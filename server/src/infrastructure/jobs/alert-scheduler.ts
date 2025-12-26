import * as cron from "node-cron";
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
        // eslint-disable-next-line no-console
        console.log(`[Alert Scheduler] Job "${job.name}" is disabled`);
        continue;
      }

      try {
        const task = cron.schedule(job.schedule, async () => {
          try {
            // eslint-disable-next-line no-console
            console.log(`[Alert Scheduler] Running job: ${job.name}`);
            await job.handler(services);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`[Alert Scheduler] Error in job "${job.name}":`, error);
          }
        });

        this.jobs.set(job.id, task);
        // eslint-disable-next-line no-console
        console.log(`[Alert Scheduler] Registered job: ${job.name} (${job.schedule})`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[Alert Scheduler] Failed to register job "${job.name}":`, error);
      }
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    for (const [id, task] of Array.from(this.jobs.entries())) {
      task.stop();
      // eslint-disable-next-line no-console
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
export function registerRenewalReminderJob(_notificationService: NotificationService): void {
  const scheduler = getAlertScheduler();

  scheduler.register({
    id: "renewal-reminder",
    name: "Renewal Reminder",
    schedule: process.env.RENEWAL_REMINDER_SCHEDULE || "0 9 * * *", // Daily at 9 AM (configurable)
    enabled: process.env.ENABLE_RENEWAL_REMINDERS !== "false",
    handler: async (services) => {
      const { checkRenewalsAndSendReminders } = await import("./renewal-reminder-job");
      await checkRenewalsAndSendReminders(services);
    },
  });

  // Register prepayment limit check job
  scheduler.register({
    id: "prepayment-limit-check",
    name: "Prepayment Limit Check",
    schedule: process.env.PREPAYMENT_LIMIT_CHECK_SCHEDULE || "0 10 * * *", // Daily at 10 AM
    enabled: process.env.ENABLE_PREPAYMENT_LIMIT_ALERTS !== "false",
    handler: async (services) => {
      const { checkPrepaymentLimits } = await import("./prepayment-limit-check");
      await checkPrepaymentLimits(services);
    },
  });

  // Register payment due reminder job
  scheduler.register({
    id: "payment-due-reminder",
    name: "Payment Due Reminder",
    schedule: process.env.PAYMENT_DUE_REMINDER_SCHEDULE || "0 8 * * *", // Daily at 8 AM
    enabled: process.env.ENABLE_PAYMENT_DUE_REMINDERS !== "false",
    handler: async (services) => {
      const { checkPaymentDueReminders } = await import("./payment-due-reminder");
      await checkPaymentDueReminders(services);
    },
  });

  // Register recast opportunity check job
  scheduler.register({
    id: "recast-opportunity-check",
    name: "Recast Opportunity Check",
    schedule: process.env.RECAST_OPPORTUNITY_CHECK_SCHEDULE || "0 11 * * 1", // Weekly on Monday at 11 AM
    enabled: process.env.ENABLE_RECAST_OPPORTUNITY_ALERTS !== "false",
    handler: async (services) => {
      const { checkRecastOpportunities } = await import("./recast-opportunity-check");
      await checkRecastOpportunities(services);
    },
  });

  // Register HELOC draw period transition check job
  scheduler.register({
    id: "heloc-draw-period-transition",
    name: "HELOC Draw Period Transition Check",
    schedule: process.env.HELOC_DRAW_PERIOD_TRANSITION_SCHEDULE || "0 9 * * *", // Daily at 9 AM
    enabled: process.env.ENABLE_HELOC_DRAW_PERIOD_TRANSITION !== "false",
    handler: async (services) => {
      const { checkHelocDrawPeriodTransitions } = await import("./heloc-draw-period-transition");
      await checkHelocDrawPeriodTransitions(services);
    },
  });
}

/**
 * Register a trigger rate alert job
 * This will check for mortgages approaching trigger rates and send notifications
 */
export function registerTriggerRateAlertJob(_notificationService: NotificationService): void {
  const scheduler = getAlertScheduler();

  scheduler.register({
    id: "trigger-rate-alert",
    name: "Trigger Rate Alert",
    schedule: process.env.TRIGGER_RATE_ALERT_SCHEDULE || "0 */6 * * *", // Every 6 hours (configurable)
    enabled: process.env.ENABLE_TRIGGER_RATE_ALERTS !== "false",
    handler: async (services) => {
      const { checkTriggerRatesAndSendAlerts } = await import("./trigger-rate-alert-job");
      await checkTriggerRatesAndSendAlerts(services);
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
  // eslint-disable-next-line no-console
  console.log("[Alert Scheduler] Started with all registered jobs");
}
