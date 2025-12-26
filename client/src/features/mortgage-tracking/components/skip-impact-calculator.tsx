import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Calculator, TrendingUp, AlertTriangle, DollarSign, Loader2 } from "lucide-react";
import { calculateSkipImpact } from "../api/mortgage-api";
import type { PaymentFrequency } from "@/shared/calculations/mortgage";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface SkipImpactCalculatorProps {
  currentBalance: number;
  currentAmortizationMonths: number;
  effectiveRate: number; // Annual rate as decimal
  paymentFrequency: PaymentFrequency;
}

/**
 * Standalone component to calculate and display skip payment impact
 * Allows "what-if" scenarios and comparisons
 */
export function SkipImpactCalculator({
  currentBalance,
  currentAmortizationMonths,
  effectiveRate,
  paymentFrequency,
}: SkipImpactCalculatorProps) {
  const [numberOfSkips, setNumberOfSkips] = useState(1);

  const calculateImpactMutation = useMutation({
    mutationFn: () =>
      calculateSkipImpact({
        currentBalance,
        annualRate: effectiveRate,
        paymentFrequency,
        currentAmortizationMonths,
        numberOfSkips,
      }),
  });

  const calculateImpact = () => {
    calculateImpactMutation.mutate();
  };

  const impact = calculateImpactMutation.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-indigo-500" />
          Skip Payment Impact Calculator
        </CardTitle>
        <CardDescription>Calculate the impact of skipping multiple payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="number-of-skips">Number of Payments to Skip</Label>
          <div className="flex gap-2">
            <Input
              id="number-of-skips"
              type="number"
              min="1"
              max="12"
              value={numberOfSkips}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (value >= 1 && value <= 12) {
                  setNumberOfSkips(value);
                  setImpact(null);
                }
              }}
            />
            <Button onClick={calculateImpact} disabled={calculateImpactMutation.isPending}>
              {calculateImpactMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate Impact"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the number of consecutive payments you want to skip (1-12)
          </p>
        </div>

        {calculateImpactMutation.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {calculateImpactMutation.error instanceof Error
                ? calculateImpactMutation.error.message
                : "Failed to calculate skip impact"}
            </AlertDescription>
          </Alert>
        )}

        {impact && (
          <div className="space-y-4">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Impact Summary:</strong> Skipping {numberOfSkips} payment
                {numberOfSkips !== 1 ? "s" : ""} will have the following impact:
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Total Interest Accrued</p>
                <p className="text-xl font-mono font-semibold text-orange-600">
                  $
                  {impact.totalInterestAccrued.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Balance Increase</p>
                <p className="text-xl font-mono font-semibold text-red-600">
                  +$
                  {impact.balanceIncrease.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Final Balance</p>
                <p className="text-xl font-mono font-semibold">
                  $
                  {impact.finalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Extended Amortization</p>
                <p className="text-xl font-mono font-semibold">
                  {Math.round((impact.extendedAmortizationMonths / 12) * 10) / 10} years
                  <span className="text-xs text-muted-foreground ml-1">
                    ({impact.extendedAmortizationMonths} months)
                  </span>
                </p>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Skipping {numberOfSkips} payment
                {numberOfSkips !== 1 ? "s" : ""} will increase your balance by{" "}
                <strong>
                  $
                  {impact.balanceIncrease.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
                . This interest will compound over time, increasing your total interest paid over
                the life of the mortgage.
              </AlertDescription>
            </Alert>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Current Balance: $
                    {currentBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    After skipping {numberOfSkips} payment{numberOfSkips !== 1 ? "s" : ""}, your
                    balance will be{" "}
                    <strong>
                      $
                      {impact.finalBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
