import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { prepaymentEventCreateSchema } from "@domain/models";
import { requireUser } from "@api/utils/auth";

const prepaymentEventUpdateSchema = prepaymentEventCreateSchema.omit({ scenarioId: true }).partial();

export function registerPrepaymentEventRoutes(router: Router, services: ApplicationServices) {
  router.get("/scenarios/:scenarioId/prepayment-events", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const events = await services.prepaymentEvents.list(req.params.scenarioId, user.id);
    if (!events) {
      res.status(404).json({ error: "Scenario not found" });
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
      const event = await services.prepaymentEvents.create(
        req.params.scenarioId,
        user.id,
        payload,
      );
      if (!event) {
        res.status(404).json({ error: "Scenario not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data", details: error });
    }
  });

  router.patch("/prepayment-events/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = prepaymentEventUpdateSchema.parse(req.body);
      const updated = await services.prepaymentEvents.update(req.params.id, user.id, data);
      if (!updated) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  router.delete("/prepayment-events/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.prepaymentEvents.delete(req.params.id, user.id);
    if (!deleted) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json({ success: true });
  });
}

