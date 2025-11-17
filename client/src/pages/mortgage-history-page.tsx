import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Download, AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function MortgageHistoryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTermRenewalOpen, setIsTermRenewalOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("all");
  const [mortgageType, setMortgageType] = useState("variable-fixed");
  const [primeRate, setPrimeRate] = useState("6.45");

  // Current term information (locked for the term duration)
  const currentTerm = {
    type: "variable-fixed" as "fixed" | "variable-changing" | "variable-fixed",
    startDate: "2024-01-01",
    endDate: "2029-01-01",
    termYears: 5,
    lockedSpread: -0.80, // This is locked for the full 5-year term
    fixedRate: null as number | null, // Only for fixed-rate terms
  };

  // Mock payment history data
  const paymentHistory = [
    {
      id: 1,
      date: "2024-01-01",
      year: 2024,
      paymentAmount: 2100,
      primeRate: 6.45,
      termSpread: -0.80,
      effectiveRate: 5.65,
      principal: 600,
      interest: 1500,
      remainingBalance: 399400,
      mortgageType: "Variable-Fixed Payment",
      triggerHit: false,
      amortizationYears: 25.0,
      termStartDate: "2024-01-01",
    },
    {
      id: 2,
      date: "2024-02-01",
      year: 2024,
      paymentAmount: 2100,
      primeRate: 6.70, // Prime changed, but spread stays -0.80
      termSpread: -0.80,
      effectiveRate: 5.90,
      principal: 580,
      interest: 1520,
      remainingBalance: 398820,
      mortgageType: "Variable-Fixed Payment",
      triggerHit: false,
      amortizationYears: 25.3,
      termStartDate: "2024-01-01",
    },
    {
      id: 3,
      date: "2024-03-01",
      year: 2024,
      paymentAmount: 2100,
      primeRate: 6.95, // Prime changed again
      termSpread: -0.80,
      effectiveRate: 6.15,
      principal: 555,
      interest: 1545,
      remainingBalance: 398265,
      mortgageType: "Variable-Fixed Payment",
      triggerHit: false,
      amortizationYears: 25.6,
      termStartDate: "2024-01-01",
    },
    {
      id: 4,
      date: "2024-04-01",
      year: 2024,
      paymentAmount: 2100,
      primeRate: 7.20, // Prime keeps changing
      termSpread: -0.80, // But spread stays constant
      effectiveRate: 6.40,
      principal: 520,
      interest: 1580,
      remainingBalance: 397745,
      mortgageType: "Variable-Fixed Payment",
      triggerHit: true,
      amortizationYears: 26.2,
      termStartDate: "2024-01-01",
    },
  ];

  const summaryStats = {
    totalPayments: paymentHistory.length,
    totalPaid: paymentHistory.reduce((sum, p) => sum + p.paymentAmount, 0),
    totalPrincipal: paymentHistory.reduce((sum, p) => sum + p.principal, 0),
    totalInterest: paymentHistory.reduce((sum, p) => sum + p.interest, 0),
    currentBalance: paymentHistory[paymentHistory.length - 1]?.remainingBalance || 400000,
    currentRate: paymentHistory[paymentHistory.length - 1]?.effectiveRate || 5.65,
    currentPrimeRate: paymentHistory[paymentHistory.length - 1]?.primeRate || 6.45,
    amortizationYears: paymentHistory[paymentHistory.length - 1]?.amortizationYears || 25.0,
    triggerHitCount: paymentHistory.filter(p => p.triggerHit).length,
  };

  const filteredPayments =
    filterYear === "all"
      ? paymentHistory
      : paymentHistory.filter((p) => p.year.toString() === filterYear);

  const availableYears = Array.from(new Set(paymentHistory.map((p) => p.year))).sort((a, b) => b - a);

  const effectiveRate = currentTerm.type === "fixed" && currentTerm.fixedRate
    ? currentTerm.fixedRate.toFixed(2)
    : (parseFloat(primeRate) + currentTerm.lockedSpread).toFixed(2);

  const monthsRemainingInTerm = Math.round((new Date(currentTerm.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Mortgage History</h1>
          <p className="text-muted-foreground">Track your actual mortgage payments (Canadian term-based mortgages)</p>
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Mortgage Payment</DialogTitle>
                <DialogDescription>
                  Record a mortgage payment (using your current term's locked rate/spread)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-accent/50 rounded-md space-y-2">
                  <p className="text-sm font-semibold">Current Term (Locked)</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Term Type:</p>
                      <p className="font-medium">{currentTerm.type === "fixed" ? "Fixed Rate" : "Variable Rate"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term Duration:</p>
                      <p className="font-medium">{currentTerm.termYears} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Locked Spread:</p>
                      <p className="font-medium font-mono">Prime {currentTerm.lockedSpread >= 0 ? '+' : ''} {currentTerm.lockedSpread}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Months Remaining:</p>
                      <p className="font-medium">{monthsRemainingInTerm} months</p>
                    </div>
                  </div>
                </div>

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

                {currentTerm.type === "fixed" ? (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-1">Locked Fixed Rate</p>
                    <p className="text-2xl font-mono font-bold">{currentTerm.fixedRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rate is constant until {currentTerm.endDate}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="prime-rate">Current Prime Rate (%)</Label>
                    <Input
                      id="prime-rate"
                      type="number"
                      step="0.01"
                      value={primeRate}
                      onChange={(e) => setPrimeRate(e.target.value)}
                      data-testid="input-prime-rate"
                    />
                    <p className="text-sm text-muted-foreground">
                      Only Prime changes during your term. Your spread ({currentTerm.lockedSpread >= 0 ? '+' : ''}{currentTerm.lockedSpread}%) 
                      is locked until {currentTerm.endDate}
                    </p>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-1">Effective Rate</p>
                      <p className="text-2xl font-mono font-bold">{effectiveRate}%</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {primeRate}% (Prime) {currentTerm.lockedSpread >= 0 ? '+' : ''} {currentTerm.lockedSpread}% = {effectiveRate}%
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-muted rounded-md space-y-2">
                  <p className="text-sm font-medium">Auto-calculated (semi-annual compounding)</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Principal:</p>
                      <p className="font-mono font-medium text-green-600">$600.00</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest:</p>
                      <p className="font-mono font-medium text-orange-600">$1,500.00</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">New Balance:</p>
                    <p className="font-mono font-medium">$399,400.00</p>
                  </div>
                  {currentTerm.type.includes("variable-fixed") && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">New Amortization:</p>
                      <p className="font-mono font-medium">25.2 years</p>
                    </div>
                  )}
                </div>

                {currentTerm.type.includes("variable-fixed") && parseFloat(effectiveRate) > 6.0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <span className="font-medium">Trigger Rate Warning:</span> Interest portion approaching payment amount. 
                      May require payment increase or lump-sum prepayment.
                    </AlertDescription>
                  </Alert>
                )}
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

      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Current Mortgage Term</CardTitle>
              <CardDescription>Your locked rate/spread for this term period</CardDescription>
            </div>
            <Dialog open={isTermRenewalOpen} onOpenChange={setIsTermRenewalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-renew-term">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renew Term
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Renew Mortgage Term</DialogTitle>
                  <DialogDescription>
                    Start a new term with a new rate or spread (typically every 3-5 years)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-term-type">New Term Type</Label>
                    <Select defaultValue="variable-fixed">
                      <SelectTrigger id="new-term-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Rate</SelectItem>
                        <SelectItem value="variable-changing">Variable - Changing Payment</SelectItem>
                        <SelectItem value="variable-fixed">Variable - Fixed Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term-length">Term Length</Label>
                    <Select defaultValue="5">
                      <SelectTrigger id="term-length">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="2">2 Years</SelectItem>
                        <SelectItem value="3">3 Years</SelectItem>
                        <SelectItem value="5">5 Years</SelectItem>
                        <SelectItem value="7">7 Years</SelectItem>
                        <SelectItem value="10">10 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-spread">New Spread (for variable) or Rate (for fixed)</Label>
                    <Input id="new-spread" type="number" step="0.01" placeholder="-0.65" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTermRenewalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    console.log("Term renewed");
                    setIsTermRenewalOpen(false);
                  }}>
                    Start New Term
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Term Type</p>
              <p className="text-base font-medium">
                {currentTerm.type === "fixed" ? "Fixed Rate" : 
                 currentTerm.type === "variable-changing" ? "Variable (Changing Payment)" :
                 "Variable (Fixed Payment)"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Term Duration</p>
              <p className="text-base font-medium">{currentTerm.termYears} years</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Locked Until</p>
              <p className="text-base font-medium">{currentTerm.endDate}</p>
              <p className="text-sm text-muted-foreground">{monthsRemainingInTerm} months left</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {currentTerm.type === "fixed" ? "Locked Rate" : "Locked Spread"}
              </p>
              <p className="text-base font-medium font-mono">
                {currentTerm.type === "fixed" 
                  ? `${currentTerm.fixedRate}%`
                  : `Prime ${currentTerm.lockedSpread >= 0 ? '+' : ''}${currentTerm.lockedSpread}%`
                }
              </p>
            </div>
          </div>
          {currentTerm.type !== "fixed" && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Prime Rate</p>
                  <p className="text-2xl font-mono font-bold">{summaryStats.currentPrimeRate}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current Effective Rate</p>
                  <p className="text-2xl font-mono font-bold">{summaryStats.currentRate}%</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {summaryStats.triggerHitCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Trigger Rate Hit:</span> {summaryStats.triggerHitCount} payment(s) 
            where interest exceeded regular payment amount. Consider lump-sum prepayment or payment increase.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono">{summaryStats.totalPayments}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Total: ${summaryStats.totalPaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Principal Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-green-600">
              ${summaryStats.totalPrincipal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Interest Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-orange-600">
              ${summaryStats.totalInterest.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Balance Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono">
              ${summaryStats.currentBalance.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {summaryStats.amortizationYears} years amort.
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Prime</TableHead>
                  <TableHead className="text-right">Term Spread</TableHead>
                  <TableHead className="text-right">Effective Rate</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Amort.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No payments recorded yet. Click "Log Payment" to add your first payment.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`} className={payment.triggerHit ? "bg-destructive/10" : ""}>
                      <TableCell className="font-medium">
                        {payment.date}
                        {payment.triggerHit && (
                          <Badge variant="destructive" className="ml-2 text-xs">Trigger</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {payment.primeRate ? `${payment.primeRate}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {payment.termSpread !== undefined ? `${payment.termSpread >= 0 ? '+' : ''}${payment.termSpread}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">{payment.effectiveRate}%</TableCell>
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
                      <TableCell className="text-right font-mono text-sm">
                        {payment.amortizationYears} yr
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
          <CardTitle className="text-lg font-semibold">How Canadian Mortgage Terms Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 bg-primary rounded" />
            <p className="text-sm">
              <span className="font-medium">Term Lock (3-5 years typical):</span> You lock in either a fixed rate 
              OR a variable spread (e.g., Prime - 0.80%) for the term duration.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-chart-1 rounded" />
            <p className="text-sm">
              <span className="font-medium">Fixed Rate Terms:</span> Your rate stays constant for the entire term. 
              After term ends, you renew at a new rate.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-chart-2 rounded" />
            <p className="text-sm">
              <span className="font-medium">Variable Rate Terms:</span> Your spread is locked (e.g., Prime - 0.80%), 
              but Prime rate itself changes monthly as Bank of Canada adjusts it.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-chart-3 rounded" />
            <p className="text-sm">
              <span className="font-medium">Term Renewal:</span> When your term expires, you negotiate a new 
              rate/spread for the next term (same or different lender).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
