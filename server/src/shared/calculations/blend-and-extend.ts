/**
 * Blend-and-Extend Renewal Calculations
 * 
 * **Canadian Mortgage Rule:**
 * Blend-and-extend is a renewal option where:
 * 1. The new rate is "blended" between the old rate and current market rate
 * 2. The amortization period can be extended (e.g., 20 years remaining → 25 years)
 * 3. This helps borrowers lower payments by extending the term
 * 
 * **Blended Rate Calculation:**
 * The blended rate is a weighted average based on:
 * - Remaining balance at renewal
 * - Time remaining in old term
 * - Current market rate
 * 
 * Formula: blendedRate = (oldRate × oldBalance + newRate × newBalance) / totalBalance
 * Where newBalance is the amount that would be at the new rate
 */

import { calculatePayment, type PaymentFrequency } from "./mortgage";

export interface BlendAndExtendInput {
  /** Current rate from expiring term */
  oldRate: number;
  /** Current market rate for new term */
  newMarketRate: number;
  /** Remaining balance at renewal */
  remainingBalance: number;
  /** Remaining time in old term (in months) */
  remainingTermMonths: number;
  /** Original amortization period (months) */
  originalAmortizationMonths: number;
  /** Remaining amortization period (months) - before extension */
  remainingAmortizationMonths: number;
  /** Extended amortization period (months) - after extension */
  extendedAmortizationMonths: number;
  /** Payment frequency */
  frequency: PaymentFrequency;
}

export interface BlendAndExtendResult {
  /** Blended interest rate (decimal, e.g., 0.0595 for 5.95%) */
  blendedRate: number;
  /** New payment amount with blended rate and extended amortization */
  newPaymentAmount: number;
  /** Payment amount if using new market rate (for comparison) */
  marketRatePaymentAmount: number;
  /** Payment amount if using old rate (for comparison) */
  oldRatePaymentAmount: number;
  /** Interest savings vs market rate (per payment) */
  interestSavingsPerPayment: number;
}

/**
 * Calculate blended rate for blend-and-extend renewal
 * 
 * **Blended Rate Formula:**
 * The rate is weighted by the remaining balance and time:
 * - Old rate applies to remaining balance for remaining term
 * - New rate applies to the balance going forward
 * 
 * Simplified approach (most lenders use):
 * blendedRate = oldRate × weight + newMarketRate × (1 - weight)
 * where weight = remainingTermMonths / (remainingTermMonths + newTermMonths)
 * 
 * @param oldRate - Current rate from expiring term
 * @param newMarketRate - Current market rate for new term
 * @param remainingTermMonths - Months remaining in old term
 * @param newTermMonths - Months in new term (typically 36-60 months)
 * @returns Blended rate (as decimal)
 */
export function calculateBlendedRate(
  oldRate: number,
  newMarketRate: number,
  remainingTermMonths: number,
  newTermMonths: number = 60 // Default 5-year term
): number {
  // Weight based on time remaining vs new term length
  // More weight to old rate if more time remaining
  const totalMonths = remainingTermMonths + newTermMonths;
  const oldWeight = remainingTermMonths / totalMonths;
  const newWeight = 1 - oldWeight;

  // Blended rate is weighted average
  const blendedRate = (oldRate * oldWeight) + (newMarketRate * newWeight);

  // Round to 3 decimal places (standard rate precision)
  return Math.round(blendedRate * 1000) / 1000;
}

/**
 * Calculate blend-and-extend renewal parameters
 * 
 * This function calculates:
 * 1. Blended rate between old and new rates
 * 2. New payment amount using blended rate and extended amortization
 * 3. Comparison payments for analysis
 * 
 * @param input - Blend-and-extend parameters
 * @returns Calculated blend-and-extend result
 */
export function calculateBlendAndExtend(input: BlendAndExtendInput): BlendAndExtendResult {
  const {
    oldRate,
    newMarketRate,
    remainingBalance,
    remainingTermMonths,
    extendedAmortizationMonths,
    frequency,
  } = input;

  // Calculate blended rate
  // Assume new term is 5 years (60 months) - typical Canadian term
  const newTermMonths = 60;
  const blendedRate = calculateBlendedRate(
    oldRate,
    newMarketRate,
    remainingTermMonths,
    newTermMonths
  );

  // Calculate payment with blended rate and extended amortization
  const newPaymentAmount = calculatePayment(
    remainingBalance,
    blendedRate,
    extendedAmortizationMonths,
    frequency
  );

  // Calculate comparison payments
  const marketRatePaymentAmount = calculatePayment(
    remainingBalance,
    newMarketRate,
    extendedAmortizationMonths,
    frequency
  );

  const oldRatePaymentAmount = calculatePayment(
    remainingBalance,
    oldRate,
    input.remainingAmortizationMonths, // Use remaining, not extended
    frequency
  );

  // Interest savings per payment (vs market rate)
  const interestSavingsPerPayment = marketRatePaymentAmount - newPaymentAmount;

  return {
    blendedRate,
    newPaymentAmount,
    marketRatePaymentAmount,
    oldRatePaymentAmount,
    interestSavingsPerPayment,
  };
}

/**
 * Calculate extended amortization period
 * 
 * **Canadian Mortgage Rule:**
 * At renewal, borrowers can extend amortization:
 * - From remaining period (e.g., 20 years) to original (e.g., 25 years)
 * - Or to a longer period (e.g., 30 years) if lender allows
 * 
 * **Common Scenarios:**
 * - Original: 25 years, Remaining: 20 years → Extend to 25 years
 * - Original: 25 years, Remaining: 20 years → Extend to 30 years (if allowed)
 * 
 * @param remainingAmortizationMonths - Current remaining amortization
 * @param originalAmortizationMonths - Original amortization period
 * @param extendToMonths - Desired extended amortization (optional, defaults to original)
 * @returns Extended amortization period in months
 */
export function calculateExtendedAmortization(
  remainingAmortizationMonths: number,
  originalAmortizationMonths: number,
  extendToMonths?: number
): number {
  // If not specified, extend to original amortization
  if (extendToMonths === undefined) {
    return originalAmortizationMonths;
  }

  // Ensure extended period is not less than remaining
  if (extendToMonths < remainingAmortizationMonths) {
    throw new Error(
      `Extended amortization (${extendToMonths} months) cannot be less than remaining (${remainingAmortizationMonths} months)`
    );
  }

  // Typical maximum: 30 years (360 months) for conventional mortgages
  if (extendToMonths > 360) {
    throw new Error(
      `Extended amortization (${extendToMonths} months) exceeds maximum allowed (360 months / 30 years)`
    );
  }

  return extendToMonths;
}

