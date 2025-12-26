import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useHelocTransactions } from "../hooks";
import type { HelocAccount } from "@shared/schema";
import { Download, Search, Filter } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface HelocTransactionListProps {
  account: HelocAccount;
}

export function HelocTransactionList({ account }: HelocTransactionListProps) {
  const { data: transactions, isLoading } = useHelocTransactions(account.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((t) => {
      const matchesSearch = (t.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || t.transactionType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, typeFilter]);

  const handleExportCsv = () => {
    if (!filteredTransactions.length) return;

    const headers = ["Date", "Type", "Amount", "Balance After", "Available Credit", "Description"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [
          t.transactionDate,
          t.transactionType,
          t.transactionAmount,
          t.balanceAfter,
          t.availableCreditAfter,
          `"${t.description || ""}"`, // Quote description to handle commas
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `heloc_transactions_${account.id}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>Transaction History</CardTitle>
            <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 w-full bg-slate-50 dark:bg-slate-900 rounded animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>No transactions recorded yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>
              Use the &quot;Borrow&quot; or &quot;Pay&quot; buttons above to create your first
              record.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 && "s"}{" "}
              found
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search descriptions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="borrowing">Borrowing</SelectItem>
                <SelectItem value="repayment">Payment</SelectItem>
                <SelectItem value="interest_payment">Interest Payment</SelectItem>
                <SelectItem value="interest_accrual">Interest Accrual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right hidden md:table-cell">Available</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          transaction.transactionType === "borrowing"
                            ? "border-amber-200 text-amber-700 bg-amber-50"
                            : transaction.transactionType === "repayment"
                              ? "border-green-200 text-green-700 bg-green-50"
                              : transaction.transactionType === "interest_payment"
                                ? "border-blue-200 text-blue-700 bg-blue-50"
                                : "border-slate-200"
                        }
                      >
                        {transaction.transactionType === "borrowing"
                          ? "Borrow"
                          : transaction.transactionType === "repayment"
                            ? "Payment"
                            : transaction.transactionType === "interest_payment"
                              ? "Interest"
                              : transaction.transactionType === "interest_accrual"
                                ? "Accrual"
                                : transaction.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono",
                        transaction.transactionType === "borrowing"
                          ? "text-amber-700"
                          : "text-green-700"
                      )}
                    >
                      {transaction.transactionType === "borrowing" ? "+" : "-"}
                      {formatCurrency(transaction.transactionAmount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(transaction.balanceAfter)}
                    </TableCell>
                    <TableCell className="text-right font-mono hidden md:table-cell">
                      {formatCurrency(transaction.availableCreditAfter)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {transaction.description || "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No results match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
