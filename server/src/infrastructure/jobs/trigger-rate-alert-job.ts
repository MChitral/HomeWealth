import type { ApplicationServices } from "@application/services";
import { eq, and, gte } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import { notifications, mortgageTerms } from "@shared/schema";
import { calculatePayment, type PaymentFrequency } from "@server-shared/calculations/mortgage";

// Alert thresholds
const ALERT_THRESHOLDS = {
  APPROACHING: 0.01, // 1% away
  CLOSE: 0.005, // 0.5% away
  HIT: 0, // At or above trigger rate
};

export type TriggerRateAlertType =
  | "trigger_rate_approaching"
  | "trigger_rate_close"
  | "trigger_rate_hit";

/**
 * Determine alert type based on distance to trigger rate
 */
function getAlertType(distanceToTrigger: number, isHit: boolean): TriggerRateAlertType | null {
  if (isHit) return "trigger_rate_hit";
  if (distanceToTrigger <= ALERT_THRESHOLDS.CLOSE) return "trigger_rate_close";
  if (distanceToTrigger <= ALERT_THRESHOLDS.APPROACHING) return "trigger_rate_approaching";
  return null;
}

/**
 * Calculate monthly balance increase when trigger rate is hit
 */
function calculateMonthlyBalanceIncrease(
  currentRate: number,
  triggerRate: number,
  balance: number
): number {
  if (currentRate <= triggerRate) return 0;
  return (currentRate - triggerRate) * balance * (1 / 12);
}

/**
 * Project balance at term end
 */
function projectBalanceAtTermEnd(
  currentBalance: number,
  monthlyIncrease: number,
  monthsRemaining: number
): number {
  return currentBalance + monthlyIncrease * monthsRemaining;
}

/**
 * Calculate months remaining in term
 */
function calculateMonthsRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return Math.max(0, diffMonths);
}

/**
 * Calculate required payment to prevent negative amortization
 */
function calculateRequiredPayment(
  balance: number,
  triggerRate: number,
  paymentFrequency: PaymentFrequency,
  amortizationMonths: number
): number {
  // Calculate payment that would cover interest at trigger rate
  const annualRate = triggerRate;
  return calculatePayment(balance, annualRate, paymentFrequency, amortizationMonths);
}

/**
 * Check if a trigger rate alert has already been sent for this mortgage and alert type
 */
async function hasAlertBeenSent(
  userId: string,
  mortgageId: string,
  alertType: TriggerRateAlertType
): Promise<boolean> {
  // Check for existing notification with same metadata within last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const existingNotifications = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, "trigger_rate_alert"),
        gte(notifications.createdAt, oneDayAgo)
      )
    );

  // Check if any existing notification has matching metadata
  for (const notification of existingNotifications) {
    const metadata = notification.metadata as Record<string, any> | null;
    if (metadata && metadata.mortgageId === mortgageId && metadata.alertType === alertType) {
      return true;
    }
  }

  return false;
}

/**
 * Check if we should send an upgrade alert (e.g., approaching -> close -> hit)
 */
async function shouldSendUpgradeAlert(
  userId: string,
  mortgageId: string,
  newAlertType: TriggerRateAlertType
): Promise<boolean> {
  // Check for existing notification with less severe type
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const existingNotifications = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, "trigger_rate_alert"),
        gte(notifications.createdAt, oneDayAgo)
      )
    );

  // Severity order: approaching < close < hit
  const severity: Record<TriggerRateAlertType, number> = {
    trigger_rate_approaching: 1,
    trigger_rate_close: 2,
    trigger_rate_hit: 3,
  };

  for (const notification of existingNotifications) {
    const metadata = notification.metadata as Record<string, any> | null;
    if (metadata && metadata.mortgageId === mortgageId) {
      const existingType = metadata.alertType as TriggerRateAlertType;
      if (existingType && severity[existingType] < severity[newAlertType]) {
        return true; // Upgrade alert needed
      }
    }
  }

  return false;
}

/**
 * Get alert message based on alert type
 */
function getAlertMessage(
  alertType: TriggerRateAlertType,
  distanceToTrigger: number,
  triggerRate: number,
  currentRate: number
): string {
  const triggerRatePercent = (triggerRate * 100).toFixed(2);
  const currentRatePercent = (currentRate * 100).toFixed(2);
  const distancePercent = (distanceToTrigger * 100).toFixed(2);

  switch (alertType) {
    case "trigger_rate_hit":
      return `Critical: Your mortgage rate (${currentRatePercent}%) has exceeded your trigger rate (${triggerRatePercent}%). Negative amortization has started.`;
    case "trigger_rate_close":
      return `Urgent: You are ${distancePercent}% away from your trigger rate (${triggerRatePercent}%). Your current rate is ${currentRatePercent}%.`;
    case "trigger_rate_approaching":
      return `Warning: You are ${distancePercent}% away from your trigger rate (${triggerRatePercent}%). Your current rate is ${currentRatePercent}%.`;
    default:
      return `Trigger rate alert: Current rate ${currentRatePercent}%, Trigger rate ${triggerRatePercent}%`;
  }
}

/**
 * Get alert title based on alert type
 */
function getAlertTitle(alertType: TriggerRateAlertType): string {
  switch (alertType) {
    case "trigger_rate_hit":
      return "Trigger Rate Hit - Action Required";
    case "trigger_rate_close":
      return "Trigger Rate Close - Urgent Warning";
    case "trigger_rate_approaching":
      return "Trigger Rate Approaching - Warning";
    default:
      return "Trigger Rate Alert";
  }
}

