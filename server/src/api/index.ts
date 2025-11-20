import type { Express } from "express";
import type { ApplicationServices } from "@application/services";
import type { Repositories } from "@infrastructure/repositories";
import { buildApiRouter } from "./routes";
import { devAuth } from "./middleware/dev-auth";

export function registerApi(app: Express, services: ApplicationServices, repositories: Repositories) {
  const apiRouter = buildApiRouter(services, repositories);
  app.use("/api", devAuth, apiRouter);
}

