import { useState } from "react";
import {
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calculator,
  Bell,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Button } from "@/shared/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import type { RenewalStatusResponse } from "@/features/mortgage-tracking/api";
import { PenaltyCalculatorDialog } from "@/features/mortgage-tracking/components/penalty-calculator-dialog";
import { notificationApi } from "@/features/notifications/api/notification-api";

interface RenewalCardProps {
  status: RenewalStatusResponse;
}

export function RenewalCard({ status }: RenewalCardProps) {
  const [penaltyCalculatorOpen, setPenaltyCalculatorOpen] = useState(false);
  const queryClient = useQueryClient();

  // Check for renewal reminder notifications for this mortgage
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => notificationApi.getNotifications({ unreadOnly: true }),
    enabled: !!status,
  });

  const renewalReminders = notifications.filter(
    (n) => n.type === "renewal_reminder" && n.metadata?.mortgageId === status?.mortgageId && !n.read
  );

  const hasUnreadReminder = renewalReminders.length > 0;

  const markReminderAsRead = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const handleDismissReminder = () => {
    if (renewalReminders.length > 0) {
      markReminderAsRead.mutate(renewalReminders[0].id);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "urgent":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      case "soon":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
      case "upcoming":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
      default:
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
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

  if (!status) return null;

  // Calculate rough progress (assuming 5 year term standard for visual, or just inverse of urgency)
  const progressValue = Math.max(
    0,
    Math.min(100, 100 - (status.daysUntilRenewal / (365 * 5)) * 100)
  );

  return (
    <Card className="relative overflow-visible">
      {hasUnreadReminder && (
        <div className="absolute top-2 right-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            New Reminder
          </Badge>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Renewal Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${getStatusColor(status.status)}`}
            >
              {getStatusIcon(status.status)}
              {getStatusText(status.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Timeline */}
          <div className="space-y-1">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold tracking-tight">
                {status.daysUntilRenewal}
              </span>
              <span className="text-sm font-medium text-muted-foreground mb-1">days remaining</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>Today</span>
              <span>{new Date(status.renewalDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Penalty Estimation */}
          <div className="bg-muted/50 rounded-md p-3 border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cost to Break Today
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 font-normal">
                Est. {status.estimatedPenalty.method === "IRD" ? "IRD" : "3-Mo Int"}
              </Badge>
            </div>
            <div className="text-lg font-semibold">
              $
              {status.estimatedPenalty.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Renewal Reminder Alert */}
          {hasUnreadReminder && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Renewal Reminder
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {renewalReminders[0].message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={handleDismissReminder}
                  disabled={markReminderAsRead.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button variant="default" size="sm" asChild className="w-full">
              <Link href={`/mortgages/${status.mortgageId}?tab=renewals`}>
                View Renewal Planning
              </Link>
            </Button>
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
