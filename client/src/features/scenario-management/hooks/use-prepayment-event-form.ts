import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { DraftPrepaymentEvent } from "./use-scenario-editor-state";

/**
 * Zod schema for prepayment event form validation
 */
export const prepaymentEventFormSchema = z
  .object({
    eventType: z.enum(["annual", "one-time"]),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine(
        (val) => {
          const num = Number(val);
          return Number.isFinite(num) && num > 0;
        },
        {
          message: "Amount must be greater than zero",
        }
      ),
    description: z.string().optional(),
    recurrenceMonth: z.string().optional(),
    oneTimeYear: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.eventType === "annual") {
        const month = data.recurrenceMonth?.trim();
        return month !== undefined && month !== "";
      }
      return true;
    },
    {
      message: "Recurrence month is required for annual events",
      path: ["recurrenceMonth"],
    }
  )
  .refine(
    (data) => {
      if (data.eventType === "one-time") {
        const year = data.oneTimeYear?.trim();
        return year !== undefined && year !== "";
      }
      return true;
    },
    {
      message: "Year is required for one-time events",
      path: ["oneTimeYear"],
    }
  )
  .refine(
    (data) => {
      if (data.eventType === "one-time") {
        const year = Number(data.oneTimeYear);
        return Number.isFinite(year) && year >= 1;
      }
      return true;
    },
    {
      message: "Year must be 1 or greater",
      path: ["oneTimeYear"],
    }
  );

export type PrepaymentEventFormData = z.infer<typeof prepaymentEventFormSchema>;

interface UsePrepaymentEventFormProps {
  initialEvent?: DraftPrepaymentEvent | null;
}

const defaultValues: PrepaymentEventFormData = {
  eventType: "annual",
  amount: "",
  description: "",
  recurrenceMonth: "3", // March (Tax Refund)
  oneTimeYear: "1",
};

/**
 * React Hook Form hook for prepayment event form
 * Replaces 5 useState calls with a single useForm hook
 */
export function usePrepaymentEventForm({ initialEvent }: UsePrepaymentEventFormProps = {}) {
  const form = useForm<PrepaymentEventFormData>({
    resolver: zodResolver(prepaymentEventFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Sync form with initial event data when editing
  useEffect(() => {
    if (initialEvent) {
      form.reset({
        eventType: initialEvent.eventType,
        amount: initialEvent.amount || "",
        description: initialEvent.description || "",
        recurrenceMonth: initialEvent.recurrenceMonth?.toString() || "3",
        oneTimeYear: initialEvent.oneTimeYear?.toString() || "1",
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

