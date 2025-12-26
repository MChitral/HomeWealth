import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { AnalyticsDashboard } from "@/features/analytics/analytics-dashboard";
import PrepaymentFeature from "../prepayment-feature";
import { PrepaymentStrategyRecommendations } from "./prepayment-strategy-recommendations";
import { RenewalTab } from "./renewal-tab";
import { RefinanceTab } from "./refinance-tab";
import type { Mortgage, MortgagePayment } from "@shared/schema";
import type { UseFormReturn } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";
import type { PrimeRateResponse } from "../api";
import type { UiTerm, UiPayment } from "../types";
import type { EditMortgageFormData } from "../hooks/use-edit-mortgage-form";

import type { BackfillFormData } from "../hooks/use-backfill-form";
import type { EditTermFormData } from "../hooks/use-edit-term-form";
import type { TermRenewalFormData } from "../hooks/use-term-renewal-form";
import { MortgageHeader } from "./mortgage-header";
import { NoTermState } from "./no-term-state";
import { EditMortgageDialog } from "./edit-mortgage-dialog";
import { LogPaymentDialog } from "./log-payment-dialog";
import { SkipPaymentDialog } from "./skip-payment-dialog";
import { BackfillPaymentsDialog } from "./backfill-payments-dialog";
import { TermDetailsSection } from "./term-details-section";
import { MortgageSummaryPanels } from "./mortgage-summary-panels";
import { PaymentHistorySection } from "./payment-history-section";
import { EducationSidebar } from "./education-sidebar";
import { HelocSection } from "./heloc-section";
import { RecastDialog } from "./recast-dialog";
import { RecastHistory } from "./recast-history";
import { FrequencyChangeDialog } from "./frequency-change-dialog";
import { FrequencyChangeHistory } from "./frequency-change-history";
import { PortabilityDialog } from "./portability-dialog";
import { PortabilityHistory } from "./portability-history";
import { PropertyValueUpdateDialog } from "./property-value-update-dialog";
import { PropertyValueSection } from "./property-value-section";
import { formatAmortization } from "../utils/format";
import { useState } from "react";
import { SkipImpactCalculator } from "./skip-impact-calculator";
import { MLISelectChecker } from "./mli-select-checker";
import { InsuranceProviderComparison } from "./insurance-provider-comparison";
import { StressTestCalculator } from "./stress-test-calculator";
import { DebtServiceRatios } from "./debt-service-ratios";
import { useQuery } from "@tanstack/react-query";
import { insuranceApi } from "../api/insurance-api";

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
    form: UseFormReturn<TermRenewalFormData>;
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
    totalSkippedInterest: number;
  };
  filteredPayments: UiPayment[];
  availableYears: number[];
  filterYear: string;
  onFilterYearChange: (year: string) => void;
  filterDateRange: { start: string | null; end: string | null };
  onFilterDateRangeChange: (range: { start: string | null; end: string | null }) => void;
  filterPaymentType: "all" | "regular" | "prepayment" | "skipped";
  onFilterPaymentTypeChange: (type: "all" | "regular" | "prepayment" | "skipped") => void;
  searchAmount: string;
  onSearchAmountChange: (amount: string) => void;
  payments?: MortgagePayment[]; // Raw payments for skip tracking
  isSkipPaymentOpen: boolean;
  setIsSkipPaymentOpen: (open: boolean) => void;
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
  isSkipPaymentOpen,
  setIsSkipPaymentOpen,
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
  filterDateRange,
  onFilterDateRangeChange,
  filterPaymentType,
  onFilterPaymentTypeChange,
  searchAmount,
  onSearchAmountChange,
  payments,
  createPaymentMutation,
  backfillPaymentsMutation,
  deletePaymentMutation,
  editMortgageMutation,
}: MortgageContentProps) {
  const [isRecastOpen, setIsRecastOpen] = useState(false);
  const [isFrequencyChangeOpen, setIsFrequencyChangeOpen] = useState(false);
  const [isPortabilityOpen, setIsPortabilityOpen] = useState(false);
  const [isPropertyValueUpdateOpen, setIsPropertyValueUpdateOpen] = useState(false);
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);

  // Check if mortgage is high-ratio (down payment < 20%)
  const isHighRatio = mortgage
    ? (Number(mortgage.originalAmount) / Number(mortgage.propertyPrice)) * 100 > 80
    : false;

  // Fetch insurance provider comparison if high-ratio mortgage
  const { data: insuranceComparison } = useQuery({
    queryKey: [
      "insurance-comparison",
      mortgage?.id,
      mortgage?.propertyPrice,
      mortgage?.originalAmount,
    ],
    queryFn: () => {
      if (!mortgage) return null;
      const downPayment = Number(mortgage.propertyPrice) - Number(mortgage.originalAmount);
      return insuranceApi.compareProviders({
        propertyPrice: Number(mortgage.propertyPrice),
        downPayment,
      });
    },
    enabled: !!mortgage && isHighRatio,
  });

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
        mortgageId={mortgage?.id}
        payments={payments}
        onOpenSkipPayment={() => setIsSkipPaymentOpen(true)}
      />

      {mortgage && payments && (
        <SkipPaymentDialog
          open={isSkipPaymentOpen}
          onOpenChange={setIsSkipPaymentOpen}
          mortgageId={mortgage.id}
          currentTerm={uiCurrentTerm}
          currentBalance={lastKnownBalance}
          currentAmortizationMonths={lastKnownAmortizationMonths}
          currentEffectiveRate={currentEffectiveRate}
          payments={payments}
        />
      )}

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

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto gap-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="heloc">HELOC</TabsTrigger>
          <TabsTrigger value="risk">Risk & Analytics</TabsTrigger>
          <TabsTrigger value="prepayments">Prepayments</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
          <TabsTrigger value="refinance">Refinance</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-8">
          <TermDetailsSection
            currentTerm={uiCurrentTerm}
            mortgage={mortgage}
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
                <span className="font-medium">Trigger Rate Hit:</span>{" "}
                {summaryStats.triggerHitCount} payment(s) where interest exceeded regular payment
                amount. Consider lump-sum prepayment or payment increase.
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
              totalSkippedInterest: summaryStats.totalSkippedInterest,
            }}
            formatAmortization={formatAmortization}
            payments={payments || []}
          />

          {/* Skip Impact Calculator */}
          {uiCurrentTerm && (
            <SkipImpactCalculator
              currentBalance={lastKnownBalance}
              currentAmortizationMonths={lastKnownAmortizationMonths}
              effectiveRate={currentEffectiveRate / 100} // Convert percentage to decimal
              paymentFrequency={uiCurrentTerm.paymentFrequency}
            />
          )}

          <PaymentHistorySection
            filteredPayments={filteredPayments}
            availableYears={availableYears}
            filterYear={filterYear}
            onFilterYearChange={onFilterYearChange}
            filterDateRange={filterDateRange}
            onFilterDateRangeChange={onFilterDateRangeChange}
            filterPaymentType={filterPaymentType}
            onFilterPaymentTypeChange={onFilterPaymentTypeChange}
            searchAmount={searchAmount}
            onSearchAmountChange={onSearchAmountChange}
            formatAmortization={formatAmortization}
            deletePaymentMutation={deletePaymentMutation}
          />

          <EducationSidebar />

          {/* Property Value Tracking */}
          {mortgage && (
            <PropertyValueSection
              mortgageId={mortgage.id}
              currentPropertyValue={Number(mortgage.propertyPrice)}
            />
          )}

          {/* Insurance & Compliance Section */}
          {mortgage && isHighRatio && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Insurance & Compliance</h2>
                <p className="text-muted-foreground mb-6">
                  Tools and information for mortgage default insurance and regulatory compliance
                </p>
              </div>

              <MLISelectChecker />

              {insuranceComparison && (
                <InsuranceProviderComparison comparison={insuranceComparison} />
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="heloc" className="space-y-8">
          <HelocSection mortgageId={mortgage.id} mortgage={mortgage} />
        </TabsContent>

        <TabsContent value="risk" className="space-y-8">
          <AnalyticsDashboard mortgageId={mortgage.id} />

          {/* Regulatory Compliance Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Regulatory Compliance</h2>
              <p className="text-muted-foreground mb-6">
                Calculate B-20 stress test and debt service ratios to understand regulatory
                requirements
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">B-20 Stress Test</h3>
                  <Button
                    variant="outline"
                    onClick={() => setIsStressTestOpen(true)}
                    className="w-full md:w-auto"
                  >
                    Open Calculator
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Calculate if your mortgage qualifies under B-20 stress test guidelines. Qualifying
                  rate = max(contract rate + 2%, Bank of Canada 5-year posted rate).
                </p>
              </div>

              <DebtServiceRatios
                mortgagePayment={
                  uiCurrentTerm ? Number(uiCurrentTerm.regularPaymentAmount) : undefined
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prepayments" className="space-y-6">
          <PrepaymentFeature isEmbedded />
          {mortgage && summaryStats && uiCurrentTerm && (
            <PrepaymentStrategyRecommendations
              mortgage={mortgage}
              currentTerm={uiCurrentTerm}
              payments={filteredPayments}
              currentBalance={summaryStats.currentBalance}
              currentRate={summaryStats.currentRate}
              onUseAmount={(amount, type) => {
                // Navigate to prepayment feature or trigger prepayment dialog
                // For now, we'll just log - can be enhanced to integrate with prepayment dialog
                // eslint-disable-next-line no-console
                console.log("Use prepayment amount:", amount, type);
              }}
            />
          )}
          {mortgage && (
            <Tabs defaultValue="recast" className="w-full">
              <TabsList>
                <TabsTrigger value="recast">Recast History</TabsTrigger>
                <TabsTrigger value="frequency">Frequency Changes</TabsTrigger>
                <TabsTrigger value="portability">Portability History</TabsTrigger>
              </TabsList>
              <TabsContent value="recast">
                <RecastHistory mortgageId={mortgage.id} />
              </TabsContent>
              <TabsContent value="frequency">
                <FrequencyChangeHistory mortgageId={mortgage.id} />
              </TabsContent>
              <TabsContent value="portability">
                <PortabilityHistory mortgageId={mortgage.id} />
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>

        <TabsContent value="renewals">
          <RenewalTab
            mortgageId={mortgage.id}
            onTermRenewalDialogOpenChange={onTermRenewalDialogOpenChange}
            currentTerm={uiCurrentTerm}
          />
        </TabsContent>

        <TabsContent value="refinance">
          <RefinanceTab
            mortgageId={mortgage.id}
            currentPropertyPrice={Number(mortgage.propertyPrice)}
          />
        </TabsContent>
      </Tabs>

      {mortgage && (
        <>
          <RecastDialog
            open={isRecastOpen}
            onOpenChange={setIsRecastOpen}
            mortgageId={mortgage.id}
          />
          <PortabilityDialog
            open={isPortabilityOpen}
            onOpenChange={setIsPortabilityOpen}
            mortgageId={mortgage.id}
            currentPropertyPrice={Number(mortgage.propertyPrice)}
          />
          <PropertyValueUpdateDialog
            open={isPropertyValueUpdateOpen}
            onOpenChange={setIsPropertyValueUpdateOpen}
            mortgageId={mortgage.id}
            currentPropertyPrice={Number(mortgage.propertyPrice)}
          />
        </>
      )}

      {mortgage && uiCurrentTerm && (
        <FrequencyChangeDialog
          open={isFrequencyChangeOpen}
          onOpenChange={setIsFrequencyChangeOpen}
          mortgageId={mortgage.id}
          termId={uiCurrentTerm.id}
          currentFrequency={uiCurrentTerm.paymentFrequency}
        />
      )}

      {/* Stress Test Calculator Dialog */}
      {mortgage && uiCurrentTerm && (
        <StressTestCalculator
          open={isStressTestOpen}
          onOpenChange={setIsStressTestOpen}
          mortgageAmount={lastKnownBalance}
          contractRate={summaryStats.currentRate / 100} // currentRate is percentage, convert to decimal
          amortizationMonths={lastKnownAmortizationMonths}
        />
      )}
    </div>
  );
}
