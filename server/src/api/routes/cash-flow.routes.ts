import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { cashFlowCreateSchema, cashFlowUpdateSchema } from "@domain/models";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";

export function registerCashFlowRoutes(router: Router, services: ApplicationServices) {
  router.get("/cash-flow", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const cashFlow = await services.cashFlows.getByUserId(user.id);
    res.json(cashFlow ?? null);
  });

  router.post("/cash-flow", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = cashFlowCreateSchema.parse({ ...req.body, userId: user.id });
      const { userId, ...payload } = data;
      const created = await services.cashFlows.create(user.id, payload);
      res.json(created);
    } catch (error) {
      sendError(res, 400, "Invalid cash flow data", error);
    }
  });

  router.patch("/cash-flow/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = cashFlowUpdateSchema.parse(req.body);
      const updated = await services.cashFlows.update(user.id, req.params.id, data);
      if (!updated) {
        sendError(res, 404, "Cash flow not found");
        return;
      }
      res.json(updated);
    } catch (error) {
      sendError(res, 400, "Invalid update data", error);
    }
  });
}

