import type { MortgageTerm, MortgagePayment } from "@shared/schema";
import type { UiTerm, UiPayment } from "../types";

export function normalizeTerm(term: MortgageTerm | undefined): UiTerm | null {
  if (!term) return null;
  return {
    id: term.id,
    mortgageId: term.mortgageId,
    termType: term.termType as UiTerm["termType"],
    startDate: term.startDate,
    endDate: term.endDate,
    termYears: term.termYears,
    lockedSpread: Number(term.lockedSpread || 0),
    fixedRate: term.fixedRate ? Number(term.fixedRate) : null,
    primeRate: term.primeRate ? Number(term.primeRate) : null,
    paymentFrequency: term.paymentFrequency as UiTerm["paymentFrequency"],
    regularPaymentAmount: Number(term.regularPaymentAmount),
  };
}

export function normalizePayments(
  payments: MortgagePayment[] | undefined,
  terms: MortgageTerm[] | undefined
): UiPayment[] {
  if (!payments) return [];
  return payments.map((payment) => {
    const paymentDate = new Date(payment.paymentDate);
    const term = terms?.find((t) => t.id === payment.termId);

    return {
      id: payment.id,
      date: payment.paymentDate,
      year: paymentDate.getFullYear(),
      paymentPeriodLabel: payment.paymentPeriodLabel || undefined,
      regularPaymentAmount: Number(payment.regularPaymentAmount || 0),
      prepaymentAmount: Number(payment.prepaymentAmount || 0),
      paymentAmount: Number(payment.paymentAmount),
      primeRate: payment.primeRate ? Number(payment.primeRate) : undefined,
      termSpread: term?.lockedSpread ? Number(term.lockedSpread) : undefined,
      effectiveRate: Number(payment.effectiveRate),
      principal: Number(payment.principalPaid),
      interest: Number(payment.interestPaid),
      remainingBalance: Number(payment.remainingBalance),
      mortgageType: term?.termType || "Unknown",
      triggerHit: payment.triggerRateHit === 1,
      amortizationYears: payment.remainingAmortizationMonths / 12,
      termStartDate: term?.startDate,
      remainingAmortizationMonths: payment.remainingAmortizationMonths,
      // Payment skipping fields
      isSkipped: payment.isSkipped === 1,
      skippedInterestAccrued: Number(payment.skippedInterestAccrued || 0),
    };
  });
}
