import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { SummaryItem } from "@/features/dashboard/components/summary-item";
import type { ScenarioWithMetrics } from "@/entities";

interface StrategyOutcomeCardProps {
  selectedScenario: ScenarioWithMetrics;
  getMetricForHorizon: (
    scenario: ScenarioWithMetrics | undefined,
    metric: "netWorth" | "mortgageBalance" | "investments" | "investmentReturns"
  ) => number;
}

export function StrategyOutcomeCard({
  selectedScenario,
  getMetricForHorizon,
}: StrategyOutcomeCardProps) {
  const interestSaved = getMetricForHorizon(selectedScenario, "investmentReturns");
  const equityBuilt = getMetricForHorizon(selectedScenario, "netWorth") -
    getMetricForHorizon(selectedScenario, "investments");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Strategy Outcome</CardTitle>
        <CardDescription>{selectedScenario.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SummaryItem
            label="Equity Built"
            value={`$${equityBuilt.toLocaleString()}`}
          />
          <SummaryItem
            label="Interest Saved / Returns"
            value={`$${interestSaved.toLocaleString()}`}
          />
          <SummaryItem
            label="Net Worth"
            value={`$${getMetricForHorizon(selectedScenario, "netWorth").toLocaleString()}`}
          />
          <SummaryItem
            label="Emergency Fund Coverage"
            value={
              selectedScenario.metrics?.emergencyFundYears != null
                ? `${selectedScenario.metrics.emergencyFundYears.toFixed(1)} months`
                : "\u2014"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
