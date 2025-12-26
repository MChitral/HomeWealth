import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import {
  insertSmithManeuverStrategySchema,
  updateSmithManeuverStrategySchema,
} from "@shared/schema";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import { z } from "zod";

const projectQuerySchema = z.object({
  years: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val === undefined ? 30 : typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => val > 0 && val <= 50, "Years must be between 1 and 50"),
});

export function registerSmithManeuverRoutes(router: Router, services: ApplicationServices) {
  // Get all strategies for user
  router.get("/smith-maneuver/strategies", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const strategies = await services.smithManeuver.getStrategiesByUserId(user.id);
      res.json(strategies);
    } catch (error) {
      sendError(res, 500, "Failed to fetch Smith Maneuver strategies", error);
    }
  });

  // Get strategy by ID
  router.get("/smith-maneuver/strategies/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const strategy = await services.smithManeuver.getStrategyById(req.params.id, user.id);
      if (!strategy) {
        sendError(res, 404, "Strategy not found");
        return;
      }
      res.json(strategy);
    } catch (error) {
      sendError(res, 500, "Failed to fetch strategy", error);
    }
  });

  // Create strategy
  router.post("/smith-maneuver/strategies", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = insertSmithManeuverStrategySchema.parse(req.body);
      const strategy = await services.smithManeuver.createStrategy({
        ...validated,
        userId: user.id,
      });
      res.status(201).json(strategy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid strategy data", error.errors);
        return;
      }
      sendError(res, 500, "Failed to create strategy", error);
    }
  });

  // Update strategy
  router.put("/smith-maneuver/strategies/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = updateSmithManeuverStrategySchema.parse(req.body);
      const strategy = await services.smithManeuver.updateStrategy(
        req.params.id,
        user.id,
        validated
      );
      if (!strategy) {
        sendError(res, 404, "Strategy not found");
        return;
      }
      res.json(strategy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid strategy data", error.errors);
        return;
      }
      sendError(res, 500, "Failed to update strategy", error);
    }
  });

  // Delete strategy
  router.delete("/smith-maneuver/strategies/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const deleted = await services.smithManeuver.deleteStrategy(req.params.id, user.id);
      if (!deleted) {
        sendError(res, 404, "Strategy not found");
        return;
      }
      res.json({ success: true });
    } catch (error) {
      sendError(res, 500, "Failed to delete strategy", error);
    }
  });

  // Generate projections
  router.post("/smith-maneuver/strategies/:id/project", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = projectQuerySchema.parse({ years: req.query.years });
      const projections = await services.smithManeuver.projectStrategy(
        req.params.id,
        user.id,
        validated.years
      );
      res.json(projections);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid query parameters", error.errors);
        return;
      }
      sendError(res, 500, "Failed to generate projections", error);
    }
  });

  // Get transactions for strategy
  router.get("/smith-maneuver/strategies/:id/transactions", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const transactions = await services.smithManeuver.getTransactionsByStrategyId(
        req.params.id,
        user.id
      );
      res.json(transactions);
    } catch (error) {
      sendError(res, 500, "Failed to fetch transactions", error);
    }
  });

  // Get tax calculations for strategy
  router.get("/smith-maneuver/strategies/:id/roi-analysis", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const years = req.query.years ? parseInt(req.query.years as string, 10) : 10;
      const analysis = await services.smithManeuver.calculateROIAnalysis(
        req.params.id,
        user.id,
        years
      );
      res.json(analysis);
    } catch (error) {
      sendError(res, 500, "Failed to calculate ROI analysis", error);
    }
  });

  router.post("/smith-maneuver/strategies/:id/compare-prepayment", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { years, mortgageRate } = req.body;
      const comparison = await services.smithManeuver.compareWithDirectPrepayment(
        req.params.id,
        user.id,
        years || 10,
        mortgageRate
      );
      res.json(comparison);
    } catch (error) {
      sendError(res, 500, "Failed to compare with direct prepayment", error);
    }
  });

  router.get("/smith-maneuver/strategies/:id/tax-calculations", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const taxCalculations = await services.smithManeuver.getTaxCalculationsByStrategyId(
        req.params.id,
        user.id
      );
      res.json(taxCalculations);
    } catch (error) {
      sendError(res, 500, "Failed to fetch tax calculations", error);
    }
  });
}

