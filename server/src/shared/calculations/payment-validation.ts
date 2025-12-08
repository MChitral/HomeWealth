import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";
import { calculateInterestPayment, calculatePrincipalPayment, calculateRemainingBalance, getEffectivePeriodicRate, getPaymentsPerYear, PaymentFrequency } from "./mortgage";
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
  const { mortgage, term, previousPayment, paymentAmount, regularPaymentAmount, prepaymentAmount, effectiveRateOverride } = input;
  const frequency = term.paymentFrequency as PaymentFrequency;
  const amortizationMonths = mortgage.amortizationYears * 12 + (mortgage.amortizationMonths ?? 0);
  
  // Use provided rate override (for historical/backfilled payments) or fall back to term's current rate
  // effectiveRateOverride is expected to be a percentage (e.g., 5.49), convert to decimal
  const annualRate = effectiveRateOverride !== undefined
    ? effectiveRateOverride / 100
    : getTermEffectiveRate(term);

  const balanceBeforePayment = previousPayment
    ? Number(previousPayment.remainingBalance)
    : Number(mortgage.currentBalance);

  const interestPayment = calculateInterestPayment(balanceBeforePayment, annualRate, frequency);
  const principalPayment = calculatePrincipalPayment(paymentAmount, interestPayment);
  const totalPrincipalPayment = principalPayment + prepaymentAmount;
  const remainingBalance = calculateRemainingBalance(balanceBeforePayment, principalPayment, prepaymentAmount);

  const periodicRate = getEffectivePeriodicRate(annualRate, frequency);
  const interestOnlyPayment = balanceBeforePayment * periodicRate;
  const triggerRateHit = regularPaymentAmount <= interestOnlyPayment;

  const paymentsPerYear = getPaymentsPerYear(frequency);
  let remainingAmortizationMonths = input.remainingAmortizationMonths ?? amortizationMonths;
  if (!triggerRateHit && remainingBalance > 0 && periodicRate > 0) {
    // Use total payment amount (regular + prepayment) for accurate amortization calculation
    // Prepayments reduce the payoff timeline, so they should be included in the calculation
    const effectivePaymentAmount = paymentAmount; // paymentAmount already includes prepayments
    const remainingPayments = -Math.log(1 - (periodicRate * remainingBalance / effectivePaymentAmount)) / Math.log(1 + periodicRate);
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

