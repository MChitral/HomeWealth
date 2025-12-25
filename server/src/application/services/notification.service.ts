import { NotificationRepository } from "@infrastructure/repositories/notification.repository";
import { NotificationPreferencesRepository } from "@infrastructure/repositories/notification-preferences.repository";
import { emailService } from "@infrastructure/email/email.service";
import { users } from "@shared/schema";
import { db } from "@infrastructure/db/connection";
import { eq } from "drizzle-orm";
import type { InsertNotification, Notification, UpdateNotificationPreferences } from "@shared/schema";

export type NotificationType =
  | "renewal_reminder"
  | "trigger_rate_alert"
  | "rate_change"
  | "penalty_calculated"
  | "blend_extend_available";

export class NotificationService {
  constructor(
    private notificationRepo: NotificationRepository,
    private preferencesRepo: NotificationPreferencesRepository
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const notification = await this.notificationRepo.create({
      userId,
      type,
      title,
      message,
      metadata: metadata || {},
      read: 0,
      emailSent: 0,
    });

    // Check if email should be sent
    const shouldSendEmail = await this.shouldSendEmail(userId, type);
    if (shouldSendEmail) {
      // Queue email (async, don't await)
      this.sendEmailNotification(notification).catch((error) => {
        console.error("Failed to send email notification:", error);
      });
    }

    return notification;
  }

  async getNotifications(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number; offset?: number }
  ): Promise<Notification[]> {
    return this.notificationRepo.findByUserId(userId, options);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.countUnread(userId);
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    return this.notificationRepo.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this.notificationRepo.markAllAsRead(userId);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    return this.notificationRepo.delete(notificationId, userId);
  }

  async sendEmailNotification(notification: Notification): Promise<void> {
    // Get user email
    const [user] = await db.select().from(users).where(eq(users.id, notification.userId)).limit(1);
    if (!user?.email) {
      console.warn(`User ${notification.userId} has no email address`);
      return;
    }

    // Send email based on type
    let result;
    switch (notification.type) {
      case "renewal_reminder":
        result = await emailService.sendRenewalReminder(
          user.email,
          user.firstName || "User",
          notification.metadata?.renewalDate || "",
          notification.metadata?.daysUntil || 0,
          notification.metadata?.currentRate || 0
        );
        break;
      case "trigger_rate_alert":
        result = await emailService.sendTriggerRateAlert(
          user.email,
          user.firstName || "User",
          notification.metadata?.mortgageName || "Mortgage",
          notification.metadata?.currentRate || 0,
          notification.metadata?.triggerRate || 0,
          notification.metadata?.balance || 0
        );
        break;
      default:
        // Generic email for other types
        result = await emailService.sendEmail(
          user.email,
          notification.title,
          `<h1>${notification.title}</h1><p>${notification.message}</p>`
        );
    }

    if (result.success) {
      await this.notificationRepo.markEmailSent(notification.id);
    } else {
      console.error(`Failed to send email for notification ${notification.id}:`, result.error);
    }
  }

  async shouldSendEmail(userId: string, type: NotificationType): Promise<boolean> {
    const prefs = await this.preferencesRepo.getOrCreate(userId);

    if (!prefs.emailEnabled) return false;
    if (!prefs.inAppEnabled) return false; // Still check in-app enabled for overall notification status

    // Check type-specific preferences
    switch (type) {
      case "renewal_reminder":
        return prefs.renewalReminders === 1;
      case "trigger_rate_alert":
        return prefs.triggerRateAlerts === 1;
      case "rate_change":
        return prefs.rateChangeAlerts === 1;
      case "penalty_calculated":
        return prefs.penaltyAlerts === 1;
      case "blend_extend_available":
        return prefs.blendExtendAlerts === 1;
      default:
        return true;
    }
  }

  async getPreferences(userId: string) {
    return this.preferencesRepo.getOrCreate(userId);
  }

  async updatePreferences(userId: string, updates: UpdateNotificationPreferences) {
    return this.preferencesRepo.update(userId, updates);
  }
}

