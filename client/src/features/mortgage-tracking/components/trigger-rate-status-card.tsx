import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Button } from "@/shared/ui/button";
import { AlertTriangle, TrendingUp, AlertCircle, Calculator } from "lucide-react";
import { Link } from "wouter";
import { mortgageApi, mortgageQueryKeys } from "../api";
import type { TriggerRateAlert } from "../api";

interface TriggerRateStatusCardProps {
  mortgageId: string;
}

export function TriggerRateStatusCard({ mortgageId }: TriggerRateStatusCardProps) {
  const { data: triggerStatus, isLoading } = useQuery<TriggerRateAlert | null>({
    queryKey: mortgageQueryKeys.triggerStatus(mortgageId),
    queryFn: () => mortgageApi.fetchTriggerStatus(mortgageId),
    enabled: !!mortgageId,
    refetchInterval: 1000 * 60 * 60, // Check every hour
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trigger Rate Status</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!triggerStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trigger Rate Status</CardTitle>
          <CardDescription>No trigger rate monitoring needed for this mortgage</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Trigger rate monitoring is only available for variable-rate mortgages with fixed
            payments.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentRatePercent = triggerStatus.currentRate * 100;
  const triggerRatePercent = triggerStatus.triggerRate * 100;
  const distanceToTrigger = triggerStatus.triggerRate - triggerStatus.currentRate;
  const distancePercent = distanceToTrigger * 100;

  // Calculate progress (0% = at trigger, 100% = safe)
  // We'll show how close we are to trigger rate
  const maxDistance = 0.05; // 5% buffer for visualization
  const progressValue = Math.max(0, Math.min(100, (distanceToTrigger / maxDistance) * 100));

  const getStatusColor = () => {
    if (triggerStatus.isHit) return "destructive";
    if (triggerStatus.isRisk) return "default";
    if (distancePercent <= 1) return "default";
    return "secondary";
  };

  const getStatusIcon = () => {
    if (triggerStatus.isHit) return <AlertCircle className="h-5 w-5 text-red-600" />;
    if (triggerStatus.isRisk) return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    return <TrendingUp className="h-5 w-5 text-blue-600" />;
  };

  const getStatusText = () => {
    if (triggerStatus.isHit) return "Trigger Rate Hit";
    if (triggerStatus.isRisk) return "At Risk";
    if (distancePercent <= 1) return "Approaching";
    return "Safe";
  };

  return (
    <Card className="border-t-4 border-t-orange-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Trigger Rate Status
          </CardTitle>
          <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
        </div>
        <CardDescription>Monitor your distance to trigger rate</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rate Comparison */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Rate</span>
            <span className="text-lg font-semibold">{currentRatePercent.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Trigger Rate</span>
            <span className="text-lg font-semibold">{triggerRatePercent.toFixed(2)}%</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Distance to Trigger</span>
              <Badge
                variant={
                  distancePercent <= 0
                    ? "destructive"
                    : distancePercent <= 0.5
                      ? "default"
                      : "secondary"
                }
              >
                {distancePercent > 0 ? "+" : ""}
                {distancePercent.toFixed(2)}%
              </Badge>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>At Trigger</span>
              <span>Safe Zone</span>
            </div>
          </div>
        </div>

        {/* Impact Analysis (if hit or close) */}
        {(triggerStatus.isHit || triggerStatus.isRisk) && (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium">Impact Analysis</span>
            </div>
            {triggerStatus.isHit && (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Your mortgage balance is increasing each month. Take immediate action to prevent
                further increase.
              </p>
            )}
            {triggerStatus.isRisk && (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                You are very close to your trigger rate. Consider increasing your payment to build a
                buffer.
              </p>
            )}
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recommendations</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            {triggerStatus.isHit ? (
              <>
                <li>Contact your lender immediately</li>
                <li>Make a lump-sum prepayment</li>
                <li>Increase your regular payment amount</li>
                <li>Consider refinancing options</li>
              </>
            ) : triggerStatus.isRisk ? (
              <>
                <li>Make a prepayment to reduce balance</li>
                <li>Increase your regular payment amount</li>
                <li>Monitor your rate closely</li>
                <li>Contact your lender to discuss options</li>
              </>
            ) : (
              <>
                <li>Monitor your rate regularly</li>
                <li>Consider making prepayments to build a buffer</li>
                <li>Review your payment amount</li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/mortgages/${mortgageId}`}>View Details</Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/mortgages/${mortgageId}?tab=prepayments`}>
              <Calculator className="h-4 w-4 mr-2" />
              Prepay
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
