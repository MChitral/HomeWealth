/**
 * Client-side Mortgage Calculation Utilities
 *
 * These are simplified versions of server-side calculations for client-side use.
 * For complex calculations, use the API endpoints.
 */

export type PaymentFrequency =
  | "monthly" // 12 payments/year
  | "semi-monthly" // 24 payments/year
  | "biweekly" // 26 payments/year
  | "accelerated-biweekly" // 26 payments/year, pays off faster
  | "weekly" // 52 payments/year
  | "accelerated-weekly"; // 52 payments/year, pays off faster

/**
 * Get number of payments per year for a given frequency
 */
export function getPaymentsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case "monthly":
      return 12;
    case "semi-monthly":
      return 24;
    case "biweekly":
      return 26;
    case "accelerated-biweekly":
      return 26;
    case "weekly":
      return 52;
    case "accelerated-weekly":
      return 52;
  }
}

/**
 * Convert annual nominal rate to effective periodic rate for Canadian mortgages
 *
 * Canadian mortgages use semi-annual compounding:
 * 1. Convert annual rate to semi-annual effective rate
 * 2. Convert semi-annual rate to payment frequency rate
 *
 * @param annualRate - Annual nominal interest rate (e.g., 0.0549 for 5.49%)
 * @param frequency - Payment frequency
 * @returns Effective rate per payment period
 */
export function getEffectivePeriodicRate(annualRate: number, frequency: PaymentFrequency): number {
  // Step 1: Convert annual rate to semi-annual effective rate
  const semiAnnualRate = annualRate / 2;

  // Step 2: Calculate effective annual rate from semi-annual compounding
  // EAR = (1 + r/2)^2 - 1
  const effectiveAnnualRate = Math.pow(1 + semiAnnualRate, 2) - 1;

  // Step 3: Convert to periodic rate based on payment frequency
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const effectivePeriodicRate = Math.pow(1 + effectiveAnnualRate, 1 / paymentsPerYear) - 1;

  return effectivePeriodicRate;
}

/**
 * Calculate interest portion of a payment
 *
 * @param remainingBalance - Current principal balance
 * @param annualRate - Annual nominal interest rate
 * @param frequency - Payment frequency
 * @returns Interest amount for this payment (rounded to nearest cent)
 */
export function calculateInterestPayment(
  remainingBalance: number,
  annualRate: number,
  frequency: PaymentFrequency
): number {
  const periodicRate = getEffectivePeriodicRate(annualRate, frequency);
  // Round to nearest cent (Canadian lender convention)
  return Math.round(remainingBalance * periodicRate * 100) / 100;
}
