import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import type { Mortgage } from "@shared/schema";
import type { UseFormReturn } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";
import type { PrimeRateResponse } from "../api";
import type { UiTerm, UiPayment } from "../types";
import type { EditMortgageFormData } from "../hooks/use-edit-mortgage-form";
import type { CreateMortgageFormData } from "../hooks/use-create-mortgage-form";
import type { BackfillFormData } from "../hooks/use-backfill-form";
import type { EditTermFormData } from "../hooks/use-edit-term-form";
import type { TermRenewalFormData } from "../hooks/use-term-renewal-form";
import { MortgageHeader } from "./mortgage-header";
import { NoTermState } from "./no-term-state";
import { EditMortgageDialog } from "./edit-mortgage-dialog";
import { LogPaymentDialog } from "./log-payment-dialog";
import { BackfillPaymentsDialog } from "./backfill-payments-dialog";
import { TermDetailsSection } from "./term-details-section";
import { MortgageSummaryPanels } from "./mortgage-summary-panels";
import { PaymentHistorySection } from "./payment-history-section";
import { EducationSidebar } from "./education-sidebar";
import { formatAmortization } from "../utils/format";

interface MortgageContentProps {
  mortgage: Mortgage | null;
  mortgages: Mortgage[];
  selectedMortgageId: string | null;
  setSelectedMortgageId: (id: string | null) => void;
  uiCurrentTerm: UiTerm | null;
  primeBanner: React.ReactNode;
  handleExport: () => void;
  // Dialog states
  isEditMortgageOpen: boolean;
  onEditMortgageDialogOpenChange: (open: boolean) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isBackfillOpen: boolean;
  setIsBackfillOpen: (open: boolean) => void;
  isTermRenewalOpen: boolean;
  onTermRenewalDialogOpenChange: (open: boolean) => void;
  isEditTermOpen: boolean;
  setIsEditTermOpen: (open: boolean) => void;
  onOpenCreateMortgage: () => void;
  // Form states
  editMortgageForm: UseFormReturn<EditMortgageFormData>;
  firstTermFormState: {
    form: UseFormReturn<CreateMortgageFormData>;
    isValid: boolean;
    autoPayment: string;
    paymentEdited: boolean;
    handlePaymentAmountChange: (amount: string) => void;
    useAutoPayment: () => void;
    handleSubmit: () => void;
    createTermMutation: UseMutationResult<any, Error, any, unknown>;
  };
  backfillForm: UseFormReturn<BackfillFormData>;
  editTermFormState: {
    form: UseFormReturn<EditTermFormData>;
    handleSubmit: () => void;
    updateTermMutation: UseMutationResult<any, Error, any, unknown>;
    isValid: boolean;
  };
  renewalFormState: {
    form: UseFormReturn<TermRenewalFormData>;
    handleSubmit: () => void;
    createTermMutation: UseMutationResult<any, Error, any, unknown>;
    isValid: boolean;
    autoPayment: string;
    paymentEdited: boolean;
    handlePaymentAmountChange: (amount: string) => void;
    useAutoPayment: () => void;
  };
  // Data
  primeRateData?: PrimeRateResponse;
  isPrimeRateLoading: boolean;
  refetchPrimeRate: () => Promise<any> | void;
  currentPrimeRateValue: number;
  currentEffectiveRate: number;
  monthsRemainingInTerm: number;
  lastKnownBalance: number;
  lastKnownAmortizationMonths: number;
  summaryStats: {
    currentPrimeRate: number;
    currentRate: number;
    triggerHitCount: number;
    totalPayments: number;
    totalPaid: number;
    totalPrincipal: number;
    totalInterest: number;
    currentBalance: number;
    amortizationYears: number;
  };
  filteredPayments: UiPayment[];
  availableYears: number[];
  filterYear: string;
  onFilterYearChange: (year: string) => void;
  // Mutations - keeping any for complex prop-drilled mutations
  createPaymentMutation: UseMutationResult<any, Error, any, unknown>;
  backfillPaymentsMutation: UseMutationResult<any, Error, any, unknown>;
  deletePaymentMutation: UseMutationResult<any, Error, any, unknown>;
  editMortgageMutation: UseMutationResult<any, Error, any, unknown>;
}

/**
 * Main content component for mortgage feature.
 * Handles rendering when mortgage exists (with or without term).
 * Extracted from mortgage-feature.tsx to reduce component size.
 */
