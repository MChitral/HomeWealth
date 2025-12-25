import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Info, CheckCircle2, AlertTriangle } from "lucide-react";
import type { CalculatePenaltyResponse } from "../api";

interface PenaltyCalculatorResultsProps {
  results: CalculatePenaltyResponse;
}

export function PenaltyCalculatorResults({ results }: PenaltyCalculatorResultsProps) {
  const isIRD = results.method === "IRD";
  const savings = results.threeMonthPenalty - results.irdPenalty;

  return (
    <div className="space-y-4">
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Penalty Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Penalty */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border-2 border-indigo-200 dark:border-indigo-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Penalty</span>
              <Badge variant={isIRD ? "destructive" : "default"} className="text-xs">
                {results.method}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              ${results.totalPenalty.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">3-Month Interest</div>
              <div className="text-lg font-semibold">
                ${results.threeMonthPenalty.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">IRD Penalty</div>
              <div className="text-lg font-semibold">
                ${results.irdPenalty.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          {/* Info Alert */}
          {isIRD && savings > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                IRD penalty applies because it's higher than 3-month interest. You would save{" "}
                <strong>
                  ${Math.abs(savings).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>{" "}
                if 3-month interest applied instead.
              </AlertDescription>
            </Alert>
          )}

          {!isIRD && results.irdPenalty > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                3-month interest applies (the greater of the two). IRD would be{" "}
                <strong>
                  ${results.irdPenalty.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
                .
              </AlertDescription>
            </Alert>
          )}

          {results.irdPenalty === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                IRD is $0 because the market rate is higher than or equal to your current rate.
                Only 3-month interest applies.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

