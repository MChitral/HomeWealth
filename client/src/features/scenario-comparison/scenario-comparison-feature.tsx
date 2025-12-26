import { useState } from "react";
import { PageHeader } from "@/shared/ui/page-header";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { useMortgageSelection } from "@/features/mortgage-tracking";
import { useScenarioComparison } from "./hooks";
import {
  ScenarioSelector,
  WinnerCard,
  ComparisonMetrics,
  EmptyState,
  ComparisonNoMortgageState,
  ScenarioComparisonSkeleton,
  TimeHorizonSelector,
  ComparisonTabs,
  MonteCarloResults,
  WhatIfRateAnalysis,
} from "./components";
import { MonteCarloSettings } from "@/features/scenario-management/components";
import type { MonteCarloResult } from "@/types/monte-carlo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function ScenarioComparisonFeature() {
  const { mortgages, isLoading: mortgagesLoading } = useMortgageSelection();
  const comparison = useScenarioComparison();
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null);

  usePageTitle("Scenario Comparison | Mortgage Strategy");

  if (comparison.isLoading || mortgagesLoading) {
    return <ScenarioComparisonSkeleton />;
  }

  // Product Logic: Mortgage must exist before scenarios can be created
  // Scenario comparison requires scenarios, which require mortgage data
  if (!mortgages || mortgages.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Scenario Comparison"
          description="Compare different financial strategies side-by-side"
        />
        <ComparisonNoMortgageState />
      </div>
    );
  }

  if (comparison.selectedScenarios.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Scenario Comparison"
          description="Compare different financial strategies side-by-side"
        />
        <EmptyState
          allScenarios={comparison.allScenarios}
          toggleScenario={comparison.toggleScenario}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scenario Comparison"
        description="Compare different financial strategies side-by-side"
        actions={
          <div className="flex items-center gap-3">
            <TimeHorizonSelector
              value={comparison.timeHorizon}
              onValueChange={comparison.setTimeHorizon}
            />
          </div>
        }
      />

      <ScenarioSelector
        allScenarios={comparison.allScenarios}
        selectedScenarios={comparison.selectedScenarios}
        toggleScenario={comparison.toggleScenario}
      />

      {comparison.winner && comparison.selectedScenarioData.length > 1 && (
        <WinnerCard
          winner={comparison.winner}
          timeHorizon={comparison.timeHorizon}
          getMetricForHorizon={comparison.getMetricForHorizon}
        />
      )}

      <ComparisonMetrics
        scenarios={comparison.selectedScenarioData}
        winner={comparison.winner}
        timeHorizon={comparison.timeHorizon}
        getMetricForHorizon={comparison.getMetricForHorizon}
      />

      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Scenario Comparison</TabsTrigger>
          <TabsTrigger value="monte-carlo">Monte Carlo Analysis</TabsTrigger>
          <TabsTrigger value="what-if">What-If Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="comparison" className="space-y-6">
          <ComparisonTabs
            scenarios={comparison.selectedScenarioData}
            chartData={comparison.chartData}
            timeHorizon={comparison.timeHorizon}
            getMetricForHorizon={comparison.getMetricForHorizon}
          />
        </TabsContent>
        <TabsContent value="monte-carlo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonteCarloSettings onResult={setMonteCarloResult} />
            {monteCarloResult && (
              <div className="lg:col-span-2">
                <MonteCarloResults result={monteCarloResult} />
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="what-if" className="space-y-6">
          <WhatIfRateAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
