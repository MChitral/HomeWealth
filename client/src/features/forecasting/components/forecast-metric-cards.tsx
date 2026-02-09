import { TrendingUp, Home, Scale } from "lucide-react";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import type { ScenarioWithMetrics } from "@/entities";

interface ForecastMetricCardsProps {
  selectedScenario: ScenarioWithMetrics;
  selectedHorizon: number;
  getMetricForHorizon: (
    scenario: ScenarioWithMetrics | undefined,
    metric: "netWorth" | "mortgageBalance" | "investments" | "investmentReturns"
  ) => number;
}

export function ForecastMetricCards({
  selectedScenario,
  selectedHorizon,
  getMetricForHorizon,
}: ForecastMetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        title={`Equity & Net Worth (${selectedHorizon}yr)`}
        value={`$${getMetricForHorizon(selectedScenario, "netWorth").toLocaleString()}`}
        subtitle="Home equity + savings"
        icon={TrendingUp}
        data-testid={`card-networth-${selectedHorizon}yr`}
      />
      <MetricCard
        title={`Remaining Mortgage (${selectedHorizon}yr)`}
        value={`$${getMetricForHorizon(selectedScenario, "mortgageBalance").toLocaleString()}`}
        subtitle="Outstanding balance"
        icon={Home}
        data-testid={`card-mortgage-${selectedHorizon}yr`}
      />
      <MetricCard
        title={`Prepay vs. Invest (${selectedHorizon}yr)`}
        value={`$${getMetricForHorizon(selectedScenario, "investments").toLocaleString()}`}
        subtitle="Surplus allocation outcome"
        icon={Scale}
        data-testid={`card-investments-${selectedHorizon}yr`}
      />
    </div>
  );
}
