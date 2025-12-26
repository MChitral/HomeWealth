import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { useHelocTransactions } from "../hooks";
import type { HelocAccount } from "@shared/schema";

interface HelocTransactionListProps {
  account: HelocAccount;
}

export function HelocTransactionList({ account }: HelocTransactionListProps) {
  const { data: transactions, isLoading } = useHelocTransactions(account.id);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">No transactions yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Available Credit</TableHead>
                <TableHead className="text-right">Interest Rate</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.transactionDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.transactionType}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(transaction.transactionAmount)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(transaction.balanceAfter)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(transaction.availableCreditAfter)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {transaction.interestRate
                      ? `${Number(transaction.interestRate).toFixed(3)}%`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {transaction.description || "-"}
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
