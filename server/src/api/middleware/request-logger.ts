import type { Request, Response, NextFunction } from "express";
import { log } from "@infrastructure/vite";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: unknown;

  const originalResJson = res.json;
  res.json = function patchedJson(body: unknown, ..._args: unknown[]) {
    capturedJsonResponse = body;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return originalResJson.call(res, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          // ignore serialization errors
        }
      }

      if (logLine.length > 80) {
        logLine = `${logLine.slice(0, 79)}…`;
      }

      log(logLine);
    }
  });

  next();
}
