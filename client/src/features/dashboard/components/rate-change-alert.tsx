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
    <Card className="bg-accent/30 dark:bg-accent/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Prime Rate Impact Analysis
          </CardTitle>
          <Badge
            variant="secondary"
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
              <ArrowUpRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
              <div className="p-3 bg-muted/50 rounded-md border">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Old Payment
                </div>
                <div className="text-xl font-semibold opacity-70">
                  ${impact.oldValue.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-accent/50 rounded-md border">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  New Payment
                </div>
                <div className="text-xl font-bold">
                  ${impact.newValue.toFixed(2)}
                  <span className="ml-2 text-xs font-normal text-destructive">
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
