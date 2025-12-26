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
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden border-t-4 border-t-emerald-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <TrendingDown className="h-5 w-5 text-emerald-500" />
            Refinance Opportunity
          </CardTitle>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${
              isBeneficial
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-slate-500 bg-slate-50 border-slate-200"
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
              <div className="text-lg font-bold text-slate-700 dark:text-slate-200">
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

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Analysis Result */}
          {isBeneficial ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/20">
                <div>
                  <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    Monthly Savings
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    After switching
                  </div>
                </div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  +${analysis.monthlySavings.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Break-even Point:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
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
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
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
