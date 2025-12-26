import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { type PortabilityCalculationResult } from "../api";
import { Home, DollarSign, TrendingUp } from "lucide-react";

interface PortabilityResultsProps {
  results: PortabilityCalculationResult;
}

export function PortabilityResults({ results }: PortabilityResultsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600" />
            Portability Options
          </CardTitle>
          <CardDescription>Mortgage portability calculation results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Old Property Price</p>
              <p className="text-lg font-semibold">
                $
                {parseFloat(results.oldPropertyPrice.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">New Property Price</p>
              <p className="text-lg font-semibold">
                $
                {parseFloat(results.newPropertyPrice.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Portable Amount
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              $
              {parseFloat(results.portedAmount.toString()).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Maximum amount that can be ported to the new property
            </p>
          </div>

          {results.requiresTopUp && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Top-Up Required
                </p>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                $
                {parseFloat(results.topUpAmount.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Additional amount needed for the new property. This will be added to your mortgage
                at a blended rate.
              </p>
              {results.blendedRate && (
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                  Blended Rate: {(results.blendedRate * 100).toFixed(3)}%
                </p>
              )}
            </div>
          )}

          {!results.requiresTopUp && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-900 dark:text-green-100">
                ✓ No top-up required. The portable amount covers the new property purchase.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
