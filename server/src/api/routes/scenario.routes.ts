import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { scenarioCreateSchema } from "@domain/models";
import { requireUser } from "@api/utils/auth";

const scenarioUpdateSchema = scenarioCreateSchema.omit({ userId: true }).partial();

export function registerScenarioRoutes(router: Router, services: ApplicationServices) {
  router.get("/scenarios", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const scenarios = await services.scenarios.listByUserId(user.id);
    res.json(scenarios);
  });

  router.get("/scenarios/with-projections", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const scenarios = await services.scenarios.listByUserId(user.id);
    const enriched = await services.scenarioProjections.buildForUser(user.id, scenarios);
    res.json(enriched);
  });

  router.get("/scenarios/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const scenario = await services.scenarios.getByIdForUser(req.params.id, user.id);
    if (!scenario) {
      res.status(404).json({ error: "Scenario not found" });
      return;
    }
    res.json(scenario);
  });

  router.post("/scenarios", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = scenarioCreateSchema.parse({ ...req.body, userId: user.id });
      const { userId, ...payload } = data;
      const scenario = await services.scenarios.create(user.id, payload);
      res.json(scenario);
    } catch (error) {
      res.status(400).json({ error: "Invalid scenario data", details: error });
    }
  });

  router.patch("/scenarios/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = scenarioUpdateSchema.parse(req.body);
      const updated = await services.scenarios.update(req.params.id, user.id, data);
      if (!updated) {
        res.status(404).json({ error: "Scenario not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  router.delete("/scenarios/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.scenarios.delete(req.params.id, user.id);
    if (!deleted) {
      res.status(404).json({ error: "Scenario not found" });
      return;
    }
    res.json({ success: true });
  });
}

