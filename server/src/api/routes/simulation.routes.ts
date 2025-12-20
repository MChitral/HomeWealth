import { Router } from "express";
import { SimulationService } from "../../application/services/simulation.service";

export const createSimulationRoutes = (simulationService: SimulationService) => {
  const router = Router();

  router.post("/trigger-rate", async (req, res) => {
    try {
      const { mortgageId, numIterations } = req.body;

      if (!mortgageId) {
        return res.status(400).json({ error: "Mortgage ID is required" });
      }

      const result = await simulationService.runTriggerRateSimulation({
        mortgageId,
        numIterations: numIterations ? parseInt(numIterations) : undefined,
      });

      if (!result) {
        return res.status(404).json({ error: "Mortgage or term not found" });
      }

      res.json(result);
    } catch (error: any) {
      console.error("Error running trigger rate simulation:", error);
      res.status(500).json({ error: error.message || "Failed to run simulation" });
    }
  });

  return router;
};
