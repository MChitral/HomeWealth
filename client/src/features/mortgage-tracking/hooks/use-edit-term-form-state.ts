import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { mortgageApi, mortgageQueryKeys, type PrimeRateResponse } from "../api";
import type { UpdateTermPayload } from "../api";
import type { MortgageTerm } from "@shared/schema";
import { useEditTermForm, type EditTermFormData } from "./use-edit-term-form";

interface UseEditTermFormStateProps {
  currentTerm?: MortgageTerm | null;
  primeRateData?: PrimeRateResponse;
  onSuccess?: () => void;
}

/**
 * Complete hook for edit term form state management
 * Handles form validation, submission, and mutation
 */
export function useEditTermFormState({
  currentTerm,
  primeRateData,
  onSuccess,
}: UseEditTermFormStateProps) {
  const form = useEditTermForm({
    currentTerm,
    primeRateData,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTermMutation = useMutation({
    mutationFn: ({ termId, updates }: { termId: string; updates: UpdateTermPayload }) => {
      return mortgageApi.updateTerm(termId, updates);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ 
        queryKey: mortgageQueryKeys.mortgageTerms(currentTerm?.mortgageId ?? null) 
      });
      toast({
        title: "Term updated",
        description: "Your mortgage term has been updated successfully",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update term",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data: EditTermFormData) => {
    if (!currentTerm?.id) {
      toast({
        title: "Error",
        description: "No term selected",
        variant: "destructive",
      });
      return;
    }

    const termYearsNum = parseInt(data.termYears) || 5;
    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + termYearsNum);

    const updates: UpdateTermPayload = {
      termType: data.termType,
      startDate: data.startDate,
      endDate: endDate.toISOString().split("T")[0],
      termYears: termYearsNum,
      paymentFrequency: data.paymentFrequency,
      regularPaymentAmount: data.paymentAmount,
      fixedRate: data.termType === "fixed" ? data.fixedRate : undefined,
      lockedSpread: data.termType !== "fixed" ? data.spread : undefined,
      primeRate: data.termType !== "fixed" ? data.primeRate : undefined,
    };

    updateTermMutation.mutate({
      termId: currentTerm.id,
      updates,
    });
  });

  return {
    form,
    handleSubmit,
    updateTermMutation,
    isValid: form.formState.isValid,
  };
}

