import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { prepaymentEventCreateSchema } from "@domain/models";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";

const prepaymentEventUpdateSchema = prepaymentEventCreateSchema
  .omit({ scenarioId: true })
  .partial();

export function registerPrepaymentEventRoutes(router: Router, services: ApplicationServices) {
  router.get("/scenarios/:scenarioId/prepayment-events", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const events = await services.prepaymentEvents.list(req.params.scenarioId, user.id);
    if (!events) {
      sendError(res, 404, "Scenario not found");
      return;
    }
    res.json(events);
  });

  router.post("/scenarios/:scenarioId/prepayment-events", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = prepaymentEventCreateSchema.parse({
        ...req.body,
        scenarioId: req.params.scenarioId,
      });
      const { scenarioId, ...payload } = data;
      const event = await services.prepaymentEvents.create(req.params.scenarioId, user.id, payload);
      if (!event) {
        sendError(res, 404, "Scenario not found");
        return;
      }
      res.json(event);
    } catch (error) {
      sendError(res, 400, "Invalid event data", error);
    }
  });

  router.patch("/prepayment-events/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = prepaymentEventUpdateSchema.parse(req.body);
      const updated = await services.prepaymentEvents.update(req.params.id, user.id, data);
      if (!updated) {
        sendError(res, 404, "Event not found");
        return;
      }
      res.json(updated);
    } catch (error) {
      sendError(res, 400, "Invalid update data", error);
    }
  });

  router.delete("/prepayment-events/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.prepaymentEvents.delete(req.params.id, user.id);
    if (!deleted) {
      sendError(res, 404, "Event not found");
      return;
    }
    res.json({ success: true });
  });
}
