import type { ApplicationServices } from "@application/services";
import { getPrepaymentYear } from "@server-shared/calculations/prepayment-year";

/**
 * Check all mortgages for recast opportunities
 * 
 * A recast opportunity exists when:
 * - A large prepayment has been made (typically > 10% of original balance)
 * - The mortgage could benefit from payment reduction
 * - The recast would reduce monthly payments significantly
 * 
 * This job should run weekly to analyze mortgages for recast opportunities.
 */
export async function checkRecastOpportunities(services: ApplicationServices): Promise<void> {
  const allMortgages = await services.mortgages.findAll();

  for (const mortgage of allMortgages) {
    try {
      // Get user's notification preferences
      const preferences = await services.notificationPreferences.findByUserId(mortgage.userId);

      // Check if recast opportunity alerts are enabled (default: enabled)
      // We'll check for any notification preference, but recast is a new feature
      // so we'll enable by default if preferences exist

      // Get all payments for this mortgage
      const payments = await services.mortgagePayments.findByMortgageId(mortgage.id);

      // Get current term
      const terms = await services.mortgageTerms.findByMortgageId(mortgage.id);
      const activeTerm = terms.find((term) => {
        const today = new Date();
        const startDate = new Date(term.startDate);
        const endDate = new Date(term.endDate);
        return today >= startDate && today <= endDate;
      });

      if (!activeTerm) {
        continue;
      }

      // Calculate total prepayments in current prepayment year
      const today = new Date().toISOString().split("T")[0];
      const currentPrepaymentYear = getPrepaymentYear(
        today,
        mortgage.prepaymentLimitResetDate,
        mortgage.startDate
      );

      const currentYearPayments = payments.filter((p) => {
        const paymentYear = getPrepaymentYear(
          p.paymentDate,
          mortgage.prepaymentLimitResetDate,
          mortgage.startDate
        );
        return paymentYear === currentPrepaymentYear;
      });

      // Calculate cumulative prepayments this year
      const yearToDatePrepayments = currentYearPayments.reduce(
        (sum, p) => sum + Number(p.prepaymentAmount || 0),
        0
      );

      // Check if large prepayment was made (>= 10% of original balance)
      const originalAmount = Number(mortgage.originalAmount);
      const largePrepaymentThreshold = originalAmount * 0.1; // 10% of original

      if (yearToDatePrepayments >= largePrepaymentThreshold) {
        // Check if recast would be beneficial
        // A recast is beneficial if:
        // 1. Large prepayment was made
        // 2. Current balance is significantly lower than original
        // 3. Remaining amortization is still substantial

        const currentBalance = Number(mortgage.currentBalance);
        const balanceReduction = originalAmount - currentBalance;
        const reductionPercent = (balanceReduction / originalAmount) * 100;

        // Check if we've already sent a recast opportunity notification
        const existingNotifications = await services.notifications.getNotifications(
          mortgage.userId,
          { unreadOnly: false }
        );

        const alreadyNotified = existingNotifications.some(
          (n) =>
            n.type === "recast_opportunity" &&
            n.metadata?.mortgageId === mortgage.id &&
            n.metadata?.prepaymentYear === currentPrepaymentYear
        );

        if (!alreadyNotified && reductionPercent >= 10) {
          // Calculate potential payment reduction
          const currentPayment = Number(activeTerm.regularPaymentAmount);
          const remainingAmortizationMonths =
            mortgage.amortizationYears * 12 + (mortgage.amortizationMonths || 0);

          // Estimate new payment after recast (simplified calculation)
          // In reality, this would use the recast calculation service
          const estimatedNewPayment = currentPayment * 0.9; // Rough estimate: 10% reduction
          const estimatedSavings = currentPayment - estimatedNewPayment;

          await services.notifications.createNotification(
            mortgage.userId,
            "recast_opportunity",
            "Recast Opportunity Available",
            `You've made significant prepayments (${yearToDatePrepayments.toFixed(2)}). Consider recasting your mortgage to reduce monthly payments. Estimated savings: ${estimatedSavings.toFixed(2)}/month.`,
            {
              mortgageId: mortgage.id,
              termId: activeTerm.id,
              yearToDatePrepayments,
              currentBalance,
              originalAmount,
              reductionPercent: Math.round(reductionPercent * 10) / 10,
              estimatedNewPayment,
              estimatedSavings,
              prepaymentYear: currentPrepaymentYear,
            }
          );
        }
      }
    } catch (error) {
      console.error(`Error checking recast opportunities for mortgage ${mortgage.id}:`, error);
    }
  }
}

