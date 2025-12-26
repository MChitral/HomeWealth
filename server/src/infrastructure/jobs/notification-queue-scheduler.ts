import cron from "node-cron";
import { NotificationQueueProcessor } from "./notification-queue-processor";
import type { NotificationService } from "@application/services/notification.service";

let queueProcessor: NotificationQueueProcessor | null = null;

export function startNotificationQueueScheduler(notificationService: NotificationService): void {
  // Check if scheduler is enabled (default: true in production, false in development)
  const isEnabled = process.env.ENABLE_NOTIFICATION_QUEUE_SCHEDULER !== "false";
  const isProduction = process.env.NODE_ENV === "production";

  // Default: enabled in production, disabled in development
  const shouldRun =
    isEnabled && (isProduction || process.env.ENABLE_NOTIFICATION_QUEUE_SCHEDULER === "true");

  if (!shouldRun) {
    // eslint-disable-next-line no-console
    console.log("[Notification Queue Scheduler] Disabled");
    return;
  }

  // Initialize processor
  queueProcessor = new NotificationQueueProcessor(notificationService);

  // Process queue every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    if (!queueProcessor) {
      // eslint-disable-next-line no-console
      console.error("[Notification Queue Scheduler] Processor not initialized");
      return;
    }

    try {
      await queueProcessor.processQueue();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error processing notification queue:", error);
    }
  });

  // eslint-disable-next-line no-console
  console.log("[Notification Queue Scheduler] Started - processing queue every 5 minutes");
}
