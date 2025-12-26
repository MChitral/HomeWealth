import type { MarketRatesRepository } from "@infrastructure/repositories";
import { fetchLatestMarketRate } from "@server-shared/services/market-rate";
import type { MarketRate } from "@shared/schema";

export class MarketRateService {
  constructor(private readonly marketRatesRepo: MarketRatesRepository) {}

  /**
   * Get current market rate for a given term type and length
   * Returns cached rate from database if available (within 7 days), otherwise fetches latest
   *
   * @param rateType - Type of rate (fixed, variable-changing, variable-fixed)
   * @param termYears - Term length in years (1, 2, 3, 4, 5, 7, 10)
   * @returns Market rate as decimal (e.g., 0.0549 for 5.49%) or null if unavailable
   */
  async getMarketRate(
    rateType: "fixed" | "variable-changing" | "variable-fixed",
    termYears: number
  ): Promise<number | null> {
    // Try to get latest from database first
    const latest = await this.marketRatesRepo.findLatest(rateType, termYears);

    // If we have a recent rate (within 7 days), use it
    if (latest) {
      const latestDate = new Date(latest.effectiveDate);
      const daysSince = (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 7) {
        return Number(latest.rate) / 100; // Convert to decimal
      }
    }

    // Otherwise, fetch latest and store
    try {
      const data = await fetchLatestMarketRate(rateType, termYears);
      await this.marketRatesRepo.create({
        rateType: data.rateType,
        termYears: data.termYears,
        rate: data.rate.toFixed(3),
        effectiveDate: data.effectiveDate,
        source: "Bank of Canada",
      });
      return data.rate / 100; // Convert to decimal
    } catch (error) {
      console.error("Failed to fetch market rate:", error);
      // Return cached rate if available, even if old
      return latest ? Number(latest.rate) / 100 : null;
    }
  }

  /**
   * Fetch and store latest rates for all common term types and lengths
   * Called by scheduled job
   */
  async fetchAndStoreLatestRates(): Promise<void> {
    const termTypes: Array<"fixed" | "variable-changing" | "variable-fixed"> = [
      "fixed",
      "variable-changing",
      "variable-fixed",
    ];
    const termLengths = [1, 2, 3, 4, 5, 7, 10];

    for (const rateType of termTypes) {
      for (const termYears of termLengths) {
        try {
          // Check if rate already exists for today
          const today = new Date().toISOString().split("T")[0];
          const exists = await this.marketRatesRepo.existsForDate(rateType, termYears, today);

          if (exists) {
            continue; // Skip if already fetched today
          }

          const data = await fetchLatestMarketRate(rateType, termYears);
          await this.marketRatesRepo.create({
            rateType: data.rateType,
            termYears: data.termYears,
            rate: data.rate.toFixed(3),
            effectiveDate: data.effectiveDate,
            source: "Bank of Canada",
          });
        } catch (error) {
          console.error(`Failed to fetch market rate for ${rateType} ${termYears}yr:`, error);
          // Continue with other rates
        }
      }
    }
  }

  /**
   * Get historical market rates for a date range
   *
   * @param rateType - Type of rate
   * @param termYears - Term length in years
   * @param startDate - Start date for range
   * @param endDate - End date for range
   * @returns Array of market rates
   */
  async getHistoricalRates(
    rateType: string,
    termYears: number,
    startDate: Date,
    endDate: Date
  ): Promise<MarketRate[]> {
    return this.marketRatesRepo.findByDateRange(rateType, termYears, startDate, endDate);
  }
}
