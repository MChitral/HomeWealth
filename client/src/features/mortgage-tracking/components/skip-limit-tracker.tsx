import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { countSkippedPaymentsInYear } from "@server-shared/calculations/payment-skipping";
import type { MortgagePayment } from "@shared/schema";

interface SkipLimitTrackerProps {
  payments: MortgagePayment[];
  maxSkipsPerYear?: number;
  currentYear?: number;
}

/**
 * Component to display skip limit status and tracking
 */
export function SkipLimitTracker({
  payments,
  maxSkipsPerYear = 2,
  currentYear,
}: SkipLimitTrackerProps) {
  const year = currentYear || new Date().getFullYear();
  const skippedThisYear = countSkippedPaymentsInYear(payments, year);
  const skipsRemaining = maxSkipsPerYear - skippedThisYear;
  const skipProgress = (skippedThisYear / maxSkipsPerYear) * 100;
  const nextYear = year + 1;
  const resetDate = new Date(nextYear, 0, 1); // January 1st of next year

  const isAtLimit = skippedThisYear >= maxSkipsPerYear;
  const isNearLimit = skippedThisYear >= maxSkipsPerYear - 1 && skippedThisYear < maxSkipsPerYear;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          Payment Skip Limit
        </CardTitle>
        <CardDescription>Track your payment skip usage for {year}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Skips Used This Year</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {skippedThisYear} of {maxSkipsPerYear}
              </span>
              {isAtLimit ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Limit Reached
                </Badge>
              ) : isNearLimit ? (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-yellow-500 text-yellow-700 bg-yellow-50"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Near Limit
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-green-500 text-green-700 bg-green-50"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Available
                </Badge>
              )}
            </div>
          </div>
          <Progress value={skipProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {skipsRemaining > 0
              ? `${skipsRemaining} skip${skipsRemaining !== 1 ? "s" : ""} remaining this year`
              : "No skips remaining this year"}
          </p>
        </div>

        {isAtLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have reached your skip limit for {year}. The limit will reset on{" "}
              {resetDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              .
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have {skipsRemaining} skip{skipsRemaining !== 1 ? "s" : ""} remaining this year.
              Use them wisely.
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Reset Date:</strong>{" "}
            {resetDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Skip limits reset annually on January 1st.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