/**
 * Main function to check trigger rates and send alerts
 */
export async function checkTriggerRatesAndSendAlerts(services: ApplicationServices): Promise<void> {
  try {
    console.log("[Trigger Rate Alert Job] Starting trigger rate check...");

    // Get all mortgages
    const allMortgages = await services.mortgages.findAll();
    console.log(`[Trigger Rate Alert Job] Found ${allMortgages.length} mortgages to check`);

    let alertsSent = 0;
    let alertsSkipped = 0;
    let errors = 0;

    // Process each mortgage
    for (const mortgage of allMortgages) {
      try {
        // Check trigger rate status using TriggerRateMonitor
        const triggerStatus = await services.triggerRateMonitor.checkOne(mortgage.id);

        // Skip if no trigger status (not VRM-Fixed Payment or no active term)
        if (!triggerStatus) {
          continue;
        }

        // Calculate distance to trigger rate
        const distanceToTrigger = triggerStatus.triggerRate - triggerStatus.currentRate;

        // Determine alert type
        const alertType = getAlertType(distanceToTrigger, triggerStatus.isHit);

        if (!alertType) {
          continue; // No alert needed
        }

        // Check if alert has already been sent (same type)
        const alreadySent = await hasAlertBeenSent(mortgage.userId, mortgage.id, alertType);

        if (alreadySent) {
          console.log(
            `[Trigger Rate Alert Job] Skipping duplicate alert for mortgage ${mortgage.id}, type ${alertType}`
          );
          alertsSkipped++;
          continue;
        }

        // Check if we should send an upgrade alert
        const shouldUpgrade = await shouldSendUpgradeAlert(mortgage.userId, mortgage.id, alertType);

        if (!shouldUpgrade && !triggerStatus.isHit) {
          // For non-hit alerts, only send if it's an upgrade or first time
          // (This prevents sending approaching alerts repeatedly)
          const hasAnyRecentAlert = await hasAlertBeenSent(
            mortgage.userId,
            mortgage.id,
            "trigger_rate_approaching" // Check for any recent alert
          );
          if (hasAnyRecentAlert) {
            alertsSkipped++;
            continue;
          }
        }

        // Get active term for impact calculations
        const terms = await services.mortgageTerms.listForMortgage(mortgage.id, mortgage.userId);
        if (!terms) {
          console.warn(`[Trigger Rate Alert Job] Could not get terms for mortgage ${mortgage.id}`);
          continue;
        }
        const activeTerm = terms
          .filter((t) => new Date(t.startDate) <= new Date() && new Date(t.endDate) >= new Date())
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

        // Calculate impact analysis
        let monthlyBalanceIncrease: number | undefined;
        let projectedBalanceAtTermEnd: number | undefined;
        let requiredPayment: number | undefined;

        if (triggerStatus.isHit || distanceToTrigger <= ALERT_THRESHOLDS.CLOSE) {
          monthlyBalanceIncrease = calculateMonthlyBalanceIncrease(
            triggerStatus.currentRate,
            triggerStatus.triggerRate,
            triggerStatus.balance
          );

          if (activeTerm) {
            const monthsRemaining = calculateMonthsRemaining(activeTerm.endDate);
            projectedBalanceAtTermEnd = projectBalanceAtTermEnd(
              triggerStatus.balance,
              monthlyBalanceIncrease,
              monthsRemaining
            );

            const amortizationMonths =
              mortgage.amortizationYears * 12 + (mortgage.amortizationMonths || 0);
            requiredPayment = calculateRequiredPayment(
              triggerStatus.balance,
              triggerStatus.triggerRate,
              activeTerm.paymentFrequency as PaymentFrequency,
              amortizationMonths
            );
          }
        }

        // Create notification
        const title = getAlertTitle(alertType);
        const message = getAlertMessage(
          alertType,
          distanceToTrigger,
          triggerStatus.triggerRate,
          triggerStatus.currentRate
        );

        const metadata = {
          mortgageId: mortgage.id,
          mortgageName: triggerStatus.mortgageName,
          alertType: alertType,
          distanceToTrigger: distanceToTrigger,
          currentRate: triggerStatus.currentRate * 100, // Convert to percentage
          triggerRate: triggerStatus.triggerRate * 100, // Convert to percentage
          balance: triggerStatus.balance,
          paymentAmount: triggerStatus.paymentAmount,
          monthlyBalanceIncrease: monthlyBalanceIncrease,
          projectedBalanceAtTermEnd: projectedBalanceAtTermEnd,
          requiredPayment: requiredPayment,
          isHit: triggerStatus.isHit,
          isRisk: triggerStatus.isRisk,
          sentAt: new Date().toISOString(),
        };

        await services.notifications.createNotification(
          mortgage.userId,
          "trigger_rate_alert",
          title,
          message,
          metadata
        );

        alertsSent++;
        console.log(`[Trigger Rate Alert Job] Sent ${alertType} alert for mortgage ${mortgage.id}`);
      } catch (error) {
        errors++;
        console.error(`[Trigger Rate Alert Job] Error processing mortgage ${mortgage.id}:`, error);
        // Continue with next mortgage instead of crashing
      }
    }

    console.log(
      `[Trigger Rate Alert Job] Completed: ${alertsSent} sent, ${alertsSkipped} skipped, ${errors} errors`
    );
  } catch (error) {
    console.error("[Trigger Rate Alert Job] Fatal error:", error);
    throw error;
  }
}
