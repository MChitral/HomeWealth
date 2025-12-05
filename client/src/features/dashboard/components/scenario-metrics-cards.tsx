import { TrendingUp, Home, Wallet } from "lucide-react";
import { MetricCard } from "./metric-card";
import type { ScenarioWithMetrics } from "@/entities";

interface ScenarioMetricsCardsProps {
  selectedScenario: ScenarioWithMetrics;
  selectedHorizon: number;
  getMetricForHorizon: (
    scenario: ScenarioWithMetrics | undefined,
    metric: "netWorth" | "mortgageBalance" | "investments" | "investmentReturns",
  ) => number;
}

export function ScenarioMetricsCards({
  selectedScenario,
  selectedHorizon,
  getMetricForHorizon,
}: ScenarioMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        title={`Net Worth (${selectedHorizon}yr)`}
        value={`$${getMetricForHorizon(selectedScenario, "netWorth").toLocaleString()}`}
        subtitle="Projected total"
        icon={TrendingUp}
        data-testid={`card-networth-${selectedHorizon}yr`}
      />
      <MetricCard
        title={`Mortgage (${selectedHorizon}yr)`}
        value={`$${getMetricForHorizon(selectedScenario, "mortgageBalance").toLocaleString()}`}
        subtitle="Remaining balance"
        icon={Home}
        data-testid={`card-mortgage-${selectedHorizon}yr`}
      />
      <MetricCard
        title={`Investments (${selectedHorizon}yr)`}
        value={`$${getMetricForHorizon(selectedScenario, "investments").toLocaleString()}`}
        subtitle="Portfolio value"
        icon={Wallet}
        data-testid={`card-investments-${selectedHorizon}yr`}
      />
    </div>
  );
}

