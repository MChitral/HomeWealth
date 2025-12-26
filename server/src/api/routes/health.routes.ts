import { Router } from "express";
import { HealthScoreService } from "../../application/services/health-score.service";

export const createHealthRoutes = (healthService: HealthScoreService) => {
  const router = Router();

  router.get("/:id/health", async (req, res) => {
    try {
      const result = await healthService.calculateHealthScore(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Mortgage not found" });
      }
      res.json(result);
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error("Error calculating health score:", error);
      const errorMessage = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  });

  return router;
};
