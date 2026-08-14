import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";
import {
  calculateInterestPayment,
  calculatePrincipalPayment,
  calculateRemainingBalance,
  getEffectivePeriodicRate,
  getPaymentsPerYear,
  PaymentFrequency,
} from "./mortgage";
import { getTermEffectiveRate } from "./term-helpers";

interface PaymentValidationInput {
  mortgage: Mortgage;
  term: MortgageTerm;
  previousPayment?: MortgagePayment;
  paymentAmount: number;
  regularPaymentAmount: number;
  prepaymentAmount: number;
  remainingAmortizationMonths?: number;
  effectiveRateOverride?: number; // Optional: use this rate instead of term's current rate (for historical/backfilled payments)
}

export interface PaymentValidationResult {
  expectedInterest: number;
  expectedPrincipal: number;
  expectedBalance: number;
  triggerRateHit: boolean;
  remainingAmortizationMonths: number;
}

/**
 * Recalculate principal/interest split and remaining balance using authoritative Canadian mortgage rules.
 *
 * Rounding: All monetary amounts are rounded to nearest cent (2 decimal places) using .toFixed(2),
 * which matches the convention used by major Canadian lenders.
 */
export function validateMortgagePayment(input: PaymentValidationInput): PaymentValidationResult {
  const {
    mortgage,
    term,
    previousPayment,
    paymentAmount,
    prepaymentAmount,
    effectiveRateOverride,
  } = input;
  const frequency = term.paymentFrequency as PaymentFrequency;
  const amortizationMonths = mortgage.amortizationYears * 12 + (mortgage.amortizationMonths ?? 0);

  // Use provided rate override (for historical/backfilled payments) or fall back to term's current rate
  // effectiveRateOverride is expected to be a percentage (e.g., 5.49), convert to decimal
  const annualRate =
    effectiveRateOverride !== undefined ? effectiveRateOverride / 100 : getTermEffectiveRate(term);

  const balanceBeforePayment = previousPayment
    ? Number(previousPayment.remainingBalance)
    : Number(mortgage.currentBalance);

  // Reject malformed splits before doing any math — the server's calculated
  // splits are authoritative, and garbage inputs would silently corrupt the
  // balance history.
  if (
    !Number.isFinite(paymentAmount) ||
    !Number.isFinite(prepaymentAmount) ||
    paymentAmount < 0 ||
    prepaymentAmount < 0
  ) {
    throw new Error("Payment amounts must be non-negative numbers");
  }
  if (prepaymentAmount > paymentAmount) {
    throw new Error("Prepayment amount cannot exceed the total payment amount");
  }

  // The regular portion is what remains after the lump-sum prepayment.
  // Lump-sum prepayments apply 100% to principal (Canadian convention);
  // interest is only charged against the regular payment portion.
  const regularPortion = Math.max(0, paymentAmount - prepaymentAmount);
  const interestPayment =
    regularPortion > 0 ? calculateInterestPayment(balanceBeforePayment, annualRate, frequency) : 0;
  const principalPayment =
    regularPortion > 0 ? calculatePrincipalPayment(regularPortion, interestPayment) : 0;
  const totalPrincipalPayment = principalPayment + prepaymentAmount;
  const remainingBalance = calculateRemainingBalance(
    balanceBeforePayment,
    principalPayment,
    prepaymentAmount
  );

  const periodicRate = getEffectivePeriodicRate(annualRate, frequency);
  const interestOnlyPayment = balanceBeforePayment * periodicRate;
  // A pure lump-sum prepayment is not a regular payment, so it can never
  // count as a trigger-rate hit.
  const triggerRateHit = regularPortion > 0 && regularPortion <= interestOnlyPayment;

  const paymentsPerYear = getPaymentsPerYear(frequency);
  let remainingAmortizationMonths = input.remainingAmortizationMonths ?? amortizationMonths;
  // Recompute the payoff timeline from the RECURRING payment (the regular
  // portion, or the term's contractual payment for pure lump-sums). A
  // one-time prepayment shortens amortization via the lower balance — not by
  // pretending the lump-sum recurs every period.
  const recurringPayment =
    regularPortion > 0 ? regularPortion : Number(term.regularPaymentAmount ?? 0);
  if (
    remainingBalance > 0 &&
    periodicRate > 0 &&
    recurringPayment > remainingBalance * periodicRate
  ) {
    const remainingPayments =
      -Math.log(1 - (periodicRate * remainingBalance) / recurringPayment) /
      Math.log(1 + periodicRate);
    remainingAmortizationMonths = Math.round((remainingPayments / paymentsPerYear) * 12);
  }

  return {
    expectedInterest: Number(interestPayment.toFixed(2)),
    expectedPrincipal: Number(totalPrincipalPayment.toFixed(2)),
    expectedBalance: Number(remainingBalance.toFixed(2)),
    triggerRateHit,
    remainingAmortizationMonths,
  };
}
