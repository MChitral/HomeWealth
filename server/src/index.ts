import "./config/loadEnv";
import express from "express";
import { createServer } from "http";
import type { Request } from "express";
import { registerApi } from "@api/index";
import { requestLogger } from "@api/middleware/request-logger";
import { errorHandler } from "@api/middleware/error-handler";
import { createRepositories } from "@infrastructure/repositories";
import { createServices } from "@application/services";
import { autoSeedDemoData } from "@application/seed/seed-demo";
import { setupVite, serveStatic, log } from "@infrastructure/vite";
import { setupAuth, isAuthenticated } from "./replitAuth";

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
  }),
);
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

async function bootstrap() {
  const repositories = createRepositories();
  const services = createServices(repositories);

  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await repositories.users.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  await autoSeedDemoData(repositories);

  registerApi(app, services, repositories);
  app.use(errorHandler);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
}

void bootstrap();

