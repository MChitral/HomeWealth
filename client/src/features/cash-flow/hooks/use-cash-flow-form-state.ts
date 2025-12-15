import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/query-client";
import { useToast } from "@/shared/hooks/use-toast";
import type { CashFlow } from "@shared/schema";
import { cashFlowApi, cashFlowQueryKeys, type CashFlowPayload } from "../api";
import { useCashFlowForm, type CashFlowFormData } from "./use-cash-flow-form";

interface UseCashFlowFormStateProps {
  cashFlow: CashFlow | null;
}

/**
 * React Hook Form-based hook that replaces useCashFlowState
 * Provides compatible interface while using React Hook Form internally
 */
export function useCashFlowFormState({ cashFlow }: UseCashFlowFormStateProps) {
  const { toast } = useToast();
  const form = useCashFlowForm({ cashFlow });

  const saveMutation = useMutation({
    mutationFn: (payload: CashFlowPayload) => {
      if (cashFlow?.id) {
        return cashFlowApi.update(cashFlow.id, payload);
      }
      return cashFlowApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashFlowQueryKeys.cashFlow() });
      toast({
        title: "Cash flow saved",
        description: "Your income and expenses have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save cash flow data",
        variant: "destructive",
      });
    },
  });

  const handleSave = form.handleSubmit((data: CashFlowFormData) => {
    const payload: CashFlowPayload = {
      monthlyIncome: data.monthlyIncome.toString(),
      extraPaycheques: data.extraPaycheques,
      annualBonus: data.annualBonus.toString(),
      propertyTax: data.propertyTax.toString(),
      homeInsurance: data.insurance.toString(),
      condoFees: data.condoFees.toString(),
      utilities: data.utilities.toString(),
      groceries: data.groceries.toString(),
      dining: data.dining.toString(),
      transportation: data.transportation.toString(),
      entertainment: data.entertainment.toString(),
      carLoan: data.carLoan.toString(),
      studentLoan: data.studentLoan.toString(),
      creditCard: data.creditCard.toString(),
    };

    saveMutation.mutate(payload);
  });

  // Watch all form values
  const watchedValues = form.watch();

  // Create setters that use form.setValue (compatible with existing components)
  const setMonthlyIncome = (value: number) =>
    form.setValue("monthlyIncome", value, { shouldValidate: true });
  const setExtraPaycheques = (value: number) =>
    form.setValue("extraPaycheques", value, { shouldValidate: true });
  const setAnnualBonus = (value: number) =>
    form.setValue("annualBonus", value, { shouldValidate: true });
  const setPropertyTax = (value: number) =>
    form.setValue("propertyTax", value, { shouldValidate: true });
  const setInsurance = (value: number) =>
    form.setValue("insurance", value, { shouldValidate: true });
  const setCondoFees = (value: number) =>
    form.setValue("condoFees", value, { shouldValidate: true });
  const setUtilities = (value: number) =>
    form.setValue("utilities", value, { shouldValidate: true });
  const setGroceries = (value: number) =>
    form.setValue("groceries", value, { shouldValidate: true });
  const setDining = (value: number) => form.setValue("dining", value, { shouldValidate: true });
  const setTransportation = (value: number) =>
    form.setValue("transportation", value, { shouldValidate: true });
  const setEntertainment = (value: number) =>
    form.setValue("entertainment", value, { shouldValidate: true });
  const setCarLoan = (value: number) => form.setValue("carLoan", value, { shouldValidate: true });
  const setStudentLoan = (value: number) =>
    form.setValue("studentLoan", value, { shouldValidate: true });
  const setCreditCard = (value: number) =>
    form.setValue("creditCard", value, { shouldValidate: true });

  return {
    // Form values (from watched values)
    monthlyIncome: watchedValues.monthlyIncome,
    extraPaycheques: watchedValues.extraPaycheques,
    annualBonus: watchedValues.annualBonus,
    propertyTax: watchedValues.propertyTax,
    insurance: watchedValues.insurance,
    condoFees: watchedValues.condoFees,
    utilities: watchedValues.utilities,
    groceries: watchedValues.groceries,
    dining: watchedValues.dining,
    transportation: watchedValues.transportation,
    entertainment: watchedValues.entertainment,
    carLoan: watchedValues.carLoan,
    studentLoan: watchedValues.studentLoan,
    creditCard: watchedValues.creditCard,

    // Setters (compatible interface)
    setMonthlyIncome,
    setExtraPaycheques,
    setAnnualBonus,
    setPropertyTax,
    setInsurance,
    setCondoFees,
    setUtilities,
    setGroceries,
    setDining,
    setTransportation,
    setEntertainment,
    setCarLoan,
    setStudentLoan,
    setCreditCard,

    // Actions
    handleSave,
    saveMutation,

    // Expose form for advanced usage if needed
    form,
  };
}
