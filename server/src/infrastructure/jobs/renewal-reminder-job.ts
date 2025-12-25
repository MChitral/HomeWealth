import type { ApplicationServices } from "@application/services";
import { eq, and, gte } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import { notifications } from "@shared/schema";

// Reminder intervals (in days)
const REMINDER_INTERVALS = [180, 90, 30, 7];

/**
 * Check if a reminder should be sent for the given days until renewal
 */
function shouldSendReminder(daysUntil: number): boolean {
  return REMINDER_INTERVALS.includes(daysUntil);
}

/**
 * Check if a reminder has already been sent for this mortgage and interval
 */
async function hasReminderBeenSent(
  userId: string,
  mortgageId: string,
  daysUntil: number
): Promise<boolean> {
  // Check for existing notification with same metadata within last 2 days (buffer for timing)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const existingNotifications = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, "renewal_reminder"),
        gte(notifications.createdAt, twoDaysAgo)
      )
    );

  // Check if any existing notification has matching metadata
  for (const notification of existingNotifications) {
    const metadata = notification.metadata as Record<string, any> | null;
    if (
      metadata &&
      metadata.mortgageId === mortgageId &&
      metadata.daysUntil === daysUntil
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Get reminder message based on days until renewal
 */
function getReminderMessage(daysUntil: number, renewalDate: string): string {
  const renewalDateFormatted = new Date(renewalDate).toLocaleDateString();

  if (daysUntil === 180) {
    return `Your mortgage term is renewing in 6 months (${renewalDateFormatted}). Start planning your renewal strategy now.`;
  } else if (daysUntil === 90) {
    return `Your mortgage term is renewing in 3 months (${renewalDateFormatted}). Research current market rates and consider your options.`;
  } else if (daysUntil === 30) {
    return `Your mortgage term is renewing in 1 month (${renewalDateFormatted}). Time to make a decision - review rates and calculate penalties.`;
  } else if (daysUntil === 7) {
    return `Your mortgage term is renewing in 1 week (${renewalDateFormatted}). Action needed - finalize your renewal decision.`;
  }

  return `Your mortgage term is renewing in ${daysUntil} days (${renewalDateFormatted}).`;
}

/**
 * Get reminder title based on days until renewal
 */
function getReminderTitle(daysUntil: number): string {
  if (daysUntil === 180) {
    return "Mortgage Renewal Reminder: 6 Months Away";
  } else if (daysUntil === 90) {
    return "Mortgage Renewal Reminder: 3 Months Away";
  } else if (daysUntil === 30) {
    return "Mortgage Renewal Reminder: 1 Month Away - Action Needed";
  } else if (daysUntil === 7) {
    return "Mortgage Renewal Reminder: 1 Week Away - Urgent";
  }

  return `Mortgage Renewal Reminder: ${daysUntil} Days Away`;
}

/**
 * Main function to check renewals and send reminders
 */
export async function checkRenewalsAndSendReminders(services: ApplicationServices): Promise<void> {
  try {
    console.log("[Renewal Reminder Job] Starting renewal check...");

    // Get all mortgages
    const allMortgages = await services.mortgages.findAll();
    console.log(`[Renewal Reminder Job] Found ${allMortgages.length} mortgages to check`);

    let remindersSent = 0;
    let remindersSkipped = 0;
    let errors = 0;

    // Process each mortgage
    for (const mortgage of allMortgages) {
      try {
        // Get renewal status
        const renewalInfo = await services.renewalService.getRenewalStatus(mortgage.id);

        // Skip if no renewal info (no active term, etc.)
        if (!renewalInfo) {
          continue;
        }

        const daysUntil = renewalInfo.daysUntilRenewal;

        // Skip if renewal is in the past (edge case: past renewal date)
        if (daysUntil < 0) {
          continue;
        }

        // Edge case: Skip if renewal is too far in the future (beyond our reminder intervals)
        if (daysUntil > 180) {
          continue;
        }

        // Check if reminder should be sent
        if (!shouldSendReminder(daysUntil)) {
          continue;
        }

        // Check if reminder has already been sent
        const alreadySent = await hasReminderBeenSent(
          mortgage.userId,
          mortgage.id,
          daysUntil
        );

        if (alreadySent) {
          console.log(
            `[Renewal Reminder Job] Skipping duplicate reminder for mortgage ${mortgage.id}, ${daysUntil} days`
          );
          remindersSkipped++;
          continue;
        }

        // Get market rate for comparison (optional, don't fail if unavailable)
        let marketRate: number | undefined;
        try {
          const activeTerm = (
            await services.mortgageTerms.findByMortgageId(mortgage.id)
          ).sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          )[0];

          if (activeTerm) {
            const termType = activeTerm.termType as
              | "fixed"
              | "variable-changing"
              | "variable-fixed";
            const termYears = activeTerm.termYears;
            const rate = await services.marketRateService.getMarketRate(termType, termYears);
            if (rate !== null) {
              marketRate = rate * 100; // Convert to percentage for storage
            }
          }
        } catch (error) {
          console.warn(
            `[Renewal Reminder Job] Failed to fetch market rate for mortgage ${mortgage.id}:`,
            error
          );
          // Continue without market rate
        }

        // Create notification
        const title = getReminderTitle(daysUntil);
        const message = getReminderMessage(daysUntil, renewalInfo.renewalDate);

        const metadata = {
          mortgageId: mortgage.id,
          daysUntil: daysUntil,
          renewalDate: renewalInfo.renewalDate,
          reminderInterval: daysUntil,
          currentRate: renewalInfo.currentRate, // Already in percentage
          estimatedPenalty: renewalInfo.estimatedPenalty,
          marketRate: marketRate, // In percentage if available
          status: renewalInfo.status,
          sentAt: new Date().toISOString(),
        };

        await services.notifications.createNotification(
          mortgage.userId,
          "renewal_reminder",
          title,
          message,
          metadata
        );

        remindersSent++;
        console.log(
          `[Renewal Reminder Job] Sent reminder for mortgage ${mortgage.id}, ${daysUntil} days until renewal`
        );
      } catch (error) {
        errors++;
        console.error(
          `[Renewal Reminder Job] Error processing mortgage ${mortgage.id}:`,
          error
        );
        // Continue with next mortgage instead of crashing
      }
    }

    console.log(
      `[Renewal Reminder Job] Completed: ${remindersSent} sent, ${remindersSkipped} skipped, ${errors} errors`
    );
  } catch (error) {
    console.error("[Renewal Reminder Job] Fatal error:", error);
    throw error;
  }
}

