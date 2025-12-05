import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { MortgageBalanceChart } from "@/widgets/charts/mortgage-balance-chart";
import { CurrentStatusStat } from "./current-status-stat";
import type { ScenarioWithMetrics } from "@/entities";

interface MortgageDetailsCardProps {
  selectedScenario: ScenarioWithMetrics;
  mortgageChartData: Array<{
    year: number;
    balance: number;
    principal: number;
    interest: number;
  }>;
}

export function MortgageDetailsCard({ selectedScenario, mortgageChartData }: MortgageDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Mortgage Details - {selectedScenario.name}</CardTitle>
        <p className="text-sm text-muted-foreground">Projected mortgage journey</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <CurrentStatusStat
            label="Projected Payoff"
            value={`${selectedScenario.metrics.mortgagePayoffYear.toFixed(1)} years`}
            testId="text-payoff-year"
          />
          <CurrentStatusStat
            label="Total Interest"
            value={`$${selectedScenario.metrics.totalInterestPaid.toLocaleString()}`}
            testId="text-total-interest"
          />
          <CurrentStatusStat
            label="Avg Monthly Surplus"
            value={`$${selectedScenario.metrics.avgMonthlySurplus.toLocaleString()}`}
            testId="text-avg-surplus"
          />
        </div>
        <div className="relative">
          <MortgageBalanceChart data={mortgageChartData} />
          <div className="absolute top-4 left-4 bg-card/90 border border-border rounded-md px-3 py-2">
            <p className="text-xs text-muted-foreground">← You are here (Year 0)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

