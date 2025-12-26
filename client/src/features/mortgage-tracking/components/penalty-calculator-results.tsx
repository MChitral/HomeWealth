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
  const isIRD = results.method === "IRD" || results.method === "IRD (Posted Rate)" || results.method === "IRD (Discounted Rate)" || results.method === "IRD (Origination Comparison)";
  const isOpenMortgage = results.isOpenMortgage === true || results.method === "Open Mortgage";
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
              <Badge variant={isOpenMortgage ? "secondary" : isIRD ? "destructive" : "default"} className="text-xs">
                {results.method}
              </Badge>
            </div>
            <div className="mt-2">
              {isOpenMortgage ? (
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-xs text-green-900 dark:text-green-100">
                    <strong>Open Mortgage Detected:</strong> {results.note || "This is an open mortgage, so there is no penalty for early payment or refinancing."}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-900 dark:text-blue-100">
                    <strong>Note:</strong> Penalty calculations are estimates. Actual penalties may vary by lender and specific mortgage terms. Consult your lender for exact penalty amounts.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              ${results.totalPenalty.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Breakdown - Hide for open mortgages since penalty is always 0 */}
          {!isOpenMortgage && (
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
          )}

          {/* Info Alert - Skip for open mortgages */}
          {!isOpenMortgage && isIRD && savings > 0 && (
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

          {!isOpenMortgage && !isIRD && results.irdPenalty > 0 && (
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

          {!isOpenMortgage && results.irdPenalty === 0 && (
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

