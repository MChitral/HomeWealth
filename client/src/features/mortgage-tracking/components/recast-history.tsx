import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useQuery } from "@tanstack/react-query";
import { mortgageApi, mortgageQueryKeys, type RecastEvent } from "../api";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface RecastHistoryProps {
  mortgageId: string;
}

export function RecastHistory({ mortgageId }: RecastHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: [...mortgageQueryKeys.mortgages(), mortgageId, "recast-history"],
    queryFn: () => mortgageApi.fetchRecastHistory(mortgageId),
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
          <CardTitle>Recast History</CardTitle>
          <CardDescription>No recast events found for this mortgage</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recast History</CardTitle>
        <CardDescription>Payment recalculations after large prepayments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((event: RecastEvent) => (
            <div
              key={event.id}
              className="rounded-lg border p-4 space-y-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {format(new Date(event.recastDate), "MMMM d, yyyy")}
                  </p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Prepayment</p>
                  <p className="font-semibold">
                    $
                    {parseFloat(event.prepaymentAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment Change</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm line-through text-muted-foreground">
                      $
                      {parseFloat(event.previousPaymentAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      $
                      {parseFloat(event.newPaymentAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Balance After</p>
                  <p className="text-lg font-semibold">
                    $
                    {parseFloat(event.newBalance).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
