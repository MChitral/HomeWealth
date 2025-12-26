import type {
  PrimeRateHistoryRepository,
  MortgageTermsRepository,
  MortgagesRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import { MortgageTerm } from "@shared/schema";
import { fetchLatestPrimeRate } from "@server-shared/services/prime-rate";
import { ImpactCalculator } from "./impact-calculator.service";
import { validateVariableRate } from "@domain/calculations/variable-rate";
import { getTermEffectiveRate } from "@server-shared/calculations/term-helpers";
import { calculatePayment, type PaymentFrequency } from "@server-shared/calculations/mortgage";
// ... imports

// Result of checking for prime rate changes
export interface PrimeRateChangeResult {
  changed: boolean;
  previousRate?: number;
  newRate: number;
  effectiveDate: string;
  termsUpdated: number;
  errors: Array<{ termId: string; error: string }>;
}

export class PrimeRateTrackingService {
  constructor(
    private readonly primeRateHistory: PrimeRateHistoryRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly mortgages: MortgagesRepository,
    private readonly impactCalculator: ImpactCalculator,
    private readonly mortgagePayments?: MortgagePaymentsRepository,
    private readonly paymentAmountChangeService?: {
      recordPaymentAmountChange: (params: {
        mortgageId: string;
        termId: string;
        changeDate: string;
        oldAmount: number;
        newAmount: number;
        reason: string;
      }) => Promise<unknown>;
    } // PaymentAmountChangeService - using interface to avoid circular dependency
  ) {}

  /**
   * Check for prime rate changes and update all active variable rate mortgages
   *
   * This method:
   * 1. Fetches latest prime rate from Bank of Canada
   * 2. Checks if it's different from the last recorded rate
   * 3. If changed, records it in history
   * 4. Updates all active VRM terms with the new rate
   * 5. Recalculates payments for VRM-Changing terms
   *
   * @returns Result with change status and update counts
   */
  async checkAndUpdatePrimeRate(): Promise<PrimeRateChangeResult> {
    try {
      // Fetch latest prime rate from Bank of Canada
      const { primeRate: newRate, effectiveDate } = await fetchLatestPrimeRate();

      // Get the latest recorded prime rate from history
      const latestHistory = await this.primeRateHistory.findLatest();
      const previousRate = latestHistory ? Number(latestHistory.primeRate) : undefined;

      // Check if rate has changed
      const changed = previousRate === undefined || previousRate !== newRate;

      if (!changed) {
        return {
          changed: false,
          newRate,
          effectiveDate,
          termsUpdated: 0,
          errors: [],
        };
      }

      // Record the new prime rate in history (if not already recorded for this date)
      const alreadyExists = await this.primeRateHistory.existsForDate(effectiveDate);
      if (!alreadyExists) {
        await this.primeRateHistory.create({
          primeRate: newRate.toFixed(3),
          effectiveDate,
          source: "Bank of Canada",
        });
      }

      // Find all active variable rate mortgage terms
      // Active means: current date is between term startDate and endDate
      const allTerms = await this.mortgageTerms.findAll();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeVrmTerms = allTerms.filter((term) => {
        if (!term.termType.startsWith("variable")) {
          return false;
        }
        const startDate = new Date(term.startDate);
        const endDate = new Date(term.endDate);
        return today >= startDate && today <= endDate;
      });

      // Update each active VRM term
      const errors: Array<{ termId: string; error: string }> = [];
      const updatedTerms: MortgageTerm[] = []; // Store terms for impact calc
      let termsUpdated = 0;

      for (const term of activeVrmTerms) {
        try {
          // Calculate new effective rate
          const currentEffectiveRate = getTermEffectiveRate(term);
          const spread = term.lockedSpread ? Number(term.lockedSpread) : 0;
          const proposedNewRate = (newRate + spread) / 100; // Convert to decimal

          // Validate against cap/floor if set
          const validation = validateVariableRate(
            currentEffectiveRate,
            proposedNewRate,
            term.variableRateCap ? Number(term.variableRateCap) / 100 : null,
            term.variableRateFloor ? Number(term.variableRateFloor) / 100 : null
          );

          // Use validated rate
          const finalRate = validation.adjustedRate;
          const finalPrimeRate = finalRate * 100 - spread; // Convert back to prime rate

          // For variable-changing mortgages, recalculate payment amount
          let paymentRecalculated = false;
          if (
            term.termType === "variable-changing" &&
            this.mortgagePayments &&
            this.paymentAmountChangeService
          ) {
            const mortgage = await this.mortgages.findById(term.mortgageId);
            if (mortgage) {
              // Get current balance from latest payment or mortgage
              const payments = await this.mortgagePayments.findByTermId(term.id);
              const latestPayment = payments.sort(
                (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
              )[0];
              const currentBalance = latestPayment
                ? Number(latestPayment.remainingBalance)
                : Number(mortgage.currentBalance);

              // Calculate remaining amortization
              const remainingAmortizationMonths = latestPayment
                ? latestPayment.remainingAmortizationMonths
                : mortgage.amortizationYears * 12 + (mortgage.amortizationMonths || 0);

              // Calculate new payment amount
              const oldPaymentAmount = Number(term.regularPaymentAmount);
              const newPaymentAmount = calculatePayment(
                currentBalance,
                finalRate,
                remainingAmortizationMonths,
                term.paymentFrequency as PaymentFrequency
              );

              // Update term with new payment amount
              await this.mortgageTerms.update(term.id, {
                primeRate: finalPrimeRate.toFixed(3),
                regularPaymentAmount: newPaymentAmount.toFixed(2),
              });

              // Record payment amount change event if payment changed
              if (oldPaymentAmount !== newPaymentAmount) {
                try {
                  await this.paymentAmountChangeService.recordPaymentAmountChange({
                    mortgageId: term.mortgageId,
                    termId: term.id,
                    changeDate: effectiveDate,
                    oldAmount: oldPaymentAmount,
                    newAmount: newPaymentAmount,
                    reason: `Rate change: Prime rate changed from ${previousRate?.toFixed(3)}% to ${newRate.toFixed(3)}%`,
                  });
                  paymentRecalculated = true;
                } catch (error) {
                  console.error(
                    `Failed to record payment amount change for term ${term.id}:`,
                    error
                  );
                }
              } else {
                // Just update prime rate if payment didn't change
                await this.mortgageTerms.update(term.id, {
                  primeRate: finalPrimeRate.toFixed(3),
                });
              }
            } else {
              // Just update prime rate if mortgage not found
              await this.mortgageTerms.update(term.id, {
                primeRate: finalPrimeRate.toFixed(3),
              });
            }
          } else {
            // For variable-fixed mortgages or if services not available, just update prime rate
            await this.mortgageTerms.update(term.id, {
              primeRate: finalPrimeRate.toFixed(3),
            });
          }

          termsUpdated++;
          updatedTerms.push(term);

          // Log warning if rate was adjusted
          if (!validation.valid && validation.message) {
            console.warn(`Term ${term.id}: ${validation.message}`);
          }

          // Log payment recalculation
          if (paymentRecalculated) {
            // eslint-disable-next-line no-console
            console.log(`Term ${term.id}: Payment recalculated due to rate change`);
          }
        } catch (error: unknown) {
          errors.push({
            termId: term.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Calculate Impact immediately
      if (updatedTerms.length > 0 && previousRate !== undefined) {
        // Run async, don't block return
        this.impactCalculator
          .calculateImpacts(updatedTerms, previousRate, newRate)
          .then(() => {
            // For MVP: Log impacts. Future: Create notifications.
            // Rate change detected
            // TODO: Persist alerts
          })
          .catch((err) => console.error("Error calculating impacts:", err));
      }

      return {
        changed: true,
        previousRate,
        newRate,
        effectiveDate,
        termsUpdated,
        errors,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to check and update prime rate: ${message}`);
    }
  }

  /**
   * Get prime rate history within a date range
   */
  async getHistory(startDate: string, endDate: string) {
    return await this.primeRateHistory.findByDateRange(startDate, endDate);
  }

  /**
   * Get the latest prime rate from history
   */
  async getLatest(): Promise<{ rate: number; effectiveDate: string } | undefined> {
    const latest = await this.primeRateHistory.findLatest();
    if (!latest) {
      return undefined;
    }
    return {
      rate: Number(latest.primeRate),
      effectiveDate: latest.effectiveDate,
    };
  }
}