export function MortgageContent({
  mortgage,
  mortgages,
  selectedMortgageId,
  setSelectedMortgageId,
  uiCurrentTerm,
  primeBanner,
  handleExport,
  isEditMortgageOpen,
  onEditMortgageDialogOpenChange,
  isDialogOpen,
  setIsDialogOpen,
  isBackfillOpen,
  setIsBackfillOpen,
  isTermRenewalOpen,
  onTermRenewalDialogOpenChange,
  isEditTermOpen,
  setIsEditTermOpen,
  onOpenCreateMortgage,
  editMortgageForm,
  firstTermFormState,
  backfillForm,
  editTermFormState,
  renewalFormState,
  primeRateData,
  isPrimeRateLoading,
  refetchPrimeRate,
  currentPrimeRateValue,
  currentEffectiveRate,
  monthsRemainingInTerm,
  lastKnownBalance,
  lastKnownAmortizationMonths,
  summaryStats,
  filteredPayments,
  availableYears,
  filterYear,
  onFilterYearChange,
  createPaymentMutation,
  backfillPaymentsMutation,
  deletePaymentMutation,
  editMortgageMutation,
}: MortgageContentProps) {
  if (!mortgage) {
    return null;
  }

  const header = (
    <MortgageHeader
      mortgages={mortgages}
      selectedMortgageId={selectedMortgageId}
      onSelectMortgage={setSelectedMortgageId}
      onEditMortgage={() => onEditMortgageDialogOpenChange(true)}
      onBackfillPayments={() => setIsBackfillOpen(true)}
      onLogPayment={() => setIsDialogOpen(true)}
      onExport={handleExport}
      primeBanner={primeBanner}
      canCreateTerm={Boolean(uiCurrentTerm)}
      onOpenCreateMortgage={onOpenCreateMortgage}
    />
  );

  if (!uiCurrentTerm) {
    return (
      <div className="space-y-8">
        {header}
        <NoTermState
          mortgage={mortgage}
          isTermRenewalOpen={isTermRenewalOpen}
          onTermRenewalOpenChange={onTermRenewalDialogOpenChange}
          form={firstTermFormState.form}
          isValid={firstTermFormState.isValid}
          autoPaymentAmount={firstTermFormState.autoPayment}
          paymentEdited={firstTermFormState.paymentEdited}
          onPaymentAmountChange={firstTermFormState.handlePaymentAmountChange}
          onUseAutoPayment={firstTermFormState.useAutoPayment}
          onSubmit={firstTermFormState.handleSubmit}
          isSubmitting={firstTermFormState.createTermMutation.isPending}
          primeRateData={primeRateData}
          onRefreshPrime={refetchPrimeRate}
          isPrimeRateLoading={isPrimeRateLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {header}

      <EditMortgageDialog
        open={isEditMortgageOpen}
        onOpenChange={onEditMortgageDialogOpenChange}
        form={editMortgageForm}
        editMortgageMutation={editMortgageMutation}
      />

      <LogPaymentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentTerm={uiCurrentTerm}
        currentPrimeRate={currentPrimeRateValue}
        currentEffectiveRate={currentEffectiveRate}
        monthsRemainingInTerm={monthsRemainingInTerm}
        lastKnownBalance={lastKnownBalance}
        lastKnownAmortizationMonths={lastKnownAmortizationMonths}
        onSubmit={(payload) => createPaymentMutation.mutate(payload)}
        isSubmitting={createPaymentMutation.isPending}
      />

      <BackfillPaymentsDialog
        open={isBackfillOpen}
        onOpenChange={(open) => {
          setIsBackfillOpen(open);
          if (!open) {
            backfillForm.reset();
          }
        }}
        currentTerm={uiCurrentTerm}
        mortgage={mortgage}
        form={backfillForm}
        primeRateData={primeRateData}
        backfillMutation={{
          mutate: (payload) => backfillPaymentsMutation.mutate(payload),
          isPending: backfillPaymentsMutation.isPending,
        }}
      />

      <TermDetailsSection
        currentTerm={uiCurrentTerm}
        monthsRemainingInTerm={monthsRemainingInTerm}
        summaryStats={{
          currentPrimeRate: summaryStats.currentPrimeRate,
          currentRate: summaryStats.currentRate,
        }}
        isEditTermOpen={isEditTermOpen}
        setIsEditTermOpen={setIsEditTermOpen}
        editTermForm={editTermFormState.form}
        editTermOnSubmit={editTermFormState.handleSubmit}
        editTermIsSubmitting={editTermFormState.updateTermMutation.isPending}
        editTermIsValid={editTermFormState.isValid}
        isTermRenewalOpen={isTermRenewalOpen}
        setIsTermRenewalOpen={onTermRenewalDialogOpenChange}
        renewalForm={renewalFormState.form}
        renewalOnSubmit={renewalFormState.handleSubmit}
        renewalIsSubmitting={renewalFormState.createTermMutation.isPending}
        renewalIsValid={renewalFormState.isValid}
        renewalAutoPaymentAmount={renewalFormState.autoPayment}
        renewalPaymentEdited={renewalFormState.paymentEdited}
        renewalOnPaymentAmountChange={renewalFormState.handlePaymentAmountChange}
        renewalOnUseAutoPayment={renewalFormState.useAutoPayment}
        primeRateData={primeRateData}
        isPrimeRateLoading={isPrimeRateLoading}
        refetchPrimeRate={refetchPrimeRate}
      />

      {summaryStats.triggerHitCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Trigger Rate Hit:</span> {summaryStats.triggerHitCount}{" "}
            payment(s) where interest exceeded regular payment amount. Consider lump-sum prepayment
            or payment increase.
          </AlertDescription>
        </Alert>
      )}

      <MortgageSummaryPanels
        stats={{
          totalPayments: summaryStats.totalPayments,
          totalPaid: summaryStats.totalPaid,
          totalPrincipal: summaryStats.totalPrincipal,
          totalInterest: summaryStats.totalInterest,
          currentBalance: summaryStats.currentBalance,
          amortizationYears: summaryStats.amortizationYears,
        }}
        formatAmortization={formatAmortization}
      />

      <PaymentHistorySection
        filteredPayments={filteredPayments}
        availableYears={availableYears}
        filterYear={filterYear}
        onFilterYearChange={onFilterYearChange}
        formatAmortization={formatAmortization}
        deletePaymentMutation={deletePaymentMutation}
      />

      <EducationSidebar />
    </div>
  );
}
