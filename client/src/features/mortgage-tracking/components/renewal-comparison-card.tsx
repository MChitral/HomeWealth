import { useQuery } from "@tanstack/react-query";
import { mortgageApi } from "@/features/mortgage-tracking/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";
import type { RenewalRecommendationResponse } from "@/features/mortgage-tracking/api";

interface RenewalComparisonCardProps {
  mortgageId: string;
}

export function RenewalComparisonCard({ mortgageId }: RenewalComparisonCardProps) {
  const { data: recommendation, isLoading } = useQuery({
    queryKey: ["renewal-recommendation", mortgageId],
    queryFn: () => mortgageApi.fetchRenewalRecommendation(mortgageId),
    enabled: !!mortgageId,
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

  if (!recommendation) {
    return null;
  }

  const getRecommendationBadge = () => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      stay: "default",
      switch: "secondary",
      refinance: "outline",
      consider_switching: "outline",
    };
    const colors: Record<string, string> = {
      high: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-gray-100 text-gray-800",
    };
    return (
      <div className="flex items-center gap-2">
        <Badge variant={variants[recommendation.recommendation] || "default"}>
          {recommendation.recommendation === "consider_switching"
            ? "Consider Switching"
            : recommendation.recommendation.charAt(0).toUpperCase() +
              recommendation.recommendation.slice(1)}
        </Badge>
        <Badge variant="outline" className={colors[recommendation.confidence]}>
          {recommendation.confidence} confidence
        </Badge>
      </div>
    );
  };

  const getRecommendationIcon = () => {
    switch (recommendation.recommendation) {
      case "stay":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "switch":
      case "consider_switching":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "refinance":
        return <TrendingUp className="h-5 w-5 text-indigo-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRecommendationIcon()}
            Renewal Recommendation
          </div>
          {getRecommendationBadge()}
        </CardTitle>
        <CardDescription>{recommendation.reasoning}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Stay with Current Lender */}
          {recommendation.stayWithCurrentLender && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Stay with Current Lender</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Rate</span>
                  <span className="font-medium">
                    {recommendation.stayWithCurrentLender.estimatedRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Penalty</span>
                  <span className="font-medium">
                    {formatCurrency(recommendation.stayWithCurrentLender.estimatedPenalty)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Payment</span>
                  <span className="font-medium">
                    {formatCurrency(recommendation.stayWithCurrentLender.estimatedMonthlyPayment)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Switch Lender */}
          {recommendation.switchLender && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Switch Lender</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Rate</span>
                  <span className="font-medium">
                    {recommendation.switchLender.estimatedRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Penalty</span>
                  <span className="font-medium">
                    {formatCurrency(recommendation.switchLender.estimatedPenalty)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Closing Costs</span>
                  <span className="font-medium">
                    {formatCurrency(recommendation.switchLender.estimatedClosingCosts)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Payment</span>
                  <span className="font-medium">
                    {formatCurrency(recommendation.switchLender.estimatedMonthlyPayment)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Break-Even</span>
                    <span className="font-medium">
                      {recommendation.switchLender.breakEvenMonths.toFixed(1)} months
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Refinance */}
          {recommendation.refinance && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Refinance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Rate</span>
                  <span className="font-medium">
                    {recommendation.refinance.estimatedRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Penalty</span>
                  <span className="font-medium">
                    {formatCurrency(recommendation.refinance.estimatedPenalty)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Closing Costs</span>
                  <span className="font-medium">
                    {formatCurrency(recommendation.refinance.estimatedClosingCosts)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Payment</span>
                  <span className="font-medium">
                    {formatCurrency(recommendation.refinance.estimatedMonthlyPayment)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Savings</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(recommendation.refinance.monthlySavings)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Break-Even</span>
                    <span className="font-medium">
                      {recommendation.refinance.breakEvenMonths.toFixed(1)} months
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
