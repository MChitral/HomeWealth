import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMortgageFormSchema, type CreateMortgageFormData } from "./use-create-mortgage-form";
import type { PrimeRateResponse } from "../api";
import { useAutoCreatePayment } from "./use-auto-payments";
import type { PaymentFrequency } from "../utils/mortgage-math";

interface UseCreateMortgageFormWithAutoPaymentProps {
  primeRateData?: PrimeRateResponse;
  defaultPrimeRate?: string;
  onPrimeRateUpdate?: (primeRate: string) => void;
}

const defaultValues: CreateMortgageFormData = {
  propertyPrice: "",
  downPayment: "",
  startDate: new Date().toISOString().split("T")[0],
  amortization: "25",
  frequency: "monthly",
  termType: "variable-fixed",
  termYears: "5",
  fixedRate: "",
  primeRate: "6.45",
  spread: "-0.80",
  paymentAmount: "",
};

/**
 * Enhanced React Hook Form hook for mortgage creation
 * Includes auto-payment calculations and payment editing state
 */
export function useCreateMortgageFormWithAutoPayment({
  primeRateData,
  defaultPrimeRate = "6.45",
  onPrimeRateUpdate,
}: UseCreateMortgageFormWithAutoPaymentProps = {}) {
  const [paymentEdited, setPaymentEdited] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const form = useForm<CreateMortgageFormData>({
    resolver: zodResolver(createMortgageFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Watch form values for auto-payment calculation
  const watchedValues = form.watch();
  const loanAmount = useMemo(() => {
    const propertyPrice = Number(watchedValues.propertyPrice || 0);
    const downPayment = Number(watchedValues.downPayment || 0);
    return propertyPrice - downPayment;
  }, [watchedValues.propertyPrice, watchedValues.downPayment]);

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

  // Auto-payment calculation
  const autoPayment = useAutoCreatePayment({
    loanAmount,
    amortizationYears: watchedValues.amortization || "25",
    frequency: (watchedValues.frequency || "monthly") as PaymentFrequency,
    termType: (watchedValues.termType || "variable-fixed") as "fixed" | "variable-changing" | "variable-fixed",
    fixedRateInput: watchedValues.fixedRate || "",
    spreadInput: watchedValues.spread || "",
    primeInput: watchedValues.primeRate || defaultPrimeRate,
    fallbackPrime: defaultPrimeRate,
    startDate: watchedValues.startDate || defaultValues.startDate,
    paymentEdited,
    setPaymentAmount: (value: string) => {
      if (!paymentEdited) {
        form.setValue("paymentAmount", value, { shouldValidate: true });
      }
    },
  });

  // Auto-set payment amount if not edited
  useEffect(() => {
    if (autoPayment && !paymentEdited && wizardStep === 2) {
      form.setValue("paymentAmount", autoPayment, { shouldValidate: true });
    }
  }, [autoPayment, paymentEdited, wizardStep, form]);

  // Validate step 1
  const isStep1Valid = useMemo(() => {
    const propertyPrice = watchedValues.propertyPrice;
    const downPayment = watchedValues.downPayment;
    const startDate = watchedValues.startDate;
    const amortization = watchedValues.amortization;

    if (!propertyPrice || !downPayment || !startDate || !amortization) return false;

    const propPrice = Number(propertyPrice);
    const downPay = Number(downPayment);

    if (!Number.isFinite(propPrice) || propPrice <= 0) return false;
    if (!Number.isFinite(downPay) || downPay < 0) return false;
    if (downPay > propPrice) return false;

    return true;
  }, [watchedValues.propertyPrice, watchedValues.downPayment, watchedValues.startDate, watchedValues.amortization]);

  // Validate step 2
  const isStep2Valid = useMemo(() => {
    const paymentAmount = watchedValues.paymentAmount;
    const termType = watchedValues.termType;

    if (!paymentAmount || Number(paymentAmount) <= 0) return false;

    if (termType === "fixed") {
      const fixedRate = watchedValues.fixedRate;
      return Boolean(fixedRate && Number(fixedRate) > 0);
    } else {
      const spread = watchedValues.spread?.trim();
      return Boolean(spread && spread !== "");
    }
  }, [
    watchedValues.paymentAmount,
    watchedValues.termType,
    watchedValues.fixedRate,
    watchedValues.spread,
  ]);

  // Reset form
  const reset = () => {
    form.reset(defaultValues);
    setPaymentEdited(false);
    setWizardStep(1);
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
    loanAmount,
    wizardStep,
    setWizardStep,
    isStep1Valid,
    isStep2Valid,
    autoPayment,
    paymentEdited,
    handlePaymentAmountChange,
    useAutoPayment,
    reset,
  };
}

