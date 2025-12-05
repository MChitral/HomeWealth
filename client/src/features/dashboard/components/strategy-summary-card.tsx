import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { SummaryItem } from "./summary-item";
import type { ScenarioWithMetrics } from "@/entities";

interface StrategySummaryCardProps {
  selectedScenario: ScenarioWithMetrics;
  getMetricForHorizon: (
    scenario: ScenarioWithMetrics | undefined,
    metric: "netWorth" | "mortgageBalance" | "investments" | "investmentReturns",
  ) => number;
}

export function StrategySummaryCard({ selectedScenario, getMetricForHorizon }: StrategySummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Strategy Summary</CardTitle>
        <CardDescription>{selectedScenario.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SummaryItem
            label="Investments"
            value={`$${getMetricForHorizon(selectedScenario, "investments").toLocaleString()}`}
          />
          <SummaryItem
            label="Investment Returns"
            value={`$${getMetricForHorizon(selectedScenario, "investmentReturns").toLocaleString()}`}
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
                : "—"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

