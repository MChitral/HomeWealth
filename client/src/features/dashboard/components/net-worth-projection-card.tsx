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
        {netWorthChartData.length > 0 ? (
          <NetWorthChart data={netWorthChartData} />
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            No projection data available for this scenario.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
