import { useEffect, useCallback } from "react";
import { useCreateMortgageFormState } from "./use-create-mortgage-form-state";
import { useEditMortgageForm } from "./use-edit-mortgage-form";
import { useTermRenewalFormState } from "./use-term-renewal-form-state";
import type { Mortgage } from "@shared/schema";
import type { PrimeRateResponse } from "../api";
import type { UiTerm, UiPayment } from "../types";

interface UseMortgageFormsProps {
  // Dialog states
  isCreateMortgageOpen: boolean;
  isEditMortgageOpen: boolean;
  isTermRenewalOpen: boolean;
  
  // Data
  mortgage: Mortgage | null;
  primeRateData?: PrimeRateResponse;
  primeRate: string;
  setPrimeRate: (rate: string) => void;
  
  // Handlers
  setSelectedMortgageId: (id: string) => void;
  setIsCreateMortgageOpen: (open: boolean) => void;
  setIsEditMortgageOpen: (open: boolean) => void;
  setIsTermRenewalOpen: (open: boolean) => void;
  
  // For term renewal form
  paymentHistory?: UiPayment[];
  lastKnownBalance?: number;
  lastKnownAmortizationMonths?: number;
}

/**
 * Hook to consolidate all form state management for mortgage-related forms.
 * Manages create mortgage, edit mortgage, and term renewal forms with automatic
 * form resets when dialogs close.
 */
export function useMortgageForms({
  isCreateMortgageOpen,
  isEditMortgageOpen,
  isTermRenewalOpen,
  mortgage,
  primeRateData,
  primeRate,
  setPrimeRate,
  setSelectedMortgageId,
  setIsCreateMortgageOpen,
  setIsEditMortgageOpen,
  setIsTermRenewalOpen,
  paymentHistory = [],
  lastKnownBalance = 0,
  lastKnownAmortizationMonths = 0,
}: UseMortgageFormsProps) {
  // Memoize prime rate update callback to prevent unnecessary re-renders
  const handlePrimeRateUpdate = useCallback(
    (newPrimeRate: string) => {
      setPrimeRate(newPrimeRate);
    },
    [setPrimeRate]
  );

  // Create Mortgage Form
  const createMortgageForm = useCreateMortgageFormState({
    primeRateData,
    defaultPrimeRate: primeRate,
    onSuccess: (mortgageId) => {
      setSelectedMortgageId(mortgageId);
      setIsCreateMortgageOpen(false);
    },
    onPrimeRateUpdate: handlePrimeRateUpdate,
  });

  // Reset create mortgage form when dialog closes
  useEffect(() => {
    if (!isCreateMortgageOpen) {
      createMortgageForm.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateMortgageOpen]);

  // Edit Mortgage Form
  const editMortgageForm = useEditMortgageForm({
    initialPropertyPrice: mortgage?.propertyPrice || undefined,
    initialCurrentBalance: mortgage?.currentBalance || undefined,
    initialPaymentFrequency: mortgage?.paymentFrequency || undefined,
  });

  // Sync edit mortgage form when dialog opens
  useEffect(() => {
    if (isEditMortgageOpen && mortgage) {
      editMortgageForm.reset({
        propertyPrice: mortgage.propertyPrice || "",
        currentBalance: mortgage.currentBalance || "",
        paymentFrequency: (mortgage.paymentFrequency || "monthly") as
          | "monthly"
          | "biweekly"
          | "accelerated-biweekly"
          | "weekly"
          | "accelerated-weekly"
          | "semi-monthly",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMortgageOpen, mortgage]);

  // Term Renewal Form (for first term creation)
  const firstTermFormState = useTermRenewalFormState({
    mortgage,
    currentTerm: null, // No existing term for first term creation
    paymentHistory,
    lastKnownBalance: lastKnownBalance || Number(mortgage?.currentBalance || 0),
    lastKnownAmortizationMonths:
      lastKnownAmortizationMonths || (mortgage?.amortizationYears || 25) * 12,
    primeRateData,
    defaultPrimeRate: primeRate,
    defaultStartDate: mortgage?.startDate,
    onSuccess: () => {
      setIsTermRenewalOpen(false);
    },
    onPrimeRateUpdate: handlePrimeRateUpdate,
  });

  // Reset term renewal form when dialog closes
  useEffect(() => {
    if (!isTermRenewalOpen) {
      firstTermFormState.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTermRenewalOpen]);

  return {
    createMortgageForm,
    editMortgageForm,
    firstTermFormState,
  };
}

