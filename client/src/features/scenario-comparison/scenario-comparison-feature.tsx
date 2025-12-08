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
} from "./components";

export function ScenarioComparisonFeature() {
  const { mortgages, isLoading: mortgagesLoading } = useMortgageSelection();
  const comparison = useScenarioComparison();

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

      <ComparisonTabs
        scenarios={comparison.selectedScenarioData}
        chartData={comparison.chartData}
        timeHorizon={comparison.timeHorizon}
        getMetricForHorizon={comparison.getMetricForHorizon}
      />
    </div>
  );
}
