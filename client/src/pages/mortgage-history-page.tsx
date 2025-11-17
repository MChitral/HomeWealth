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
import { Badge } from "@/components/ui/badge";
import { Plus, Download, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MortgageHistoryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("all");
  const [mortgageType, setMortgageType] = useState("fixed");
  const [rateType, setRateType] = useState("fixed-rate");
  const [primeRate, setPrimeRate] = useState("6.45");
  const [spread, setSpread] = useState("-0.80");

  // Mock payment history data with Canadian mortgage features
  const paymentHistory = [
    {
      id: 1,
      date: "2024-01-01",
      year: 2024,
      paymentAmount: 2100,
      primeRate: 6.45,
      spread: -0.80,
      effectiveRate: 5.65,
      principal: 600,
      interest: 1500,
      remainingBalance: 399400,
      mortgageType: "Variable-Fixed Payment",
      triggerHit: false,
      amortizationYears: 25.0,
    },
    {
      id: 2,
      date: "2024-02-01",
      year: 2024,
      paymentAmount: 2100,
      primeRate: 6.70,
      spread: -0.80,
      effectiveRate: 5.90,
      principal: 580,
      interest: 1520,
      remainingBalance: 398820,
      mortgageType: "Variable-Fixed Payment",
      triggerHit: false,
      amortizationYears: 25.3,
    },
    {
      id: 3,
      date: "2024-03-01",
      year: 2024,
      paymentAmount: 2100,
      primeRate: 6.95,
      spread: -0.80,
      effectiveRate: 6.15,
      principal: 555,
      interest: 1545,
      remainingBalance: 398265,
      mortgageType: "Variable-Fixed Payment",
      triggerHit: false,
      amortizationYears: 25.6,
    },
    {
      id: 4,
      date: "2024-04-01",
      year: 2024,
      paymentAmount: 2100,
      primeRate: 7.20,
      spread: -0.80,
      effectiveRate: 6.40,
      principal: 520,
      interest: 1580,
      remainingBalance: 397745,
      mortgageType: "Variable-Fixed Payment",
      triggerHit: true,
      amortizationYears: 26.2,
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
    currentSpread: paymentHistory[paymentHistory.length - 1]?.spread || -0.80,
    amortizationYears: paymentHistory[paymentHistory.length - 1]?.amortizationYears || 25.0,
    triggerHitCount: paymentHistory.filter(p => p.triggerHit).length,
  };

  const filteredPayments =
    filterYear === "all"
      ? paymentHistory
      : paymentHistory.filter((p) => p.year.toString() === filterYear);

  const availableYears = Array.from(new Set(paymentHistory.map((p) => p.year))).sort((a, b) => b - a);

  const effectiveRate = rateType === "prime-plus" 
    ? (parseFloat(primeRate) + parseFloat(spread)).toFixed(2)
    : "4.50";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Mortgage History</h1>
          <p className="text-muted-foreground">Track your actual mortgage payments and rates (Canadian mortgages)</p>
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
                  Record a mortgage payment with Canadian mortgage specifics
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-date">Payment Date</Label>
                  <Input id="payment-date" type="date" data-testid="input-payment-date" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mortgage-type">Mortgage Type</Label>
                  <Select value={mortgageType} onValueChange={setMortgageType}>
                    <SelectTrigger id="mortgage-type" data-testid="select-mortgage-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                      <SelectItem value="variable-changing">Variable - Changing Payment (VRM)</SelectItem>
                      <SelectItem value="variable-fixed">Variable - Fixed Payment (Static)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {mortgageType === "fixed" && "Payment and rate stay constant during term"}
                    {mortgageType === "variable-changing" && "Rate changes → payment recalculated to maintain amortization"}
                    {mortgageType === "variable-fixed" && "Rate changes → payment stays same, amortization adjusts (trigger rate risk)"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Payment Amount</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    placeholder="2100.00"
                    data-testid="input-payment-amount"
                  />
                  {mortgageType === "variable-changing" && (
                    <p className="text-sm text-muted-foreground">
                      Payment will change if rate changed since last payment
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-type">Rate Type</Label>
                  <Select value={rateType} onValueChange={setRateType}>
                    <SelectTrigger id="rate-type" data-testid="select-rate-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed-rate">Fixed Rate (%)</SelectItem>
                      <SelectItem value="prime-plus">Prime ± Spread (Variable)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {rateType === "fixed-rate" ? (
                  <div className="space-y-2">
                    <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                    <Input
                      id="interest-rate"
                      type="number"
                      step="0.01"
                      placeholder="4.50"
                      data-testid="input-interest-rate"
                    />
                    <p className="text-sm text-muted-foreground">Annual rate with semi-annual compounding</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prime-rate">Prime Rate (%)</Label>
                      <Input
                        id="prime-rate"
                        type="number"
                        step="0.01"
                        value={primeRate}
                        onChange={(e) => setPrimeRate(e.target.value)}
                        data-testid="input-prime-rate"
                      />
                      <p className="text-sm text-muted-foreground">Current Bank of Canada prime</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spread">Your Spread (%)</Label>
                      <Input
                        id="spread"
                        type="number"
                        step="0.01"
                        value={spread}
                        onChange={(e) => setSpread(e.target.value)}
                        data-testid="input-spread"
                      />
                      <p className="text-sm text-muted-foreground">e.g., -0.80 for Prime - 0.80%</p>
                    </div>
                  </div>
                )}

                {rateType === "prime-plus" && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-1">Effective Rate</p>
                    <p className="text-2xl font-mono font-bold">{effectiveRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {primeRate}% (Prime) {parseFloat(spread) >= 0 ? '+' : ''} {spread}% = {effectiveRate}%
                    </p>
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
                  {mortgageType === "variable-fixed" && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">New Amortization:</p>
                      <p className="font-mono font-medium">25.2 years</p>
                    </div>
                  )}
                </div>

                {mortgageType === "variable-fixed" && parseFloat(effectiveRate) > 6.0 && (
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
                <span className="text-sm font-mono font-medium text-green-600">
                  ${summaryStats.totalPrincipal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Interest:</span>
                <span className="text-sm font-mono font-medium text-orange-600">
                  ${summaryStats.totalInterest.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono">
              ${summaryStats.currentBalance.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Amortization: {summaryStats.amortizationYears} years
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Current Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono">{summaryStats.currentRate}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              Prime {summaryStats.currentSpread >= 0 ? '+' : ''} {summaryStats.currentSpread}%
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
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Prime</TableHead>
                  <TableHead className="text-right">Spread</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
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
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No payments recorded yet. Click "Log Payment" to add your first payment.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`} className={payment.triggerHit ? "bg-destructive/10" : ""}>
                      <TableCell className="font-medium">
                        {payment.date}
                        {payment.triggerHit && (
                          <Badge variant="destructive" className="ml-2">Trigger</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{payment.mortgageType}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {payment.primeRate ? `${payment.primeRate}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {payment.spread !== undefined ? `${payment.spread >= 0 ? '+' : ''}${payment.spread}%` : "-"}
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
          <CardTitle className="text-lg font-semibold">Canadian Mortgage Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 bg-primary rounded" />
            <p className="text-sm">
              <span className="font-medium">Semi-Annual Compounding:</span> Interest calculated using Canadian 
              standard semi-annual compounding, not in advance.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-chart-1 rounded" />
            <p className="text-sm">
              <span className="font-medium">Prime ± Spread:</span> Variable rates track Bank of Canada prime 
              rate ± your negotiated spread (e.g., Prime - 0.80%).
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-chart-2 rounded" />
            <p className="text-sm">
              <span className="font-medium">Trigger Rate (Fixed Payment):</span> When interest portion ≥ payment amount,
              lender may require payment increase or lump-sum.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-chart-3 rounded" />
            <p className="text-sm">
              <span className="font-medium">Amortization Tracking:</span> For fixed-payment variable mortgages,
              amortization adjusts as rates change.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
