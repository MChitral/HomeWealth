import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { refinancingEventCreateSchema } from "@domain/models";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";

const refinancingEventUpdateSchema = refinancingEventCreateSchema.omit({ scenarioId: true }).partial();

export function registerRefinancingEventRoutes(router: Router, services: ApplicationServices) {
  router.get("/scenarios/:scenarioId/refinancing-events", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const events = await services.refinancingEvents.list(req.params.scenarioId, user.id);
    if (!events) {
      sendError(res, 404, "Scenario not found");
      return;
    }
    res.json(events);
  });

  router.post("/scenarios/:scenarioId/refinancing-events", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = refinancingEventCreateSchema.parse({
        ...req.body,
        scenarioId: req.params.scenarioId,
      });
      const { scenarioId, ...payload } = data;
      const event = await services.refinancingEvents.create(
        req.params.scenarioId,
        user.id,
        payload,
      );
      if (!event) {
        sendError(res, 404, "Scenario not found");
        return;
      }
      res.json(event);
    } catch (error) {
      sendError(res, 400, "Invalid event data", error);
    }
  });

  router.patch("/refinancing-events/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = refinancingEventUpdateSchema.parse(req.body);
      const updated = await services.refinancingEvents.update(req.params.id, user.id, data);
      if (!updated) {
        sendError(res, 404, "Event not found");
        return;
      }
      res.json(updated);
    } catch (error) {
      sendError(res, 400, "Invalid update data", error);
    }
  });

  router.delete("/refinancing-events/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.refinancingEvents.delete(req.params.id, user.id);
    if (!deleted) {
      sendError(res, 404, "Event not found");
      return;
    }
    res.json({ success: true });
  });
}

