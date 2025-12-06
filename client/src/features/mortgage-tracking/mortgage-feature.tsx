import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { useToast } from "@/shared/hooks/use-toast";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { LogPaymentDialog } from "./components/log-payment-dialog";
import { BackfillPaymentsDialog } from "./components/backfill-payments-dialog";
import { MortgageLayout } from "./components/mortgage-layout";
import { MortgageHeader } from "./components/mortgage-header";
import { MortgageEmptyState } from "./components/mortgage-empty-state";
import { MortgagePrimeBanner } from "./components/mortgage-prime-banner";
import { CreateMortgageDialog } from "./components/create-mortgage-dialog";
import { TermDetailsSection } from "./components/term-details-section";
import { MortgageSummaryPanels } from "./components/mortgage-summary-panels";
import { PaymentHistorySection } from "./components/payment-history-section";
import { EducationSidebar } from "./components/education-sidebar";
import { EditMortgageDialog } from "./components/edit-mortgage-dialog";
import { NoTermState } from "./components/no-term-state";
import { useState, useEffect } from "react";
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
    renewalTermType,
    setRenewalTermType,
    renewalPaymentFrequency,
    setRenewalPaymentFrequency,
    renewalRate,
    setRenewalRate,
    renewalSpread,
    setRenewalSpread,
    renewalPrime,
    setRenewalPrime,
    renewalTermYears,
    setRenewalTermYears,
    renewalStartDate,
    setRenewalStartDate,
    renewalPaymentAmount,
    setRenewalPaymentAmount,
    createPaymentEdited,
    setCreatePaymentEdited,
    renewalPaymentEdited,
    setRenewalPaymentEdited,
    isEditMortgageOpen,
    setIsEditMortgageOpen,
    isEditTermOpen,
    setIsEditTermOpen,
    mortgages,
    mortgage,
    terms,
    payments,
    isLoading,
    primeRateData,
    isPrimeRateLoading,
    refetchPrimeRate,
    uiCurrentTerm,
    paymentHistory,
    lastKnownBalance,
    lastKnownAmortizationMonths,
    autoRenewalPayment,
    createPaymentMutation,
    createTermMutation,
    backfillPaymentsMutation,
    deletePaymentMutation,
    formatAmortization,
    editMortgageMutation,
    updateTermMutation,
    handleTermRenewal,
    currentPrimeRateValue,
    currentEffectiveRate,
    previewBackfillEndDate,
    summaryStats,
    filteredPayments,
    availableYears,
    effectiveRate,
    monthsRemainingInTerm,
  } = useMortgageTrackingState();

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
    createMortgageForm,
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
    onPrimeRateUpdate: (newPrimeRate) => {
      setPrimeRate(newPrimeRate);
    },
  });

  // Reset renewal form when dialog closes
  useEffect(() => {
    if (!isTermRenewalOpen && uiCurrentTerm) {
      renewalFormState.reset();
    }
  }, [isTermRenewalOpen, renewalFormState, uiCurrentTerm]);

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
  

  const renderMainContent = () => {
    if (!mortgage) {
      return null;
    }

    const header = (
      <MortgageHeader
        mortgages={mortgages}
        selectedMortgageId={selectedMortgageId}
        onSelectMortgage={setSelectedMortgageId}
        onEditMortgage={() => setIsEditMortgageOpen(true)}
        onBackfillPayments={() => setIsBackfillOpen(true)}
        onLogPayment={() => setIsDialogOpen(true)}
        onExport={handleExport}
        primeBanner={primeBanner}
        canCreateTerm={Boolean(uiCurrentTerm)}
        onOpenCreateMortgage={() => setIsCreateMortgageOpen(true)}
      />
    );

    if (!uiCurrentTerm) {
      return (
        <div className="space-y-8">
          {header}
          <NoTermState
            mortgage={mortgage}
            isTermRenewalOpen={isTermRenewalOpen}
            onTermRenewalOpenChange={handleTermRenewalDialogOpenChange}
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
        onOpenChange={handleEditMortgageDialogOpenChange}
        form={editMortgageForm}
        editMortgageMutation={editMortgageMutation}
      />

      {uiCurrentTerm && (
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
      )}

      {uiCurrentTerm && (
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
      )}

      {uiCurrentTerm && (
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
          setIsTermRenewalOpen={setIsTermRenewalOpen}
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
      )}

      {/* Old term details card removed - now using TermDetailsSection component */}

      {summaryStats.triggerHitCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Trigger Rate Hit:</span> {summaryStats.triggerHitCount} payment(s) 
            where interest exceeded regular payment amount. Consider lump-sum prepayment or payment increase.
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
        onFilterYearChange={setFilterYear}
        formatAmortization={formatAmortization}
        deletePaymentMutation={deletePaymentMutation}
      />

      <EducationSidebar />
      </div>
    );
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
        {renderMainContent()}
      </MortgageLayout>
    </>
  );
}
