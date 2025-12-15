import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import {
  mortgageApi,
  mortgageQueryKeys,
  type CreateTermPayload,
  type PrimeRateResponse,
} from "../api";
import { useTermRenewalFormWithAutoPayment } from "./use-term-renewal-form-with-auto-payment";
import type { Mortgage } from "@shared/schema";
import type { UiTerm, UiPayment } from "../types";

interface UseTermRenewalFormStateProps {
  mortgage: Mortgage | null;
  currentTerm: UiTerm | null;
  paymentHistory: UiPayment[];
  lastKnownBalance: number;
  lastKnownAmortizationMonths: number;
  primeRateData?: PrimeRateResponse;
  defaultPrimeRate?: string;
  defaultStartDate?: string;
  onSuccess?: () => void;
  onPrimeRateUpdate?: (primeRate: string) => void;
}

/**
 * Complete hook for term renewal form state management
 * Integrates React Hook Form, auto-payment calculations, and mutation logic
 */
export function useTermRenewalFormState({
  mortgage,
  currentTerm,
  paymentHistory,
  lastKnownBalance,
  lastKnownAmortizationMonths,
  primeRateData,
  defaultPrimeRate = "6.45",
  defaultStartDate,
  onSuccess,
  onPrimeRateUpdate,
}: UseTermRenewalFormStateProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    form,
    isValid,
    autoPayment,
    paymentEdited,
    handlePaymentAmountChange,
    useAutoPayment,
    reset,
  } = useTermRenewalFormWithAutoPayment({
    primeRateData,
    defaultPrimeRate,
    defaultStartDate: defaultStartDate || currentTerm?.endDate,
    mortgage,
    currentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    fallbackSpread: currentTerm?.lockedSpread ?? null,
    fallbackFixedRate: currentTerm?.fixedRate ?? null,
    onPrimeRateUpdate,
  });

  const createTermMutation = useMutation({
    mutationFn: async () => {
      const formData = form.getValues();

      // Validate form before submission
      if (!isValid) {
        throw new Error("Please fill in all required fields");
      }

      const termYears = Number(formData.termYears) || 5;
      const startDate =
        formData.startDate ||
        defaultStartDate ||
        currentTerm?.endDate ||
        new Date().toISOString().split("T")[0];
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + termYears);

      const payload: CreateTermPayload = {
        termType: formData.termType,
        startDate,
        endDate: endDate.toISOString().split("T")[0],
        termYears,
        fixedRate: formData.termType === "fixed" ? formData.fixedRate : undefined,
        lockedSpread: formData.termType !== "fixed" ? formData.spread : "0",
        primeRate: formData.termType !== "fixed" ? formData.primeRate : undefined,
        paymentFrequency: formData.paymentFrequency,
        regularPaymentAmount: formData.paymentAmount,
      };

      if (!mortgage?.id) throw new Error("No mortgage selected");
      return mortgageApi.createTerm(mortgage.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mortgageQueryKeys.mortgageTerms(mortgage?.id ?? null),
      });
      toast({
        title: "Term renewed",
        description: "New mortgage term has been created successfully",
      });
      reset();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to renew term",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    form.handleSubmit(() => {
      createTermMutation.mutate();
    })();
  };

  return {
    form,
    isValid,
    autoPayment,
    paymentEdited,
    handlePaymentAmountChange,
    useAutoPayment,
    handleSubmit,
    createTermMutation,
    reset,
  };
}
