import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useQuery } from "@tanstack/react-query";
import { mortgageApi, mortgageQueryKeys, type FrequencyChangeEvent } from "../api";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface FrequencyChangeHistoryProps {
  mortgageId: string;
}

const frequencyLabels: Record<string, string> = {
  monthly: "Monthly",
  "semi-monthly": "Semi-Monthly",
  biweekly: "Bi-weekly",
  "accelerated-biweekly": "Accelerated Bi-weekly",
  weekly: "Weekly",
  "accelerated-weekly": "Accelerated Weekly",
};

export function FrequencyChangeHistory({ mortgageId }: FrequencyChangeHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: [...mortgageQueryKeys.mortgages(), mortgageId, "frequency-change-history"],
    queryFn: () => mortgageApi.fetchFrequencyChangeHistory(mortgageId),
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

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Frequency Change History</CardTitle>
          <CardDescription>No frequency changes found for this mortgage</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Frequency Change History</CardTitle>
        <CardDescription>History of payment frequency changes for this mortgage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((event: FrequencyChangeEvent) => (
            <div
              key={event.id}
              className="rounded-lg border p-4 space-y-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {format(new Date(event.changeDate), "MMMM d, yyyy")}
                  </p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Frequency Change</p>
                  <p className="font-semibold">
                    {frequencyLabels[event.oldFrequency] || event.oldFrequency} →{" "}
                    {frequencyLabels[event.newFrequency] || event.newFrequency}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment Change</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm line-through text-muted-foreground">
                      ${parseFloat(event.oldPaymentAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-lg font-semibold text-blue-600">
                      ${parseFloat(event.newPaymentAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Remaining Term</p>
                  <p className="text-lg font-semibold">
                    {Math.floor(event.remainingTermMonths / 12)} years{" "}
                    {event.remainingTermMonths % 12} months
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

