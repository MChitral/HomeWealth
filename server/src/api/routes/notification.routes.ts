import { Router } from "express";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import type { ApplicationServices } from "@application/services";
import { z } from "zod";

export function registerNotificationRoutes(router: Router, services: ApplicationServices): void {
  // Get notifications
  router.get("/notifications", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const unreadOnly = req.query.unreadOnly === "true";
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

      const notifications = await services.notifications.getNotifications(user.id, {
        unreadOnly,
        limit,
        offset,
      });

      res.json(notifications);
    } catch (error) {
      sendError(res, 500, "Failed to fetch notifications", error);
    }
  });

  // Get unread count
  router.get("/notifications/unread-count", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const count = await services.notifications.getUnreadCount(user.id);
      res.json({ count });
    } catch (error) {
      sendError(res, 500, "Failed to get unread count", error);
    }
  });

  // Mark as read
  router.patch("/notifications/:id/read", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const success = await services.notifications.markAsRead(req.params.id, user.id);
      if (!success) {
        sendError(res, 404, "Notification not found");
        return;
      }
      res.json({ success: true });
    } catch (error) {
      sendError(res, 500, "Failed to mark notification as read", error);
    }
  });

  // Mark all as read
  router.patch("/notifications/read-all", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const count = await services.notifications.markAllAsRead(user.id);
      res.json({ count });
    } catch (error) {
      sendError(res, 500, "Failed to mark all as read", error);
    }
  });

  // Delete notification
  router.delete("/notifications/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const success = await services.notifications.deleteNotification(req.params.id, user.id);
      if (!success) {
        sendError(res, 404, "Notification not found");
        return;
      }
      res.json({ success: true });
    } catch (error) {
      sendError(res, 500, "Failed to delete notification", error);
    }
  });

  // Get preferences
  router.get("/notifications/preferences", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const prefs = await services.notifications.getPreferences(user.id);
      res.json(prefs);
    } catch (error) {
      sendError(res, 500, "Failed to get preferences", error);
    }
  });

  // Update preferences
  router.patch("/notifications/preferences", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const updateSchema = z.object({
        emailEnabled: z.boolean().optional(),
        inAppEnabled: z.boolean().optional(),
        renewalReminders: z.boolean().optional(),
        renewalReminderDays: z.string().optional(),
        triggerRateAlerts: z.boolean().optional(),
        triggerRateThreshold: z.union([z.string(), z.number()]).optional(),
        rateChangeAlerts: z.boolean().optional(),
        penaltyAlerts: z.boolean().optional(),
        blendExtendAlerts: z.boolean().optional(),
      });

      const data = updateSchema.parse(req.body);
      const prefs = await services.notifications.updatePreferences(user.id, data);
      res.json(prefs);
    } catch (error) {
      sendError(res, 400, "Invalid preferences data", error);
    }
  });
}

