import { useState } from "react";
import { CalendarDays, AlertTriangle, CheckCircle2, Clock, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Button } from "@/shared/ui/button";
import type { RenewalStatusResponse } from "@/features/mortgage-tracking/api";
import { PenaltyCalculatorDialog } from "@/features/mortgage-tracking/components/penalty-calculator-dialog";

interface RenewalCardProps {
  status: RenewalStatusResponse;
}

export function RenewalCard({ status }: RenewalCardProps) {
  if (!status) return null;

  const [penaltyCalculatorOpen, setPenaltyCalculatorOpen] = useState(false);

  const getStatusColor = (s: string) => {
    switch (s) {
      case "urgent":
        return "text-red-600 bg-red-100 border-red-200";
      case "soon":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "upcoming":
        return "text-blue-600 bg-blue-100 border-blue-200";
      default:
        return "text-green-600 bg-green-100 border-green-200";
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4" />;
      case "soon":
        return <Clock className="h-4 w-4" />;
      case "upcoming":
        return <CalendarDays className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusText = (s: string) => {
    switch (s) {
      case "urgent":
        return "Action Required";
      case "soon":
        return "Start Planning";
      case "upcoming":
        return "On Horizon";
      default:
        return "On Track";
    }
  };

  // Calculate rough progress (assuming 5 year term standard for visual, or just inverse of urgency)
  const progressValue = Math.max(
    0,
    Math.min(100, 100 - (status.daysUntilRenewal / (365 * 5)) * 100)
  );

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden border-t-4 border-t-indigo-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <CalendarDays className="h-5 w-5 text-indigo-500" />
            Renewal Status
          </CardTitle>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${getStatusColor(status.status)}`}
          >
            {getStatusIcon(status.status)}
            {getStatusText(status.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Timeline */}
          <div className="space-y-1">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {status.daysUntilRenewal}
              </span>
              <span className="text-sm font-medium text-slate-500 mb-1">days remaining</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>Today</span>
              <span>{new Date(status.renewalDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Penalty Estimation */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cost to Break Today
              </span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                Est. {status.estimatedPenalty.method === "IRD" ? "IRD" : "3-Mo Int"}
              </span>
            </div>
            <div className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              $
              {status.estimatedPenalty.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Calculate Penalty Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPenaltyCalculatorOpen(true)}
            className="w-full"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Detailed Penalty
          </Button>
        </div>
      </CardContent>

      <PenaltyCalculatorDialog
        open={penaltyCalculatorOpen}
        onOpenChange={setPenaltyCalculatorOpen}
        mortgageId={status.mortgageId}
        initialCurrentRate={(status.currentRate * 100).toFixed(2)}
      />
    </Card>
  );
}
