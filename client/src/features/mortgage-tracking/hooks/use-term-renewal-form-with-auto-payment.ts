import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { termRenewalFormSchema, type TermRenewalFormData } from "./use-term-renewal-form";
import type { PrimeRateResponse } from "../api";
import { useAutoRenewalPayment } from "./use-auto-payments";
import type { PaymentFrequency } from "../utils/mortgage-math";
import type { Mortgage } from "@shared/schema";
import type { UiTerm, UiPayment } from "../types";

interface UseTermRenewalFormWithAutoPaymentProps {
  primeRateData?: PrimeRateResponse;
  defaultPrimeRate?: string;
  defaultStartDate?: string;
  mortgage: Mortgage | null;
  currentTerm: UiTerm | null;
  paymentHistory: UiPayment[];
  lastKnownBalance: number;
  lastKnownAmortizationMonths: number;
  fallbackSpread?: number | null;
  fallbackFixedRate?: number | null;
  onPrimeRateUpdate?: (primeRate: string) => void;
}

const defaultValues: TermRenewalFormData = {
  startDate: "",
  termType: "variable-fixed",
  paymentFrequency: "monthly",
  termYears: "5",
  fixedRate: "",
  primeRate: "6.45",
  spread: "-0.80",
  paymentAmount: "",
};

/**
 * Enhanced React Hook Form hook for term renewal
 * Includes auto-payment calculations and payment editing state
 */
export function useTermRenewalFormWithAutoPayment({
  primeRateData,
  defaultPrimeRate = "6.45",
  defaultStartDate,
  mortgage,
  currentTerm,
  paymentHistory,
  lastKnownBalance,
  lastKnownAmortizationMonths,
  fallbackSpread,
  fallbackFixedRate,
  onPrimeRateUpdate,
}: UseTermRenewalFormWithAutoPaymentProps) {
  const [paymentEdited, setPaymentEdited] = useState(false);

  const form = useForm<TermRenewalFormData>({
    resolver: zodResolver(termRenewalFormSchema),
    defaultValues: {
      ...defaultValues,
      startDate: defaultStartDate || "",
      primeRate: defaultPrimeRate,
      spread: fallbackSpread?.toString() || defaultValues.spread,
      fixedRate: fallbackFixedRate?.toString() || "",
    },
    mode: "onChange",
  });

  // Watch form values for auto-payment calculation
  const watchedValues = form.watch();

  // Auto-update prime rate when it changes
  useEffect(() => {
    const latestPrime = primeRateData?.primeRate?.toString() || defaultPrimeRate;
    if (latestPrime && watchedValues.termType !== "fixed") {
      form.setValue("primeRate", latestPrime, { shouldValidate: false });
      if (onPrimeRateUpdate) {
        onPrimeRateUpdate(latestPrime);
      }
    }
  }, [primeRateData, defaultPrimeRate, watchedValues.termType, form, onPrimeRateUpdate]);

  // Auto-update start date when default changes
  useEffect(() => {
    if (defaultStartDate && !watchedValues.startDate) {
      form.setValue("startDate", defaultStartDate, { shouldValidate: true });
    }
  }, [defaultStartDate, watchedValues.startDate, form]);

  // Memoize setPaymentAmount callback to prevent infinite loops
  const handleSetPaymentAmount = useCallback(
    (value: string) => {
      if (!paymentEdited) {
        form.setValue("paymentAmount", value, { shouldValidate: true });
      }
    },
    [paymentEdited, form]
  );

  // Auto-payment calculation
  const autoPayment = useAutoRenewalPayment({
    mortgage,
    currentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    termType: (watchedValues.termType || "variable-fixed") as
      | "fixed"
      | "variable-changing"
      | "variable-fixed",
    renewalRateInput: watchedValues.fixedRate || "",
    renewalPrimeInput: watchedValues.primeRate || defaultPrimeRate,
    renewalSpreadInput: watchedValues.spread || "",
    fallbackPrime: defaultPrimeRate,
    fallbackSpread: fallbackSpread ?? null,
    fallbackFixedRate: fallbackFixedRate ?? null,
    frequency: (watchedValues.paymentFrequency || "monthly") as PaymentFrequency,
    paymentEdited,
    setPaymentAmount: handleSetPaymentAmount,
  });

  // Auto-set payment amount if not edited
  useEffect(() => {
    if (autoPayment && !paymentEdited && watchedValues.startDate) {
      form.setValue("paymentAmount", autoPayment, { shouldValidate: true });
    }
  }, [autoPayment, paymentEdited, watchedValues.startDate, form]);

  // Validate form
  const isValid = useMemo(() => {
    const startDate = watchedValues.startDate;
    const termYears = watchedValues.termYears;
    const termType = watchedValues.termType;
    const paymentAmount = watchedValues.paymentAmount;

    if (!startDate || !termYears || !paymentAmount || Number(paymentAmount) <= 0) {
      return false;
    }

    if (termType === "fixed") {
      const fixedRate = watchedValues.fixedRate;
      return Boolean(fixedRate && Number(fixedRate) > 0);
    } else {
      const spread = watchedValues.spread?.trim();
      return Boolean(spread && spread !== "");
    }
  }, [
    watchedValues.startDate,
    watchedValues.termYears,
    watchedValues.termType,
    watchedValues.paymentAmount,
    watchedValues.fixedRate,
    watchedValues.spread,
  ]);

  // Reset form
  const reset = () => {
    form.reset({
      ...defaultValues,
      startDate: defaultStartDate || "",
      primeRate: defaultPrimeRate,
      spread: fallbackSpread?.toString() || defaultValues.spread,
      fixedRate: fallbackFixedRate?.toString() || "",
    });
    setPaymentEdited(false);
  };

  // Handle payment amount change
  const handlePaymentAmountChange = (value: string) => {
    form.setValue("paymentAmount", value, { shouldValidate: true });
    setPaymentEdited(true);
  };

  // Use auto payment
  const useAutoPayment = () => {
    if (autoPayment) {
      form.setValue("paymentAmount", autoPayment, { shouldValidate: true });
      setPaymentEdited(false);
    }
  };

  return {
    form,
    isValid,
    autoPayment,
    paymentEdited,
    handlePaymentAmountChange,
    useAutoPayment,
    reset,
  };
}
