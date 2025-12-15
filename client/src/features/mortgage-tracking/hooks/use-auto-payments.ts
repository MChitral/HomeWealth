import { useEffect, useState } from "react";
import type { Mortgage } from "@shared/schema";
import type { UiPayment, UiTerm } from "../types";
import { calculatePayment, type PaymentFrequency } from "../utils/mortgage-math";

type MortgageTermType = "fixed" | "variable-changing" | "variable-fixed";

type UseAutoCreatePaymentOptions = {
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
  const [autoPayment, setAutoPayment] = useState("");

  useEffect(() => {
    if (!Number.isFinite(loanAmount) || loanAmount <= 0 || !startDate) {
      setAutoPayment("");
      if (!paymentEdited) {
        setPaymentAmount("");
      }
      return;
    }

    const amortMonths = parseInt(amortizationYears, 10) * 12;
    if (!Number.isFinite(amortMonths) || amortMonths <= 0) {
      setAutoPayment("");
      return;
    }

    const effectiveRatePercent =
      termType === "fixed"
        ? parseFloat(fixedRateInput || "0")
        : (parseFloat(primeInput || fallbackPrime || "0") || 0) +
          (parseFloat(spreadInput || "0") || 0);

    if (!Number.isFinite(effectiveRatePercent) || effectiveRatePercent <= 0) {
      setAutoPayment("");
      return;
    }

    const paymentValue = calculatePayment(
      loanAmount,
      effectiveRatePercent / 100,
      amortMonths,
      frequency
    );

    if (Number.isFinite(paymentValue)) {
      const formatted = paymentValue.toFixed(2);
      setAutoPayment(formatted);
      if (!paymentEdited) {
        setPaymentAmount(formatted);
      }
    } else {
      setAutoPayment("");
    }
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
    paymentEdited,
    setPaymentAmount,
  ]);

  return autoPayment;
}

type UseAutoRenewalPaymentOptions = {
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
  const [autoPayment, setAutoPayment] = useState("");

  useEffect(() => {
    if (!mortgage || !currentTerm) {
      setAutoPayment("");
      return;
    }

    const balance =
      paymentHistory[paymentHistory.length - 1]?.remainingBalance ??
      lastKnownBalance ??
      Number(mortgage.currentBalance || 0);

    if (!Number.isFinite(balance) || balance <= 0) {
      setAutoPayment("");
      return;
    }

    const remainingMonths =
      paymentHistory[paymentHistory.length - 1]?.remainingAmortizationMonths ??
      lastKnownAmortizationMonths ??
      mortgage.amortizationYears * 12;

    if (!Number.isFinite(remainingMonths) || remainingMonths <= 0) {
      setAutoPayment("");
      return;
    }

    const effectiveRatePercent =
      termType === "fixed"
        ? parseFloat(renewalRateInput || fallbackFixedRate?.toString() || "0")
        : (parseFloat(renewalPrimeInput || fallbackPrime || "0") || 0) +
          (parseFloat(renewalSpreadInput || fallbackSpread?.toString() || "0") || 0);

    if (!Number.isFinite(effectiveRatePercent) || effectiveRatePercent <= 0) {
      setAutoPayment("");
      return;
    }

    const paymentValue = calculatePayment(
      balance,
      effectiveRatePercent / 100,
      remainingMonths,
      frequency
    );

    if (Number.isFinite(paymentValue)) {
      const formatted = paymentValue.toFixed(2);
      setAutoPayment(formatted);
      if (!paymentEdited) {
        setPaymentAmount(formatted);
      }
    } else {
      setAutoPayment("");
    }
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
    paymentEdited,
    setPaymentAmount,
  ]);

  return autoPayment;
}
