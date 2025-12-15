/**
 * Payment Skipping Calculations
 *
 * **Canadian Mortgage Rule:**
 * Some lenders allow borrowers to skip payments (typically 1-2 per year) with the following rules:
 * 1. Interest still accrues during the skipped period
 * 2. Balance increases (negative amortization)
 * 3. Amortization period extends
 * 4. Skipped interest is added to principal
 * 5. Usually limited to 1-2 skipped payments per calendar year
 *
 * **Common Use Cases:**
 * - Financial hardship
 * - Seasonal income variations
 * - Emergency expenses
 */

import type { PaymentFrequency } from "./mortgage";
import { calculateInterestPayment, getPaymentsPerYear } from "./mortgage";

export interface SkippedPaymentCalculation {
  /** Interest that accrues during the skipped payment period */
  interestAccrued: number;
  /** New balance after skipping (old balance + interest) */
  newBalance: number;
  /** Extended amortization period (in months) */
  extendedAmortizationMonths: number;
}

/**
 * Calculate the impact of skipping a payment
 *
 * When a payment is skipped:
 * - No principal is paid
 * - Interest accrues and is added to the balance
 * - Balance increases (negative amortization)
 * - Amortization period extends
 *
 * @param currentBalance - Current mortgage balance
 * @param annualRate - Annual interest rate (as decimal, e.g., 0.0549)
 * @param frequency - Payment frequency
 * @param currentAmortizationMonths - Current remaining amortization period
 * @returns Calculation of skipped payment impact
 */
export function calculateSkippedPayment(
  currentBalance: number,
  annualRate: number,
  frequency: PaymentFrequency,
  currentAmortizationMonths: number
): SkippedPaymentCalculation {
  // Calculate interest that accrues during the skipped payment period
  const interestAccrued = calculateInterestPayment(currentBalance, annualRate, frequency);

  // New balance = old balance + accrued interest (no payment made)
  const newBalance = currentBalance + interestAccrued;

  // Amortization extends because balance increased
  // Estimate: if balance increased by X%, amortization extends by approximately X%
  // More accurate: recalculate based on payment amount and new balance
  // For now, we'll extend by the equivalent of one payment period
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const monthsPerPayment = 12 / paymentsPerYear;
  const extendedAmortizationMonths = currentAmortizationMonths + monthsPerPayment;

  return {
    interestAccrued: Math.round(interestAccrued * 100) / 100, // Round to nearest cent
    newBalance: Math.round(newBalance * 100) / 100,
    extendedAmortizationMonths: Math.round(extendedAmortizationMonths),
  };
}

/**
 * Validate if a payment can be skipped
 *
 * **Canadian Lender Rules:**
 * - Typically limited to 1-2 skipped payments per calendar year
 * - Some lenders allow more, some less
 * - Usually requires lender approval
 * - Cannot skip if already at maximum limit
 *
 * @param skippedPaymentsThisYear - Number of payments already skipped this calendar year
 * @param maxSkipsPerYear - Maximum allowed skips per year (default: 2)
 * @returns True if payment can be skipped
 */
export function canSkipPayment(
  skippedPaymentsThisYear: number,
  maxSkipsPerYear: number = 2
): boolean {
  return skippedPaymentsThisYear < maxSkipsPerYear;
}

/**
 * Count skipped payments in a given year
 *
 * @param payments - Array of payments with isSkipped flag
 * @param year - Year to count (defaults to current year)
 * @returns Number of skipped payments in the year
 */
export function countSkippedPaymentsInYear(
  payments: Array<{ paymentDate: string | Date; isSkipped: number | boolean }>,
  year?: number
): number {
  const targetYear = year ?? new Date().getFullYear();

  return payments.filter((payment) => {
    const paymentDate = new Date(payment.paymentDate);
    const isSkipped =
      typeof payment.isSkipped === "boolean" ? payment.isSkipped : payment.isSkipped === 1;

    return paymentDate.getFullYear() === targetYear && isSkipped;
  }).length;
}

/**
 * Calculate total interest accrued from skipped payments
 *
 * @param payments - Array of payments with skipped interest
 * @returns Total interest accrued from all skipped payments
 */
export function calculateTotalSkippedInterest(
  payments: Array<{ skippedInterestAccrued: string | number }>
): number {
  return payments.reduce((total, payment) => {
    const interest =
      typeof payment.skippedInterestAccrued === "string"
        ? parseFloat(payment.skippedInterestAccrued)
        : payment.skippedInterestAccrued;
    return total + (interest || 0);
  }, 0);
}
