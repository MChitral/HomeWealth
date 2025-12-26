import { eq, and, lte } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import { notificationQueue, notifications } from "@shared/schema";
import { NotificationService } from "@application/services/notification.service";

export class NotificationQueueProcessor {
  constructor(private notificationService: NotificationService) {}

  async processQueue(): Promise<void> {
    // Get pending notifications scheduled for now or earlier
    const pendingItems = await db
      .select()
      .from(notificationQueue)
      .where(
        and(
          eq(notificationQueue.status, "pending"),
          lte(notificationQueue.scheduledFor, new Date())
        )
      )
      .limit(10); // Process in batches

    for (const item of pendingItems) {
      await this.processQueueItem(item.id);
    }
  }

  private async processQueueItem(queueId: string): Promise<void> {
    // Mark as processing
    await db
      .update(notificationQueue)
      .set({ status: "processing" })
      .where(eq(notificationQueue.id, queueId));

    try {
      // Get notification
      const [queueItem] = await db
        .select()
        .from(notificationQueue)
        .where(eq(notificationQueue.id, queueId))
        .limit(1);

      if (!queueItem) {
        throw new Error("Queue item not found");
      }

      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, queueItem.notificationId))
        .limit(1);

      if (!notification) {
        throw new Error("Notification not found");
      }

      // Send email
      await this.notificationService.sendEmailNotification(notification);

      // Mark as sent
      await db
        .update(notificationQueue)
        .set({
          status: "sent",
          processedAt: new Date(),
        })
        .where(eq(notificationQueue.id, queueId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Get current retry count
      const [queueItem] = await db
        .select()
        .from(notificationQueue)
        .where(eq(notificationQueue.id, queueId))
        .limit(1);

      if (queueItem && queueItem.retryCount < queueItem.maxRetries) {
        // Retry
        await db
          .update(notificationQueue)
          .set({
            status: "pending",
            retryCount: queueItem.retryCount + 1,
            errorMessage,
            scheduledFor: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
          })
          .where(eq(notificationQueue.id, queueId));
      } else {
        // Mark as failed
        await db
          .update(notificationQueue)
          .set({
            status: "failed",
            errorMessage,
            processedAt: new Date(),
          })
          .where(eq(notificationQueue.id, queueId));
      }
    }
  }
}
