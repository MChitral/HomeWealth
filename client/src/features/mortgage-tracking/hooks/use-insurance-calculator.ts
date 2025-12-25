import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { insuranceApi } from "../api/insurance-api";

/**
 * Zod schema for insurance calculator form validation
 */
export const insuranceCalculatorSchema = z.object({
  propertyPrice: z
    .string()
    .min(1, "Property price is required")
    .refine(
      (val) => {
        const num = Number(val);
        return Number.isFinite(num) && num > 0;
      },
      {
        message: "Property price must be greater than zero",
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
        message: "Down payment must be a valid number",
      }
    ),
  provider: z.enum(["CMHC", "Sagen", "Genworth"]),
  mliSelectDiscount: z.union([z.literal(0), z.literal(10), z.literal(20), z.literal(30)]).optional(),
  premiumPaymentType: z.enum(["upfront", "added-to-principal"]).optional(),
});

export type InsuranceCalculatorFormData = z.infer<typeof insuranceCalculatorSchema>;

interface UseInsuranceCalculatorProps {
  defaultPropertyPrice?: string;
  defaultDownPayment?: string;
  onCalculate?: (result: any) => void;
}

const defaultValues: InsuranceCalculatorFormData = {
  propertyPrice: "",
  downPayment: "",
  provider: "CMHC",
  mliSelectDiscount: 0,
  premiumPaymentType: "upfront",
};

/**
 * React Hook Form hook for insurance calculator
 */
export function useInsuranceCalculator({
  defaultPropertyPrice,
  defaultDownPayment,
  onCalculate,
}: UseInsuranceCalculatorProps = {}) {
  const form = useForm<InsuranceCalculatorFormData>({
    resolver: zodResolver(insuranceCalculatorSchema),
    defaultValues: {
      ...defaultValues,
      propertyPrice: defaultPropertyPrice || "",
      downPayment: defaultDownPayment || "",
    },
    mode: "onChange",
  });

  const calculateMutation = useMutation({
    mutationFn: (data: InsuranceCalculatorFormData) =>
      insuranceApi.calculateInsurance({
        propertyPrice: Number(data.propertyPrice),
        downPayment: Number(data.downPayment),
        provider: data.provider,
        mliSelectDiscount: data.mliSelectDiscount,
        premiumPaymentType: data.premiumPaymentType,
      }),
    onSuccess: (result) => {
      if (onCalculate) {
        onCalculate(result);
      }
    },
  });

  const compareMutation = useMutation({
    mutationFn: (data: Omit<InsuranceCalculatorFormData, "provider">) =>
      insuranceApi.compareProviders({
        propertyPrice: Number(data.propertyPrice),
        downPayment: Number(data.downPayment),
        mliSelectDiscount: data.mliSelectDiscount,
        premiumPaymentType: data.premiumPaymentType,
      }),
  });

  const handleCalculate = form.handleSubmit((data) => {
    calculateMutation.mutate(data);
  });

  const handleCompare = form.handleSubmit((data) => {
    const { provider, ...compareData } = data;
    compareMutation.mutate(compareData);
  });

  // Calculate down payment percentage
  const propertyPrice = form.watch("propertyPrice");
  const downPayment = form.watch("downPayment");
  const downPaymentPercent =
    propertyPrice && downPayment && Number(propertyPrice) > 0
      ? ((Number(downPayment) / Number(propertyPrice)) * 100).toFixed(2)
      : "0.00";

  // Check if high-ratio mortgage
  const isHighRatio = Number(downPaymentPercent) < 20;

  return {
    form,
    calculateMutation,
    compareMutation,
    handleCalculate,
    handleCompare,
    downPaymentPercent,
    isHighRatio,
    isValid: form.formState.isValid,
  };
}

