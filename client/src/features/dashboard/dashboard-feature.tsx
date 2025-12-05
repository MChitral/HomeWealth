import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { Separator } from "@/shared/ui/separator";
import { useMortgageSelection } from "@/shared/contexts/mortgage-selection-context";
import { MortgageSelector } from "@/features/mortgage-tracking/components/mortgage-selector";
import { useDashboardData, useDashboardCalculations, useDashboardCharts } from "./hooks";
import { useMortgageData } from "@/features/mortgage-tracking/hooks";
import type { PaymentFrequency } from "@/features/mortgage-tracking/utils/mortgage-math";
import type { ScenarioWithMetrics } from "@/entities";
import {
  DashboardSkeleton,
  DashboardEmptyState,
  CurrentFinancialStatusCard,
  ProjectionsHeader,
  ScenarioMetricsCards,
  MortgageDetailsCard,
  NetWorthProjectionCard,
  InvestmentGrowthCard,
  StrategySummaryCard,
} from "./components";

const HORIZONS = [10, 20, 30] as const;
type Horizon = (typeof HORIZONS)[number];

export function DashboardFeature() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<Horizon>(10);

  usePageTitle("Dashboard | Mortgage Strategy");

  const { selectedMortgageId, setSelectedMortgageId, mortgages, selectedMortgage } = useMortgageSelection();
  const { scenarios, emergencyFund, cashFlow, isLoading } = useDashboardData();
  const {
    mortgage: detailedMortgage,
    terms,
    payments,
    isLoading: mortgageDataLoading,
  } = useMortgageData(selectedMortgageId);
  const activeMortgage = detailedMortgage ?? selectedMortgage ?? null;
  const dashboardPaymentFrequency: PaymentFrequency = "monthly";

  const newScenarioAction = (
    <Link href="/scenarios/new">
      <Button data-testid="button-new-scenario">
        <Plus className="h-4 w-4 mr-2" />
        New Scenario
      </Button>
    </Link>
  );

  useEffect(() => {
    if (scenarios && scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].id);
    }
  }, [scenarios, selectedScenarioId]);

  const sortedTerms = useMemo(() => {
    if (!terms?.length) return [];
    return [...terms].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [terms]);
  const latestTerm = sortedTerms[0] || null;

  const sortedPayments = useMemo(() => {
    if (!payments?.length) return [];
    return [...payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments]);
  const latestPayment = sortedPayments[0] || null;

  const {
    homeValue,
    mortgageBalance,
    originalMortgageBalance,
    efBalance,
    efTargetAmount,
    paymentPreview,
  } = useDashboardCalculations({
    activeMortgage,
    latestTerm,
    latestPayment,
    emergencyFund: emergencyFund ?? null,
    cashFlow: cashFlow ?? null,
    paymentFrequency: dashboardPaymentFrequency,
  });

  const selectedScenario = scenarios?.find((s) => s.id === selectedScenarioId);
  const getMetricForHorizon = (
    scenario: ScenarioWithMetrics | undefined,
    metric: "netWorth" | "mortgageBalance" | "investments" | "investmentReturns",
  ) => {
    if (!scenario?.metrics) return 0;
    const key = `${metric}${selectedHorizon}yr` as keyof ScenarioWithMetrics["metrics"];
    return Number(scenario.metrics[key] || 0);
  };

  const { netWorthChartData, mortgageChartData, investmentChartData } = useDashboardCharts({
    activeMortgage,
    netWorthProjections: selectedScenario?.metrics?.netWorthProjections,
    mortgageBalanceProjections: selectedScenario?.metrics?.mortgageBalanceProjections,
    investmentProjections: selectedScenario?.metrics?.investmentProjections,
  });

  if (isLoading || mortgageDataLoading) {
    return <DashboardSkeleton />;
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Your financial overview and projections"
          actions={newScenarioAction}
        />
        <DashboardEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Your financial overview and projections" actions={newScenarioAction} />

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

      <CurrentFinancialStatusCard
        homeValue={homeValue}
        mortgageBalance={mortgageBalance}
        originalMortgageBalance={originalMortgageBalance}
        efBalance={efBalance}
        efTargetAmount={efTargetAmount}
        activeMortgage={activeMortgage}
        paymentPreview={paymentPreview}
      />

      <Separator />

      <ProjectionsHeader
        selectedHorizon={selectedHorizon}
        setSelectedHorizon={setSelectedHorizon}
        selectedScenarioId={selectedScenarioId}
        setSelectedScenarioId={setSelectedScenarioId}
        scenarios={scenarios}
      />

      {selectedScenario?.metrics && (
        <>
          <ScenarioMetricsCards
            selectedScenario={selectedScenario}
            selectedHorizon={selectedHorizon}
            getMetricForHorizon={getMetricForHorizon}
          />

          <MortgageDetailsCard selectedScenario={selectedScenario} mortgageChartData={mortgageChartData} />

          <NetWorthProjectionCard
            selectedScenario={selectedScenario}
            netWorthChartData={netWorthChartData}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InvestmentGrowthCard investmentChartData={investmentChartData} />
            <StrategySummaryCard selectedScenario={selectedScenario} getMetricForHorizon={getMetricForHorizon} />
          </div>
        </>
      )}
    </div>
  );
}

