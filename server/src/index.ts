import "./config/loadEnv";
import express from "express";
import { createServer } from "http";
import type { Request } from "express";
import { registerApi } from "@api/index";
import { requestLogger } from "@api/middleware/request-logger";
import { errorHandler } from "@api/middleware/error-handler";
import { createRepositories } from "@infrastructure/repositories";
import { createServices } from "@application/services";
import { setupVite, serveStatic, log } from "@infrastructure/vite";
import { startPrimeRateScheduler } from "@infrastructure/jobs/prime-rate-scheduler";
import { startTriggerRateCheck } from "@infrastructure/jobs/daily-trigger-check";
import { startMarketRateScheduler } from "@infrastructure/jobs/market-rate-scheduler";
import { startNotificationQueueScheduler } from "@infrastructure/jobs/notification-queue-scheduler";
import { startAlertScheduler, getAlertScheduler } from "@infrastructure/jobs/alert-scheduler";

declare module "http" {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}

const app = express();
const server = createServer(app);

app.use(
  express.json({
    verify: (req: Request, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

async function bootstrap() {
  const repositories = createRepositories();
  const services = createServices(repositories);

  registerApi(app, services, repositories);
  app.use(errorHandler);

  // Start scheduled jobs
  startPrimeRateScheduler(services.primeRateTracking);
  startMarketRateScheduler(services.marketRateService);
  startTriggerRateCheck(services.triggerRateMonitor);
  startNotificationQueueScheduler(services.notifications);
  startAlertScheduler(services);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);

  // Handle server listen errors (like port already in use)
  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      log(`\n❌ Port ${port} is already in use!`);
      log(`\nTo fix this, run one of the following:`);
      log(`  1. Find and kill the process: netstat -ano | findstr :${port}`);
      log(`  2. Use a different port: $env:PORT=5001; npm run dev`);
      log(`  3. Run the helper script: .\\scripts\\check-port.ps1\n`);
      process.exit(1);
    } else {
      log("Server error:", error);
      process.exit(1);
    }
  });

  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
    log(`\n${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(() => {
      log("HTTP server closed");

      // Stop schedulers
      try {
        const scheduler = getAlertScheduler();
        scheduler.stop();
        log("Alert scheduler stopped");
      } catch (error) {
        log("Error stopping alert scheduler:", error);
      }

      log("Graceful shutdown complete");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      log("Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Handle uncaught errors (but not port errors - those are handled above)
  process.on("uncaughtException", (error) => {
    // Don't handle EADDRINUSE here - it's already handled by server.on('error')
    if (error.code === "EADDRINUSE") {
      return;
    }
    log("Uncaught Exception:", error);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    log("Unhandled Rejection:", reason);
    gracefulShutdown("unhandledRejection");
  });
}

void bootstrap();
