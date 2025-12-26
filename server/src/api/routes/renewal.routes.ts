import { Router } from "express";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import type { ApplicationServices } from "@application/services";

export function createRenewalRoutes(services: ApplicationServices): Router {
  const router = Router();

  /**
   * GET /mortgages/:id/renewal-history
   * Get renewal history for a mortgage
   */
  router.get("/mortgages/:id/renewal-history", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { id } = req.params;

      // Verify mortgage ownership
      const mortgage = await services.mortgages.getByIdForUser(id, user.id);
      if (!mortgage) {
        return sendError(res, 404, "Mortgage not found");
      }

      const history = await services.renewalService.getRenewalHistory(id);

      res.json(history);
    } catch (error) {
      sendError(res, 500, "Failed to fetch renewal history", error);
    }
  });

  /**
   * POST /mortgages/:id/renewal-history
   * Record a renewal decision
   */
  router.post("/mortgages/:id/renewal-history", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { id } = req.params;
      const {
        termId,
        renewalDate,
        previousRate,
        newRate,
        decisionType,
        lenderName,
        estimatedSavings,
        notes,
      } = req.body;

      // Validate required fields
      if (!termId || !renewalDate || previousRate === undefined || newRate === undefined || !decisionType) {
        return sendError(res, 400, "Missing required fields: termId, renewalDate, previousRate, newRate, decisionType");
      }

      // Validate decisionType
      if (!["stayed", "switched", "refinanced"].includes(decisionType)) {
        return sendError(res, 400, "Invalid decisionType. Must be: stayed, switched, or refinanced");
      }

      // Verify mortgage ownership
      const mortgage = await services.mortgages.getByIdForUser(id, user.id);
      if (!mortgage) {
        return sendError(res, 404, "Mortgage not found");
      }

      const historyEntry = await services.renewalService.recordRenewalDecision(
        id,
        termId,
        renewalDate,
        previousRate,
        newRate,
        decisionType,
        lenderName,
        estimatedSavings,
        notes
      );

      res.json(historyEntry);
    } catch (error) {
      sendError(res, 500, "Failed to record renewal decision", error);
    }
  });

  /**
   * GET /mortgages/:id/renewal-analytics
   * Get renewal performance metrics
   */
  router.get("/mortgages/:id/renewal-analytics", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { id } = req.params;

      // Verify mortgage ownership
      const mortgage = await services.mortgages.getByIdForUser(id, user.id);
      if (!mortgage) {
        return sendError(res, 404, "Mortgage not found");
      }

      const performance = await services.renewalService.calculateRenewalPerformance(id);
      const rateComparison = await services.renewalService.compareRenewalRates(id);

      res.json({
        performance,
        rateComparison,
      });
    } catch (error) {
      sendError(res, 500, "Failed to fetch renewal analytics", error);
    }
  });

  /**
   * GET /mortgages/:id/renewal-rate-comparison
   * Get rate comparison between current and previous renewal
   */
  router.get("/mortgages/:id/renewal-rate-comparison", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { id } = req.params;

      // Verify mortgage ownership
      const mortgage = await services.mortgages.getByIdForUser(id, user.id);
      if (!mortgage) {
        return sendError(res, 404, "Mortgage not found");
      }

      const comparison = await services.renewalService.compareRenewalRates(id);

      res.json(comparison);
    } catch (error) {
      sendError(res, 500, "Failed to fetch renewal rate comparison", error);
    }
  });

  /**
   * GET /mortgages/:id/renewal-recommendation
   * Get automated renewal recommendation
   */
  router.get("/mortgages/:id/renewal-recommendation", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { id } = req.params;

      // Verify mortgage ownership
      const mortgage = await services.mortgages.getByIdForUser(id, user.id);
      if (!mortgage) {
        return sendError(res, 404, "Mortgage not found");
      }

      if (!services.renewalRecommendationService) {
        return sendError(res, 503, "Renewal recommendation service not available");
      }

      const recommendation = await services.renewalRecommendationService.generateRecommendation(id);

      if (!recommendation) {
        return sendError(res, 404, "Could not generate recommendation");
      }

      res.json(recommendation);
    } catch (error) {
      sendError(res, 500, "Failed to generate renewal recommendation", error);
    }
  });

  return router;
}

