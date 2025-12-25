import cron from "node-cron";
import type { NotificationService } from "@application/services/notification.service";
import type { ApplicationServices } from "@application/services";

export type AlertJob = {
  id: string;
  name: string;
  schedule: string; // Cron expression
  enabled: boolean;
  handler: (services: ApplicationServices) => Promise<void>;
};

class AlertScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private registeredJobs: AlertJob[] = [];

  /**
   * Register an alert job
   */
  register(job: AlertJob): void {
    this.registeredJobs.push(job);
  }

  /**
   * Start all registered jobs
   */
  start(services: ApplicationServices): void {
    for (const job of this.registeredJobs) {
      if (!job.enabled) {
        console.log(`[Alert Scheduler] Job "${job.name}" is disabled`);
        continue;
      }

      try {
        const task = cron.schedule(job.schedule, async () => {
          try {
            console.log(`[Alert Scheduler] Running job: ${job.name}`);
            await job.handler(services);
          } catch (error) {
            console.error(`[Alert Scheduler] Error in job "${job.name}":`, error);
          }
        });

        this.jobs.set(job.id, task);
        console.log(`[Alert Scheduler] Registered job: ${job.name} (${job.schedule})`);
      } catch (error) {
        console.error(`[Alert Scheduler] Failed to register job "${job.name}":`, error);
      }
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    for (const [id, task] of this.jobs.entries()) {
      task.stop();
      console.log(`[Alert Scheduler] Stopped job: ${id}`);
    }
    this.jobs.clear();
  }

  /**
   * Get all registered jobs
   */
  getJobs(): AlertJob[] {
    return [...this.registeredJobs];
  }
}

// Singleton instance
let scheduler: AlertScheduler | null = null;

export function getAlertScheduler(): AlertScheduler {
  if (!scheduler) {
    scheduler = new AlertScheduler();
  }
  return scheduler;
}

/**
 * Register a renewal reminder job
 * This will check for mortgages approaching renewal and send notifications
 */
export function registerRenewalReminderJob(notificationService: NotificationService): void {
  const scheduler = getAlertScheduler();

  scheduler.register({
    id: "renewal-reminder",
    name: "Renewal Reminder",
    schedule: "0 9 * * *", // Daily at 9 AM
    enabled: process.env.ENABLE_RENEWAL_REMINDERS !== "false",
    handler: async (services) => {
      // This will be implemented when renewal reminder logic is added
      // For now, this is a placeholder
      console.log("[Renewal Reminder] Checking for upcoming renewals...");
      // TODO: Implement renewal reminder logic
    },
  });
}

/**
 * Register a trigger rate alert job
 * This will check for mortgages approaching trigger rates and send notifications
 */
export function registerTriggerRateAlertJob(notificationService: NotificationService): void {
  const scheduler = getAlertScheduler();

  scheduler.register({
    id: "trigger-rate-alert",
    name: "Trigger Rate Alert",
    schedule: "0 */6 * * *", // Every 6 hours
    enabled: process.env.ENABLE_TRIGGER_RATE_ALERTS !== "false",
    handler: async (services) => {
      // This will be implemented when trigger rate alert logic is added
      // For now, this is a placeholder
      console.log("[Trigger Rate Alert] Checking for trigger rate conditions...");
      // TODO: Implement trigger rate alert logic
    },
  });
}

/**
 * Start the alert scheduler with all registered jobs
 */
export function startAlertScheduler(services: ApplicationServices): void {
  const scheduler = getAlertScheduler();

  // Register default jobs
  registerRenewalReminderJob(services.notifications);
  registerTriggerRateAlertJob(services.notifications);

  // Start all jobs
  scheduler.start(services);
  console.log("[Alert Scheduler] Started with all registered jobs");
}

