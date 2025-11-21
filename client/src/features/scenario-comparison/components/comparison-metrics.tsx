import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Trophy, Home, DollarSign, TrendingUp, PiggyBank } from "lucide-react";
import type { ScenarioWithProjections, TimeHorizon, MetricName } from "../types";

interface ComparisonMetricsProps {
  scenarios: ScenarioWithProjections[];
  winner: ScenarioWithProjections | null;
  timeHorizon: TimeHorizon;
  getMetricForHorizon: (metrics: any, metricName: MetricName) => number;
}

export function ComparisonMetrics({ scenarios, winner, timeHorizon, getMetricForHorizon }: ComparisonMetricsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {scenarios.map((scenario) => {
        const isWinner = winner && scenario.id === winner.id;
        return (
          <Card key={scenario.id} className={isWinner ? "border-primary" : ""}>
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">{scenario.description}</CardDescription>
                </div>
                {isWinner && (
                  <Badge variant="default" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    Winner
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Net Worth ({timeHorizon}yr)</p>
                <p className="text-3xl font-bold font-mono">${getMetricForHorizon(scenario.metrics, 'netWorth').toLocaleString()}</p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      Mortgage Payoff
                    </span>
                    <span className="text-sm font-mono font-medium">{scenario.metrics.mortgagePayoffYear} yrs</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Total Interest
                    </span>
                    <span className="text-sm font-mono font-medium">${scenario.metrics.totalInterestPaid.toLocaleString()}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Investments ({timeHorizon}yr)
                    </span>
                    <span className="text-sm font-mono font-medium">${getMetricForHorizon(scenario.metrics, 'investments').toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <PiggyBank className="h-3 w-3" />
                      Investment Returns
                    </span>
                    <span className="text-sm font-mono font-medium text-green-600">+${getMetricForHorizon(scenario.metrics, 'investmentReturns').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
