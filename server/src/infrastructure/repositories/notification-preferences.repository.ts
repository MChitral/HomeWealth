import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  notificationPreferences,
  type InsertNotificationPreferences,
  type UpdateNotificationPreferences,
  type NotificationPreferences,
} from "@shared/schema";

export class NotificationPreferencesRepository {
  async findByUserId(userId: string): Promise<NotificationPreferences | null> {
    const [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);
    return prefs || null;
  }

  async create(data: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const [prefs] = await db.insert(notificationPreferences).values(data).returning();
    return prefs;
  }

  async update(
    userId: string,
    data: UpdateNotificationPreferences
  ): Promise<NotificationPreferences> {
    const [updated] = await db
      .update(notificationPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notificationPreferences.userId, userId))
      .returning();
    if (!updated) {
      throw new Error("Notification preferences not found");
    }
    return updated;
  }

  async getOrCreate(userId: string): Promise<NotificationPreferences> {
    let prefs = await this.findByUserId(userId);
    if (!prefs) {
      prefs = await this.create({
        userId,
        emailEnabled: 1,
        inAppEnabled: 1,
        renewalReminders: 1,
        renewalReminderDays: "180,90,30,7",
        triggerRateAlerts: 1,
        triggerRateThreshold: "0.5",
        rateChangeAlerts: 1,
        penaltyAlerts: 1,
        blendExtendAlerts: 1,
      } as InsertNotificationPreferences);
    }
    return prefs;
  }
}
