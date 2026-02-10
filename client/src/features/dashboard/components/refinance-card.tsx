import { ArrowDownRight, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { RefinanceAnalysisResponse } from "@/features/mortgage-tracking/api";

interface RefinanceScenarioCardProps {
  analysis: RefinanceAnalysisResponse;
}

export function RefinanceScenarioCard({ analysis }: RefinanceScenarioCardProps) {
  if (!analysis) return null;

  // Only show if there's a potential benefit or market rates are significantly lower
  // If user has a great rate, we might want to hide this or show a "You have a great rate!" state.
  // For MVP, we show it always to demonstrate the feature, but style it differently.

  const isBeneficial = analysis.isBeneficial;

  return (
    <Card className="relative overflow-visible">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
            Refinance Opportunity
          </CardTitle>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${
              isBeneficial
                ? "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                : ""
            }`}
          >
            {isBeneficial ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> Save Money
              </>
            ) : (
              "Keep Current Rate"
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Rate Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Current Rate
              </div>
              <div className="text-lg font-bold">
                {analysis.currentRate.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                Market ({analysis.marketRateType})
                {analysis.marketRate < analysis.currentRate && (
                  <ArrowDownRight className="h-3 w-3 text-emerald-500" />
                )}
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {analysis.marketRate.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Analysis Result */}
          {isBeneficial ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-100 dark:border-green-800">
                <div>
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    Monthly Savings
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    After switching
                  </div>
                </div>
                <div className="text-xl font-bold text-green-700 dark:text-green-300">
                  +${analysis.monthlySavings.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Break-even Point:</span>
                <span className="font-medium">
                  {analysis.breakEvenMonths.toFixed(1)} months
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Cost to Break:</span>
                <span className="font-medium text-red-600/80">
                  -$
                  {(analysis.penalty + (analysis.closingCosts || 0)).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              {analysis.closingCosts > 0 && (
                <div className="text-xs text-muted-foreground pt-1">
                  (Penalty: $
                  {analysis.penalty.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  + Closing: $
                  {analysis.closingCosts.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                  )
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                Refinancing now would cost{" "}
                <strong>
                  $
                  {Math.abs(analysis.totalTermSavings).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </strong>{" "}
                more than staying put due to penalties.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
