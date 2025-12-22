import type {
  PrimeRateHistoryRepository,
  MortgageTermsRepository,
  MortgagesRepository,
} from "@infrastructure/repositories";
import { MortgageTerm } from "@shared/schema";
import { fetchLatestPrimeRate } from "@server-shared/services/prime-rate";
import { ImpactCalculator } from "./impact-calculator.service";
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
    private readonly impactCalculator: ImpactCalculator
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
          // Update the term's prime rate directly
          await this.mortgageTerms.update(term.id, {
            primeRate: newRate.toFixed(3),
          });
          termsUpdated++;
          updatedTerms.push(term);
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
