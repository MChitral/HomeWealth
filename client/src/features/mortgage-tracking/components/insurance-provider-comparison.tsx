import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { TrendingDown, CheckCircle2 } from "lucide-react";
import type { InsuranceProviderComparison } from "../api/insurance-api";

interface InsuranceProviderComparisonProps {
  comparison: InsuranceProviderComparison;
}

export function InsuranceProviderComparison({ comparison }: InsuranceProviderComparisonProps) {
  // Find the provider with the lowest premium
  const providers = ["CMHC", "Sagen", "Genworth"] as const;
  const premiums = providers.map((provider) => ({
    provider,
    premium: comparison[provider]?.premiumAfterDiscount || 0,
  }));
  const bestProvider = premiums.reduce((best, current) =>
    current.premium < best.premium ? current : best
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Provider Comparison</h3>
        <p className="text-sm text-muted-foreground">
          Compare premiums across all three mortgage default insurance providers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => {
          const result = comparison[provider];
          if (!result || !result.isHighRatio) return null;

          const isBest = provider === bestProvider.provider;
          const difference = result.premiumAfterDiscount - bestProvider.premium;

          return (
            <Card
              key={provider}
              className={`relative ${isBest ? "border-green-500 border-2" : ""}`}
            >
              {isBest && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{provider}</CardTitle>
                  {isBest && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Best Price
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Premium Rate</p>
                  <p className="text-lg font-semibold">{result.premiumRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Premium Amount</p>
                  <p className="text-xl font-bold text-orange-600">
                    $
                    {result.premiumAfterDiscount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                {!isBest && difference > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      $
                      {difference.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      more than {bestProvider.provider}
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">LTV Ratio</p>
                  <p className="text-sm font-medium">{result.ltvRatio}%</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {bestProvider.premium > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Recommendation:</strong> {bestProvider.provider} offers the lowest premium at{" "}
            <strong>
              $
              {bestProvider.premium.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
            . However, consider other factors such as lender requirements and service quality when
            choosing your insurance provider.
          </p>
        </div>
      )}
    </div>
  );
}
