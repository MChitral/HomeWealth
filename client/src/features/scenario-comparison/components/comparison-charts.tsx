import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { ComparisonNetWorthChart } from "@/widgets/charts/comparison-net-worth-chart";
import { ComparisonLineChart } from "@/widgets/charts/comparison-line-chart";
import type { ScenarioWithProjections } from "../types";

interface ComparisonChartsProps {
  scenarios: ScenarioWithProjections[];
  chartData: {
    netWorth: any[];
    mortgage: any[];
    investment: any[];
  };
}

export function ComparisonCharts({ scenarios, chartData }: ComparisonChartsProps) {
  const scenarioMeta = scenarios.map(s => ({ id: s.id, name: s.name, color: s.color }));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Net Worth Over Time</CardTitle>
          <CardDescription>How your total net worth grows under each strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <ComparisonNetWorthChart 
            data={chartData.netWorth} 
            scenarios={scenarioMeta}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mortgage Balance</CardTitle>
            <CardDescription>How quickly each strategy pays down the mortgage</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonLineChart 
              data={chartData.mortgage} 
              scenarios={scenarioMeta}
              yAxisLabel="Mortgage Balance"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment Growth</CardTitle>
            <CardDescription>Investment portfolio value over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonLineChart 
              data={chartData.investment} 
              scenarios={scenarioMeta}
              yAxisLabel="Investment Value"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
