import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { scenarioCreateSchema } from "@domain/models";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";

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
      sendError(res, 404, "Scenario not found");
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
      sendError(res, 400, "Invalid scenario data", error);
    }
  });

  router.patch("/scenarios/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = scenarioUpdateSchema.parse(req.body);
      const updated = await services.scenarios.update(req.params.id, user.id, data);
      if (!updated) {
        sendError(res, 404, "Scenario not found");
        return;
      }
      res.json(updated);
    } catch (error) {
      sendError(res, 400, "Invalid update data", error);
    }
  });

  router.delete("/scenarios/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.scenarios.delete(req.params.id, user.id);
    if (!deleted) {
      sendError(res, 404, "Scenario not found");
      return;
    }
    res.json({ success: true });
  });
}
