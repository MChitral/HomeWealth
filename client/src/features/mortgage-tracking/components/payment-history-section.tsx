import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Trash2, SkipForward, Download, X, Search } from "lucide-react";
import type { UiPayment } from "../types";
import type { UseMutationResult } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

/**
 * Format payment period label as "MMM-YYYY" (e.g., "Feb-2025") from payment date
 */
function formatPaymentPeriod(date: string, existingLabel?: string | null): string {
  // Use existing label if provided and valid, otherwise generate from date
  if (existingLabel && existingLabel.trim()) {
    return existingLabel;
  }

  // Generate month-year from payment date
  try {
    const paymentDate = new Date(date);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[paymentDate.getMonth()];
    const year = paymentDate.getFullYear();
    return `${month}-${year}`;
  } catch {
    return existingLabel || "-";
  }
}

interface PaymentHistorySectionProps {
  filteredPayments: UiPayment[];
  availableYears: number[];
  filterYear: string;
  onFilterYearChange: (year: string) => void;
  filterDateRange: { start: string | null; end: string | null };
  onFilterDateRangeChange: (range: { start: string | null; end: string | null }) => void;
  filterPaymentType: "all" | "regular" | "prepayment" | "skipped";
  onFilterPaymentTypeChange: (type: "all" | "regular" | "prepayment" | "skipped") => void;
  searchAmount: string;
  onSearchAmountChange: (amount: string) => void;
  formatAmortization: (years: number) => string;
  deletePaymentMutation: UseMutationResult<{ success: boolean }, Error, string, unknown>;
}

