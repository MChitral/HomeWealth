import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { type FrequencyChangeResult } from "../api";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";

interface FrequencyChangeResultsProps {
  results: FrequencyChangeResult;
}

const frequencyLabels: Record<string, string> = {
  monthly: "Monthly",
  "semi-monthly": "Semi-Monthly",
  biweekly: "Bi-weekly",
  "accelerated-biweekly": "Accelerated Bi-weekly",
  weekly: "Weekly",
  "accelerated-weekly": "Accelerated Weekly",
};

export function FrequencyChangeResults({ results }: FrequencyChangeResultsProps) {
  const paymentChangePercent =
    results.oldPaymentAmount > 0
      ? ((results.paymentDifference / results.oldPaymentAmount) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Frequency Change Impact
          </CardTitle>
          <CardDescription>Your new payment amount and impact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Previous Payment</p>
              <p className="text-2xl font-bold">
                $
                {parseFloat(results.oldPaymentAmount.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {frequencyLabels[results.oldFrequency] || results.oldFrequency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">New Payment</p>
              <p className="text-2xl font-bold text-blue-600">
                $
                {parseFloat(results.newPaymentAmount.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {frequencyLabels[results.newFrequency] || results.newFrequency}
              </p>
            </div>
          </div>

          <div
            className={`rounded-lg p-4 border ${
              results.paymentDifference > 0
                ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign
                className={`h-4 w-4 ${
                  results.paymentDifference > 0 ? "text-blue-600" : "text-green-600"
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  results.paymentDifference > 0
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-green-900 dark:text-green-100"
                }`}
              >
                Payment {results.paymentDifference > 0 ? "Increase" : "Decrease"}
              </p>
            </div>
            <p
              className={`text-2xl font-bold ${
                results.paymentDifference > 0 ? "text-blue-600" : "text-green-600"
              }`}
            >
              {results.paymentDifference > 0 ? "+" : ""}$
              {parseFloat(Math.abs(results.paymentDifference).toString()).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}{" "}
              <span
                className={`text-sm font-normal ${
                  results.paymentDifference > 0
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-green-700 dark:text-green-300"
                }`}
              >
                ({Math.abs(parseFloat(paymentChangePercent))}%)
              </span>
            </p>
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
