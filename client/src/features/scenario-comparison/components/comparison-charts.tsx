import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ComparisonNetWorthChart } from "@/widgets/charts/comparison-net-worth-chart";
import { ComparisonLineChart } from "@/widgets/charts/comparison-line-chart";
import { exportToCSV, exportToJSON } from "../utils/export";
import type { ScenarioWithProjections, TimeHorizon, MetricName } from "../types";

interface ComparisonChartsProps {
  scenarios: ScenarioWithProjections[];
  chartData: {
    netWorth: any[];
    mortgage: any[];
    investment: any[];
  };
  timeHorizon: TimeHorizon;
  getMetricForHorizon: (metrics: any, metricName: MetricName) => number;
}

export function ComparisonCharts({
  scenarios,
  chartData,
  timeHorizon,
  getMetricForHorizon,
}: ComparisonChartsProps) {
  const scenarioMeta = scenarios.map((s) => ({ id: s.id, name: s.name, color: s.color }));

  const handleExport = (format: "csv" | "json") => {
    if (format === "csv") {
      exportToCSV({ scenarios, timeHorizon, getMetricForHorizon, chartData });
    } else {
      exportToJSON({ scenarios, timeHorizon, getMetricForHorizon, chartData });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Net Worth Over Time</CardTitle>
              <CardDescription>How your total net worth grows under each strategy</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <ComparisonNetWorthChart data={chartData.netWorth} scenarios={scenarioMeta} />
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
