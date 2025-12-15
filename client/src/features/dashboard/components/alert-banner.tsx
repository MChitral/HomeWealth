import { AlertTriangle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import type { TriggerRateAlert } from "@/features/mortgage-tracking/api";

interface AlertBannerProps {
  alert: TriggerRateAlert;
}

export function AlertBanner({ alert }: AlertBannerProps) {
  if (!alert.isHit && !alert.isRisk) return null;

  const isCritical = alert.isHit;
  const variant = isCritical ? "destructive" : "warning"; // "warning" variant might not exist in default shadcn, usually it's "default" or customized.
  // If "warning" variant doesn't exist, use "destructive" for hit and default with yellow styling for risk?
  // Let's assume standard variants: default, destructive.
  // For MVP, if hit -> destructive. If risk -> default (maybe add class for color).

  const title = isCritical ? "Trigger Rate Hit!" : "Approaching Trigger Rate";
  const icon = isCritical ? (
    <AlertCircle className="h-4 w-4" />
  ) : (
    <AlertTriangle className="h-4 w-4" />
  );

  const gap = ((alert.triggerRate - alert.currentRate) * 100).toFixed(2);
  const triggerRatePct = (alert.triggerRate * 100).toFixed(2);

  return (
    <Alert
      variant={isCritical ? "destructive" : "default"}
      className={`mb-6 ${!isCritical ? "border-yellow-500 bg-yellow-50 text-yellow-900" : ""}`}
    >
      {isCritical ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
      )}
      <AlertTitle className={!isCritical ? "text-yellow-800" : ""}>{title}</AlertTitle>
      <AlertDescription className={!isCritical ? "text-yellow-700" : ""}>
        {isCritical ? (
          <span>
            <b>Critical Action Required:</b> Your mortgage rate has exceeded your trigger rate of{" "}
            <b>{triggerRatePct}%</b>. You are now negatively amortizing (interest exceeds payment).
            Contact your lender immediately.
          </span>
        ) : (
          <span>
            <b>Warning:</b> You are <b>{gap}%</b> away from your trigger rate of{" "}
            <b>{triggerRatePct}%</b>. Consider increasing your payments now to build a buffer.
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
