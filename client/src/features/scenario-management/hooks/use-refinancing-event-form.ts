import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { DraftRefinancingEvent } from "./use-scenario-editor-state";

/**
 * Zod schema for refinancing event form validation
 */
export const refinancingEventFormSchema = z
  .object({
    timingType: z.enum(["by-year", "at-term-end"]),
    refinancingYear: z.string().optional(),
    newRate: z
      .string()
      .min(1, "Rate is required")
      .refine(
        (val) => {
          const num = Number(val);
          return Number.isFinite(num) && num >= 0 && num <= 100;
        },
        {
          message: "Rate must be between 0 and 100",
        }
      ),
    termType: z.enum(["fixed", "variable-changing", "variable-fixed"]),
    newAmortizationMonths: z.string().optional(),
    paymentFrequency: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.timingType === "by-year") {
        const year = data.refinancingYear?.trim();
        return year !== undefined && year !== "";
      }
      return true;
    },
    {
      message: "Refinancing year is required for year-based refinancing",
      path: ["refinancingYear"],
    }
  )
  .refine(
    (data) => {
      if (data.timingType === "by-year") {
        const year = Number(data.refinancingYear);
        return Number.isFinite(year) && year >= 1;
      }
      return true;
    },
    {
      message: "Refinancing year must be 1 or greater",
      path: ["refinancingYear"],
    }
  );

export type RefinancingEventFormData = z.infer<typeof refinancingEventFormSchema>;

interface UseRefinancingEventFormProps {
  initialEvent?: DraftRefinancingEvent | null;
}

const defaultValues: RefinancingEventFormData = {
  timingType: "by-year",
  refinancingYear: "5",
  newRate: "",
  termType: "fixed",
  newAmortizationMonths: "",
  paymentFrequency: "",
  description: "",
};

/**
 * React Hook Form hook for refinancing event form
 */
export function useRefinancingEventForm({ initialEvent }: UseRefinancingEventFormProps = {}) {
  const form = useForm<RefinancingEventFormData>({
    resolver: zodResolver(refinancingEventFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Sync form with initial event data when editing
  useEffect(() => {
    if (initialEvent) {
      form.reset({
        timingType: initialEvent.atTermEnd ? "at-term-end" : "by-year",
        refinancingYear: initialEvent.refinancingYear?.toString() || "",
        newRate: initialEvent.newRate ? (Number(initialEvent.newRate) * 100).toFixed(3) : "",
        termType: initialEvent.termType || "fixed",
        newAmortizationMonths: initialEvent.newAmortizationMonths?.toString() || "",
        paymentFrequency: initialEvent.paymentFrequency || "",
        description: initialEvent.description || "",
      });
    } else {
      // Reset to defaults when adding new event
      form.reset(defaultValues);
    }
  }, [initialEvent, form]);

  // Reset form
  const reset = () => {
    form.reset(defaultValues);
  };

  return {
    form,
    reset,
  };
}

