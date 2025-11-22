import type { Express } from "express";
import type { ApplicationServices } from "@application/services";
import type { Repositories } from "@infrastructure/repositories";
import { buildApiRouter } from "./routes";
import { isAuthenticated } from "../replitAuth";

export function registerApi(app: Express, services: ApplicationServices, repositories: Repositories) {
  const apiRouter = buildApiRouter(services, repositories);
  app.use("/api", isAuthenticated, apiRouter);
}

