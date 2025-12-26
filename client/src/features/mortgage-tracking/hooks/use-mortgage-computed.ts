import { useMemo } from "react";
import { normalizePayments, normalizeTerm } from "../utils/normalize";
import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";
import type { PrimeRateResponse } from "../api";

interface UseMortgageComputedProps {
  mortgage: Mortgage | null;
  terms: MortgageTerm[] | undefined;
  payments: MortgagePayment[] | undefined;
  primeRateData?: PrimeRateResponse;
  primeRate: string;
  filterYear: string;
  filterDateRange: { start: string | null; end: string | null };
  filterPaymentType: "all" | "regular" | "prepayment" | "skipped";
  searchAmount: string;
}

/**
 * Hook for computing derived values from mortgage data
 * Extracted from use-mortgage-tracking-state.ts for better organization
 */
export function useMortgageComputed({
  mortgage,
  terms,
  payments,
  primeRateData,
  primeRate,
  filterYear,
  filterDateRange,
  filterPaymentType,
  searchAmount,
}: UseMortgageComputedProps) {
  const uiCurrentTerm = useMemo(
    () => normalizeTerm(terms ? terms[terms.length - 1] : undefined),
    [terms]
  );
  const paymentHistory = useMemo(() => normalizePayments(payments, terms), [payments, terms]);

  const lastKnownBalance =
    paymentHistory[paymentHistory.length - 1]?.remainingBalance ??
    Number(mortgage?.currentBalance || 0);
  const lastKnownAmortizationMonths =
    paymentHistory[paymentHistory.length - 1]?.remainingAmortizationMonths ??
    (mortgage ? mortgage.amortizationYears * 12 : 0);

  // Always prefer current prime rate from API, never use stale values from term or payments
  // For variable rate mortgages, the prime rate changes over time, so we must use the current rate
  const currentPrimeRateValue =
    primeRateData?.primeRate ??
    parseFloat(primeRate) ??
    // Only fall back to term/payment rates if API data is unavailable (should rarely happen)
    uiCurrentTerm?.primeRate ??
    null ??
    paymentHistory[paymentHistory.length - 1]?.primeRate ??
    0;

  // Effective rate calculation for variable rate mortgages

  const currentEffectiveRate = uiCurrentTerm
    ? uiCurrentTerm.termType === "fixed" && uiCurrentTerm.fixedRate
      ? Math.round(uiCurrentTerm.fixedRate * 100) / 100
      : Math.round((currentPrimeRateValue + (uiCurrentTerm.lockedSpread || 0)) * 100) / 100
    : 0;

  const summaryStats = useMemo(
    () => ({
      totalPayments: paymentHistory.length,
      totalPaid: paymentHistory.reduce((sum, p) => sum + p.paymentAmount, 0),
      totalPrincipal: paymentHistory.reduce((sum, p) => sum + p.principal, 0),
      totalInterest: paymentHistory.reduce((sum, p) => sum + p.interest, 0),
      currentBalance: mortgage
        ? Number(mortgage.currentBalance)
        : paymentHistory[paymentHistory.length - 1]?.remainingBalance || 0,
      currentRate: currentEffectiveRate,
      currentPrimeRate: currentPrimeRateValue,
      amortizationYears: mortgage
        ? mortgage.amortizationYears
        : paymentHistory[paymentHistory.length - 1]?.amortizationYears || 30,
      triggerHitCount: paymentHistory.filter((p) => p.triggerHit).length,
      totalSkippedInterest: (payments || []).reduce(
        (sum, p) => sum + Number(p.skippedInterestAccrued || 0),
        0
      ),
    }),
    [paymentHistory, mortgage, currentEffectiveRate, currentPrimeRateValue, payments]
  );

  const filteredPayments = useMemo(() => {
    let filtered = paymentHistory;

    // Filter by year
    if (filterYear !== "all") {
      filtered = filtered.filter((p) => p.year.toString() === filterYear);
    }

    // Filter by date range
    if (filterDateRange.start || filterDateRange.end) {
      filtered = filtered.filter((p) => {
        const paymentDate = new Date(p.date);
        if (filterDateRange.start) {
          const startDate = new Date(filterDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          if (paymentDate < startDate) return false;
        }
        if (filterDateRange.end) {
          const endDate = new Date(filterDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (paymentDate > endDate) return false;
        }
        return true;
      });
    }

    // Filter by payment type
    if (filterPaymentType !== "all") {
      filtered = filtered.filter((p) => {
        if (filterPaymentType === "prepayment") {
          return p.prepaymentAmount > 0;
        }
        if (filterPaymentType === "skipped") {
          return p.isSkipped;
        }
        if (filterPaymentType === "regular") {
          return p.prepaymentAmount === 0 && !p.isSkipped;
        }
        return true;
      });
    }

    // Search by amount (searches in total payment amount, prepayment amount, principal, interest)
    if (searchAmount.trim()) {
      const searchValue = parseFloat(searchAmount.trim());
      if (!isNaN(searchValue)) {
        filtered = filtered.filter(
          (p) =>
            Math.abs(p.paymentAmount - searchValue) < 0.01 ||
            Math.abs(p.prepaymentAmount - searchValue) < 0.01 ||
            Math.abs(p.principal - searchValue) < 0.01 ||
            Math.abs(p.interest - searchValue) < 0.01
        );
      }
    }

    return filtered;
  }, [paymentHistory, filterYear, filterDateRange, filterPaymentType, searchAmount]);

  const availableYears = useMemo(
    () => Array.from(new Set(paymentHistory.map((p) => p.year))).sort((a, b) => b - a),
    [paymentHistory]
  );

  const effectiveRate = useMemo(() => {
    if (!uiCurrentTerm) return "0.00";
    if (uiCurrentTerm.termType === "fixed" && uiCurrentTerm.fixedRate) {
      return uiCurrentTerm.fixedRate.toFixed(2);
    }
    return (parseFloat(primeRate) + uiCurrentTerm.lockedSpread).toFixed(2);
  }, [uiCurrentTerm, primeRate]);

  const monthsRemainingInTerm = useMemo(() => {
    if (!uiCurrentTerm) return 0;
    return Math.round(
      (new Date(uiCurrentTerm.endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );
  }, [uiCurrentTerm]);

  return {
    uiCurrentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    currentPrimeRateValue,
    currentEffectiveRate,
    summaryStats,
    filteredPayments,
    availableYears,
    effectiveRate,
    monthsRemainingInTerm,
  };
}
