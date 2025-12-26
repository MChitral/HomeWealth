import type { ApplicationServices } from "@application/services";
import { getPrepaymentYear } from "@server-shared/calculations/prepayment-year";

/**
 * Check all mortgages for prepayment limit thresholds and create notifications
 *
 * This job should run daily to check prepayment usage and alert users when they
 * approach or reach their annual prepayment limits.
 */
export async function checkPrepaymentLimits(services: ApplicationServices): Promise<void> {
  const allMortgages = await services.mortgages.findAll();

  for (const mortgage of allMortgages) {
    try {
      // Get user's notification preferences
      const preferences = await services.notificationPreferences.findByUserId(mortgage.userId);

      // Check if prepayment limit alerts are enabled
      if (!preferences || preferences.prepaymentLimitAlerts === 0) {
        continue;
      }

      // Get thresholds (default: 80, 90, 100)
      const thresholds = (preferences.prepaymentLimitThresholds || "80,90,100")
        .split(",")
        .map((t) => parseInt(t.trim(), 10))
        .filter((t) => !isNaN(t));

      // Get all payments for this mortgage
      const payments = await services.mortgagePayments.findByMortgageId(mortgage.id);

      // Calculate current prepayment year
      const today = new Date().toISOString().split("T")[0];
      const currentPrepaymentYear = getPrepaymentYear(
        today,
        mortgage.prepaymentLimitResetDate,
        mortgage.startDate
      );

      // Filter payments for current prepayment year
      const currentYearPayments = payments.filter((p) => {
        const paymentYear = getPrepaymentYear(
          p.paymentDate,
          mortgage.prepaymentLimitResetDate,
          mortgage.startDate
        );
        return paymentYear === currentPrepaymentYear;
      });

      // Calculate prepayment usage
      const annualLimitPercent = mortgage.annualPrepaymentLimitPercent || 20;
      const annualLimit = Number(mortgage.originalAmount) * (annualLimitPercent / 100);
      const carryForward = Number(mortgage.prepaymentCarryForward || 0);
      const totalLimit = annualLimit + carryForward;

      const used = currentYearPayments.reduce((sum, p) => sum + Number(p.prepaymentAmount || 0), 0);

      const usagePercent = totalLimit > 0 ? (used / totalLimit) * 100 : 0;

      // Check each threshold and create notification if needed
      for (const threshold of thresholds) {
        if (usagePercent >= threshold && usagePercent < threshold + 5) {
          // Check if we've already sent a notification for this threshold
          const existingNotifications = await services.notifications.getNotifications(
            mortgage.userId,
            { unreadOnly: false }
          );

          const alreadyNotified = existingNotifications.some(
            (n) =>
              n.type === `prepayment_limit_${threshold}` &&
              n.metadata?.mortgageId === mortgage.id &&
              n.metadata?.prepaymentYear === currentPrepaymentYear
          );

          if (!alreadyNotified) {
            await services.notifications.createNotification(
              mortgage.userId,
              `prepayment_limit_${threshold}` as NotificationType,
              `Prepayment Limit Alert: ${threshold}% Used`,
              `You have used ${usagePercent.toFixed(1)}% of your annual prepayment limit (${threshold}% threshold). Used: ${used.toFixed(2)}, Limit: ${totalLimit.toFixed(2)}.`,
              {
                mortgageId: mortgage.id,
                usagePercent: Math.round(usagePercent * 10) / 10,
                used: used,
                limit: totalLimit,
                remaining: totalLimit - used,
                prepaymentYear: currentPrepaymentYear,
                threshold,
              }
            );
          }
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error checking prepayment limits for mortgage ${mortgage.id}:`, error);
    }
  }
}
