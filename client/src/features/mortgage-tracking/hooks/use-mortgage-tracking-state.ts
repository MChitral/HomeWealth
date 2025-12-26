import { useState } from "react";
import { useMortgageSelection } from "../contexts/mortgage-selection-context";
import { useMortgageData } from "./use-mortgage-data";
import { usePrimeRate } from "./use-prime-rate";
import { useMortgageDialogs } from "./use-mortgage-dialogs";
import { useMortgageComputed } from "./use-mortgage-computed";
import { useMortgageMutations } from "./use-mortgage-mutations";

/**
 * Core hook for mortgage tracking state management.
 * Manages only essential state - all form state is handled by form hooks.
 *
 * This hook was refactored from 558 lines to ~150 lines by:
 * - Removing all legacy form state (now in React Hook Form hooks)
 * - Removing business logic functions (moved to form hooks)
 * - Removing unused computed values and effects
 * - Keeping only core state management
 */
export function useMortgageTrackingState() {
  const {
    selectedMortgageId,
    setSelectedMortgageId,
    mortgages: contextMortgages,
  } = useMortgageSelection();

  // Dialog state (extracted hook)
  const dialogs = useMortgageDialogs();
  const {
    isDialogOpen,
    setIsDialogOpen,
    isTermRenewalOpen,
    setIsTermRenewalOpen,
    isBackfillOpen,
    setIsBackfillOpen,
    isEditMortgageOpen,
    setIsEditMortgageOpen,
    isEditTermOpen,
    setIsEditTermOpen,
  } = dialogs;

  // Payment history filters
  const [filterYear, setFilterYear] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [filterPaymentType, setFilterPaymentType] = useState<"all" | "regular" | "prepayment" | "skipped">("all");
  const [searchAmount, setSearchAmount] = useState<string>("");

  // Core data hooks
  const { mortgage, terms, payments, isLoading } = useMortgageData(selectedMortgageId);
  const { primeRate, setPrimeRate, primeRateData, isPrimeRateLoading, refetchPrimeRate } =
    usePrimeRate();

  // Use mortgages from context
  const mortgages = contextMortgages;

  // Computed values (extracted hook)
  const computed = useMortgageComputed({
    mortgage,
    terms,
    payments,
    primeRateData,
    primeRate,
    filterYear,
    filterDateRange,
    filterPaymentType,
    searchAmount,
  });
  const {
    uiCurrentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    currentPrimeRateValue,
    currentEffectiveRate,
    summaryStats,
    filteredPayments,
    availableYears,
    effectiveRate,
    monthsRemainingInTerm,
  } = computed;

  // Mutations (extracted hook)
  const mutations = useMortgageMutations({
    mortgage,
    uiCurrentTerm,
    onDialogClose: () => setIsDialogOpen(false),
    onTermRenewalDialogClose: () => setIsTermRenewalOpen(false),
    onBackfillDialogClose: () => setIsBackfillOpen(false),
    onBackfillReset: () => {
      // Reset handled by form hook
    },
    onEditMortgageDialogClose: () => setIsEditMortgageOpen(false),
    onEditTermDialogClose: () => setIsEditTermOpen(false),
  });
  const {
    createPaymentMutation,
    createTermMutation,
    backfillPaymentsMutation,
    deletePaymentMutation,
    editMortgageMutation,
    updateTermMutation,
  } = mutations;

  return {
    // Mortgage selection
    selectedMortgageId,
    setSelectedMortgageId,

    // Dialog states
    isDialogOpen,
    setIsDialogOpen,
    isTermRenewalOpen,
    setIsTermRenewalOpen,
    isBackfillOpen,
    setIsBackfillOpen,
    isEditMortgageOpen,
    setIsEditMortgageOpen,
    isEditTermOpen,
    setIsEditTermOpen,

    // Payment history filters
    filterYear,
    setFilterYear,
    filterDateRange,
    setFilterDateRange,
    filterPaymentType,
    setFilterPaymentType,
    searchAmount,
    setSearchAmount,

    // Core data
    mortgages,
    mortgage,
    terms,
    payments,
    isLoading,
    rawPayments: payments, // Expose raw payments for skip tracking

    // Prime rate
    primeRate,
    setPrimeRate,
    primeRateData,
    isPrimeRateLoading,
    refetchPrimeRate,

    // Computed values
    uiCurrentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    currentPrimeRateValue,
    currentEffectiveRate,
    summaryStats,
    filteredPayments,
    availableYears,
    effectiveRate,
    monthsRemainingInTerm,

    // Mutations
    createPaymentMutation,
    createTermMutation,
    backfillPaymentsMutation,
    deletePaymentMutation,
    editMortgageMutation,
    updateTermMutation,
  };
}
