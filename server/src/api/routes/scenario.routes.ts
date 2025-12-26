import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { scenarioCreateSchema } from "@domain/models";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import { z } from "zod";
import { ScenarioTemplateService } from "@application/services/scenario-template.service";

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
      const { userId: _unusedUserId, ...payload } = data;
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

  const monteCarloSimulationSchema = z.object({
    scenarioId: z.string().optional(),
    timeHorizonMonths: z.number().int().min(1).max(360),
    numIterations: z.number().int().min(100).max(10000).optional(),
    rateModel: z.enum(["gbm", "vasicek"]).optional(),
    interestRateVolatility: z.number().min(0).max(1).optional(),
    interestRateDrift: z.number().optional(),
    meanReversionSpeed: z.number().min(0).max(1).optional(),
    longTermMeanRate: z.number().min(0).max(1).optional(),
    rateCap: z.number().min(0).max(1).optional(),
    rateFloor: z.number().min(0).max(1).optional(),
    useHistoricalVolatility: z.boolean().optional(),
    historicalRates: z.array(z.number().min(0).max(1)).optional(),
  });

  router.post("/scenarios/monte-carlo", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = monteCarloSimulationSchema.parse(req.body);
      const result = await services.scenarioProjections.runMonteCarloSimulation(user.id, data);
      if (!result) {
        sendError(res, 404, "Mortgage not found");
        return;
      }
      res.json(result);
    } catch (error) {
      sendError(res, 400, "Invalid simulation parameters", error);
    }
  });

  const templateService = new ScenarioTemplateService();

  router.get("/scenarios/templates", async (req, res) => {
    const templates = templateService.getTemplates();
    res.json(templates);
  });

  router.get("/scenarios/templates/:id", async (req, res) => {
    const template = templateService.getTemplateById(req.params.id);
    if (!template) {
      sendError(res, 404, "Template not found");
      return;
    }
    res.json(template);
  });

  const createFromTemplateSchema = z.object({
    templateId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
  });

  router.post("/scenarios/from-template", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = createFromTemplateSchema.parse(req.body);
      const payload = templateService.createFromTemplate(
        data.templateId,
        data.name,
        data.description
      );
      if (!payload) {
        sendError(res, 404, "Template not found");
        return;
      }

      const scenario = await services.scenarios.create(user.id, payload);
      res.json(scenario);
    } catch (error) {
      sendError(res, 400, "Invalid template data", error);
    }
  });

  const rateChangeAnalysisSchema = z.object({
    scenarioId: z.string().optional(),
    rateChanges: z.array(z.number()).min(1).max(10), // Array of rate changes in percentage points
    timeHorizonYears: z.number().int().min(1).max(30).optional(),
  });

  router.post("/scenarios/rate-change-analysis", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = rateChangeAnalysisSchema.parse(req.body);
      const result = await services.scenarioProjections.analyzeRateChangeScenarios(user.id, data);
      if (!result) {
        sendError(res, 404, "Mortgage not found");
        return;
      }
      res.json(result);
    } catch (error) {
      sendError(res, 400, "Invalid rate change analysis parameters", error);
    }
  });
}
