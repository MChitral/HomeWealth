import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import type { Repositories } from "@infrastructure/repositories";
import { registerCashFlowRoutes } from "./cash-flow.routes";
import { registerEmergencyFundRoutes } from "./emergency-fund.routes";
import { registerMortgageRoutes } from "./mortgage.routes";
import { registerScenarioRoutes } from "./scenario.routes";
import { registerPrepaymentEventRoutes } from "./prepayment-event.routes";
import { registerRefinancingEventRoutes } from "./refinancing-event.routes";
import { registerSeedRoutes } from "./seed.routes";
import { registerPrimeRateRoutes } from "./prime-rate.routes";
import { createImpactRoutes } from "./impact.routes";
import { createPrepaymentRoutes } from "./prepayment.routes";
import { createSimulationRoutes } from "./simulation.routes";
import { createHealthRoutes } from "./health.routes";
import { registerNotificationRoutes } from "./notification.routes";
import { registerHelocRoutes } from "./heloc.routes";
import { registerReAdvanceableMortgageRoutes } from "./re-advanceable-mortgage.routes";
import insuranceRoutes from "./insurance.routes";

export function buildApiRouter(services: ApplicationServices, repositories: Repositories): Router {
  const router = Router();

  registerSeedRoutes(router, repositories);
  registerCashFlowRoutes(router, services);
  registerEmergencyFundRoutes(router, services);
  registerMortgageRoutes(router, services);
  registerScenarioRoutes(router, services);
  registerPrepaymentEventRoutes(router, services);
  registerRefinancingEventRoutes(router, services);
  registerPrimeRateRoutes(router, services);
  registerNotificationRoutes(router, services);
  registerHelocRoutes(router, services);
  registerReAdvanceableMortgageRoutes(router, services);
  router.use("/impact", createImpactRoutes(services, repositories));
  router.use("/prepayment", createPrepaymentRoutes(services));
  router.use("/simulations", createSimulationRoutes(services.simulationService));
  router.use("/mortgages", createHealthRoutes(services.healthScoreService)); // Mounting under /api/mortgages for consistency with REST
  router.use("/insurance", insuranceRoutes);

  return router;
}
