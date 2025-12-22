import { useToast } from "@/shared/hooks/use-toast";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { MortgageLayout } from "./components/mortgage-layout";
import { MortgageEmptyState } from "./components/mortgage-empty-state";
import { MortgagePrimeBanner } from "./components/mortgage-prime-banner";
import { CreateMortgageDialog } from "./components/create-mortgage-dialog";
import { MortgageContent } from "./components/mortgage-content";
import { useState, useEffect, useCallback } from "react";
import { useMortgageTrackingState } from "./hooks/use-mortgage-tracking-state";
import { useMortgageForms } from "./hooks/use-mortgage-forms";
import { useMortgageDialogHandlers } from "./hooks/use-mortgage-dialog-handlers";
import { useBackfillFormState } from "./hooks/use-backfill-form-state";
import { useEditTermFormState } from "./hooks/use-edit-term-form-state";
import { useTermRenewalFormState } from "./hooks/use-term-renewal-form-state";

export default function MortgageFeature() {
  const { toast } = useToast();
  usePageTitle("Mortgage Tracking | Mortgage Strategy");

  const [isCreateMortgageOpen, setIsCreateMortgageOpen] = useState(false);

  const {
    selectedMortgageId,
    setSelectedMortgageId,
    isDialogOpen,
    setIsDialogOpen,
    isTermRenewalOpen,
    setIsTermRenewalOpen,
    isBackfillOpen,
    setIsBackfillOpen,
    filterYear,
    setFilterYear,
    primeRate,
    setPrimeRate,
    isEditMortgageOpen,
    setIsEditMortgageOpen,
    isEditTermOpen,
    setIsEditTermOpen,
    mortgages,
    mortgage,
    terms,
    // payments, // Unused
    isLoading,
    primeRateData,
    isPrimeRateLoading,
    refetchPrimeRate,
    uiCurrentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    createPaymentMutation,
    backfillPaymentsMutation,
    deletePaymentMutation,
    editMortgageMutation,
    // updateTermMutation, // Unused
    currentPrimeRateValue,
    currentEffectiveRate,
    summaryStats,
    filteredPayments,
    availableYears,
    monthsRemainingInTerm,
  } = useMortgageTrackingState();

  // Memoize prime rate update callback to prevent unnecessary re-renders
  const handlePrimeRateUpdate = useCallback(
    (newPrimeRate: string) => {
      setPrimeRate(newPrimeRate);
    },
    [setPrimeRate]
  );

  // Consolidated form state management
  const forms = useMortgageForms({
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
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
  });
  const { createMortgageForm, editMortgageForm, firstTermFormState } = forms;

  // Consolidated dialog handlers
  const dialogHandlers = useMortgageDialogHandlers({
    setIsCreateMortgageOpen,
    setIsEditMortgageOpen,
    setIsTermRenewalOpen,
    editMortgageForm,
    createMortgageForm: createMortgageForm.form,
    firstTermFormState,
  });
  const {
    handleCreateDialogOpenChange,
    handleEditMortgageDialogOpenChange,
    handleTermRenewalDialogOpenChange,
  } = dialogHandlers;

  // Backfill form state
  const backfillForm = useBackfillFormState({
    currentTerm: uiCurrentTerm,
    isOpen: isBackfillOpen,
    onClose: () => setIsBackfillOpen(false),
    onReset: () => {
      // Reset handled by hook
    },
  });

  // Edit term form state
  const editTermFormState = useEditTermFormState({
    currentTerm: terms?.[terms.length - 1] || null,
    primeRateData,
    onSuccess: () => {
      setIsEditTermOpen(false);
    },
  });

  // Term renewal form state for existing term renewals (not first term)
  const renewalFormState = useTermRenewalFormState({
    mortgage,
    currentTerm: uiCurrentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    primeRateData,
    defaultPrimeRate: primeRate,
    defaultStartDate: uiCurrentTerm?.endDate,
    onSuccess: () => {
      setIsTermRenewalOpen(false);
    },
    onPrimeRateUpdate: handlePrimeRateUpdate,
  });

  // Reset renewal form when dialog closes
  useEffect(() => {
    if (!isTermRenewalOpen && uiCurrentTerm) {
      renewalFormState.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTermRenewalOpen, uiCurrentTerm]);

  const emptyState = (
    <MortgageEmptyState onOpenCreateMortgage={() => setIsCreateMortgageOpen(true)} />
  );

  const primeBanner = mortgage ? (
    <MortgagePrimeBanner
      primeRate={currentPrimeRateValue}
      effectiveDate={primeRateData?.effectiveDate ?? null}
      onRefresh={() => refetchPrimeRate()}
      isRefreshing={isPrimeRateLoading}
    />
  ) : null;

  const handleExport = () => {
    toast({
      title: "Export coming soon",
      description: "CSV export will be available in a future update.",
    });
  };

  return (
    <>
      <CreateMortgageDialog
        open={isCreateMortgageOpen}
        onOpenChange={handleCreateDialogOpenChange}
        form={createMortgageForm.form}
        loanAmount={createMortgageForm.loanAmount}
        wizardStep={createMortgageForm.wizardStep}
        setWizardStep={createMortgageForm.setWizardStep}
        onNextStep={createMortgageForm.handleNextStep}
        onSubmit={createMortgageForm.handleSubmit}
        isCreatingMortgage={createMortgageForm.createMortgageMutation.isPending}
        isStep1Valid={createMortgageForm.isStep1Valid}
        isStep2Valid={createMortgageForm.isStep2Valid}
        autoPayment={createMortgageForm.autoPayment}
        paymentEdited={createMortgageForm.paymentEdited}
        onPaymentAmountChange={createMortgageForm.handlePaymentAmountChange}
        onUseAutoPayment={createMortgageForm.useAutoPayment}
        primeRateData={primeRateData}
        onRefreshPrime={() => refetchPrimeRate()}
        isPrimeRateLoading={isPrimeRateLoading}
      />
      <MortgageLayout
        isLoading={isLoading}
        hasMortgage={mortgages.length > 0}
        emptyState={emptyState}
      >
        <MortgageContent
          mortgage={mortgage}
          mortgages={mortgages}
          selectedMortgageId={selectedMortgageId}
          setSelectedMortgageId={setSelectedMortgageId}
          uiCurrentTerm={uiCurrentTerm}
          primeBanner={primeBanner}
          handleExport={handleExport}
          isEditMortgageOpen={isEditMortgageOpen}
          onEditMortgageDialogOpenChange={handleEditMortgageDialogOpenChange}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          isBackfillOpen={isBackfillOpen}
          setIsBackfillOpen={setIsBackfillOpen}
          isTermRenewalOpen={isTermRenewalOpen}
          onTermRenewalDialogOpenChange={handleTermRenewalDialogOpenChange}
          isEditTermOpen={isEditTermOpen}
          setIsEditTermOpen={setIsEditTermOpen}
          onOpenCreateMortgage={() => setIsCreateMortgageOpen(true)}
          editMortgageForm={editMortgageForm}
          firstTermFormState={firstTermFormState}
          backfillForm={backfillForm}
          editTermFormState={editTermFormState}
          renewalFormState={renewalFormState}
          primeRateData={primeRateData}
          isPrimeRateLoading={isPrimeRateLoading}
          refetchPrimeRate={refetchPrimeRate}
          currentPrimeRateValue={currentPrimeRateValue}
          currentEffectiveRate={currentEffectiveRate}
          monthsRemainingInTerm={monthsRemainingInTerm}
          lastKnownBalance={lastKnownBalance}
          lastKnownAmortizationMonths={lastKnownAmortizationMonths}
          summaryStats={summaryStats}
          filteredPayments={filteredPayments}
          availableYears={availableYears}
          filterYear={filterYear}
          onFilterYearChange={setFilterYear}
          createPaymentMutation={createPaymentMutation}
          backfillPaymentsMutation={backfillPaymentsMutation}
          deletePaymentMutation={deletePaymentMutation}
          editMortgageMutation={editMortgageMutation}
        />
      </MortgageLayout>
    </>
  );
}
