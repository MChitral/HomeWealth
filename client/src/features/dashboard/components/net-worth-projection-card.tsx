import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { NetWorthChart } from "@/widgets/charts/net-worth-chart";
import type { ScenarioWithMetrics } from "@/entities";

interface NetWorthProjectionCardProps {
  selectedScenario: ScenarioWithMetrics;
  netWorthChartData: Array<{ year: number; netWorth: number }>;
}

export function NetWorthProjectionCard({
  selectedScenario,
  netWorthChartData,
}: NetWorthProjectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Net Worth Projection</CardTitle>
        <CardDescription>
          Based on <span className="font-medium">{selectedScenario.name}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NetWorthChart data={netWorthChartData} />
      </CardContent>
    </Card>
  );
}

