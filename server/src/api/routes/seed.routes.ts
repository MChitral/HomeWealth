import { Router } from "express";
import { seedDemoData } from "@application/seed/seed-demo";
import type { Repositories } from "@infrastructure/repositories";

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
      res.status(500).json({
        success: false,
        error: "Failed to seed demo data",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

