import type { ApplicationServices } from "@application/services";
import { calculateHelocMinimumPayment } from "@domain/calculations/heloc-payment";
import { fetchLatestPrimeRate } from "@server-shared/services/prime-rate";

/**
 * Check all HELOC accounts for draw period transitions
 *
 * A draw period transition occurs when:
 * - The HELOC draw period end date has passed
 * - The account is still in "interest_only" payment mode (if applicable)
 * - The minimum payment needs to be recalculated for principal+interest payments
 *
 * This job should run daily to detect and handle transitions.
 */
export async function checkHelocDrawPeriodTransitions(
  services: ApplicationServices
): Promise<void> {
  const allHelocAccounts = await services.heloc.findAll();

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for comparison

  for (const account of allHelocAccounts) {
    try {
      // Skip if no draw period end date is set
      if (!account.helocDrawPeriodEndDate) {
        continue;
      }

      const drawPeriodEndDate = new Date(account.helocDrawPeriodEndDate);
      drawPeriodEndDate.setHours(0, 0, 0, 0);

      // Check if draw period has ended
      if (drawPeriodEndDate > today) {
        continue; // Draw period hasn't ended yet
      }

      // Check if we've already processed this transition
      // We'll check for existing notifications to avoid duplicate processing
      const existingNotifications = await services.notifications.getNotifications(account.userId, {
        unreadOnly: false,
      });

      const alreadyProcessed = existingNotifications.some(
        (n) =>
          n.type === "heloc_draw_period_transition" &&
          n.metadata?.helocAccountId === account.id &&
          n.metadata?.transitionDate === drawPeriodEndDate.toISOString().split("T")[0]
      );

      if (alreadyProcessed) {
        continue; // Already processed this transition
      }

      // Get current balance and payment details
      const currentBalance = Number(account.currentBalance || 0);
      const currentPaymentType = account.helocPaymentType || "interest_only";
      const interestSpread = Number(account.interestSpread || 0);

      // Skip if balance is zero (no payment needed)
      if (currentBalance <= 0) {
        continue;
      }

      // Fetch current prime rate
      const { primeRate } = await fetchLatestPrimeRate();
      const annualRate = (primeRate + interestSpread) / 100;

      // Determine new payment type
      // Some HELOCs remain interest-only, but most transition to principal+interest
      // We'll transition to principal+interest if currently interest-only
      // If it's already principal+interest, we'll just recalculate
      const newPaymentType: "interest_only" | "principal_plus_interest" =
        currentPaymentType === "interest_only"
          ? "principal_plus_interest"
          : (currentPaymentType as "interest_only" | "principal_plus_interest");

      // Calculate new minimum payment
      const newMinimumPayment = calculateHelocMinimumPayment(
        currentBalance,
        annualRate,
        newPaymentType
      );

      const oldMinimumPayment = Number(account.helocMinimumPayment || 0);

      // Update HELOC account with new payment type and minimum payment
      await services.helocAccounts.updateAccount(account.id, account.userId, {
        helocPaymentType: newPaymentType,
        helocMinimumPayment: newMinimumPayment.toFixed(2),
      });

      // Create notification for the user
      const paymentTypeChanged = currentPaymentType !== newPaymentType;
      const paymentAmountChanged = Math.abs(newMinimumPayment - oldMinimumPayment) > 0.01;

      let notificationTitle: string;
      let notificationMessage: string;

      if (paymentTypeChanged && paymentAmountChanged) {
        notificationTitle = "HELOC Draw Period Ended - Payment Requirements Changed";
        notificationMessage = `Your HELOC draw period ended on ${drawPeriodEndDate.toLocaleDateString()}. Your payment type has changed from interest-only to principal+interest, and your minimum payment has been updated from $${oldMinimumPayment.toFixed(2)} to $${newMinimumPayment.toFixed(2)} per month.`;
      } else if (paymentTypeChanged) {
        notificationTitle = "HELOC Draw Period Ended - Payment Type Changed";
        notificationMessage = `Your HELOC draw period ended on ${drawPeriodEndDate.toLocaleDateString()}. Your payment type has changed from interest-only to principal+interest. Your minimum payment remains $${newMinimumPayment.toFixed(2)} per month.`;
      } else if (paymentAmountChanged) {
        notificationTitle = "HELOC Draw Period Ended - Payment Amount Updated";
        notificationMessage = `Your HELOC draw period ended on ${drawPeriodEndDate.toLocaleDateString()}. Your minimum payment has been updated from $${oldMinimumPayment.toFixed(2)} to $${newMinimumPayment.toFixed(2)} per month.`;
      } else {
        notificationTitle = "HELOC Draw Period Ended";
        notificationMessage = `Your HELOC draw period ended on ${drawPeriodEndDate.toLocaleDateString()}. Your minimum payment is $${newMinimumPayment.toFixed(2)} per month.`;
      }

      await services.notifications.createNotification(
        account.userId,
        "heloc_draw_period_transition",
        notificationTitle,
        notificationMessage,
        {
          helocAccountId: account.id,
          transitionDate: drawPeriodEndDate.toISOString().split("T")[0],
          oldPaymentType: currentPaymentType,
          newPaymentType: newPaymentType,
          oldMinimumPayment: oldMinimumPayment,
          newMinimumPayment: newMinimumPayment,
          currentBalance: currentBalance,
        }
      );

      console.log(
        `[HELOC Draw Period Transition] Processed transition for HELOC ${account.id} (user ${account.userId})`
      );
    } catch (error) {
      console.error(`[HELOC Draw Period Transition] Error processing HELOC ${account.id}:`, error);
    }
  }
}
