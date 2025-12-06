import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Zod schema for backfill payments form validation
 */
export const backfillFormSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  numberOfPayments: z
    .string()
    .min(1, "Number of payments is required")
    .refine(
      (val) => {
        const num = parseInt(val);
        return Number.isFinite(num) && num >= 1 && num <= 60;
      },
      {
        message: "Number of payments must be between 1 and 60",
      }
    ),
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
});

export type BackfillFormData = z.infer<typeof backfillFormSchema>;

interface UseBackfillFormProps {
  defaultPaymentAmount?: string;
}

const defaultValues: BackfillFormData = {
  startDate: "",
  numberOfPayments: "12",
  paymentAmount: "",
};

/**
 * React Hook Form hook for backfill payments form
 * Replaces 3 useState calls with a single useForm hook
 */
export function useBackfillForm({
  defaultPaymentAmount = "",
}: UseBackfillFormProps = {}) {
  const form = useForm<BackfillFormData>({
    resolver: zodResolver(backfillFormSchema),
    defaultValues: {
      ...defaultValues,
      paymentAmount: defaultPaymentAmount,
    },
    mode: "onChange",
  });

  return form;
}

