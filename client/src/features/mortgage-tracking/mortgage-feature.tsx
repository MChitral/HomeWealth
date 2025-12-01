import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { Plus, AlertTriangle, RefreshCw, Info, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Separator } from "@/shared/ui/separator";
import { useToast } from "@/shared/hooks/use-toast";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { InfoTooltip } from "@/shared/ui/info-tooltip";
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
import { TermRenewalDialog } from "./components/term-renewal-dialog";
import { useMortgageTrackingState } from "./hooks/use-mortgage-tracking-state";

export default function MortgageFeature() {
  const { toast } = useToast();
  usePageTitle("Mortgage Tracking | Mortgage Strategy");

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
    backfillStartDate,
    setBackfillStartDate,
    backfillNumberOfPayments,
    setBackfillNumberOfPayments,
    backfillPaymentAmount,
    setBackfillPaymentAmount,
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
    isCreateMortgageOpen,
    setIsCreateMortgageOpen,
    wizardStep,
    setWizardStep,
    createPropertyPrice,
    setCreatePropertyPrice,
    createDownPayment,
    setCreateDownPayment,
    createStartDate,
    setCreateStartDate,
    createAmortization,
    setCreateAmortization,
    createFrequency,
    setCreateFrequency,
    createTermType,
    setCreateTermType,
    createTermYears,
    setCreateTermYears,
    createFixedRate,
    setCreateFixedRate,
    createPrimeRate,
    setCreatePrimeRate,
    createSpread,
    setCreateSpread,
    createPaymentAmount,
    setCreatePaymentAmount,
    isCreatingMortgage,
    isEditMortgageOpen,
    setIsEditMortgageOpen,
    editPropertyPrice,
    setEditPropertyPrice,
    editCurrentBalance,
    setEditCurrentBalance,
    editPaymentFrequency,
    setEditPaymentFrequency,
    isEditTermOpen,
    setIsEditTermOpen,
    editTermType,
    setEditTermType,
    editTermStartDate,
    setEditTermStartDate,
    editTermEndDate,
    setEditTermEndDate,
    editTermYears,
    setEditTermYears,
    editTermPaymentFrequency,
    setEditTermPaymentFrequency,
    editTermPaymentAmount,
    setEditTermPaymentAmount,
    editTermFixedRate,
    setEditTermFixedRate,
    editTermPrimeRate,
    setEditTermPrimeRate,
    editTermSpread,
    setEditTermSpread,
    propertyPrice,
    downPayment,
    propertyPriceError,
    downPaymentError,
    loanAmount,
    loanAmountError,
    isFormValid,
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
    autoCreatePayment,
    autoRenewalPayment,
    createPaymentMutation,
    createTermMutation,
    backfillPaymentsMutation,
    deletePaymentMutation,
    formatAmortization,
    editMortgageMutation,
    updateTermMutation,
    handleTermRenewal,
    createMortgageWithTerm,
    isStep2Valid,
    currentPrimeRateValue,
    currentEffectiveRate,
    previewBackfillEndDate,
    summaryStats,
    filteredPayments,
    availableYears,
    effectiveRate,
    monthsRemainingInTerm,
  } = useMortgageTrackingState();

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateMortgageOpen(open);
    if (!open) {
      setWizardStep(1);
    }
  };

  const handleNextWizardStep = () => {
    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description:
          propertyPriceError ||
          downPaymentError ||
          loanAmountError ||
          "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setWizardStep(2);
  };

  const handleCreatePaymentAmountChange = (value: string) => {
    setCreatePaymentAmount(value);
    setCreatePaymentEdited(true);
  };

  const handleUseAutoPayment = () => {
    if (!autoCreatePayment) return;
    setCreatePaymentEdited(false);
    setCreatePaymentAmount(autoCreatePayment);
  };

  const emptyState = (
    <MortgageEmptyState onOpenCreateMortgage={() => setIsCreateMortgageOpen(true)} />
  );

  const createDialogFormValues = {
    propertyPrice: createPropertyPrice,
    downPayment: createDownPayment,
    startDate: createStartDate,
    amortization: createAmortization,
    frequency: createFrequency,
    termType: createTermType,
    termYears: createTermYears,
    fixedRate: createFixedRate,
    primeRate: createPrimeRate,
    spread: createSpread,
    paymentAmount: createPaymentAmount,
  };

  const createDialogFormSetters = {
    setPropertyPrice: setCreatePropertyPrice,
    setDownPayment: setCreateDownPayment,
    setStartDate: setCreateStartDate,
    setAmortization: setCreateAmortization,
    setFrequency: setCreateFrequency,
    setTermType: setCreateTermType,
    setTermYears: setCreateTermYears,
    setFixedRate: setCreateFixedRate,
    setPrimeRate: setCreatePrimeRate,
    setSpread: setCreateSpread,
  };

  const createDialogValidation = {
    propertyPriceError,
    downPaymentError,
    loanAmountError,
    isFormValid: Boolean(isFormValid),
    isStep2Valid,
  };

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
  
  const handleCreateFirstTerm = () => {
    if (!mortgage) return;
    const defaultStartDate = mortgage.startDate || new Date().toISOString().split("T")[0];
    const startDate = renewalStartDate || defaultStartDate;
    const termYears = Number(renewalTermYears) || 5;
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + termYears);

    createTermMutation.mutate({
      termType: renewalTermType,
      startDate,
      endDate: endDate.toISOString().split("T")[0],
      termYears,
      lockedSpread: renewalTermType !== "fixed" ? renewalSpread : "0",
      fixedRate: renewalTermType === "fixed" ? renewalRate : undefined,
      primeRate: renewalTermType !== "fixed" ? (renewalPrime || primeRate) : undefined,
      paymentFrequency: renewalPaymentFrequency,
      regularPaymentAmount: renewalPaymentAmount,
    });
  };

  const renderNoTermState = () => {
    if (!mortgage) return null;
    const defaultStartDate = mortgage.startDate || new Date().toISOString().split("T")[0];

    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">No Term Data</h2>
          <p className="text-muted-foreground max-w-md">
            Your mortgage has been created! Now create your first mortgage term to start tracking payments.
          </p>
        </div>

        <TermRenewalDialog
          open={isTermRenewalOpen}
          onOpenChange={setIsTermRenewalOpen}
          title="Create Mortgage Term"
          description="Set up your initial mortgage term with interest rate and payment details"
          showAlert={false}
          defaultStartDate={defaultStartDate}
          triggerButton={
            <Button size="lg" data-testid="button-create-first-term">
              <Plus className="h-5 w-5 mr-2" />
              Create First Term
            </Button>
          }
          termType={renewalTermType}
          setTermType={setRenewalTermType}
          paymentFrequency={renewalPaymentFrequency}
          setPaymentFrequency={setRenewalPaymentFrequency}
          termYears={renewalTermYears}
          setTermYears={setRenewalTermYears}
          startDate={renewalStartDate}
          setStartDate={setRenewalStartDate}
          fixedRate={renewalRate}
          setFixedRate={setRenewalRate}
          spread={renewalSpread}
          setSpread={setRenewalSpread}
          primeRate={renewalPrime || primeRate}
          setPrimeRate={setRenewalPrime}
          paymentAmount={renewalPaymentAmount}
          setPaymentAmount={setRenewalPaymentAmount}
          autoPaymentAmount={autoRenewalPayment}
          paymentEdited={renewalPaymentEdited}
          setPaymentEdited={setRenewalPaymentEdited}
          onSubmit={handleCreateFirstTerm}
          isSubmitting={createTermMutation.isPending}
          isSubmitDisabled={
            !renewalPaymentAmount ||
            (renewalTermType === "fixed" ? !renewalRate : !renewalSpread)
          }
        />
      </div>
    );
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
          {renderNoTermState()}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {header}

      <EditMortgageDialog
        open={isEditMortgageOpen}
        onOpenChange={setIsEditMortgageOpen}
        propertyPrice={editPropertyPrice}
        setPropertyPrice={setEditPropertyPrice}
        currentBalance={editCurrentBalance}
        setCurrentBalance={setEditCurrentBalance}
        paymentFrequency={editPaymentFrequency}
        setPaymentFrequency={setEditPaymentFrequency}
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
          onOpenChange={setIsBackfillOpen}
          currentTerm={uiCurrentTerm}
          mortgage={mortgage}
          backfillStartDate={backfillStartDate}
          setBackfillStartDate={setBackfillStartDate}
          backfillNumberOfPayments={backfillNumberOfPayments}
          setBackfillNumberOfPayments={setBackfillNumberOfPayments}
          backfillPaymentAmount={backfillPaymentAmount}
          setBackfillPaymentAmount={setBackfillPaymentAmount}
          previewEndDate={previewBackfillEndDate}
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
          editTermType={editTermType}
          setEditTermType={setEditTermType}
          editTermStartDate={editTermStartDate}
          setEditTermStartDate={setEditTermStartDate}
          editTermEndDate={editTermEndDate}
          setEditTermEndDate={setEditTermEndDate}
          editTermYears={editTermYears}
          setEditTermYears={setEditTermYears}
          editTermPaymentFrequency={editTermPaymentFrequency}
          setEditTermPaymentFrequency={setEditTermPaymentFrequency}
          editTermPaymentAmount={editTermPaymentAmount}
          setEditTermPaymentAmount={setEditTermPaymentAmount}
          editTermFixedRate={editTermFixedRate}
          setEditTermFixedRate={setEditTermFixedRate}
          editTermPrimeRate={editTermPrimeRate}
          setEditTermPrimeRate={setEditTermPrimeRate}
          editTermSpread={editTermSpread}
          setEditTermSpread={setEditTermSpread}
          isTermRenewalOpen={isTermRenewalOpen}
          setIsTermRenewalOpen={setIsTermRenewalOpen}
          renewalTermType={renewalTermType}
          setRenewalTermType={setRenewalTermType}
          renewalPaymentFrequency={renewalPaymentFrequency}
          setRenewalPaymentFrequency={setRenewalPaymentFrequency}
          renewalRate={renewalRate}
          setRenewalRate={setRenewalRate}
          renewalSpread={renewalSpread}
          setRenewalSpread={setRenewalSpread}
          renewalPrime={renewalPrime}
          setRenewalPrime={setRenewalPrime}
          renewalTermYears={renewalTermYears}
          setRenewalTermYears={setRenewalTermYears}
          renewalStartDate={renewalStartDate}
          setRenewalStartDate={setRenewalStartDate}
          renewalPaymentAmount={renewalPaymentAmount}
          setRenewalPaymentAmount={setRenewalPaymentAmount}
          updateTermMutation={updateTermMutation}
          handleTermRenewal={handleTermRenewal}
          terms={terms}
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
        wizardStep={wizardStep}
        setWizardStep={setWizardStep}
        onNextStep={handleNextWizardStep}
        onSubmit={createMortgageWithTerm}
        isCreatingMortgage={isCreatingMortgage}
        formValues={createDialogFormValues}
        formSetters={createDialogFormSetters}
        validation={createDialogValidation}
        autoCreatePayment={autoCreatePayment}
        createPaymentEdited={createPaymentEdited}
        onCreatePaymentChange={handleCreatePaymentAmountChange}
        onUseAutoPayment={handleUseAutoPayment}
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
