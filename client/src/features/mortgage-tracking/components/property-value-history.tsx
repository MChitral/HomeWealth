import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useQuery } from "@tanstack/react-query";
import { mortgageApi, mortgageQueryKeys, type PropertyValueHistoryEntry } from "../api";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PropertyValueHistoryProps {
  mortgageId: string;
}

const sourceLabels: Record<string, string> = {
  appraisal: "Professional Appraisal",
  assessment: "Property Assessment",
  estimate: "Market Estimate",
  user_input: "Manual Entry",
};

export function PropertyValueHistory({ mortgageId }: PropertyValueHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: [...mortgageQueryKeys.mortgages(), mortgageId, "property-value-history"],
    queryFn: () => mortgageApi.fetchPropertyValueHistory(mortgageId),
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
          <CardTitle>Property Value History</CardTitle>
          <CardDescription>No property value updates found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = history
    .map((entry: PropertyValueHistoryEntry) => ({
      date: format(new Date(entry.valueDate), "MMM yyyy"),
      value: parseFloat(entry.propertyValue),
      fullDate: entry.valueDate,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Value History</CardTitle>
        <CardDescription>Track your property value over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {chartData.length > 1 && (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    "Property Value",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-4">
          {history.map((entry: PropertyValueHistoryEntry) => (
            <div
              key={entry.id}
              className="rounded-lg border p-4 space-y-2 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {format(new Date(entry.valueDate), "MMMM d, yyyy")}
                  </p>
                  {entry.source && (
                    <p className="text-sm text-muted-foreground">
                      {sourceLabels[entry.source] || entry.source}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    ${parseFloat(entry.propertyValue).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              {entry.notes && (
                <p className="text-sm text-muted-foreground pt-2 border-t">{entry.notes}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

