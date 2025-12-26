import { AlertTriangle, AlertCircle, X, ExternalLink, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/features/notifications/api/notification-api";
import type { TriggerRateAlert } from "@/features/mortgage-tracking/api";
import { useState } from "react";

interface AlertBannerProps {
  alert: TriggerRateAlert;
  notificationId?: string;
  onDismiss?: () => void;
}

export function AlertBanner({ alert, notificationId, onDismiss }: AlertBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const queryClient = useQueryClient();

  if (!alert.isHit && !alert.isRisk) return null;
  if (isDismissed) return null;

  const isCritical = alert.isHit;
  const title = isCritical ? "Trigger Rate Hit!" : "Approaching Trigger Rate";

  const gap = ((alert.triggerRate - alert.currentRate) * 100).toFixed(2);
  const triggerRatePct = (alert.triggerRate * 100).toFixed(2);
  const currentRatePct = (alert.currentRate * 100).toFixed(2);

  // Get impact data from notification metadata if available
  // This would come from the notification if it was created by the alert job
  const monthlyBalanceIncrease = (alert as any).monthlyBalanceIncrease;
  const projectedBalanceAtTermEnd = (alert as any).projectedBalanceAtTermEnd;
  const requiredPayment = (alert as any).requiredPayment;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      setIsDismissed(true);
      if (onDismiss) onDismiss();
    },
  });

  const handleDismiss = () => {
    if (notificationId) {
      markAsReadMutation.mutate(notificationId);
    } else {
      setIsDismissed(true);
      if (onDismiss) onDismiss();
    }
  };

  return (
    <Alert
      variant={isCritical ? "destructive" : "default"}
      className={`mb-6 relative ${!isCritical ? "border-yellow-500 bg-yellow-50 text-yellow-900" : ""}`}
    >
      {notificationId && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
          disabled={markAsReadMutation.isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {isCritical ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
      )}
      <AlertTitle className={!isCritical ? "text-yellow-800" : ""}>{title}</AlertTitle>
      <AlertDescription className={!isCritical ? "text-yellow-700" : ""}>
        <div className="space-y-4">
          <div>
            {isCritical ? (
              <span>
                <b>Critical Action Required:</b> Your mortgage rate ({currentRatePct}%) has exceeded
                your trigger rate of <b>{triggerRatePct}%</b>. You are now negatively amortizing
                (interest exceeds payment). Contact your lender immediately.
              </span>
            ) : (
              <span>
                <b>Warning:</b> You are <b>{gap}%</b> away from your trigger rate of{" "}
                <b>{triggerRatePct}%</b>. Your current rate is <b>{currentRatePct}%</b>. Consider
                increasing your payments now to build a buffer.
              </span>
            )}
          </div>

          {/* Impact Analysis */}
          {(monthlyBalanceIncrease !== undefined || projectedBalanceAtTermEnd !== undefined) && (
            <Card className="mt-4 border-2">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-semibold">Impact Analysis</span>
                  </div>
                  {monthlyBalanceIncrease !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Balance Increase:</span>
                      <Badge variant="destructive" className="text-sm">
                        $
                        {monthlyBalanceIncrease.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Badge>
                    </div>
                  )}
                  {projectedBalanceAtTermEnd !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Projected Balance at Term End:</span>
                      <Badge variant="destructive" className="text-sm">
                        $
                        {projectedBalanceAtTermEnd.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Badge>
                    </div>
                  )}
                  {requiredPayment !== undefined && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">
                        Required Payment to Prevent Increase:
                      </span>
                      <Badge variant="default" className="text-sm bg-green-600">
                        $
                        {requiredPayment.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant={isCritical ? "default" : "outline"} size="sm" asChild>
              <Link href={`/mortgages/${alert.mortgageId}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            {requiredPayment !== undefined && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/mortgages/${alert.mortgageId}?action=increase-payment`}>
                  Increase Payment
                </Link>
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
