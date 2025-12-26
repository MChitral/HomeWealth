import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import { notifications, type InsertNotification, type Notification } from "@shared/schema";

export class NotificationRepository {
  async create(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async findById(id: string): Promise<Notification | null> {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    return notification || null;
  }

  async findByUserId(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number; offset?: number }
  ): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];

    if (options?.unreadOnly) {
      conditions.push(eq(notifications.read, 0));
    }

    const baseQuery = db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));

    if (options?.limit !== undefined || options?.offset !== undefined) {
      let query = baseQuery;
      if (options?.limit !== undefined) {
        query = query.limit(options.limit);
      }
      if (options?.offset !== undefined) {
        query = query.offset(options.offset);
      }
      return query;
    }

    return baseQuery;
  }

  async countUnread(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, 0)));
    return Number(result?.count || 0);
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const [updated] = await db
      .update(notifications)
      .set({ read: 1 })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return !!updated;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ read: 1 })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, 0)));
    return result.rowCount || 0;
  }

  async markEmailSent(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ emailSent: 1, emailSentAt: sql`now()` })
      .where(eq(notifications.id, id));
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
}
