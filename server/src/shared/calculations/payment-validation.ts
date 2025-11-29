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
 */
export function validateMortgagePayment(input: PaymentValidationInput): PaymentValidationResult {
  const { mortgage, term, previousPayment, paymentAmount, regularPaymentAmount, prepaymentAmount } = input;
  const frequency = term.paymentFrequency as PaymentFrequency;
  const amortizationMonths = mortgage.amortizationYears * 12 + (mortgage.amortizationMonths ?? 0);
  const annualRate = getTermEffectiveRate(term);

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
    const remainingPayments = -Math.log(1 - (periodicRate * remainingBalance / regularPaymentAmount)) / Math.log(1 + periodicRate);
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

