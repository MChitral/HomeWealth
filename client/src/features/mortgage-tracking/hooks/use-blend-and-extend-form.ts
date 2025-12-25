import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const blendAndExtendSchema = z.object({
  newMarketRate: z
    .string()
    .min(1, "Market rate is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, {
      message: "Market rate must be between 0 and 100",
    }),
  extendedAmortizationMonths: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optional
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0 && num <= 360;
    }, {
      message: "Extended amortization must be between 1 and 360 months",
    }),
});

export type BlendAndExtendFormData = z.infer<typeof blendAndExtendSchema>;

export function useBlendAndExtendForm(initialValues?: Partial<BlendAndExtendFormData>) {
  const form = useForm<BlendAndExtendFormData>({
    resolver: zodResolver(blendAndExtendSchema),
    defaultValues: {
      newMarketRate: initialValues?.newMarketRate || "",
      extendedAmortizationMonths: initialValues?.extendedAmortizationMonths || "",
    },
  });

  return form;
}

