import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import type { ScenarioWithProjections, TimeHorizon, MetricName } from "../types";

interface ComparisonTableProps {
  scenarios: ScenarioWithProjections[];
  timeHorizon: TimeHorizon;
  getMetricForHorizon: (metrics: any, metricName: MetricName) => number;
}

export function ComparisonTable({ scenarios, timeHorizon, getMetricForHorizon }: ComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Metric Comparison</CardTitle>
        <CardDescription>All key financial metrics at {timeHorizon} years</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Metric</th>
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
                    ${getMetricForHorizon(scenario.metrics, 'netWorth').toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover-elevate">
                <td className="py-3 px-4 text-sm font-medium">Mortgage Balance ({timeHorizon} years)</td>
                {scenarios.map((scenario) => (
                  <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                    ${getMetricForHorizon(scenario.metrics, 'mortgageBalance').toLocaleString()}
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
                  <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm text-orange-600">
                    ${scenario.metrics.totalInterestPaid.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover-elevate">
                <td className="py-3 px-4 text-sm font-medium">Investment Portfolio ({timeHorizon} years)</td>
                {scenarios.map((scenario) => (
                  <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                    ${getMetricForHorizon(scenario.metrics, 'investments').toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover-elevate">
                <td className="py-3 px-4 text-sm font-medium">Investment Returns Earned</td>
                {scenarios.map((scenario) => (
                  <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm text-green-600">
                    +${getMetricForHorizon(scenario.metrics, 'investmentReturns').toLocaleString()}
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
