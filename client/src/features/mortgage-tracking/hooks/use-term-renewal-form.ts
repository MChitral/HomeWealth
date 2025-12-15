import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PrimeRateResponse } from "../api";

/**
 * Zod schema for term renewal form validation
 */
export const termRenewalFormSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    termType: z.enum(["fixed", "variable-changing", "variable-fixed"]),
    paymentFrequency: z.enum([
      "monthly",
      "biweekly",
      "accelerated-biweekly",
      "semi-monthly",
      "weekly",
      "accelerated-weekly",
    ]),
    termYears: z.string().min(1, "Term length is required"),
    fixedRate: z.string().optional(),
    primeRate: z.string().optional(),
    spread: z.string().optional(),
    paymentAmount: z
      .string()
      .min(1, "Payment amount is required")
      .refine(
        (val) => {
          const num = Number(val);
          return Number.isFinite(num) && num > 0;
        },
        {
          message: "Payment amount must be greater than zero",
        }
      ),
  })
  .refine(
    (data) => {
      if (data.termType === "fixed") {
        const rate = Number(data.fixedRate);
        return Number.isFinite(rate) && rate > 0;
      }
      return true;
    },
    {
      message: "Fixed rate is required for fixed rate mortgages",
      path: ["fixedRate"],
    }
  )
  .refine(
    (data) => {
      if (data.termType !== "fixed") {
        const spread = data.spread?.trim();
        return spread !== undefined && spread !== "";
      }
      return true;
    },
    {
      message: "Spread is required for variable rate mortgages",
      path: ["spread"],
    }
  );

export type TermRenewalFormData = z.infer<typeof termRenewalFormSchema>;

interface UseTermRenewalFormProps {
  primeRateData?: PrimeRateResponse;
  defaultPrimeRate?: string;
  defaultStartDate?: string;
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
 * React Hook Form hook for term renewal form
 * Replaces 8+ useState calls with a single useForm hook
 */
export function useTermRenewalForm({
  primeRateData,
  defaultPrimeRate = "6.45",
  defaultStartDate,
  onPrimeRateUpdate,
}: UseTermRenewalFormProps = {}) {
  const form = useForm<TermRenewalFormData>({
    resolver: zodResolver(termRenewalFormSchema),
    defaultValues: {
      ...defaultValues,
      startDate: defaultStartDate || "",
      primeRate: defaultPrimeRate,
    },
    mode: "onChange",
  });

  // Auto-update prime rate when it changes
  useEffect(() => {
    const latestPrime = primeRateData?.primeRate?.toString() || defaultPrimeRate;
    if (latestPrime && form.getValues("termType") !== "fixed") {
      form.setValue("primeRate", latestPrime, { shouldValidate: false });
      if (onPrimeRateUpdate) {
        onPrimeRateUpdate(latestPrime);
      }
    }
  }, [primeRateData, defaultPrimeRate, form, onPrimeRateUpdate]);

  // Update start date when default changes
  useEffect(() => {
    if (defaultStartDate && !form.getValues("startDate")) {
      form.setValue("startDate", defaultStartDate, { shouldValidate: true });
    }
  }, [defaultStartDate, form]);

  // Reset form
  const reset = () => {
    form.reset({
      ...defaultValues,
      startDate: defaultStartDate || "",
      primeRate: defaultPrimeRate,
    });
  };

  // Check if form is valid
  const isValid = form.formState.isValid;

  return {
    form,
    isValid,
    reset,
  };
}
