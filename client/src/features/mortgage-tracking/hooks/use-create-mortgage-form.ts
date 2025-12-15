import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PrimeRateResponse } from "../api";

/**
 * Zod schema for mortgage creation form validation
 */
export const createMortgageFormSchema = z
  .object({
    // Step 1 fields
    propertyPrice: z
      .string()
      .min(1, "Property price is required")
      .refine(
        (val) => {
          const num = Number(val);
          return Number.isFinite(num) && num > 0;
        },
        {
          message: "Property price must be a valid number greater than zero",
        }
      ),
    downPayment: z
      .string()
      .min(1, "Down payment is required")
      .refine(
        (val) => {
          const num = Number(val);
          return Number.isFinite(num) && num >= 0;
        },
        {
          message: "Down payment must be a valid number (zero or more)",
        }
      ),
    startDate: z.string().min(1, "Start date is required"),
    amortization: z.string().min(1, "Amortization is required"),
    frequency: z.enum(["monthly", "biweekly", "accelerated-biweekly", "weekly"]),

    // Step 2 fields
    termType: z.enum(["fixed", "variable-changing", "variable-fixed"]),
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
      const propertyPrice = Number(data.propertyPrice);
      const downPayment = Number(data.downPayment);
      return downPayment <= propertyPrice;
    },
    {
      message: "Down payment cannot exceed property price",
      path: ["downPayment"],
    }
  )
  .refine(
    (data) => {
      const propertyPrice = Number(data.propertyPrice);
      const downPayment = Number(data.downPayment);
      return propertyPrice > downPayment;
    },
    {
      message: "Loan amount must be greater than zero",
      path: ["downPayment"],
    }
  )
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

export type CreateMortgageFormData = z.infer<typeof createMortgageFormSchema>;

interface UseCreateMortgageFormProps {
  primeRateData?: PrimeRateResponse;
  defaultPrimeRate?: string;
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
 * React Hook Form hook for mortgage creation form
 * Replaces 15+ useState calls with a single useForm hook
 */
export function useCreateMortgageForm({
  primeRateData,
  defaultPrimeRate,
}: UseCreateMortgageFormProps = {}) {
  const form = useForm<CreateMortgageFormData>({
    resolver: zodResolver(createMortgageFormSchema),
    defaultValues,
    mode: "onChange", // Validate as user types
  });

  // Auto-update prime rate when it changes
  useEffect(() => {
    const latestPrime = primeRateData?.primeRate?.toString() || defaultPrimeRate;
    if (latestPrime && form.getValues("termType") !== "fixed") {
      form.setValue("primeRate", latestPrime, { shouldValidate: false });
    }
  }, [primeRateData, defaultPrimeRate, form]);

  // Reset form when dialog closes
  const reset = () => {
    form.reset(defaultValues);
  };

  // Get loan amount (derived value)
  const loanAmount = (() => {
    const propertyPrice = Number(form.watch("propertyPrice") || 0);
    const downPayment = Number(form.watch("downPayment") || 0);
    return propertyPrice - downPayment;
  })();

  // Check if step 1 is valid - only validate Step 1 fields, not entire form
  // This prevents circular dependency where Step 1 can't be valid because Step 2 fields aren't filled yet
  // Watch all Step 1 fields to trigger re-renders
  const propertyPrice = form.watch("propertyPrice");
  const downPayment = form.watch("downPayment");
  const startDate = form.watch("startDate");
  const amortization = form.watch("amortization");
  const frequency = form.watch("frequency");

  const isStep1Valid = useMemo(() => {
    // Check all Step 1 fields are present
    if (!propertyPrice || !downPayment || !startDate || !amortization || !frequency) {
      return false;
    }

    // Validate property price
    const priceNum = Number(propertyPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return false;
    }

    // Validate down payment
    const downNum = Number(downPayment);
    if (!Number.isFinite(downNum) || downNum < 0) {
      return false;
    }

    // Validate down payment <= property price
    if (downNum > priceNum) {
      return false;
    }

    // Validate loan amount > 0 (property price > down payment)
    if (priceNum <= downNum) {
      return false;
    }

    return true;
  }, [propertyPrice, downPayment, startDate, amortization, frequency]);

  // Check if step 2 is valid
  const isStep2Valid = (() => {
    const termType = form.watch("termType");
    const paymentAmount = form.watch("paymentAmount");
    const fixedRate = form.watch("fixedRate");
    const spread = form.watch("spread");

    if (!paymentAmount || Number(paymentAmount) <= 0) return false;

    if (termType === "fixed") {
      return Boolean(fixedRate && Number(fixedRate) > 0);
    }
    return Boolean(spread?.trim());
  })();

  return {
    form,
    loanAmount,
    isStep1Valid,
    isStep2Valid,
    reset,
  };
}
