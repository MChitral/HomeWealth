import { useState, useEffect } from "react";

import { PageHeader } from "@/shared/ui/page-header";
import { usePageTitle } from "@/shared/hooks/use-page-title";

import { useMortgageSelection } from "@/features/mortgage-tracking";
import { useMortgageData } from "@/features/mortgage-tracking/hooks";
import { useDashboardData, useDashboardCharts } from "@/features/dashboard/hooks";

import type { ScenarioWithMetrics } from "@/entities";

import { ProjectionsHeader } from "./components/projections-header";
import { ForecastMetricCards } from "./components/forecast-metric-cards";
import { MortgagePaydownCard } from "./components/mortgage-paydown-card";
import { EquityForecastCard } from "./components/equity-forecast-card";
import { PrepayVsInvestCard } from "./components/prepay-vs-invest-card";
import { StrategyOutcomeCard } from "./components/strategy-outcome-card";
import { ForecastingSkeleton } from "./components/forecasting-skeleton";
import { ForecastingEmptyState } from "./components/forecasting-empty-state";

const HORIZONS = [10, 20, 30] as const;
type Horizon = (typeof HORIZONS)[number];

export function ForecastingFeature() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<Horizon>(10);

  usePageTitle("Forecasting | Mortgage Strategy");

  const { selectedMortgageId, selectedMortgage } = useMortgageSelection();
  const { scenarios, isLoading } = useDashboardData();
  const {
    mortgage: detailedMortgage,
    terms,
    isLoading: mortgageDataLoading,
  } = useMortgageData(selectedMortgageId);

  const activeMortgage = detailedMortgage ?? selectedMortgage ?? null;

  useEffect(() => {
    if (scenarios && scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].id);
    }
  }, [scenarios, selectedScenarioId]);

  const selectedScenario = scenarios?.find((s) => s.id === selectedScenarioId);

  const getMetricForHorizon = (
    scenario: ScenarioWithMetrics | undefined,
    metric: "netWorth" | "mortgageBalance" | "investments" | "investmentReturns"
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
    return <ForecastingSkeleton />;
  }

  const showEmptyState = !scenarios || scenarios.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecasting"
        description="Long-term mortgage paydown and wealth projections based on your scenarios"
      />

      <ProjectionsHeader
        selectedHorizon={selectedHorizon}
        setSelectedHorizon={setSelectedHorizon}
        selectedScenarioId={selectedScenarioId}
        setSelectedScenarioId={setSelectedScenarioId}
        scenarios={scenarios || []}
      />

      {showEmptyState ? (
        <ForecastingEmptyState />
      ) : (
        selectedScenario?.metrics && (
          <>
            <ForecastMetricCards
              selectedScenario={selectedScenario}
              selectedHorizon={selectedHorizon}
              getMetricForHorizon={getMetricForHorizon}
            />

            <MortgagePaydownCard
              selectedScenario={selectedScenario}
              mortgageChartData={mortgageChartData}
            />

            <EquityForecastCard
              selectedScenario={selectedScenario}
              netWorthChartData={netWorthChartData}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PrepayVsInvestCard investmentChartData={investmentChartData} />
              <StrategyOutcomeCard
                selectedScenario={selectedScenario}
                getMetricForHorizon={getMetricForHorizon}
              />
            </div>
          </>
        )
      )}
    </div>
  );
}
