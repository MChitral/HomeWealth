import cron from "node-cron";
import { TriggerRateMonitor } from "@application/services/trigger-rate-monitor";

/**
 * Scheduled job to check for trigger rate risks daily
 *
 * **Schedule:**
 * - Runs daily at 8:00 AM (before Prime Rate check)
 */
export function startTriggerRateCheck(monitor: TriggerRateMonitor): void {
  // Default: enabled in production, disabled in development unless forced
  const isEnabled = process.env.ENABLE_TRIGGER_ALERTS !== "false";
  const isProduction = process.env.NODE_ENV === "production";

  // For MVP testing, allow it to run in dev if env var is set, otherwise manual only
  const shouldRun = isEnabled && (isProduction || process.env.ENABLE_TRIGGER_ALERTS === "true");

  if (!shouldRun) {
    // Job started disabled (set ENABLE_TRIGGER_ALERTS=true to enable)");
    return;
  }

  const schedule = process.env.TRIGGER_CHECK_SCHEDULE || "0 8 * * *"; // 8 AM daily

  cron.schedule(
    schedule,
    async () => {
      try {
        const alerts = await monitor.checkAll();

        // MOCK Notification System: In real app, send emails/push notifications here if alerts.length > 0
        if (alerts.length > 0) {
          // TODO: Send notifications
        }
      } catch (error) {
        console.error("[Trigger Rate Check] Error:", error);
      }
    },
    {
      timezone: "America/Toronto",
    }
  );
}
