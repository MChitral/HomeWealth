import { NotificationRepository } from "@infrastructure/repositories/notification.repository";
import { NotificationPreferencesRepository } from "@infrastructure/repositories/notification-preferences.repository";
import { emailService } from "@infrastructure/email/email.service";
import { users } from "@shared/schema";
import { db } from "@infrastructure/db/connection";
import { eq } from "drizzle-orm";
import type { Notification, UpdateNotificationPreferences } from "@shared/schema";

export type NotificationType =
  | "renewal_reminder"
  | "renewal_deadline_escalation"
  | "trigger_rate_alert"
  | "rate_change"
  | "penalty_calculated"
  | "blend_extend_available"
  | "prepayment_limit_80"
  | "prepayment_limit_90"
  | "prepayment_limit_100"
  | "payment_due_reminder"
  | "heloc_credit_limit_increase"
  | "heloc_draw_period_transition"
  | "recast_opportunity";

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
    metadata?: Record<string, unknown>
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
    const metadata = (notification.metadata as Record<string, unknown>) || {};
    let result;
    switch (notification.type) {
      case "renewal_reminder":
        result = await emailService.sendRenewalReminder(
          user.email,
          user.firstName || "User",
          (metadata.renewalDate as string) || "",
          (metadata.daysUntil as number) || 0,
          ((metadata.currentRate as number) || 0) / 100, // Convert from percentage to decimal
          {
            estimatedPenalty: metadata.estimatedPenalty
              ? {
                  amount:
                    typeof metadata.estimatedPenalty === "number"
                      ? metadata.estimatedPenalty
                      : (metadata.estimatedPenalty as { amount: number; method: string }).amount,
                  method:
                    typeof metadata.estimatedPenalty === "object" &&
                    metadata.estimatedPenalty !== null
                      ? (metadata.estimatedPenalty as { amount: number; method: string }).method ||
                        "IRD"
                      : "IRD",
                }
              : undefined,
            marketRate: metadata.marketRate ? (metadata.marketRate as number) / 100 : undefined, // Convert from percentage to decimal if present
            mortgageId: metadata.mortgageId as string | undefined,
          }
        );
        break;
      case "trigger_rate_alert":
        result = await emailService.sendTriggerRateAlert(
          user.email,
          user.firstName || "User",
          (metadata.mortgageName as string) || "Mortgage",
          ((metadata.currentRate as number) || 0) / 100, // Convert from percentage to decimal
          ((metadata.triggerRate as number) || 0) / 100, // Convert from percentage to decimal
          (metadata.balance as number) || 0,
          {
            alertType: metadata.alertType
              ? (metadata.alertType as
                  | "trigger_rate_hit"
                  | "trigger_rate_approaching"
                  | "trigger_rate_close")
              : undefined,
            distanceToTrigger: metadata.distanceToTrigger
              ? (metadata.distanceToTrigger as number) / 100
              : undefined, // Convert from percentage to decimal if present
            monthlyBalanceIncrease: metadata.monthlyBalanceIncrease as number | undefined,
            projectedBalanceAtTermEnd: metadata.projectedBalanceAtTermEnd as number | undefined,
            requiredPayment: metadata.requiredPayment as number | undefined,
            mortgageId: metadata.mortgageId as string | undefined,
          }
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
