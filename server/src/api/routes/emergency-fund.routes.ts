import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { emergencyFundCreateSchema, emergencyFundUpdateSchema } from "@domain/models";
import { requireUser } from "@api/utils/auth";

export function registerEmergencyFundRoutes(router: Router, services: ApplicationServices) {
  router.get("/emergency-fund", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const fund = await services.emergencyFunds.getByUserId(user.id);
    res.json(fund ?? null);
  });

  router.post("/emergency-fund", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = emergencyFundCreateSchema.parse({ ...req.body, userId: user.id });
      const { userId, ...payload } = data;
      const created = await services.emergencyFunds.create(user.id, payload);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid emergency fund data", details: error });
    }
  });

  router.patch("/emergency-fund/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = emergencyFundUpdateSchema.parse(req.body);
      const updated = await services.emergencyFunds.update(user.id, req.params.id, data);
      if (!updated) {
        res.status(404).json({ error: "Emergency fund not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });
}

