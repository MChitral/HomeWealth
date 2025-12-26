import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { useCreditRoomHistory } from "@/features/heloc/hooks";
import { format } from "date-fns";

interface CreditRoomHistoryProps {
  mortgageId: string;
}

export function CreditRoomHistory({ mortgageId }: CreditRoomHistoryProps) {
  const { data: history, isLoading, error } = useCreditRoomHistory(mortgageId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading credit room history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load credit room history</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Room History</CardTitle>
          <CardDescription>
            Credit room changes will appear here as you make principal payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No credit room history available yet.</p>
            <p className="text-sm mt-2">
              Credit room increases will be tracked automatically when you make principal payments.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate increases between entries
  const historyWithIncreases = history.map((entry, index) => {
    const previousEntry = index > 0 ? history[index - 1] : null;
    const increase = previousEntry ? entry.creditRoom - previousEntry.creditRoom : entry.creditRoom;
    return { ...entry, increase };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Room History</CardTitle>
        <CardDescription>
          Track how your credit room has increased over time with principal payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Mortgage Balance</TableHead>
                <TableHead className="text-right">Credit Room</TableHead>
                <TableHead className="text-right">Available Credit</TableHead>
                <TableHead className="text-right">Increase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyWithIncreases.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {format(new Date(entry.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(entry.mortgageBalance)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(entry.creditRoom)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(entry.availableCredit)}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.increase > 0 ? (
                      <Badge variant="default" className="bg-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />+{formatCurrency(entry.increase)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
