import { ArrowUpRight, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import type { ImpactResult } from "@/features/mortgage-tracking/api";

interface RateChangeAlertProps {
  impact: ImpactResult;
  newPrimeRate: number; // To display context
}

export function RateChangeAlert({ impact, newPrimeRate }: RateChangeAlertProps) {
  if (!impact) return null;

  const isPaymentIncrease = impact.impactType === "payment_increase";
  const isTriggerRisk = impact.impactType === "trigger_risk";

  return (
    <Card className="border-l-4 border-l-blue-600 shadow-md bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-background">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Info className="h-5 w-5 text-blue-600" />
            Prime Rate Impact Analysis
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
          >
            Effect of {newPrimeRate}% Prime
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          <Alert
            variant={isTriggerRisk ? "destructive" : "default"}
            className={isPaymentIncrease ? "border-blue-200 bg-white/50" : ""}
          >
            {isTriggerRisk ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <ArrowUpRight className="h-4 w-4 text-blue-600" />
            )}
            <AlertTitle className="mb-2 text-base">
              {isPaymentIncrease
                ? "Your Monthly Payment is Increasing"
                : "Trigger Rate Status Update"}
            </AlertTitle>
            <AlertDescription className="text-sm opacity-90">{impact.message}</AlertDescription>
          </Alert>

          {isPaymentIncrease && (
            <div className="grid grid-cols-2 gap-4 mt-1">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Old Payment
                </div>
                <div className="text-xl font-semibold opacity-70">
                  ${impact.oldValue.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                <div className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-medium">
                  New Payment
                </div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  ${impact.newValue.toFixed(2)}
                  <span className="ml-2 text-xs font-normal text-red-500">
                    (+${impact.delta.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-2">
            * This change is effective immediately. Please ensure your account has sufficient funds.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
