import { Router } from "express";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import type { ApplicationServices } from "@application/services";

export function createPropertyValueRoutes(services: ApplicationServices): Router {
  const router = Router();

  /**
   * GET /mortgages/:id/property-value/trend
   * Get property value trend analysis
   */
  router.get("/mortgages/:id/property-value/trend", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { id } = req.params;
      const timeRangeMonths = req.query.timeRangeMonths
        ? parseInt(req.query.timeRangeMonths as string, 10)
        : 24;

      // Verify mortgage ownership
      const mortgage = await services.mortgages.getByIdForUser(id, user.id);
      if (!mortgage) {
        return sendError(res, 404, "Mortgage not found");
      }

      const trend = await services.propertyValue.getPropertyValueTrend(
        id,
        user.id,
        timeRangeMonths
      );

      if (!trend) {
        return sendError(res, 404, "Property value trend not found");
      }

      res.json(trend);
    } catch (error) {
      sendError(res, 500, "Failed to fetch property value trend", error);
    }
  });

  /**
   * GET /mortgages/:id/property-value/projection
   * Get projected property value
   */
  router.get("/mortgages/:id/property-value/projection", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { id } = req.params;
      const monthsAhead = req.query.monthsAhead
        ? parseInt(req.query.monthsAhead as string, 10)
        : 12;

      // Verify mortgage ownership
      const mortgage = await services.mortgages.getByIdForUser(id, user.id);
      if (!mortgage) {
        return sendError(res, 404, "Mortgage not found");
      }

      const projectedValue = await services.propertyValue.calculateProjectedValue(
        id,
        user.id,
        monthsAhead
      );

      if (projectedValue === undefined) {
        return sendError(res, 404, "Could not calculate projected value");
      }

      res.json({ projectedValue, monthsAhead });
    } catch (error) {
      sendError(res, 500, "Failed to calculate projected property value", error);
    }
  });

  return router;
}
