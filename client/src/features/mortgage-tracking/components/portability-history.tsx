import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useQuery } from "@tanstack/react-query";
import { mortgageApi, mortgageQueryKeys, type PortabilityEvent } from "../api";
import { Loader2, Home } from "lucide-react";
import { format } from "date-fns";

interface PortabilityHistoryProps {
  mortgageId: string;
}

export function PortabilityHistory({ mortgageId }: PortabilityHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: [...mortgageQueryKeys.mortgages(), mortgageId, "portability-history"],
    queryFn: () => mortgageApi.fetchPortabilityHistory(mortgageId),
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
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Portability History
          </CardTitle>
          <CardDescription>No portability events found for this mortgage</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Portability History
        </CardTitle>
        <CardDescription>History of mortgage portability events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((event: PortabilityEvent) => (
            <div
              key={event.id}
              className="rounded-lg border p-4 space-y-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {format(new Date(event.portDate), "MMMM d, yyyy")}
                  </p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Ported Amount</p>
                  <p className="font-semibold">
                    ${parseFloat(event.portedAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Old Property</p>
                  <p className="text-sm font-semibold">
                    ${parseFloat(event.oldPropertyPrice).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">New Property</p>
                  <p className="text-sm font-semibold text-blue-600">
                    ${parseFloat(event.newPropertyPrice).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {event.topUpAmount && parseFloat(event.topUpAmount) > 0 && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-900 dark:text-amber-100 font-medium mb-1">
                    Top-Up Required
                  </p>
                  <p className="text-lg font-bold text-amber-600">
                    ${parseFloat(event.topUpAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}

              {event.newMortgageId && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  New Mortgage ID: {event.newMortgageId}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

