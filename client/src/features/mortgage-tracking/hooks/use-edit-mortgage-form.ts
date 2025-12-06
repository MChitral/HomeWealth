import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Zod schema for edit mortgage form validation
 */
export const editMortgageFormSchema = z.object({
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
  currentBalance: z
    .string()
    .min(1, "Current balance is required")
    .refine(
      (val) => {
        const num = Number(val);
        return Number.isFinite(num) && num >= 0;
      },
      {
        message: "Current balance must be a valid number (zero or more)",
      }
    ),
  paymentFrequency: z.enum([
    "monthly",
    "biweekly",
    "accelerated-biweekly",
    "weekly",
    "accelerated-weekly",
    "semi-monthly",
  ]),
});

export type EditMortgageFormData = z.infer<typeof editMortgageFormSchema>;

interface UseEditMortgageFormProps {
  initialPropertyPrice?: string;
  initialCurrentBalance?: string;
  initialPaymentFrequency?: string;
}

const defaultValues: EditMortgageFormData = {
  propertyPrice: "",
  currentBalance: "",
  paymentFrequency: "monthly",
};

/**
 * React Hook Form hook for edit mortgage form
 * Replaces 3 useState calls with a single useForm hook
 */
export function useEditMortgageForm({
  initialPropertyPrice,
  initialCurrentBalance,
  initialPaymentFrequency,
}: UseEditMortgageFormProps = {}) {
  const form = useForm<EditMortgageFormData>({
    resolver: zodResolver(editMortgageFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Sync form with initial data when it loads
  useEffect(() => {
    if (
      initialPropertyPrice !== undefined ||
      initialCurrentBalance !== undefined ||
      initialPaymentFrequency !== undefined
    ) {
      form.reset({
        propertyPrice: initialPropertyPrice || "",
        currentBalance: initialCurrentBalance || "",
        paymentFrequency: (initialPaymentFrequency || "monthly") as EditMortgageFormData["paymentFrequency"],
      });
    }
  }, [initialPropertyPrice, initialCurrentBalance, initialPaymentFrequency, form]);

  return form;
}

