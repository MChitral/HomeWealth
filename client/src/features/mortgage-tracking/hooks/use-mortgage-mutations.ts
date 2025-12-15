import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import {
  mortgageApi,
  mortgageQueryKeys,
  type CreatePaymentPayload,
  type CreateTermPayload,
  type UpdateMortgagePayload,
  type UpdateTermPayload,
} from "../api";
import type { Mortgage } from "@shared/schema";
import type { UiTerm } from "../types";

interface UseMortgageMutationsProps {
  mortgage: Mortgage | null;
  uiCurrentTerm: UiTerm | null;
  onDialogClose?: () => void;
  onTermRenewalDialogClose?: () => void;
  onBackfillDialogClose?: () => void;
  onBackfillReset?: () => void;
  onEditMortgageDialogClose?: () => void;
  onEditTermDialogClose?: () => void;
  onMortgageCreated?: (mortgageId: string) => void;
}

/**
 * Hook for managing all mortgage-related mutations
 * Extracted from use-mortgage-tracking-state.ts for better organization
 */
export function useMortgageMutations({
  mortgage,
  uiCurrentTerm,
  onDialogClose,
  onTermRenewalDialogClose,
  onBackfillDialogClose,
  onBackfillReset,
  onEditMortgageDialogClose,
  onEditTermDialogClose,
  onMortgageCreated,
}: UseMortgageMutationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPaymentMutation = useMutation({
    mutationFn: async (payment: {
      paymentDate: string;
      paymentPeriodLabel?: string | null;
      regularPaymentAmount: number;
      prepaymentAmount: number;
      paymentAmount: number;
      principalPaid: number;
      interestPaid: number;
      remainingBalance: number;
      primeRate?: number;
      effectiveRate: number;
      triggerRateHit: number;
      remainingAmortizationMonths: number;
    }) => {
      if (!mortgage?.id || !uiCurrentTerm?.id) throw new Error("No mortgage or term selected");
      return mortgageApi.createPayment(mortgage.id, {
        termId: uiCurrentTerm.id,
        paymentDate: payment.paymentDate,
        paymentPeriodLabel: payment.paymentPeriodLabel || undefined,
        regularPaymentAmount: payment.regularPaymentAmount.toString(),
        prepaymentAmount: payment.prepaymentAmount.toString(),
        paymentAmount: payment.paymentAmount.toString(),
        principalPaid: payment.principalPaid.toFixed(2),
        interestPaid: payment.interestPaid.toFixed(2),
        remainingBalance: payment.remainingBalance.toFixed(2),
        primeRate: payment.primeRate ? payment.primeRate.toString() : undefined,
        effectiveRate: payment.effectiveRate.toString(),
        triggerRateHit: payment.triggerRateHit,
        remainingAmortizationMonths: payment.remainingAmortizationMonths,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mortgageQueryKeys.mortgagePayments(mortgage?.id ?? null),
      });
      toast({
        title: "Payment logged",
        description: "Mortgage payment has been recorded successfully",
      });
      if (onDialogClose) onDialogClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log payment",
        variant: "destructive",
      });
    },
  });

  const createTermMutation = useMutation({
    mutationFn: (term: CreateTermPayload) => {
      if (!mortgage?.id) throw new Error("No mortgage selected");
      return mortgageApi.createTerm(mortgage.id, term);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mortgageQueryKeys.mortgageTerms(mortgage?.id ?? null),
      });
      toast({
        title: "Term renewed",
        description: "New mortgage term has been created successfully",
      });
      if (onTermRenewalDialogClose) onTermRenewalDialogClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to renew term",
        variant: "destructive",
      });
    },
  });

  const backfillPaymentsMutation = useMutation({
    mutationFn: (paymentsPayload: CreatePaymentPayload[]) => {
      if (!mortgage?.id) throw new Error("No mortgage selected");
      return mortgageApi.createBulkPayments(mortgage.id, paymentsPayload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: mortgageQueryKeys.mortgagePayments(mortgage?.id ?? null),
      });
      toast({
        title: "Payments backfilled",
        description: `Successfully created ${data.created} payments`,
      });
      if (onBackfillDialogClose) onBackfillDialogClose();
      if (onBackfillReset) onBackfillReset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to backfill payments",
        variant: "destructive",
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => mortgageApi.deletePayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mortgageQueryKeys.mortgagePayments(mortgage?.id ?? null),
      });
      toast({
        title: "Payment deleted",
        description: "The payment has been removed from your records",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment",
        variant: "destructive",
      });
    },
  });

  const editMortgageMutation = useMutation({
    mutationFn: (updates: UpdateMortgagePayload) => {
      if (!mortgage?.id) throw new Error("No mortgage selected");
      return mortgageApi.updateMortgage(mortgage.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      toast({
        title: "Mortgage updated",
        description: "Your mortgage details have been updated successfully",
      });
      if (onEditMortgageDialogClose) onEditMortgageDialogClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update mortgage",
        variant: "destructive",
      });
    },
  });

  const updateTermMutation = useMutation({
    mutationFn: ({ termId, updates }: { termId: string; updates: UpdateTermPayload }) => {
      return mortgageApi.updateTerm(termId, updates);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: mortgageQueryKeys.mortgageTerms(mortgage?.id ?? null),
      });
      toast({
        title: "Term updated",
        description: "Your mortgage term has been updated successfully",
      });
      if (onEditTermDialogClose) onEditTermDialogClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update term",
        variant: "destructive",
      });
    },
  });

  return {
    createPaymentMutation,
    createTermMutation,
    backfillPaymentsMutation,
    deletePaymentMutation,
    editMortgageMutation,
    updateTermMutation,
  };
}
