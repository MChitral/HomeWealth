import { useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { Card, CardContent } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Info } from "lucide-react";
import { useMortgageSelection } from "@/features/mortgage-tracking";
import { MortgageSelector } from "@/features/mortgage-tracking/components/mortgage-selector";
import type { PaymentFrequency } from "@/features/mortgage-tracking/utils/mortgage-math";
import { useScenarioDetail, useScenarioEditorState, useScenarioEditorCalculations, useScenarioEditorProjections } from "./hooks";
import { useMortgageData } from "@/features/mortgage-tracking/hooks";
import { useCashFlowData } from "@/features/cash-flow/hooks";
import {
  ScenarioEditorSkeleton,
  ScenarioEditorHeader,
  ScenarioEditorNoMortgageState,
  ScenarioBasicInfoForm,
  CurrentMortgagePositionCard,
  RateAssumptionCard,
  PrepaymentEventsCard,
  SurplusAllocationCard,
  ProjectedMortgageOutcomeCard,
  EmergencyFundStrategyCard,
  InvestmentStrategyCard,
} from "./components";

export function ScenarioEditorFeature() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const rawScenarioId = params.id;
  const isNewScenario = rawScenarioId === "new" || !rawScenarioId;
  const scenarioId = !isNewScenario && rawScenarioId ? rawScenarioId : null;

  const {
    scenario,
    prepaymentEvents: fetchedEvents,
    isLoading: detailLoading,
  } = useScenarioDetail(scenarioId);

  // Use global mortgage selection
  const { selectedMortgageId, setSelectedMortgageId, mortgages, selectedMortgage } = useMortgageSelection();
  
  // Fetch real mortgage data from the database
  const { mortgage, terms, payments, isLoading: mortgageLoading } = useMortgageData(selectedMortgageId);
  const { cashFlow } = useCashFlowData();

  const pageTitle = isNewScenario ? "New Scenario | Mortgage Strategy" : "Edit Scenario | Mortgage Strategy";
  usePageTitle(pageTitle);

  // Get actual payment frequency from mortgage/term data
  const scenarioPaymentFrequency: PaymentFrequency = useMemo(() => {
    // Try to get from latest term first
    const latestTerm = terms && terms.length > 0 
      ? [...terms].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
      : null;
    
    if (latestTerm?.paymentFrequency) {
      return latestTerm.paymentFrequency as PaymentFrequency;
    }
    
    // Fallback to mortgage payment frequency
    if (mortgage?.paymentFrequency) {
      return mortgage.paymentFrequency as PaymentFrequency;
    }
    
    // Default to monthly if no data available
    return "monthly";
  }, [mortgage, terms]);

  // Use centralized state management hook
  const state = useScenarioEditorState(scenario, fetchedEvents, isNewScenario, scenarioId, () => {
    navigate("/scenarios");
  });

  // Use calculations hook
  const calculations = useScenarioEditorCalculations({
    mortgage,
    terms,
    payments,
    cashFlow,
    rateAssumption: state.rateAssumption,
    paymentFrequency: scenarioPaymentFrequency,
  });

  // Use projections hook
  const projections = useScenarioEditorProjections({
    currentMortgageData: calculations.currentMortgageData,
    prepaymentSplit: state.prepaymentSplit,
    monthlySurplus: calculations.monthlySurplus,
    prepaymentEvents: state.prepaymentEvents,
    rateAssumption: state.rateAssumption,
    mortgageId: mortgage?.id,
    paymentFrequency: scenarioPaymentFrequency,
  });

  // Show loading skeleton when editing existing scenario or loading mortgage data
  if ((detailLoading && !isNewScenario) || mortgageLoading) {
    return <ScenarioEditorSkeleton />;
  }

  // Product Logic: Mortgage must exist before scenarios can be created
  // Scenarios are projections based on mortgage data
  if (!mortgages || mortgages.length === 0) {
    return (
      <div className="space-y-6">
        <ScenarioEditorHeader
          isNewScenario={isNewScenario}
          onSave={state.handleSave}
          isSaving={state.saveMutation.isPending}
        />
        <ScenarioEditorNoMortgageState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScenarioEditorHeader
        isNewScenario={isNewScenario}
        onSave={state.handleSave}
        isSaving={state.saveMutation.isPending}
      />

      {mortgages.length > 0 && (
        <div className="lg:w-[340px]">
          <MortgageSelector
            mortgages={mortgages}
            selectedMortgageId={selectedMortgageId}
            onSelectMortgage={(id) => setSelectedMortgageId(id)}
            onCreateNew={() => {}}
          />
        </div>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your current mortgage data is pre-loaded from Mortgage History. Projections start from today's position.
        </AlertDescription>
      </Alert>

      {!cashFlow && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">Cash Flow Not Configured:</span> To calculate accurate surplus cash and 
            meaningful projections, please set up your income and expenses on the{" "}
            <Link href="/cash-flow" className="font-medium underline hover:no-underline">
              Cash Flow page
            </Link>
            . Without cash flow data, surplus calculations will be $0 and projections may not reflect your actual financial situation.
          </AlertDescription>
        </Alert>
      )}

      <ScenarioBasicInfoForm form={state.basicInfoForm} />

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-medium">Note:</span> Income and expenses are configured in the{" "}
            <Link href="/cash-flow" className="text-primary hover:underline">
              Cash Flow page
            </Link>{" "}
            and apply to all scenarios. Here you only configure what differs between strategies.
            {!cashFlow && (
              <span className="block mt-2 text-orange-600 font-medium">
                ⚠️ Set up Cash Flow to enable accurate surplus calculations and projections.
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="mortgage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mortgage" data-testid="tab-mortgage">Mortgage & Prepayment</TabsTrigger>
          <TabsTrigger value="ef" data-testid="tab-ef">Emergency Fund</TabsTrigger>
          <TabsTrigger value="investments" data-testid="tab-investments">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="mortgage" className="space-y-6">
          <CurrentMortgagePositionCard
            currentMortgageData={calculations.currentMortgageData}
            paymentPreview={calculations.scenarioPaymentPreview}
            rateUsedForPreview={calculations.rateUsedForPreview}
          />

          <RateAssumptionCard
            currentRate={calculations.currentMortgageData.currentRate}
            rateAssumption={state.rateAssumption}
            setRateAssumption={state.setRateAssumption}
          />

          <PrepaymentEventsCard
            prepaymentEvents={state.prepaymentEvents}
            isAddingEvent={state.isAddingEvent}
            editingEvent={state.editingEvent}
            form={state.prepaymentEventForm}
            onAddEvent={state.handleAddEvent}
            onEditEvent={state.handleEditEvent}
            onUpdateEvent={state.handleUpdateEvent}
            onDeleteEvent={state.handleDeleteEvent}
            onCancelEvent={() => {
              state.setIsAddingEvent(false);
              state.setEditingEvent(null);
              state.resetEventForm();
            }}
            onStartAddingEvent={() => {
              state.resetEventForm();
              state.setIsAddingEvent(true);
              state.setEditingEvent(null);
            }}
          />

          <SurplusAllocationCard
            monthlySurplus={calculations.monthlySurplus}
            prepaymentSplit={state.prepaymentSplit}
            setPrepaymentSplit={state.setPrepaymentSplit}
            hasCashFlow={!!cashFlow}
          />

          <ProjectedMortgageOutcomeCard
            prepaymentEvents={state.prepaymentEvents}
            rateAssumption={state.rateAssumption}
            projectedPayoff={projections.projectedPayoff}
            totalInterest={projections.totalInterest}
            interestSaved={projections.interestSaved}
            mortgageProjection={projections.mortgageProjection}
            yearlyAmortization={projections.yearlyAmortization}
          />
        </TabsContent>

        <TabsContent value="ef" className="space-y-6">
          <EmergencyFundStrategyCard />
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <InvestmentStrategyCard
            expectedReturnRate={state.expectedReturnRate}
            setExpectedReturnRate={state.setExpectedReturnRate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
