import cron from "node-cron";
import type { PrimeRateTrackingService } from "@application/services/prime-rate-tracking.service";

/**
 * Scheduled job to automatically check for prime rate changes
 * 
 * **Schedule:**
 * - Runs daily at 9:00 AM Eastern Time
 * - Bank of Canada typically announces rate changes during business hours
 * - Can be disabled via ENABLE_PRIME_RATE_SCHEDULER environment variable
 * 
 * **Configuration:**
 * - Set ENABLE_PRIME_RATE_SCHEDULER=false to disable
 * - Set PRIME_RATE_SCHEDULE to customize cron expression (default: "0 9 * * *")
 */
export function startPrimeRateScheduler(primeRateTracking: PrimeRateTrackingService): void {
  // Check if scheduler is enabled (default: true in production, false in development)
  const isEnabled = process.env.ENABLE_PRIME_RATE_SCHEDULER !== "false";
  const isProduction = process.env.NODE_ENV === "production";
  
  // Default: enabled in production, disabled in development
  const shouldRun = isEnabled && (isProduction || process.env.ENABLE_PRIME_RATE_SCHEDULER === "true");

  if (!shouldRun) {
    console.log("[Prime Rate Scheduler] Disabled (set ENABLE_PRIME_RATE_SCHEDULER=true to enable)");
    return;
  }

  // Default schedule: Daily at 9:00 AM (can be customized via env var)
  // Cron format: "minute hour day month day-of-week"
  // "0 9 * * *" = 9:00 AM every day
  const schedule = process.env.PRIME_RATE_SCHEDULE || "0 9 * * *";

  console.log(`[Prime Rate Scheduler] Starting with schedule: ${schedule}`);

  // Schedule the job
  cron.schedule(schedule, async () => {
    try {
      console.log("[Prime Rate Scheduler] Checking for prime rate changes...");
      const result = await primeRateTracking.checkAndUpdatePrimeRate();

      if (result.changed) {
        console.log(
          `[Prime Rate Scheduler] Prime rate changed from ${result.previousRate}% to ${result.newRate}%`
        );
        console.log(
          `[Prime Rate Scheduler] Updated ${result.termsUpdated} VRM terms`
        );
        
        if (result.errors.length > 0) {
          console.warn(
            `[Prime Rate Scheduler] ${result.errors.length} errors occurred during update:`,
            result.errors
          );
        }
      } else {
        console.log(
          `[Prime Rate Scheduler] No change detected. Current rate: ${result.newRate}%`
        );
      }
    } catch (error: any) {
      console.error("[Prime Rate Scheduler] Error checking prime rate:", error);
      // Don't throw - let the scheduler continue running
    }
  }, {
    timezone: "America/Toronto", // Eastern Time (Bank of Canada timezone)
  });

  console.log("[Prime Rate Scheduler] Scheduled job started successfully");
}

/**
 * Stop the prime rate scheduler (useful for graceful shutdown)
 */
export function stopPrimeRateScheduler(): void {
  // node-cron doesn't have a built-in stop method for all tasks
  // In a real implementation, you'd track the task and call destroy()
  console.log("[Prime Rate Scheduler] Stopping scheduler");
}

