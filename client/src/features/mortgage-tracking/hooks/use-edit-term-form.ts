import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PrimeRateResponse } from "../api";
import type { MortgageTerm } from "@shared/schema";

/**
 * Zod schema for edit term form validation
 */
export const editTermFormSchema = z
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

export type EditTermFormData = z.infer<typeof editTermFormSchema>;

interface UseEditTermFormProps {
  currentTerm?: MortgageTerm | null;
  primeRateData?: PrimeRateResponse;
}

const defaultValues: EditTermFormData = {
  startDate: "",
  termType: "variable-fixed",
  paymentFrequency: "monthly",
  termYears: "5",
  fixedRate: "",
  primeRate: "",
  spread: "",
  paymentAmount: "",
};

/**
 * React Hook Form hook for edit term form
 * Replaces 9 useState calls with a single useForm hook
 */
export function useEditTermForm({ currentTerm, primeRateData }: UseEditTermFormProps = {}) {
  const form = useForm<EditTermFormData>({
    resolver: zodResolver(editTermFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Sync form with term data when it changes
  useEffect(() => {
    if (currentTerm) {
      const startDate = currentTerm.startDate || "";
      const endDate = currentTerm.endDate || "";

      // Calculate term years from start and end dates
      let termYears = "5";
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const years = Math.round(
          (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        termYears = years.toString();
      }

      const formData: EditTermFormData = {
        startDate,
        termType: (currentTerm.termType || "variable-fixed") as EditTermFormData["termType"],
        paymentFrequency: (currentTerm.paymentFrequency ||
          "monthly") as EditTermFormData["paymentFrequency"],
        termYears,
        fixedRate: currentTerm.termType === "fixed" ? currentTerm.fixedRate || "" : "",
        primeRate:
          currentTerm.termType !== "fixed"
            ? currentTerm.primeRate?.toString() || primeRateData?.primeRate?.toString() || ""
            : "",
        spread: currentTerm.termType !== "fixed" ? currentTerm.lockedSpread || "" : "",
        paymentAmount: currentTerm.regularPaymentAmount || "",
      };

      form.reset(formData);
    }
  }, [currentTerm, primeRateData, form]);

  // Update prime rate when primeRateData changes (for variable rate terms)
  useEffect(() => {
    if (primeRateData?.primeRate && form.getValues("termType") !== "fixed") {
      const currentPrimeRate = form.getValues("primeRate");
      // Only update if it's empty or matches the old prime rate
      if (!currentPrimeRate) {
        form.setValue("primeRate", primeRateData.primeRate.toString());
      }
    }
  }, [primeRateData, form]);

  // Calculate end date when start date or years change
  const startDate = form.watch("startDate");
  const termYears = form.watch("termYears");

  useEffect(() => {
    if (startDate && termYears) {
      const start = new Date(startDate);
      start.setFullYear(start.getFullYear() + parseInt(termYears || "5"));
      // Note: end date is calculated but not stored in form (it's computed on submit)
    }
  }, [startDate, termYears]);

  return form;
}
