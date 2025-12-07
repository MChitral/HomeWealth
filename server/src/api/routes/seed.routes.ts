import { Router } from "express";
import { seedDemoData } from "@application/seed/seed-demo";
import type { Repositories } from "@infrastructure/repositories";
import { sendError } from "@server-shared/utils/api-response";

export function registerSeedRoutes(router: Router, repositories: Repositories) {
  router.post("/seed-demo", async (_req, res) => {
    try {
      const result = await seedDemoData(repositories);
      res.json({
        success: true,
        message: "Demo data seeded successfully",
        data: {
          mortgageId: result?.mortgage.id,
          scenarioIds: result?.scenarios.map((s) => s.id),
          termId: result?.term.id,
        },
      });
    } catch (error) {
      sendError(res, 500, "Failed to seed demo data", error);
    }
  });
}

