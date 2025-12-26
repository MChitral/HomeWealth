import type { ApplicationServices } from "@application/services";

/**
 * Check all active mortgages for upcoming payment due dates and send reminders
 *
 * This job should run daily to check payment due dates and send reminders
 * based on user preferences (3, 7, 14 days before due date).
 */
export async function checkPaymentDueReminders(services: ApplicationServices): Promise<void> {
  const allMortgages = await services.mortgages.findAll();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const mortgage of allMortgages) {
    try {
      // Get user's notification preferences
      const preferences = await services.notificationPreferences.findByUserId(mortgage.userId);

      // Check if payment due reminders are enabled
      if (!preferences || preferences.paymentDueReminders === 0) {
        continue;
      }

      // Get reminder days (default: 3, 7, 14)
      const reminderDays = (preferences.paymentDueReminderDays || "3,7,14")
        .split(",")
        .map((d) => parseInt(d.trim(), 10))
        .filter((d) => !isNaN(d));

      // Get active term
      const terms = await services.mortgageTerms.findByMortgageId(mortgage.id);
      const activeTerm = terms.find((term) => {
        const startDate = new Date(term.startDate);
        const endDate = new Date(term.endDate);
        return today >= startDate && today <= endDate;
      });

      if (!activeTerm) {
        continue;
      }

      // Calculate next payment date based on payment frequency
      const lastPayment = await services.mortgagePayments.findByTermId(activeTerm.id);
      const sortedPayments = lastPayment.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
      const latestPayment = sortedPayments[0];

      let nextPaymentDate: Date;
      if (latestPayment) {
        const lastDate = new Date(latestPayment.paymentDate);
        nextPaymentDate = calculateNextPaymentDate(lastDate, activeTerm.paymentFrequency);
      } else {
        // No payments yet, use term start date
        nextPaymentDate = calculateNextPaymentDate(
          new Date(activeTerm.startDate),
          activeTerm.paymentFrequency
        );
      }

      // Check each reminder day
      for (const daysBefore of reminderDays) {
        const reminderDate = new Date(nextPaymentDate);
        reminderDate.setDate(reminderDate.getDate() - daysBefore);
        reminderDate.setHours(0, 0, 0, 0);

        // Check if today is the reminder date
        if (
          today.getTime() === reminderDate.getTime() ||
          (today.getTime() > reminderDate.getTime() && today.getTime() < nextPaymentDate.getTime())
        ) {
          // Check if we've already sent a reminder for this payment
          const existingNotifications = await services.notifications.getNotifications(
            mortgage.userId,
            { unreadOnly: false }
          );

          const alreadyNotified = existingNotifications.some(
            (n) =>
              n.type === "payment_due_reminder" &&
              n.metadata?.mortgageId === mortgage.id &&
              n.metadata?.paymentDate === nextPaymentDate.toISOString().split("T")[0] &&
              n.metadata?.daysBefore === daysBefore
          );

          if (!alreadyNotified) {
            await services.notifications.createNotification(
              mortgage.userId,
              "payment_due_reminder",
              `Payment Due Reminder: ${daysBefore} Day${daysBefore > 1 ? "s" : ""} Remaining`,
              `Your mortgage payment of ${Number(activeTerm.regularPaymentAmount).toFixed(2)} is due on ${nextPaymentDate.toLocaleDateString()}.`,
              {
                mortgageId: mortgage.id,
                termId: activeTerm.id,
                paymentDate: nextPaymentDate.toISOString().split("T")[0],
                paymentAmount: Number(activeTerm.regularPaymentAmount),
                daysBefore,
              }
            );
          }
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error checking payment due reminders for mortgage ${mortgage.id}:`, error);
    }
  }
}

/**
 * Calculate next payment date based on frequency
 */
function calculateNextPaymentDate(lastDate: Date, frequency: string): Date {
  const next = new Date(lastDate);
  switch (frequency) {
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "biweekly":
    case "accelerated-biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "weekly":
    case "accelerated-weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "semi-monthly":
      next.setDate(next.getDate() + 15);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
}
