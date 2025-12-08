import { useMemo } from "react";
import { normalizePayments, normalizeTerm } from "../utils/normalize";
import type { Mortgage } from "@shared/schema";
import type { MortgageTerm } from "@shared/schema";
import type { UiPayment, UiTerm } from "../types";
import type { PrimeRateResponse } from "../api";

interface UseMortgageComputedProps {
  mortgage: Mortgage | null;
  terms: MortgageTerm[] | undefined;
  payments: any[] | undefined;
  primeRateData?: PrimeRateResponse;
  primeRate: string;
  filterYear: string;
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
}: UseMortgageComputedProps) {
  const uiCurrentTerm = useMemo(() => normalizeTerm(terms ? terms[terms.length - 1] : undefined), [terms]);
  const paymentHistory = useMemo(() => normalizePayments(payments, terms), [payments, terms]);

  const lastKnownBalance =
    paymentHistory[paymentHistory.length - 1]?.remainingBalance ?? Number(mortgage?.currentBalance || 0);
  const lastKnownAmortizationMonths =
    paymentHistory[paymentHistory.length - 1]?.remainingAmortizationMonths ?? (mortgage ? mortgage.amortizationYears * 12 : 0);

  // Always prefer current prime rate from API, never use stale values from term or payments
  // For variable rate mortgages, the prime rate changes over time, so we must use the current rate
  const currentPrimeRateValue =
    primeRateData?.primeRate ??
    parseFloat(primeRate) ??
    // Only fall back to term/payment rates if API data is unavailable (should rarely happen)
    (uiCurrentTerm?.primeRate ?? null) ??
    paymentHistory[paymentHistory.length - 1]?.primeRate ??
    0;

  // Log for debugging - show spread calculation details
  if (uiCurrentTerm && uiCurrentTerm.termType !== "fixed") {
    const storedSpread = uiCurrentTerm.lockedSpread || 0;
    const calculatedEffective = Math.round((currentPrimeRateValue + storedSpread) * 100) / 100;
    console.log(
      `[Effective Rate Calculation]`,
      {
        primeRate: currentPrimeRateValue,
        primeSource: primeRateData ? 'API' : 'fallback',
        storedSpread: storedSpread,
        calculatedEffective: calculatedEffective,
        termId: uiCurrentTerm.id,
        note: 'If effective rate is wrong, check if spread (-0.9% vs -1.9%) or prime rate is incorrect'
      }
    );
  }

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
    }),
    [paymentHistory, mortgage, currentEffectiveRate, currentPrimeRateValue]
  );

  const filteredPayments = useMemo(
    () => (filterYear === "all" ? paymentHistory : paymentHistory.filter((p) => p.year.toString() === filterYear)),
    [paymentHistory, filterYear]
  );

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
    return Math.round((new Date(uiCurrentTerm.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
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

