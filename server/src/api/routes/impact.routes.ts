import { Router } from "express";
import { ApplicationServices } from "@application/services";
import { Repositories } from "@infrastructure/repositories";

export function createImpactRoutes(services: ApplicationServices, repositories: Repositories) {
  const router = Router();

  /**
   * GET /api/impact/:mortgageId
   * Get the latest calculated impact for a specific mortgage
   */
  router.get("/:mortgageId", (req, res) => {
    const { mortgageId } = req.params;
    const impact = services.impactCalculator.getLatestImpact(mortgageId);

    if (!impact) {
      return res.status(404).json({ message: "No recent impact calculation found" });
    }

    res.json(impact);
  });

  /**
   * POST /api/impact/calculate
   * Manually trigger impact calculation (Admin/Dev tool)
   * Body: { oldRate: number, newRate: number }
   */
  router.post("/calculate", async (req, res) => {
    try {
      const { oldRate, newRate } = req.body;

      if (!oldRate || !newRate) {
        return res.status(400).json({ message: "oldRate and newRate are required" });
      }

      // Fetch all mortgages/terms to calculate
      // We need to fetch all active VRM terms manually here since service doesn't have a "do everything" method exposed that takes arbitrary rates easily without repo access inside service.
      // But wait! PrimeRateTracking.checkAndUpdatePrimeRate does the fetching but assumes fetching from BoC.

      // Let's iterate all terms here (using repo) and call calculateImpacts.
      // This logic belongs in a service method really, but for MVP route:
      const allTerms = await repositories.mortgageTerms.findAll();
      const activeVrmTerms = allTerms.filter((t) => t.termType.startsWith("variable")); // Simplified filter

      if (activeVrmTerms.length === 0) {
        return res.json({ message: "No active VRM terms found", impacts: [] });
      }

      const impacts = await services.impactCalculator.calculateImpacts(
        activeVrmTerms,
        Number(oldRate),
        Number(newRate)
      );

      res.json({
        message: `Calculated impacts for ${impacts.length} terms`,
        impacts,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
}
