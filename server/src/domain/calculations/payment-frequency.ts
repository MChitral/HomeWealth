import { calculatePayment, type PaymentFrequency } from "@server-shared/calculations/mortgage";

/**
 * Payment frequency change calculation result
 */
export interface PaymentFrequencyChangeResult {
  oldFrequency: PaymentFrequency;
  newFrequency: PaymentFrequency;
  oldPaymentAmount: number;
  newPaymentAmount: number;
  paymentDifference: number;
  remainingTermMonths: number;
  interestSavings?: number;
  payoffTimeDifference?: number; // in months
}

/**
 * Calculate new payment amount when changing payment frequency mid-term
 *
 * The payment amount is recalculated based on:
 * - Current balance
 * - Interest rate (unchanged)
 * - Remaining amortization period
 * - New payment frequency
 *
 * @param currentBalance - Current mortgage balance
 * @param annualRate - Annual interest rate (decimal, e.g., 0.0549 for 5.49%)
 * @param remainingAmortizationMonths - Remaining amortization period in months
 * @param oldFrequency - Current payment frequency
 * @param newFrequency - New payment frequency
 * @param oldPaymentAmount - Current payment amount (for comparison)
 * @returns Payment frequency change calculation result
 */
export function calculatePaymentForFrequency(
  currentBalance: number,
  annualRate: number,
  remainingAmortizationMonths: number,
  oldFrequency: PaymentFrequency,
  newFrequency: PaymentFrequency,
  oldPaymentAmount: number
): PaymentFrequencyChangeResult {
  // Validate inputs
  if (currentBalance <= 0) {
    throw new Error("Current balance must be greater than zero");
  }
  if (remainingAmortizationMonths <= 0) {
    throw new Error("Remaining amortization must be greater than zero");
  }
  if (annualRate < 0) {
    throw new Error("Annual rate cannot be negative");
  }
  if (oldFrequency === newFrequency) {
    throw new Error("New frequency must be different from current frequency");
  }

  // Calculate new payment amount based on new frequency
  const newPaymentAmount = calculatePayment(
    currentBalance,
    annualRate,
    remainingAmortizationMonths,
    newFrequency
  );

  // Calculate payment difference
  const paymentDifference = newPaymentAmount - oldPaymentAmount;

  return {
    oldFrequency,
    newFrequency,
    oldPaymentAmount,
    newPaymentAmount,
    paymentDifference,
    remainingTermMonths: remainingAmortizationMonths,
  };
}
