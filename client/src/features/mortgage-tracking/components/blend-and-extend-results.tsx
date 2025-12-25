import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Info, TrendingDown, DollarSign } from "lucide-react";
import type { BlendAndExtendResponse } from "../api";

interface BlendAndExtendResultsProps {
  results: BlendAndExtendResponse;
  currentPayment?: number;
}

export function BlendAndExtendResults({ results, currentPayment }: BlendAndExtendResultsProps) {
  const paymentReduction = currentPayment
    ? currentPayment - results.newPaymentAmount
    : results.oldRatePaymentAmount - results.newPaymentAmount;

  return (
    <div className="space-y-4">
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            Blend-and-Extend Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Blended Rate */}
          <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-4 border-2 border-indigo-200 dark:border-indigo-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Blended Rate</span>
              <Badge variant="default" className="text-xs">
                {results.blendedRatePercent}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {results.blendedRatePercent}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Weighted average of your current rate and new market rate
            </p>
          </div>

          {/* Payment Comparison */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Current Payment</div>
              <div className="text-lg font-semibold">
                ${results.oldRatePaymentAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Blend-and-Extend</div>
              <div className="text-lg font-semibold text-green-600">
                ${results.newPaymentAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Market Rate</div>
              <div className="text-lg font-semibold">
                ${results.marketRatePaymentAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          {/* Savings */}
          {paymentReduction > 0 && (
            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <DollarSign className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <strong>Payment Reduction:</strong> ${paymentReduction.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} per payment
              </AlertDescription>
            </Alert>
          )}

          {results.interestSavingsPerPayment > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You save <strong>${results.interestSavingsPerPayment.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</strong> per payment compared to market rate renewal.
              </AlertDescription>
            </Alert>
          )}

          {/* Extended Amortization Info */}
          <div className="text-xs text-muted-foreground">
            Extended amortization: {Math.round(results.extendedAmortizationMonths / 12)} years
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

