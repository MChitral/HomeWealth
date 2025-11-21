import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Trophy, TrendingUp, CheckCircle2 } from "lucide-react";
import type { ScenarioWithProjections, TimeHorizon, MetricName } from "../types";

interface WinnerCardProps {
  winner: ScenarioWithProjections;
  timeHorizon: TimeHorizon;
  getMetricForHorizon: (metrics: any, metricName: MetricName) => number;
}

export function WinnerCard({ winner, timeHorizon, getMetricForHorizon }: WinnerCardProps) {
  return (
    <Card className="border-primary bg-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-md">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold mb-2">
              Best Strategy: {winner.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Highest net worth at {timeHorizon} years with optimal balance of growth and risk
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Net Worth</p>
                <p className="font-mono font-semibold text-xl text-primary">
                  ${getMetricForHorizon(winner.metrics, 'netWorth').toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mortgage Payoff</p>
                <p className="font-mono font-semibold text-xl">
                  {winner.metrics.mortgagePayoffYear} years
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                <p className="font-mono font-semibold text-xl">
                  ${winner.metrics.totalInterestPaid.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Investment Value</p>
                <p className="font-mono font-semibold text-xl text-green-600">
                  ${getMetricForHorizon(winner.metrics, 'investments').toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Best Overall
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Recommended
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
