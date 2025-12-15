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
    console.log("[Trigger Rate Check] Job disabled (set ENABLE_TRIGGER_ALERTS=true to enable)");
    return;
  }

  const schedule = process.env.TRIGGER_CHECK_SCHEDULE || "0 8 * * *"; // 8 AM daily

  console.log(`[Trigger Rate Check] Starting with schedule: ${schedule}`);

  cron.schedule(
    schedule,
    async () => {
      try {
        console.log("[Trigger Rate Check] Running daily check...");

        const alerts = await monitor.checkAll();

        if (alerts.length > 0) {
          console.log(`[Trigger Rate Check] Found ${alerts.length} mortgages at risk:`);

          // MOCK Notification System
          // In real app: send emails/push notifications
          for (const alert of alerts) {
            const status = alert.isHit ? "CRITICAL (Hit)" : "WARNING (Approaching)";
            console.log(`
            🚨 ALERT: ${status}
            Mortgage: ${alert.mortgageName} (${alert.mortgageId})
            User: ${alert.userId}
            Current Rate: ${(alert.currentRate * 100).toFixed(2)}%
            Trigger Rate: ${(alert.triggerRate * 100).toFixed(2)}%
            Gap: ${((alert.triggerRate - alert.currentRate) * 100).toFixed(2)}%
          `);
          }
        } else {
          console.log("[Trigger Rate Check] No risks detected.");
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
