import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import { z } from "zod";

const markReAdvanceableSchema = z.object({
  helocAccountId: z.string().min(1, "HELOC account ID is required"),
});

export function registerReAdvanceableMortgageRoutes(router: Router, services: ApplicationServices) {
  // Mark mortgage as re-advanceable
  router.post("/mortgages/:id/mark-re-advanceable", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = markReAdvanceableSchema.parse(req.body);
      const result = await services.reAdvanceableMortgage.markMortgageAsReAdvanceable(
        req.params.id,
        user.id,
        data.helocAccountId
      );

      if (!result) {
        sendError(res, 404, "Mortgage or HELOC account not found");
        return;
      }

      res.json(result);
    } catch (error) {
      sendError(res, 400, "Invalid request data", error);
    }
  });

  // Get current credit room
  router.get("/mortgages/:id/credit-room", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const creditRoom = await services.reAdvanceableMortgage.getCurrentCreditRoom(req.params.id);

      if (!creditRoom) {
        sendError(res, 404, "Mortgage is not re-advanceable or not found");
        return;
      }

      res.json(creditRoom);
    } catch (error) {
      sendError(res, 500, "Failed to fetch credit room", error);
    }
  });

  // Get credit room history
  router.get("/mortgages/:id/credit-room-history", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const history = await services.reAdvanceableMortgage.getCreditRoomHistory(req.params.id);
      res.json(history);
    } catch (error) {
      sendError(res, 500, "Failed to fetch credit room history", error);
    }
  });
}
