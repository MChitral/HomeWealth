import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download } from "lucide-react";
import { useState } from "react";

export default function MortgageHistoryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("all");

  // Mock payment history data
  const paymentHistory = [
    {
      id: 1,
      date: "2024-01-01",
      year: 2024,
      paymentAmount: 2100,
      interestRate: 4.5,
      principal: 600,
      interest: 1500,
      remainingBalance: 399400,
      mortgageType: "Fixed",
    },
    {
      id: 2,
      date: "2024-02-01",
      year: 2024,
      paymentAmount: 2100,
      interestRate: 4.5,
      principal: 602,
      interest: 1498,
      remainingBalance: 398798,
      mortgageType: "Fixed",
    },
    {
      id: 3,
      date: "2024-03-01",
      year: 2024,
      paymentAmount: 2100,
      interestRate: 4.5,
      principal: 604,
      interest: 1496,
      remainingBalance: 398194,
      mortgageType: "Fixed",
    },
  ];

  const summaryStats = {
    totalPayments: paymentHistory.length,
    totalPaid: paymentHistory.reduce((sum, p) => sum + p.paymentAmount, 0),
    totalPrincipal: paymentHistory.reduce((sum, p) => sum + p.principal, 0),
    totalInterest: paymentHistory.reduce((sum, p) => sum + p.interest, 0),
    currentBalance: paymentHistory[paymentHistory.length - 1]?.remainingBalance || 400000,
    currentRate: paymentHistory[paymentHistory.length - 1]?.interestRate || 4.5,
  };

  const filteredPayments =
    filterYear === "all"
      ? paymentHistory
      : paymentHistory.filter((p) => p.year.toString() === filterYear);

  const availableYears = Array.from(new Set(paymentHistory.map((p) => p.year))).sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Mortgage History</h1>
          <p className="text-muted-foreground">Track your actual mortgage payments and rates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-payment">
                <Plus className="h-4 w-4 mr-2" />
                Log Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Mortgage Payment</DialogTitle>
                <DialogDescription>
                  Record a mortgage payment with the interest rate at the time
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-date">Payment Date</Label>
                  <Input id="payment-date" type="date" data-testid="input-payment-date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Payment Amount</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    placeholder="2100.00"
                    data-testid="input-payment-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.01"
                    placeholder="4.50"
                    data-testid="input-interest-rate"
                  />
                  <p className="text-sm text-muted-foreground">
                    Rate at the time of this payment (for variable mortgages)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mortgage-type">Mortgage Type</Label>
                  <Select defaultValue="fixed">
                    <SelectTrigger id="mortgage-type" data-testid="select-mortgage-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                      <SelectItem value="variable">Variable Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <p className="text-sm font-medium">Auto-calculated (based on rate and balance)</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Principal:</p>
                      <p className="font-mono font-medium">$600.00</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest:</p>
                      <p className="font-mono font-medium">$1,500.00</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">New Balance:</p>
                    <p className="font-mono font-medium">$399,400.00</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    console.log("Payment logged");
                    setIsDialogOpen(false);
                  }}
                  data-testid="button-save-payment"
                >
                  Save Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Total Payments Made
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono">{summaryStats.totalPayments}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Total paid: ${summaryStats.totalPaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Principal vs Interest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Principal:</span>
                <span className="text-sm font-mono font-medium">
                  ${summaryStats.totalPrincipal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Interest:</span>
                <span className="text-sm font-mono font-medium">
                  ${summaryStats.totalInterest.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono">
              ${summaryStats.currentBalance.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Current rate: {summaryStats.currentRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-xl font-semibold">Payment History</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="year-filter" className="text-sm">
                Filter by year:
              </Label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[140px]" id="year-filter" data-testid="select-year-filter">
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Rate (%)</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No payments recorded yet. Click "Log Payment" to add your first payment.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                      <TableCell className="font-medium">{payment.date}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{payment.mortgageType}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono">{payment.interestRate}</TableCell>
                      <TableCell className="text-right font-mono">
                        ${payment.paymentAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        ${payment.principal.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-orange-600">
                        ${payment.interest.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        ${payment.remainingBalance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">How to Use This Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 bg-primary rounded" />
            <p className="text-sm">
              <span className="font-medium">Log each payment</span> after you make it. Enter the date, amount,
              and the interest rate at that time.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-chart-2 rounded" />
            <p className="text-sm">
              <span className="font-medium">Variable rates:</span> If your mortgage rate changes, just enter the
              new rate when logging that payment. The system tracks rate changes automatically.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-chart-3 rounded" />
            <p className="text-sm">
              <span className="font-medium">Auto-calculations:</span> Principal and interest are calculated
              automatically based on your remaining balance and rate.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
