import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useQuery } from "@tanstack/react-query";
import { smithManeuverApi, type ROIAnalysis } from "../api";
import { Loader2, TrendingUp, DollarSign, Percent } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

interface ROIAnalysisCardProps {
  strategyId: string;
  years?: number;
}

export function ROIAnalysisCard({ strategyId, years = 10 }: ROIAnalysisCardProps) {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ["smith-maneuver", "roi-analysis", strategyId, years],
    queryFn: () => smithManeuverApi.calculateROIAnalysis(strategyId, years),
    enabled: !!strategyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          ROI Analysis ({years} Years)
        </CardTitle>
        <CardDescription>Return on investment and effective returns analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Investment</p>
            <p className="text-2xl font-bold">
              $
              {analysis.totalInvestment.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Returns</p>
            <p className="text-2xl font-bold text-green-600">
              $
              {analysis.totalReturns.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">ROI</p>
            </div>
            <Badge
              variant={analysis.roi > 0 ? "default" : "destructive"}
              className="text-lg font-bold"
            >
              {analysis.roi > 0 ? "+" : ""}
              {analysis.roi.toFixed(2)}%
            </Badge>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Return on investment over {years} years
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tax Savings</p>
            <p className="text-lg font-semibold text-green-600">
              $
              {analysis.totalTaxSavings.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Investment Tax</p>
            <p className="text-lg font-semibold text-red-600">
              $
              {analysis.totalInvestmentTax.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 border-2 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-indigo-600" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Net Benefit</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">
              $
              {analysis.netBenefit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Effective Return: {analysis.effectiveReturn.toFixed(2)}% (after-tax)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
