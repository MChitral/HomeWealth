import type { InterestAccrualBasis } from "@shared/mortgage-ledger";

export type PaymentFrequency =
  | "monthly"
  | "semi-monthly"
  | "biweekly"
  | "accelerated-biweekly"
  | "weekly"
  | "accelerated-weekly";

export function getPaymentsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case "monthly":
      return 12;
    case "semi-monthly":
      return 24;
    case "biweekly":
    case "accelerated-biweekly":
      return 26;
    case "weekly":
    case "accelerated-weekly":
      return 52;
    default:
      return 12;
  }
}

export function getEffectivePeriodicRate(annualRate: number, frequency: PaymentFrequency): number {
  const semiAnnualRate = annualRate / 2;
  const effectiveAnnualRate = Math.pow(1 + semiAnnualRate, 2) - 1;
  const paymentsPerYear = getPaymentsPerYear(frequency);
  return Math.pow(1 + effectiveAnnualRate, 1 / paymentsPerYear) - 1;
}

export function calculatePayment(
  principal: number,
  annualRate: number,
  amortizationMonths: number,
  frequency: PaymentFrequency
): number {
  if (principal <= 0 || amortizationMonths <= 0) return 0;

  if (frequency === "accelerated-biweekly") {
    const monthly = calculatePayment(principal, annualRate, amortizationMonths, "monthly");
    return monthly / 2;
  }
  if (frequency === "accelerated-weekly") {
    const monthly = calculatePayment(principal, annualRate, amortizationMonths, "monthly");
    return monthly / 4;
  }

  const paymentsPerYear = getPaymentsPerYear(frequency);
  const totalPayments = (amortizationMonths / 12) * paymentsPerYear;
  const periodicRate = getEffectivePeriodicRate(annualRate, frequency);

  if (periodicRate === 0) {
    return principal / totalPayments;
  }

  return (periodicRate * principal) / (1 - Math.pow(1 + periodicRate, -totalPayments));
}

export interface PaymentBreakdown {
  principal: number;
  interest: number;
  remainingBalance: number;
  triggerRateHit: boolean;
  remainingAmortizationMonths: number;
}

export interface PaymentBreakdownInput {
  balance: number;
  paymentAmount: number;
  regularPaymentAmount?: number;
  extraPrepaymentAmount?: number;
  frequency: PaymentFrequency;
  annualRate: number;
  interestAccrualBasis?: InterestAccrualBasis;
  periodStartDate?: string;
  periodEndDate?: string;
}

function getActualDays(startDate?: string, endDate?: string): number | null {
  if (!startDate || !endDate) return null;
  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);
  const days = (end - start) / (24 * 60 * 60 * 1000);
  return Number.isInteger(days) && days > 0 ? days : null;
}

export function calculatePaymentBreakdown({
  balance,
  paymentAmount,
  regularPaymentAmount,
  extraPrepaymentAmount = 0,
  frequency,
  annualRate,
  interestAccrualBasis = "canadian-semi-annual",
  periodStartDate,
  periodEndDate,
}: PaymentBreakdownInput): PaymentBreakdown {
  if (balance <= 0 || paymentAmount <= 0) {
    return {
      principal: 0,
      interest: 0,
      remainingBalance: balance,
      triggerRateHit: false,
      remainingAmortizationMonths: 0,
    };
  }

  const periodicRate = getEffectivePeriodicRate(annualRate, frequency);
  const actualDays = getActualDays(periodStartDate, periodEndDate);
  const interestPortion =
    interestAccrualBasis === "actual-365" && actualDays
      ? balance * annualRate * (actualDays / 365)
      : balance * periodicRate;
  const scheduledPrincipal = Math.max(paymentAmount - interestPortion - extraPrepaymentAmount, 0);
  const totalPrincipal = Math.min(balance, scheduledPrincipal + extraPrepaymentAmount);
  const remainingBalance = Math.max(0, balance - totalPrincipal);

  const triggerRatePayment = regularPaymentAmount ?? paymentAmount;
  const triggerRateHit = triggerRatePayment <= interestPortion;

  let remainingAmortizationMonths = 0;
  if (
    !triggerRateHit &&
    regularPaymentAmount &&
    regularPaymentAmount > interestPortion &&
    periodicRate > 0
  ) {
    const paymentsPerYear = getPaymentsPerYear(frequency);
    const remainingPayments =
      -Math.log(1 - (periodicRate * remainingBalance) / regularPaymentAmount) /
      Math.log(1 + periodicRate);
    if (Number.isFinite(remainingPayments) && remainingPayments > 0) {
      remainingAmortizationMonths = Math.round((remainingPayments / paymentsPerYear) * 12);
    }
  }

  return {
    principal: Number(totalPrincipal.toFixed(2)),
    interest: Number(Math.min(interestPortion, paymentAmount).toFixed(2)),
    remainingBalance: Number(remainingBalance.toFixed(2)),
    triggerRateHit,
    remainingAmortizationMonths,
  };
}

export function advancePaymentDate(date: Date, frequency: PaymentFrequency): Date {
  const next = new Date(date);
  switch (frequency) {
    case "monthly": {
      const day = next.getDate();
      next.setMonth(next.getMonth() + 1);
      const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(day, lastDay));
      return next;
    }
    case "semi-monthly":
      next.setDate(next.getDate() + 15);
      return next;
    case "biweekly":
    case "accelerated-biweekly":
      next.setDate(next.getDate() + 14);
      return next;
    case "weekly":
    case "accelerated-weekly":
      next.setDate(next.getDate() + 7);
      return next;
    default:
      return next;
  }
}
