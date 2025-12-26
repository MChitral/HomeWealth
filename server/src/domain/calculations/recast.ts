import { calculatePayment, type PaymentFrequency } from "@server-shared/calculations/mortgage";

/**
 * Recast calculation result
 */
export interface RecastResult {
  previousBalance: number;
  newBalance: number;
  previousPaymentAmount: number;
  newPaymentAmount: number;
  paymentReduction: number;
  remainingAmortizationMonths: number;
}

/**
 * Calculate mortgage recast after a large prepayment
 *
 * Recast occurs when a large prepayment is made and the lender recalculates
 * the payment based on the new (lower) balance. The payment amount decreases
 * while keeping the same amortization period.
 *
 * @param currentBalance - Current mortgage balance before prepayment
 * @param prepaymentAmount - Amount of prepayment to apply
 * @param annualRate - Annual interest rate (decimal, e.g., 0.0549 for 5.49%)
 * @param remainingAmortizationMonths - Remaining amortization period in months
 * @param paymentFrequency - Current payment frequency
 * @param currentPaymentAmount - Current payment amount (for comparison)
 * @returns Recast calculation result
 */
export function calculateRecastPayment(
  currentBalance: number,
  prepaymentAmount: number,
  annualRate: number,
  remainingAmortizationMonths: number,
  paymentFrequency: PaymentFrequency,
  currentPaymentAmount: number
): RecastResult {
  // Validate inputs
  if (currentBalance <= 0) {
    throw new Error("Current balance must be greater than zero");
  }
  if (prepaymentAmount <= 0) {
    throw new Error("Prepayment amount must be greater than zero");
  }
  if (prepaymentAmount >= currentBalance) {
    throw new Error("Prepayment amount cannot exceed current balance");
  }
  if (remainingAmortizationMonths <= 0) {
    throw new Error("Remaining amortization must be greater than zero");
  }
  if (annualRate < 0) {
    throw new Error("Annual rate cannot be negative");
  }

  // Calculate new balance after prepayment
  const newBalance = currentBalance - prepaymentAmount;

  // Edge case: If balance is very small, payment might be minimal
  if (newBalance < 0.01) {
    return {
      previousBalance: currentBalance,
      newBalance: 0,
      previousPaymentAmount: currentPaymentAmount,
      newPaymentAmount: 0,
      paymentReduction: currentPaymentAmount,
      remainingAmortizationMonths: 0,
    };
  }

  // Calculate new payment amount based on new balance and remaining amortization
  const newPaymentAmount = calculatePayment(
    newBalance,
    annualRate,
    remainingAmortizationMonths,
    paymentFrequency
  );

  // Calculate payment reduction
  const paymentReduction = currentPaymentAmount - newPaymentAmount;

  return {
    previousBalance: currentBalance,
    newBalance,
    previousPaymentAmount: currentPaymentAmount,
    newPaymentAmount,
    paymentReduction,
    remainingAmortizationMonths,
  };
}

