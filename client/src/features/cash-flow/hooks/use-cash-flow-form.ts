import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CashFlow } from "@shared/schema";

/**
 * Zod schema for cash flow form validation
 * Helper to transform string/number inputs to numbers with min(0) validation
 */
const numberField = (errorMessage: string) =>
  z
    .union([
      z.number(),
      z.string().transform((val) => (val === "" || val === undefined ? 0 : Number(val))),
    ])
    .pipe(z.number().min(0, errorMessage));

export const cashFlowFormSchema = z.object({
  // Income
  monthlyIncome: numberField("Monthly income must be zero or more"),
  extraPaycheques: z.number().int().min(0).max(12),
  annualBonus: numberField("Annual bonus must be zero or more"),

  // Fixed Expenses
  propertyTax: numberField("Property tax must be zero or more"),
  insurance: numberField("Insurance must be zero or more"),
  condoFees: numberField("Condo fees must be zero or more"),
  utilities: numberField("Utilities must be zero or more"),

  // Variable Expenses
  groceries: numberField("Groceries must be zero or more"),
  dining: numberField("Dining must be zero or more"),
  transportation: numberField("Transportation must be zero or more"),
  entertainment: numberField("Entertainment must be zero or more"),

  // Debt
  carLoan: numberField("Car loan must be zero or more"),
  studentLoan: numberField("Student loan must be zero or more"),
  creditCard: numberField("Credit card must be zero or more"),
});

export type CashFlowFormData = z.infer<typeof cashFlowFormSchema>;

const DEFAULTS: CashFlowFormData = {
  monthlyIncome: 8000,
  extraPaycheques: 2,
  annualBonus: 10000,
  propertyTax: 400,
  insurance: 150,
  condoFees: 0,
  utilities: 200,
  groceries: 600,
  dining: 300,
  transportation: 200,
  entertainment: 400,
  carLoan: 0,
  studentLoan: 0,
  creditCard: 0,
};

interface UseCashFlowFormProps {
  cashFlow: CashFlow | null;
}

/**
 * React Hook Form hook for cash flow form
 * Replaces 15+ useState calls with a single useForm hook
 */
export function useCashFlowForm({ cashFlow }: UseCashFlowFormProps) {
  const form = useForm<CashFlowFormData>({
    resolver: zodResolver(cashFlowFormSchema),
    defaultValues: DEFAULTS,
    mode: "onChange",
  });

  // Sync form with server data when it loads
  useEffect(() => {
    if (!cashFlow) return;

    form.reset({
      monthlyIncome:
        cashFlow.monthlyIncome != null ? Number(cashFlow.monthlyIncome) : DEFAULTS.monthlyIncome,
      extraPaycheques: cashFlow.extraPaycheques ?? DEFAULTS.extraPaycheques,
      annualBonus:
        cashFlow.annualBonus != null ? Number(cashFlow.annualBonus) : DEFAULTS.annualBonus,
      propertyTax:
        cashFlow.propertyTax != null ? Number(cashFlow.propertyTax) : DEFAULTS.propertyTax,
      insurance:
        cashFlow.homeInsurance != null ? Number(cashFlow.homeInsurance) : DEFAULTS.insurance,
      condoFees: cashFlow.condoFees != null ? Number(cashFlow.condoFees) : DEFAULTS.condoFees,
      utilities: cashFlow.utilities != null ? Number(cashFlow.utilities) : DEFAULTS.utilities,
      groceries: cashFlow.groceries != null ? Number(cashFlow.groceries) : DEFAULTS.groceries,
      dining: cashFlow.dining != null ? Number(cashFlow.dining) : DEFAULTS.dining,
      transportation:
        cashFlow.transportation != null ? Number(cashFlow.transportation) : DEFAULTS.transportation,
      entertainment:
        cashFlow.entertainment != null ? Number(cashFlow.entertainment) : DEFAULTS.entertainment,
      carLoan: cashFlow.carLoan != null ? Number(cashFlow.carLoan) : DEFAULTS.carLoan,
      studentLoan:
        cashFlow.studentLoan != null ? Number(cashFlow.studentLoan) : DEFAULTS.studentLoan,
      creditCard: cashFlow.creditCard != null ? Number(cashFlow.creditCard) : DEFAULTS.creditCard,
    });
  }, [cashFlow, form]);

  return form;
}
