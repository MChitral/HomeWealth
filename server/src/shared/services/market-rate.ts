import { fetchLatestPrimeRate } from "./prime-rate";

export interface MarketRateData {
  rate: number;
  effectiveDate: string;
  rateType: "fixed" | "variable-changing" | "variable-fixed";
  termYears: number;
}

/**
 * Fetch latest market rate from Bank of Canada
 *
 * **Note:** Bank of Canada doesn't provide direct mortgage rate APIs like prime rate.
 * We use a combination of:
 * 1. Posted rates (if available via API)
 * 2. Prime rate + typical spread for variable rates
 * 3. Estimated fixed rates based on prime rate + spread
 *
 * **For MVP:**
 * - Fixed rates: Use prime rate + spread (typically Prime + 1.5% to 2.5% for 5-year fixed)
 * - Variable rates: Use prime rate + spread (typically Prime - 0.5% to Prime - 1.0%)
 *
 * **Future Enhancement:**
 * - Research Bank of Canada posted rates API
 * - Integrate with rate comparison sites (Ratehub, RateSpy)
 * - Allow manual rate entry
 *
 * @param rateType - Type of rate (fixed, variable-changing, variable-fixed)
 * @param termYears - Term length in years (3, 4, 5, etc.)
 * @returns Market rate data
 */
export async function fetchLatestMarketRate(
  rateType: "fixed" | "variable-changing" | "variable-fixed",
  termYears: number
): Promise<MarketRateData> {
  // Fetch current prime rate
  const { primeRate, effectiveDate } = await fetchLatestPrimeRate();

  let rate: number;

  if (rateType === "fixed") {
    // For fixed rates, use prime rate + spread
    // Typical spreads: 5-year fixed ≈ Prime + 1.5% to 2.5%
    // Adjust based on term length (longer terms typically have higher rates)
    const baseSpread = 2.0; // Base spread for 5-year fixed
    const termAdjustment = (termYears - 5) * 0.1; // Adjust by 0.1% per year difference
    const spread = baseSpread + termAdjustment;
    rate = primeRate + spread;
  } else {
    // For variable rates (both changing and fixed payment), use prime rate + spread
    // Typical spreads: Prime - 0.5% to Prime - 1.0%
    // Use Prime - 0.75% as default
    const spread = -0.75;
    rate = primeRate + spread;
  }

  return {
    rate: Math.round(rate * 1000) / 1000, // Round to 3 decimal places
    effectiveDate,
    rateType,
    termYears,
  };
}

/**
 * Get typical market rate spread for a given rate type and term
 * Used for fallback calculations
 */
export function getTypicalSpread(
  rateType: "fixed" | "variable-changing" | "variable-fixed",
  termYears: number
): number {
  if (rateType === "fixed") {
    // Fixed rate spreads vary by term length
    // 1-year: Prime + 1.0%
    // 3-year: Prime + 1.5%
    // 5-year: Prime + 2.0%
    // 7-year: Prime + 2.2%
    // 10-year: Prime + 2.5%
    const spreads: Record<number, number> = {
      1: 1.0,
      2: 1.3,
      3: 1.5,
      4: 1.8,
      5: 2.0,
      7: 2.2,
      10: 2.5,
    };
    return spreads[termYears] ?? 2.0; // Default to 2.0% for unknown terms
  } else {
    // Variable rates: Prime - 0.75% (typical)
    return -0.75;
  }
}
