import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const penaltyCalculatorSchema = z.object({
  balance: z
    .string()
    .min(1, "Balance is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Balance must be a positive number",
    }),
  currentRate: z
    .string()
    .min(1, "Current rate is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      {
        message: "Current rate must be between 0 and 100",
      }
    ),
  marketRate: z
    .string()
    .min(1, "Market rate is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message: "Market rate must be a positive number",
      }
    ),
  remainingMonths: z
    .string()
    .min(1, "Remaining months is required")
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0 && num <= 120;
      },
      {
        message: "Remaining months must be between 1 and 120",
      }
    ),
  termType: z.enum(["fixed", "variable-changing", "variable-fixed"]).optional(),
  termYears: z.number().optional(),
  lenderName: z.string().optional(),
  penaltyCalculationMethod: z
    .enum([
      "ird_posted_rate",
      "ird_discounted_rate",
      "ird_origination_comparison",
      "three_month_interest",
      "open_mortgage",
      "variable_rate",
    ])
    .optional(),
});

export type PenaltyCalculatorFormData = z.infer<typeof penaltyCalculatorSchema>;

export function usePenaltyCalculatorForm(initialValues?: Partial<PenaltyCalculatorFormData>) {
  const form = useForm<PenaltyCalculatorFormData>({
    resolver: zodResolver(penaltyCalculatorSchema),
    defaultValues: {
      balance: initialValues?.balance || "",
      currentRate: initialValues?.currentRate || "",
      marketRate: initialValues?.marketRate || "",
      remainingMonths: initialValues?.remainingMonths || "",
      termType: initialValues?.termType,
      termYears: initialValues?.termYears,
      lenderName: initialValues?.lenderName || "",
      penaltyCalculationMethod: initialValues?.penaltyCalculationMethod,
    },
  });

  return form;
}
