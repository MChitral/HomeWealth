import { useEffect, useMemo } from "react";
import type { Mortgage } from "@shared/schema";
import type { UiPayment, UiTerm } from "../types";
import { calculatePayment, type PaymentFrequency } from "../utils/mortgage-math";

export type MortgageTermType = "fixed" | "variable-changing" | "variable-fixed";

export type UseAutoCreatePaymentOptions = {
  loanAmount: number;
  amortizationYears: string;
  frequency: PaymentFrequency;
  termType: MortgageTermType;
  fixedRateInput: string;
  spreadInput: string;
  primeInput: string;
  fallbackPrime: string;
  startDate: string;
  paymentEdited: boolean;
  setPaymentAmount: (value: string) => void;
};

export function useAutoCreatePayment({
  loanAmount,
  amortizationYears,
  frequency,
  termType,
  fixedRateInput,
  spreadInput,
  primeInput,
  fallbackPrime,
  startDate,
  paymentEdited,
  setPaymentAmount,
}: UseAutoCreatePaymentOptions): string {
  const autoPayment = useMemo(() => {
    if (!Number.isFinite(loanAmount) || loanAmount <= 0 || !startDate) {
      return "";
    }

    const amortMonths = parseInt(amortizationYears, 10) * 12;
    if (!Number.isFinite(amortMonths) || amortMonths <= 0) {
      return "";
    }

    const effectiveRatePercent =
      termType === "fixed"
        ? parseFloat(fixedRateInput || "0")
        : (parseFloat(primeInput || fallbackPrime || "0") || 0) +
          (parseFloat(spreadInput || "0") || 0);

    if (!Number.isFinite(effectiveRatePercent) || effectiveRatePercent <= 0) {
      return "";
    }

    const paymentValue = calculatePayment(
      loanAmount,
      effectiveRatePercent / 100,
      amortMonths,
      frequency
    );

    if (Number.isFinite(paymentValue)) {
      return paymentValue.toFixed(2);
    }
    return "";
  }, [
    loanAmount,
    amortizationYears,
    frequency,
    termType,
    fixedRateInput,
    spreadInput,
    primeInput,
    fallbackPrime,
    startDate,
  ]);

  // Sync with form state if not edited manually
  useEffect(() => {
    if (!paymentEdited && autoPayment) {
      setPaymentAmount(autoPayment);
    } else if (!paymentEdited && !autoPayment) {
      // Optional: clear payment if calculation becomes invalid?
      // Better to check if it WAS valid before. For now, matching previous behavior loosely.
      setPaymentAmount("");
    }
  }, [autoPayment, paymentEdited, setPaymentAmount]);

  return autoPayment;
}

export type UseAutoRenewalPaymentOptions = {
  mortgage: Mortgage | null;
  currentTerm: UiTerm | null;
  paymentHistory: UiPayment[];
  lastKnownBalance: number;
  lastKnownAmortizationMonths: number;
  termType: MortgageTermType;
  renewalRateInput: string;
  renewalPrimeInput: string;
  renewalSpreadInput: string;
  fallbackPrime: string;
  fallbackSpread: number | null;
  fallbackFixedRate: number | null;
  frequency: PaymentFrequency;
  paymentEdited: boolean;
  setPaymentAmount: (value: string) => void;
};

export function useAutoRenewalPayment({
  mortgage,
  currentTerm,
  paymentHistory,
  lastKnownBalance,
  lastKnownAmortizationMonths,
  termType,
  renewalRateInput,
  renewalPrimeInput,
  renewalSpreadInput,
  fallbackPrime,
  fallbackSpread,
  fallbackFixedRate,
  frequency,
  paymentEdited,
  setPaymentAmount,
}: UseAutoRenewalPaymentOptions): string {
  const autoPayment = useMemo(() => {
    if (!mortgage || !currentTerm) {
      return "";
    }

    const balance =
      paymentHistory[paymentHistory.length - 1]?.remainingBalance ??
      lastKnownBalance ??
      Number(mortgage.currentBalance || 0);

    if (!Number.isFinite(balance) || balance <= 0) {
      return "";
    }

    const remainingMonths =
      paymentHistory[paymentHistory.length - 1]?.remainingAmortizationMonths ??
      lastKnownAmortizationMonths ??
      mortgage.amortizationYears * 12;

    if (!Number.isFinite(remainingMonths) || remainingMonths <= 0) {
      return "";
    }

    const effectiveRatePercent =
      termType === "fixed"
        ? parseFloat(renewalRateInput || fallbackFixedRate?.toString() || "0")
        : (parseFloat(renewalPrimeInput || fallbackPrime || "0") || 0) +
          (parseFloat(renewalSpreadInput || fallbackSpread?.toString() || "0") || 0);

    if (!Number.isFinite(effectiveRatePercent) || effectiveRatePercent <= 0) {
      return "";
    }

    const paymentValue = calculatePayment(
      balance,
      effectiveRatePercent / 100,
      remainingMonths,
      frequency
    );

    if (Number.isFinite(paymentValue)) {
      return paymentValue.toFixed(2);
    }
    return "";
  }, [
    mortgage,
    currentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    termType,
    renewalRateInput,
    renewalPrimeInput,
    renewalSpreadInput,
    fallbackPrime,
    fallbackSpread,
    fallbackFixedRate,
    frequency,
  ]);

  // Sync with form state if not edited manually
  useEffect(() => {
    if (!paymentEdited && autoPayment) {
      setPaymentAmount(autoPayment);
    } else if (!paymentEdited && !autoPayment) {
      setPaymentAmount("");
    }
  }, [autoPayment, paymentEdited, setPaymentAmount]);

  return autoPayment;
}
