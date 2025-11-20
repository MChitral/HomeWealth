import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import type { Repositories } from "@infrastructure/repositories";
import { registerCashFlowRoutes } from "./cash-flow.routes";
import { registerEmergencyFundRoutes } from "./emergency-fund.routes";
import { registerMortgageRoutes } from "./mortgage.routes";
import { registerScenarioRoutes } from "./scenario.routes";
import { registerPrepaymentEventRoutes } from "./prepayment-event.routes";
import { registerSeedRoutes } from "./seed.routes";

export function buildApiRouter(
  services: ApplicationServices,
  repositories: Repositories,
): Router {
  const router = Router();

  registerSeedRoutes(router, repositories);
  registerCashFlowRoutes(router, services);
  registerEmergencyFundRoutes(router, services);
  registerMortgageRoutes(router, services);
  registerScenarioRoutes(router, services);
  registerPrepaymentEventRoutes(router, services);

  return router;
}