export function PaymentHistorySection({
  filteredPayments,
  availableYears,
  filterYear,
  onFilterYearChange,
  filterDateRange,
  onFilterDateRangeChange,
  filterPaymentType,
  onFilterPaymentTypeChange,
  searchAmount,
  onSearchAmountChange,
  formatAmortization,
  deletePaymentMutation,
}: PaymentHistorySectionProps) {
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string; date: string } | null>(null);

  const handleDeleteConfirm = () => {
    if (paymentToDelete) {
      const idToDelete = paymentToDelete.id;
      setPaymentToDelete(null);
      deletePaymentMutation.mutate(idToDelete);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Period",
      "Prime Rate",
      "Spread",
      "Effective Rate",
      "Regular Payment",
      "Prepayment",
      "Total Paid",
      "Principal",
      "Interest",
      "Skipped Interest",
      "Balance",
      "Amortization",
    ];

    const rows = filteredPayments.map((payment) => [
      payment.date,
      formatPaymentPeriod(payment.date, payment.paymentPeriodLabel),
      payment.primeRate ? `${payment.primeRate}%` : "-",
      payment.termSpread !== undefined
        ? `${payment.termSpread >= 0 ? "+" : ""}${payment.termSpread}%`
        : "-",
      `${payment.effectiveRate}%`,
      payment.regularPaymentAmount.toFixed(2),
      payment.prepaymentAmount.toFixed(2),
      payment.paymentAmount.toFixed(2),
      payment.principal.toFixed(2),
      payment.interest.toFixed(2),
      payment.isSkipped && payment.skippedInterestAccrued > 0
        ? payment.skippedInterestAccrued.toFixed(2)
        : "-",
      payment.remainingBalance.toFixed(2),
      formatAmortization(payment.amortizationYears),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payment-history-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    onFilterYearChange("all");
    onFilterDateRangeChange({ start: null, end: null });
    onFilterPaymentTypeChange("all");
    onSearchAmountChange("");
  };

  const hasActiveFilters =
    filterYear !== "all" ||
    filterDateRange.start !== null ||
    filterDateRange.end !== null ||
    filterPaymentType !== "all" ||
    searchAmount.trim() !== "";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-xl font-semibold">Payment History</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="year-filter" className="text-sm whitespace-nowrap">
                Year:
              </Label>
              <Select value={filterYear} onValueChange={onFilterYearChange}>
                <SelectTrigger
                  className="w-[120px]"
                  id="year-filter"
                  data-testid="select-year-filter"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="date-start" className="text-sm whitespace-nowrap">
                From:
              </Label>
              <Input
                id="date-start"
                type="date"
                value={filterDateRange.start || ""}
                onChange={(e) =>
                  onFilterDateRangeChange({ ...filterDateRange, start: e.target.value || null })
                }
                className="w-[140px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="date-end" className="text-sm whitespace-nowrap">
                To:
              </Label>
              <Input
                id="date-end"
                type="date"
                value={filterDateRange.end || ""}
                onChange={(e) =>
                  onFilterDateRangeChange({ ...filterDateRange, end: e.target.value || null })
                }
                className="w-[140px]"
              />
            </div>

            {/* Payment Type Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="payment-type-filter" className="text-sm whitespace-nowrap">
                Type:
              </Label>
              <Select value={filterPaymentType} onValueChange={onFilterPaymentTypeChange}>
                <SelectTrigger className="w-[130px]" id="payment-type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="regular">Regular Only</SelectItem>
                  <SelectItem value="prepayment">With Prepayment</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search by Amount */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Search amount..."
                  value={searchAmount}
                  onChange={(e) => onSearchAmountChange(e.target.value)}
                  className="w-[140px] pl-8"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}

            {/* Export CSV Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="whitespace-nowrap"
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Results Count */}
        {hasActiveFilters && (
          <div className="mt-2 text-sm text-muted-foreground">
            Showing {filteredPayments.length} payment{filteredPayments.length !== 1 ? "s" : ""}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Prime</TableHead>
                <TableHead className="text-right">Spread</TableHead>
                <TableHead className="text-right">Eff. Rate</TableHead>
                <TableHead className="text-right">Regular</TableHead>
                <TableHead className="text-right">Prepayment</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead className="text-right">Skipped Interest</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Amort.</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                    Try clicking the &quot;Log Payment&quot; button to add your first
                    record.payment.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    data-testid={`row-payment-${payment.id}`}
                    className={`${
                      payment.triggerHit ? "bg-destructive/10" : ""
                    } ${payment.isSkipped ? "bg-yellow-50 dark:bg-yellow-950/20 italic" : ""}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {payment.date}
                        {payment.triggerHit && (
                          <Badge variant="destructive" className="text-xs">
                            Trigger
                          </Badge>
                        )}
                        {payment.isSkipped && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="text-xs border-orange-300 text-orange-700 bg-orange-50"
                                >
                                  <SkipForward className="h-3 w-3 mr-1" />
                                  Skipped
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Payment was skipped. Interest accrued: $
                                  {payment.skippedInterestAccrued.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                      {formatPaymentPeriod(payment.date, payment.paymentPeriodLabel)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {payment.primeRate ? `${payment.primeRate}%` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {payment.termSpread !== undefined
                        ? `${payment.termSpread >= 0 ? "+" : ""}${payment.termSpread}%`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {payment.effectiveRate}%
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ${payment.regularPaymentAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {payment.prepaymentAmount > 0 ? (
                        <span className="text-primary font-medium">
                          +${payment.prepaymentAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      ${payment.paymentAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      ${payment.principal.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-orange-600">
                      ${payment.interest.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {payment.isSkipped && payment.skippedInterestAccrued > 0 ? (
                        <span className="text-red-600 font-medium">
                          $
                          {payment.skippedInterestAccrued.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      ${payment.remainingBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatAmortization(payment.amortizationYears)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setPaymentToDelete({ id: payment.id, date: payment.date })}
                        disabled={deletePaymentMutation.isPending}
                        data-testid={`button-delete-payment-${payment.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AlertDialog
          open={!!paymentToDelete}
          onOpenChange={(open) => !open && setPaymentToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Payment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this payment from {paymentToDelete?.date}? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
