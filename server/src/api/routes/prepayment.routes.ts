import { Router } from "express";
import { ApplicationServices } from "../../application/services";

import { requireUser } from "@api/utils/auth";

export function createPrepaymentRoutes(services: ApplicationServices): Router {
  const router = Router();

  router.get("/:mortgageId/opportunity", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { mortgageId } = req.params;
      const opportunity = await services.prepaymentService.getPrepaymentOpportunity(
        user.id,
        mortgageId
      );

      if (!opportunity) {
        return res.status(404).json({ message: "Mortgage not found or error calculating" });
      }

      res.json(opportunity);
    } catch (error) {
      console.error("Error getting prepayment opportunity:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
}
