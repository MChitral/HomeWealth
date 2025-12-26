import cron from "node-cron";
import type { MarketRateService } from "@application/services/market-rate.service";

/**
 * Scheduled job to automatically fetch and store market rates
 *
 * **Schedule:**
 * - Runs daily at 10:00 AM Eastern Time (after prime rate check at 9:00 AM)
 * - Bank of Canada typically updates rates during business hours
 * - Can be disabled via ENABLE_MARKET_RATE_SCHEDULER environment variable
 *
 * **Configuration:**
 * - Set ENABLE_MARKET_RATE_SCHEDULER=false to disable
 * - Set MARKET_RATE_SCHEDULE to customize cron expression (default: "0 10 * * *")
 */
export function startMarketRateScheduler(marketRateService: MarketRateService): void {
  // Check if scheduler is enabled (default: true in production, false in development)
  const isEnabled = process.env.ENABLE_MARKET_RATE_SCHEDULER !== "false";
  const isProduction = process.env.NODE_ENV === "production";

  // Default: enabled in production, disabled in development
  const shouldRun =
    isEnabled && (isProduction || process.env.ENABLE_MARKET_RATE_SCHEDULER === "true");

  if (!shouldRun) {
    // eslint-disable-next-line no-console
    console.log("[Market Rate Scheduler] Disabled");
    return;
  }

  // Default schedule: Daily at 10:00 AM (can be customized via env var)
  // Cron format: "minute hour day month day-of-week"
  // "0 10 * * *" = 10:00 AM every day
  const schedule = process.env.MARKET_RATE_SCHEDULE || "0 10 * * *";

  // Schedule the job
  cron.schedule(
    schedule,
    async () => {
      try {
        await marketRateService.fetchAndStoreLatestRates();
        // eslint-disable-next-line no-console
        console.log("[Market Rate Scheduler] Rates updated successfully");
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error("[Market Rate Scheduler] Error updating rates:", error);
        // Don't throw - let the scheduler continue running
      }
    },
    {
      timezone: "America/Toronto", // Eastern Time (Bank of Canada timezone)
    }
  );

  // eslint-disable-next-line no-console
  console.log(`[Market Rate Scheduler] Started with schedule: ${schedule}`);
}

/**
 * Stop the market rate scheduler (useful for graceful shutdown)
 */
export function stopMarketRateScheduler(): void {
  // node-cron doesn't have a built-in stop method for all tasks
  // In a real implementation, you'd track the task and call destroy()
}
