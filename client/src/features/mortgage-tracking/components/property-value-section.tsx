import { useQuery } from "@tanstack/react-query";
import { propertyValueApi } from "../api/property-value-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Loader2, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import { PropertyValueTrendChart } from "./property-value-trend-chart";
import { PropertyValueUpdateDialog } from "./property-value-update-dialog";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/shared/lib/utils";
import type { PropertyValueHistoryEntry } from "../api";

interface PropertyValueSectionProps {
  mortgageId: string;
  currentPropertyValue?: number;
}

export function PropertyValueSection({
  mortgageId,
  currentPropertyValue,
}: PropertyValueSectionProps) {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["property-value-history", mortgageId],
    queryFn: () => propertyValueApi.getValueHistory(mortgageId),
    enabled: !!mortgageId,
  });

  const { data: trend, isLoading: isLoadingTrend } = useQuery({
    queryKey: ["property-value-trend", mortgageId],
    queryFn: () => propertyValueApi.getTrend(mortgageId, 24),
    enabled: !!mortgageId && (history?.length || 0) > 1,
  });

  const { data: projection } = useQuery({
    queryKey: ["property-value-projection", mortgageId],
    queryFn: () => propertyValueApi.getProjections(mortgageId, 12),
    enabled: !!mortgageId && (history?.length || 0) > 1,
  });

  if (isLoadingHistory) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const latestValue =
    history && history.length > 0 ? parseFloat(history[0].propertyValue) : currentPropertyValue;

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.trendDirection) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendBadgeVariant = () => {
    if (!trend) return "default" as const;
    switch (trend.trendDirection) {
      case "increasing":
        return "default" as const;
      case "decreasing":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Property Value</CardTitle>
              <CardDescription>Track your property value over time</CardDescription>
            </div>
            <Button onClick={() => setUpdateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Update Value
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Value & Trend Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Value</p>
              <p className="text-2xl font-bold">
                {latestValue ? formatCurrency(latestValue) : "N/A"}
              </p>
            </div>
            {trend && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Growth Rate (Annual)</p>
                  <div className="flex items-center gap-2">
                    {getTrendIcon()}
                    <p className="text-2xl font-bold">
                      {trend.averageGrowthRate > 0 ? "+" : ""}
                      {trend.averageGrowthRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trend</p>
                  <Badge variant={getTrendBadgeVariant()}>
                    {trend.trendDirection.charAt(0).toUpperCase() + trend.trendDirection.slice(1)}
                  </Badge>
                </div>
              </>
            )}
          </div>

          {/* Projected Value */}
          {projection && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Projected Value (12 months)</p>
              <p className="text-xl font-semibold">{formatCurrency(projection.projectedValue)}</p>
            </div>
          )}

          {/* Trend Chart */}
          {trend && trend.history.length > 1 && !isLoadingTrend && (
            <div>
              <h4 className="text-sm font-medium mb-4">Value Trend & Projection</h4>
              <PropertyValueTrendChart trend={trend} />
            </div>
          )}

          {/* History Table */}
          {history && history.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-4">Value History</h4>
              <div className="space-y-2">
                {history.map((entry: PropertyValueHistoryEntry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border p-4 space-y-2 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {format(parseISO(entry.valueDate), "MMMM d, yyyy")}
                        </p>
                        {entry.source && (
                          <p className="text-sm text-muted-foreground">{entry.source}</p>
                        )}
                      </div>
                      <p className="text-lg font-semibold">
                        {formatCurrency(parseFloat(entry.propertyValue))}
                      </p>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground pt-2 border-t">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!history || history.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No property value history yet.</p>
              <p className="text-sm mt-2">
                Click &quot;Update Value&quot; to add your first property value entry.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {latestValue !== undefined && (
        <PropertyValueUpdateDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          mortgageId={mortgageId}
          currentPropertyPrice={latestValue}
        />
      )}
    </div>
  );
}
