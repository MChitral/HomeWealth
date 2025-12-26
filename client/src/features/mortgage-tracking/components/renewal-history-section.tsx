import { useQuery } from "@tanstack/react-query";
import { mortgageApi } from "@/features/mortgage-tracking/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { format, parseISO } from "date-fns";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";
import type { RenewalHistoryEntry } from "@/features/mortgage-tracking/api";

interface RenewalHistorySectionProps {
  mortgageId: string;
}

export function RenewalHistorySection({ mortgageId }: RenewalHistorySectionProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["renewal-history", mortgageId],
    queryFn: () => mortgageApi.fetchRenewalHistory(mortgageId),
    enabled: !!mortgageId,
  });

  const { data: analytics } = useQuery({
    queryKey: ["renewal-analytics", mortgageId],
    queryFn: () => mortgageApi.fetchRenewalAnalytics(mortgageId),
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
          <CardTitle>Renewal History</CardTitle>
          <CardDescription>No renewal history found for this mortgage.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getRateChangeIcon = (entry: RenewalHistoryEntry) => {
    const change = entry.newRate - entry.previousRate;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getRateChangeColor = (entry: RenewalHistoryEntry) => {
    const change = entry.newRate - entry.previousRate;
    if (change > 0) return "text-red-600";
    if (change < 0) return "text-green-600";
    return "text-muted-foreground";
  };

  const getDecisionTypeBadge = (decisionType: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      stayed: "default",
      switched: "secondary",
      refinanced: "outline",
    };
    return (
      <Badge variant={variants[decisionType] || "default"}>
        {decisionType.charAt(0).toUpperCase() + decisionType.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {analytics && analytics.performance.totalRenewals > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Renewal Performance</CardTitle>
            <CardDescription>Overall metrics from all renewals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Renewals</div>
                <div className="text-2xl font-bold">{analytics.performance.totalRenewals}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Rate Change</div>
                <div className="text-2xl font-bold">
                  {analytics.performance.averageRateChange > 0 ? "+" : ""}
                  {analytics.performance.averageRateChange.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Estimated Savings</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.performance.totalEstimatedSavings)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Renewal Rate</div>
                <div className="text-2xl font-bold">
                  {analytics.performance.lastRenewalRate?.toFixed(2)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Renewal History</CardTitle>
          <CardDescription>Past renewal decisions and outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Renewal Date</TableHead>
                <TableHead>Previous Rate</TableHead>
                <TableHead>New Rate</TableHead>
                <TableHead>Rate Change</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Lender</TableHead>
                <TableHead>Savings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => {
                const rateChange = entry.newRate - entry.previousRate;
                return (
                  <TableRow key={entry.id}>
                    <TableCell>{format(parseISO(entry.renewalDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{entry.previousRate.toFixed(2)}%</TableCell>
                    <TableCell className="font-medium">{entry.newRate.toFixed(2)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRateChangeIcon(entry)}
                        <span className={getRateChangeColor(entry)}>
                          {rateChange > 0 ? "+" : ""}
                          {rateChange.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getDecisionTypeBadge(entry.decisionType)}</TableCell>
                    <TableCell>{entry.lenderName || "-"}</TableCell>
                    <TableCell>
                      {entry.estimatedSavings !== null && entry.estimatedSavings !== undefined
                        ? formatCurrency(entry.estimatedSavings)
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
