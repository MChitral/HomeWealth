import { Link, useParams, useLocation } from "wouter";
import { useState } from "react";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { Card, CardContent } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Info } from "lucide-react";
import type { PaymentFrequency } from "@/features/mortgage-tracking/utils/mortgage-math";
import { useScenarioDetail, useScenarioEditorState, useScenarioEditorCalculations, useScenarioEditorProjections } from "./hooks";
import { useMortgageData } from "@/features/mortgage-tracking/hooks";
import { useCashFlowData } from "@/features/cash-flow/hooks";
import {
  ScenarioEditorSkeleton,
  ScenarioEditorHeader,
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

  // Fetch real mortgage data from the database
  const { mortgage, terms, payments, isLoading: mortgageLoading } = useMortgageData();
  const { cashFlow } = useCashFlowData();

  const pageTitle = isNewScenario ? "New Scenario | Mortgage Strategy" : "Edit Scenario | Mortgage Strategy";
  usePageTitle(pageTitle);

  const scenarioPaymentFrequency: PaymentFrequency = "monthly";

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
  });

  // Initialize form when editing existing scenario
  useEffect(() => {
    if (scenario && !isNewScenario) {
      setName(scenario.name);
      setDescription(scenario.description || "");
      setPrepaymentSplit([scenario.prepaymentMonthlyPercent]);
      setExpectedReturnRate(parseFloat(scenario.expectedReturnRate));
      setEfPriorityPercent(scenario.efPriorityPercent);
    }
  }, [scenario, isNewScenario]);

  // Load prepayment events
  useEffect(() => {
    if (fetchedEvents) {
      setPrepaymentEvents(fetchedEvents.map(toDraftEvent));
    }
  }, [fetchedEvents]);

  // Show loading skeleton when editing existing scenario or loading mortgage data
  if ((detailLoading && !isNewScenario) || mortgageLoading) {
    return <ScenarioEditorSkeleton />;
  }

  return (
    <div className="space-y-6">
      <ScenarioEditorHeader
        isNewScenario={isNewScenario}
        onSave={state.handleSave}
        isSaving={state.saveMutation.isPending}
      />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your current mortgage data is pre-loaded from Mortgage History. Projections start from today's position.
        </AlertDescription>
      </Alert>

      <ScenarioBasicInfoForm
        name={state.name}
        setName={state.setName}
        description={state.description}
        setDescription={state.setDescription}
      />

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-medium">Note:</span> Income and expenses are configured in the{" "}
            <Link href="/cash-flow" className="text-primary hover:underline">
              Cash Flow page
            </Link>{" "}
            and apply to all scenarios. Here you only configure what differs between strategies.
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
            eventType={state.eventType}
            setEventType={state.setEventType}
            eventAmount={state.eventAmount}
            setEventAmount={state.setEventAmount}
            eventDescription={state.eventDescription}
            setEventDescription={state.setEventDescription}
            recurrenceMonth={state.recurrenceMonth}
            setRecurrenceMonth={state.setRecurrenceMonth}
            oneTimeYear={state.oneTimeYear}
            setOneTimeYear={state.setOneTimeYear}
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
