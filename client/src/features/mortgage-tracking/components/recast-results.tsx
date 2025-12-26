import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { type RecastCalculationResult } from "../api";
import { TrendingDown, DollarSign, Calendar } from "lucide-react";

interface RecastResultsProps {
  results: RecastCalculationResult;
}

export function RecastResults({ results }: RecastResultsProps) {
  const paymentReductionPercent =
    results.previousPaymentAmount > 0
      ? ((results.paymentReduction / results.previousPaymentAmount) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            Recast Impact
          </CardTitle>
          <CardDescription>Your new payment amount and savings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Previous Payment</p>
              <p className="text-2xl font-bold">
                ${parseFloat(results.previousPaymentAmount.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">New Payment</p>
              <p className="text-2xl font-bold text-green-600">
                ${parseFloat(results.newPaymentAmount.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Payment Reduction
              </p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${parseFloat(results.paymentReduction.toString()).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-sm font-normal text-green-700 dark:text-green-300">
                ({paymentReductionPercent}% less)
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Previous Balance</p>
              <p className="text-lg font-semibold">
                ${parseFloat(results.previousBalance.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">New Balance</p>
              <p className="text-lg font-semibold">
                ${parseFloat(results.newBalance.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Remaining Amortization</p>
              <p className="text-lg font-semibold">
                {Math.floor(results.remainingAmortizationMonths / 12)} years{" "}
                {results.remainingAmortizationMonths % 12} months
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

