import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useQuery } from "@tanstack/react-query";
import { smithManeuverApi, type PrepaymentComparison } from "../api";
import { Loader2, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface PrepaymentComparisonCardProps {
  strategyId: string;
  years?: number;
  mortgageRate?: number;
}

export function PrepaymentComparisonCard({
  strategyId,
  years: initialYears = 10,
  mortgageRate: initialMortgageRate,
}: PrepaymentComparisonCardProps) {
  const [years, setYears] = useState(initialYears);
  const [mortgageRate, setMortgageRate] = useState(initialMortgageRate?.toString() || "");
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    data: comparison,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["smith-maneuver", "prepayment-comparison", strategyId, years, mortgageRate],
    queryFn: () => {
      if (!mortgageRate) return null;
      return smithManeuverApi.compareWithDirectPrepayment(
        strategyId,
        years,
        parseFloat(mortgageRate) / 100
      );
    },
    enabled: !!strategyId && !!mortgageRate && !isCalculating,
  });

  const handleCalculate = () => {
    if (!mortgageRate) return;
    setIsCalculating(true);
    refetch().finally(() => setIsCalculating(false));
  };

  if (isLoading || isCalculating) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Smith Maneuver vs Direct Prepayment
        </CardTitle>
        <CardDescription>
          Compare Smith Maneuver strategy with direct prepayment approach
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!comparison && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mortgage-rate">Mortgage Interest Rate (%)</Label>
              <Input
                id="mortgage-rate"
                type="number"
                step="0.01"
                value={mortgageRate}
                onChange={(e) => setMortgageRate(e.target.value)}
                placeholder="5.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years">Comparison Period (Years)</Label>
              <Input
                id="years"
                type="number"
                min="1"
                max="30"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value, 10))}
              />
            </div>
            <Button onClick={handleCalculate} disabled={!mortgageRate} className="w-full">
              Calculate Comparison
            </Button>
          </div>
        )}

        {comparison && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <p className="font-semibold">Smith Maneuver</p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Benefit:</span>
                    <span className="font-semibold text-green-600">
                      $
                      {comparison.smithManeuver.netBenefit.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Value:</span>
                    <span className="font-semibold">
                      $
                      {comparison.smithManeuver.investmentValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Balance:</span>
                    <span className="font-semibold">
                      $
                      {comparison.smithManeuver.finalMortgageBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                  <p className="font-semibold">Direct Prepayment</p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Saved:</span>
                    <span className="font-semibold text-green-600">
                      $
                      {comparison.directPrepayment.interestSaved.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Balance:</span>
                    <span className="font-semibold">
                      $
                      {comparison.directPrepayment.finalMortgageBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {comparison && (
          <div
            className={`rounded-lg p-4 border-2 ${
              comparison.advantage.strategy === "smith_maneuver"
                ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                : comparison.advantage.strategy === "direct_prepayment"
                  ? "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">
                {comparison.advantage.strategy === "smith_maneuver"
                  ? "Smith Maneuver Advantage"
                  : comparison.advantage.strategy === "direct_prepayment"
                    ? "Direct Prepayment Advantage"
                    : "Similar Results"}
              </p>
              <Badge
                variant={
                  comparison.advantage.strategy === "smith_maneuver"
                    ? "default"
                    : comparison.advantage.strategy === "direct_prepayment"
                      ? "destructive"
                      : "secondary"
                }
              >
                {comparison.advantage.netAdvantage > 0 ? "+" : ""}$
                {comparison.advantage.netAdvantage.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {comparison.advantage.advantagePercent > 0 ? "+" : ""}
              {comparison.advantage.advantagePercent.toFixed(1)}% advantage
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
