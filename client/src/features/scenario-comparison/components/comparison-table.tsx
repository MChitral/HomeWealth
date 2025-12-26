import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { exportToCSV, exportToJSON } from "../utils/export";
import type { ScenarioWithProjections, TimeHorizon, MetricName } from "../types";

interface ComparisonTableProps {
  scenarios: ScenarioWithProjections[];
  timeHorizon: TimeHorizon;
  getMetricForHorizon: (metrics: any, metricName: MetricName) => number;
  chartData: {
    netWorth: any[];
    mortgage: any[];
    investment: any[];
  };
}

export function ComparisonTable({
  scenarios,
  timeHorizon,
  getMetricForHorizon,
  chartData,
}: ComparisonTableProps) {
  const handleExport = (format: "csv" | "json") => {
    if (format === "csv") {
      exportToCSV({ scenarios, timeHorizon, getMetricForHorizon, chartData });
    } else {
      exportToJSON({ scenarios, timeHorizon, getMetricForHorizon, chartData });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Complete Metric Comparison</CardTitle>
            <CardDescription>All key financial metrics at {timeHorizon} years</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Metric
                </th>
                {scenarios.map((scenario) => (
                  <th key={scenario.id} className="text-right py-3 px-4 text-sm font-medium">
                    {scenario.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover-elevate">
                <td className="py-3 px-4 text-sm font-medium">Net Worth ({timeHorizon} years)</td>
                {scenarios.map((scenario) => (
                  <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                    ${getMetricForHorizon(scenario.metrics, "netWorth").toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover-elevate">
                <td className="py-3 px-4 text-sm font-medium">
                  Mortgage Balance ({timeHorizon} years)
                </td>
                {scenarios.map((scenario) => (
                  <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                    ${getMetricForHorizon(scenario.metrics, "mortgageBalance").toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover-elevate">
                <td className="py-3 px-4 text-sm font-medium">Years to Mortgage Freedom</td>
                {scenarios.map((scenario) => (
                  <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                    {scenario.metrics.mortgagePayoffYear} years
                  </td>
                ))}
              </tr>
              <tr className="hover-elevate">
                <td className="py-3 px-4 text-sm font-medium">Total Interest Paid</td>
                {scenarios.map((scenario) => (
                  <td
                    key={scenario.id}
                    className="text-right py-3 px-4 font-mono text-sm text-orange-600"
                  >
                    ${scenario.metrics.totalInterestPaid.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover-elevate">
                <td className="py-3 px-4 text-sm font-medium">
                  Investment Portfolio ({timeHorizon} years)
                </td>
                {scenarios.map((scenario) => (
                  <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                    ${getMetricForHorizon(scenario.metrics, "investments").toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover-elevate">
                <td className="py-3 px-4 text-sm font-medium">Investment Returns Earned</td>
                {scenarios.map((scenario) => (
                  <td
                    key={scenario.id}
                    className="text-right py-3 px-4 font-mono text-sm text-green-600"
                  >
                    +${getMetricForHorizon(scenario.metrics, "investmentReturns").toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover-elevate">
                <td className="py-3 px-4 text-sm font-medium">Emergency Fund Filled By</td>
                {scenarios.map((scenario) => (
                  <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                    Year {scenario.metrics.emergencyFundFilledByYear}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
