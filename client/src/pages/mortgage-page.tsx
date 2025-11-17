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
import { Plus, Download, AlertTriangle, RefreshCw, Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";
import { useMemo } from "react";

// UI-friendly types (normalized from DB schema)
type UiTerm = {
  id: string;
  mortgageId: string;
  termType: "fixed" | "variable-changing" | "variable-fixed";
  startDate: string;
  endDate: string;
  termYears: number;
  lockedSpread: number;
  fixedRate: number | null;
  paymentFrequency: "monthly" | "biweekly" | "accelerated-biweekly";
  regularPaymentAmount: number;
};

type UiPayment = {
  id: string;
  date: string;
  year: number;
  paymentAmount: number;
  primeRate?: number;
  termSpread?: number;
  effectiveRate: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  mortgageType: string;
  triggerHit: boolean;
  amortizationYears: number;
  termStartDate?: string;
};

// Normalization helpers
function normalizeTerm(term: MortgageTerm | undefined): UiTerm | null {
  if (!term) return null;
  return {
    id: term.id,
    mortgageId: term.mortgageId,
    termType: term.termType as "fixed" | "variable-changing" | "variable-fixed",
    startDate: term.startDate,
    endDate: term.endDate,
    termYears: term.termYears,
    lockedSpread: Number(term.lockedSpread || 0),
    fixedRate: term.fixedRate ? Number(term.fixedRate) : null,
    paymentFrequency: term.paymentFrequency as "monthly" | "biweekly" | "accelerated-biweekly",
    regularPaymentAmount: Number(term.regularPaymentAmount),
  };
}

function normalizePayments(payments: MortgagePayment[] | undefined, terms: MortgageTerm[] | undefined): UiPayment[] {
  if (!payments) return [];
  return payments.map(p => {
    const paymentDate = new Date(p.paymentDate);
    const term = terms?.find(t => t.id === p.termId);
    
    return {
      id: p.id,
      date: p.paymentDate,
      year: paymentDate.getFullYear(),
      paymentAmount: Number(p.paymentAmount),
      primeRate: p.primeRate ? Number(p.primeRate) : undefined,
      termSpread: term?.lockedSpread ? Number(term.lockedSpread) : undefined,
      effectiveRate: Number(p.effectiveRate),
      principal: Number(p.principalPaid),
      interest: Number(p.interestPaid),
      remainingBalance: Number(p.remainingBalance),
      mortgageType: term?.termType || "Unknown",
      triggerHit: p.triggerRateHit === 1,
      amortizationYears: p.remainingAmortizationMonths / 12,
      termStartDate: term?.startDate,
    };
  });
}

export default function MortgageHistoryPage() {
  const { toast } = useToast();
  
  // Set page title
  useEffect(() => {
    document.title = "Mortgage Tracking | Mortgage Strategy";
  }, []);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTermRenewalOpen, setIsTermRenewalOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("all");
  const [mortgageType, setMortgageType] = useState("variable-fixed");
  const [primeRate, setPrimeRate] = useState("6.45");
  const [renewalTermType, setRenewalTermType] = useState("variable-fixed");
  const [renewalPaymentFrequency, setRenewalPaymentFrequency] = useState("monthly");
  const [renewalRate, setRenewalRate] = useState("");
  const [renewalSpread, setRenewalSpread] = useState("");
  const [renewalPrime, setRenewalPrime] = useState("");
  const [renewalTermYears, setRenewalTermYears] = useState("5");
  const [renewalStartDate, setRenewalStartDate] = useState("");
  
  // Payment form state
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  
  // Create mortgage form state
  const [isCreateMortgageOpen, setIsCreateMortgageOpen] = useState(false);
  const [createPropertyPrice, setCreatePropertyPrice] = useState("");
  const [createDownPayment, setCreateDownPayment] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");
  const [createAmortization, setCreateAmortization] = useState("25");
  const [createFrequency, setCreateFrequency] = useState("monthly");
  
  // Validation for create mortgage form
  const propertyPrice = parseFloat(createPropertyPrice);
  const downPayment = parseFloat(createDownPayment);
  
  // Comprehensive validation using Number.isFinite to catch NaN
  const propertyPriceError = !Number.isFinite(propertyPrice) || propertyPrice <= 0
    ? "Property price must be a valid number greater than zero" 
    : "";
  
  const downPaymentError = !propertyPriceError && (!Number.isFinite(downPayment) || downPayment < 0)
    ? "Down payment must be a valid number (zero or more)"
    : !propertyPriceError && Number.isFinite(downPayment) && downPayment > propertyPrice
    ? "Down payment cannot exceed property price" 
    : "";
  
  const loanAmount = propertyPrice - downPayment;
  const loanAmountError = !propertyPriceError && !downPaymentError && (!Number.isFinite(loanAmount) || loanAmount <= 0)
    ? "Loan amount must be greater than zero" 
    : "";
  
  // Form is valid only if all fields filled, all values are finite numbers, and no errors
  const isFormValid = createPropertyPrice && createDownPayment && createStartDate && createAmortization 
    && Number.isFinite(propertyPrice) && Number.isFinite(downPayment) && Number.isFinite(loanAmount)
    && !propertyPriceError && !downPaymentError && !loanAmountError;

  // Fetch mortgages (use first one for MVP)
  const { data: mortgages, isLoading: mortgagesLoading } = useQuery<Mortgage[]>({
    queryKey: ["/api/mortgages"],
  });

  const mortgage = mortgages?.[0]; // Use first mortgage

  // Fetch terms for this mortgage
  const { data: terms, isLoading: termsLoading } = useQuery<MortgageTerm[]>({
    queryKey: ["/api/mortgages", mortgage?.id, "terms"],
    enabled: !!mortgage?.id,
  });

  // Fetch payments for this mortgage
  const { data: payments, isLoading: paymentsLoading } = useQuery<MortgagePayment[]>({
    queryKey: ["/api/mortgages", mortgage?.id, "payments"],
    enabled: !!mortgage?.id,
  });

  // Normalize data to UI-friendly format
  const uiCurrentTerm = useMemo(() => normalizeTerm(terms?.[terms.length - 1]), [terms]);
  const paymentHistory = useMemo(() => normalizePayments(payments, terms), [payments, terms]);

  // Mutation for creating a new payment
  const createPaymentMutation = useMutation({
    mutationFn: async (payment: {
      paymentDate: string;
      paymentAmount: number;
      principalPaid: number;
      interestPaid: number;
      remainingBalance: number;
      primeRate?: number;
      effectiveRate: number;
      triggerRateHit: number;
      remainingAmortizationMonths: number;
    }) => {
      if (!mortgage?.id || !uiCurrentTerm?.id) throw new Error("No mortgage or term selected");
      return apiRequest("POST", `/api/mortgages/${mortgage.id}/payments`, {
        mortgageId: mortgage.id,
        termId: uiCurrentTerm.id,
        ...payment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mortgages", mortgage?.id, "payments"] });
      toast({
        title: "Payment logged",
        description: "Mortgage payment has been recorded successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log payment",
        variant: "destructive",
      });
    },
  });

  // Mutation for creating a new mortgage
  const createMortgageMutation = useMutation({
    mutationFn: async (mortgageData: {
      propertyPrice: string;
      downPayment: string;
      originalAmount: string;
      currentBalance: string;
      startDate: string;
      amortizationYears: number;
      amortizationMonths: number;
      paymentFrequency: string;
      annualPrepaymentLimitPercent: number;
    }) => {
      return apiRequest("POST", `/api/mortgages`, mortgageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mortgages"] });
      toast({
        title: "Mortgage created",
        description: "Your mortgage has been created successfully",
      });
      setIsCreateMortgageOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create mortgage",
        variant: "destructive",
      });
    },
  });

  // Mutation for creating a new term (renewal)
  const createTermMutation = useMutation({
    mutationFn: async (term: {
      termType: string;
      startDate: string;
      endDate: string;
      termYears: number;
      fixedRate?: string;
      lockedSpread?: string;
      paymentFrequency: string;
      regularPaymentAmount: string;
    }) => {
      if (!mortgage?.id) throw new Error("No mortgage selected");
      return apiRequest("POST", `/api/mortgages/${mortgage.id}/terms`, term);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mortgages", mortgage?.id, "terms"] });
      toast({
        title: "Term renewed",
        description: "New mortgage term has been created successfully",
      });
      setIsTermRenewalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to renew term",
        variant: "destructive",
      });
    },
  });

  const handleTermRenewal = () => {
    const termYears = Number(renewalTermYears) || 5;
    const startDate = renewalStartDate || uiCurrentTerm?.endDate || new Date().toISOString().split('T')[0];
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + termYears);

    // Update prime rate if variable and user entered a value
    if (renewalTermType.startsWith('variable') && renewalPrime) {
      setPrimeRate(renewalPrime);
    }

    // TODO: Calculate regularPaymentAmount using mortgage calculation engine
    // For now, use a placeholder
    const regularPaymentAmount = "2100.00";

    createTermMutation.mutate({
      termType: renewalTermType,
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      termYears,
      fixedRate: renewalTermType === 'fixed' ? renewalRate : undefined,
      lockedSpread: renewalTermType.startsWith('variable') ? renewalSpread : undefined,
      paymentFrequency: renewalPaymentFrequency,
      regularPaymentAmount,
    });
  };

  // Show loading state while data fetches
  if (mortgagesLoading || termsLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show empty state if no mortgage data
  if (!mortgage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 p-8">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
          <Info className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center max-w-md space-y-2">
          <h2 className="text-2xl font-semibold">Welcome to Mortgage Tracking</h2>
          <p className="text-muted-foreground">
            Track your Canadian mortgage with term-by-term history, payment breakdowns (principal vs interest), 
            and renewal management. Get started by creating your first mortgage.
          </p>
        </div>
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-lg">What you'll track:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Payment History</p>
                <p className="text-xs text-muted-foreground">Principal, interest, and remaining balance per payment</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">Term Management</p>
                <p className="text-xs text-muted-foreground">Track fixed vs variable terms with Canadian semi-annual compounding</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">Renewal Tracking</p>
                <p className="text-xs text-muted-foreground">Simulate term renewals with new rates and payment schedules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Dialog open={isCreateMortgageOpen} onOpenChange={setIsCreateMortgageOpen}>
          <DialogTrigger asChild>
            <Button size="lg" data-testid="button-create-mortgage">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Mortgage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Mortgage</DialogTitle>
              <DialogDescription>
                Enter your mortgage details to start tracking payments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-price">Property Price ($)</Label>
                  <Input
                    id="property-price"
                    type="number"
                    placeholder="500000"
                    value={createPropertyPrice}
                    onChange={(e) => setCreatePropertyPrice(e.target.value)}
                    className={propertyPriceError ? "border-destructive" : ""}
                    data-testid="input-property-price"
                  />
                  {propertyPriceError && (
                    <p className="text-sm text-destructive" data-testid="error-property-price">{propertyPriceError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="down-payment">Down Payment ($)</Label>
                  <Input
                    id="down-payment"
                    type="number"
                    placeholder="100000"
                    value={createDownPayment}
                    onChange={(e) => setCreateDownPayment(e.target.value)}
                    className={downPaymentError || loanAmountError ? "border-destructive" : ""}
                    data-testid="input-down-payment"
                  />
                  {downPaymentError && (
                    <p className="text-sm text-destructive" data-testid="error-down-payment">{downPaymentError}</p>
                  )}
                  {loanAmountError && !downPaymentError && (
                    <p className="text-sm text-destructive" data-testid="error-loan-amount">{loanAmountError}</p>
                  )}
                  {!downPaymentError && !loanAmountError && propertyPrice > 0 && downPayment > 0 && (
                    <p className="text-sm text-muted-foreground font-medium" data-testid="text-loan-amount">
                      ✓ Loan amount: ${loanAmount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={createStartDate}
                  onChange={(e) => setCreateStartDate(e.target.value)}
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amortization-years">Amortization (years)</Label>
                <Input
                  id="amortization-years"
                  type="number"
                  placeholder="25"
                  value={createAmortization}
                  onChange={(e) => setCreateAmortization(e.target.value)}
                  data-testid="input-amortization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-frequency">Payment Frequency</Label>
                <select
                  id="payment-frequency"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  value={createFrequency}
                  onChange={(e) => setCreateFrequency(e.target.value)}
                  data-testid="select-frequency"
                >
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="accelerated-biweekly">Accelerated Biweekly</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateMortgageOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Prevent submission if validation fails
                  if (!isFormValid) {
                    toast({
                      title: "Validation Error",
                      description: propertyPriceError || downPaymentError || loanAmountError || "Please fill in all required fields",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  const originalAmount = loanAmount;
                  
                  createMortgageMutation.mutate({
                    propertyPrice: propertyPrice.toString(),
                    downPayment: downPayment.toString(),
                    originalAmount: originalAmount.toString(),
                    currentBalance: originalAmount.toString(),
                    startDate: createStartDate,
                    amortizationYears: parseInt(createAmortization),
                    amortizationMonths: 0,
                    paymentFrequency: createFrequency,
                    annualPrepaymentLimitPercent: 20,
                  });
                }}
                disabled={!isFormValid || createMortgageMutation.isPending}
                data-testid="button-save-mortgage"
              >
                {createMortgageMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Mortgage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  // Show message if no term exists
  if (!uiCurrentTerm) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-2xl font-semibold">No Term Data</h2>
        <p className="text-muted-foreground">Create a mortgage term to start tracking payments.</p>
      </div>
    );
  }

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

  const effectiveRate = uiCurrentTerm.termType === "fixed" && uiCurrentTerm.fixedRate
    ? uiCurrentTerm.fixedRate.toFixed(2)
    : (parseFloat(primeRate) + uiCurrentTerm.lockedSpread).toFixed(2);

  const monthsRemainingInTerm = Math.round((new Date(uiCurrentTerm.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Mortgage</h1>
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
                      <p className="font-medium">{uiCurrentTerm?.termType === "fixed" ? "Fixed Rate" : "Variable Rate"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term Duration:</p>
                      <p className="font-medium">{uiCurrentTerm.termYears} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Locked Spread:</p>
                      <p className="font-medium font-mono">Prime {uiCurrentTerm.lockedSpread >= 0 ? '+' : ''} {uiCurrentTerm.lockedSpread}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Months Remaining:</p>
                      <p className="font-medium">{monthsRemainingInTerm} months</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-date">Payment Date</Label>
                  <Input 
                    id="payment-date" 
                    type="date" 
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    data-testid="input-payment-date" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Payment Amount</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    placeholder="2100.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    data-testid="input-payment-amount"
                  />
                </div>

                {uiCurrentTerm?.termType === "fixed" ? (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-1">Locked Fixed Rate</p>
                    <p className="text-2xl font-mono font-bold">{uiCurrentTerm.fixedRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rate is constant until {uiCurrentTerm.endDate}
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
                      Only Prime changes during your term. Your spread ({uiCurrentTerm.lockedSpread >= 0 ? '+' : ''}{uiCurrentTerm.lockedSpread}%) 
                      is locked until {uiCurrentTerm.endDate}
                    </p>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-1">Effective Rate</p>
                      <p className="text-2xl font-mono font-bold">{effectiveRate}%</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {primeRate}% (Prime) {uiCurrentTerm.lockedSpread >= 0 ? '+' : ''} {uiCurrentTerm.lockedSpread}% = {effectiveRate}%
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
                  {uiCurrentTerm?.termType.includes("variable-fixed") && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">New Amortization:</p>
                      <p className="font-mono font-medium">25.2 years</p>
                    </div>
                  )}
                </div>

                {uiCurrentTerm?.termType.includes("variable-fixed") && parseFloat(effectiveRate) > 6.0 && (
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
                    // TODO: Use calculation engine to compute principal/interest split
                    // For now, stub with 70/30 split as placeholder
                    const amount = parseFloat(paymentAmount) || 2100;
                    const principal = Math.round(amount * 0.3 * 100) / 100;
                    const interest = Math.round(amount * 0.7 * 100) / 100;
                    const lastBalance = paymentHistory[paymentHistory.length - 1]?.remainingBalance || Number(mortgage?.currentBalance || 400000);
                    const newBalance = lastBalance - principal;
                    
                    createPaymentMutation.mutate({
                      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
                      paymentAmount: amount,
                      principalPaid: principal,
                      interestPaid: interest,
                      remainingBalance: newBalance,
                      primeRate: parseFloat(primeRate),
                      effectiveRate: parseFloat(effectiveRate),
                      triggerRateHit: 0,
                      remainingAmortizationMonths: Math.round((paymentHistory[paymentHistory.length - 1]?.amortizationYears || 25) * 12),
                    });
                  }}
                  disabled={!paymentDate || !paymentAmount || createPaymentMutation.isPending}
                  data-testid="button-save-payment"
                >
                  {createPaymentMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Renew Mortgage Term</DialogTitle>
                  <DialogDescription>
                    Start a new term with a new rate or spread (typically every 3-5 years)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Your current term ends on {uiCurrentTerm.endDate}. Use this dialog to negotiate a new term with your lender.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="new-term-start">New Term Start Date</Label>
                    <Input 
                      id="new-term-start" 
                      type="date" 
                      value={renewalStartDate || uiCurrentTerm.endDate}
                      onChange={(e) => setRenewalStartDate(e.target.value)}
                      data-testid="input-term-start-date"
                    />
                    <p className="text-sm text-muted-foreground">
                      Usually the day after your current term ends
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-term-type">Mortgage Type</Label>
                    <Select 
                      value={renewalTermType} 
                      onValueChange={setRenewalTermType}
                    >
                      <SelectTrigger id="new-term-type" data-testid="select-term-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Rate</SelectItem>
                        <SelectItem value="variable-changing">Variable Rate (Changing Payment)</SelectItem>
                        <SelectItem value="variable-fixed">Variable Rate (Fixed Payment)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {renewalTermType === "fixed" && "Rate stays constant for the term"}
                      {renewalTermType === "variable-changing" && "Payment recalculates when Prime changes"}
                      {renewalTermType === "variable-fixed" && "Payment stays same, amortization extends if Prime rises"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-frequency">Payment Frequency</Label>
                    <Select 
                      value={renewalPaymentFrequency} 
                      onValueChange={setRenewalPaymentFrequency}
                    >
                      <SelectTrigger id="payment-frequency" data-testid="select-payment-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly (12 payments/year)</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly (26 payments/year)</SelectItem>
                        <SelectItem value="accelerated-biweekly">Accelerated Bi-weekly (pays off faster)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Accelerated bi-weekly pays your mortgage off faster by making the equivalent of one extra monthly payment per year
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term-length">Term Length</Label>
                    <Select value={renewalTermYears} onValueChange={setRenewalTermYears}>
                      <SelectTrigger id="term-length" data-testid="select-term-length">
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
                    <p className="text-sm text-muted-foreground">
                      Most Canadian mortgages are 3 or 5 year terms
                    </p>
                  </div>

                  <Separator />

                  {renewalTermType === "fixed" ? (
                    <div className="space-y-2">
                      <Label htmlFor="new-fixed-rate">Fixed Rate (%)</Label>
                      <Input 
                        id="new-fixed-rate" 
                        type="number" 
                        step="0.01" 
                        placeholder="5.49" 
                        value={renewalRate}
                        onChange={(e) => setRenewalRate(e.target.value)}
                        data-testid="input-fixed-rate"
                      />
                      <p className="text-sm text-muted-foreground">
                        This rate will be locked for the entire {renewalTermYears}-year term
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="new-spread">Negotiated Spread (Prime ± %)</Label>
                        <Input 
                          id="new-spread" 
                          type="number" 
                          step="0.01" 
                          placeholder="-0.65" 
                          value={renewalSpread}
                          onChange={(e) => setRenewalSpread(e.target.value)}
                          data-testid="input-spread"
                        />
                        <p className="text-sm text-muted-foreground">
                          Your lender offers Prime minus 0.65% (or Prime plus X%). This spread is locked for your term.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current-prime">Current Prime Rate (%)</Label>
                        <Input 
                          id="current-prime" 
                          type="number" 
                          step="0.01" 
                          placeholder="6.45" 
                          value={renewalPrime}
                          onChange={(e) => setRenewalPrime(e.target.value)}
                          data-testid="input-current-prime"
                        />
                        <p className="text-sm text-muted-foreground">
                          Current Bank of Canada Prime rate. This will change during your term, but your spread won't.
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTermRenewalOpen(false)} data-testid="button-cancel-renewal">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleTermRenewal}
                    data-testid="button-save-renewal"
                  >
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
                {uiCurrentTerm?.termType === "fixed" ? "Fixed Rate" : 
                 uiCurrentTerm?.termType === "variable-changing" ? "Variable (Changing Payment)" :
                 "Variable (Fixed Payment)"}
              </p>
              <Badge variant="outline" className="mt-2">
                {uiCurrentTerm?.termType === "fixed" && "Fixed"}
                {uiCurrentTerm?.termType === "variable-changing" && "VRM - Changing"}
                {uiCurrentTerm?.termType === "variable-fixed" && "VRM - Fixed"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment Frequency</p>
              <p className="text-base font-medium">
                {uiCurrentTerm.paymentFrequency === "monthly" && "Monthly"}
                {uiCurrentTerm.paymentFrequency === "biweekly" && "Bi-weekly"}
                {uiCurrentTerm.paymentFrequency === "accelerated-biweekly" && "Accelerated Bi-weekly"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {uiCurrentTerm.paymentFrequency === "monthly" && "12 payments/year"}
                {uiCurrentTerm.paymentFrequency === "biweekly" && "26 payments/year"}
                {uiCurrentTerm.paymentFrequency === "accelerated-biweekly" && "26 payments/year + extra"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Term Duration</p>
              <p className="text-base font-medium">{uiCurrentTerm.termYears} years</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ends {uiCurrentTerm.endDate}
              </p>
              <p className="text-xs text-muted-foreground">{monthsRemainingInTerm} months left</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {uiCurrentTerm?.termType === "fixed" ? "Locked Rate" : "Locked Spread"}
              </p>
              <p className="text-base font-medium font-mono">
                {uiCurrentTerm?.termType === "fixed" 
                  ? `${uiCurrentTerm.fixedRate}%`
                  : `Prime ${uiCurrentTerm.lockedSpread >= 0 ? '+' : ''}${uiCurrentTerm.lockedSpread}%`
                }
              </p>
            </div>
          </div>
          {uiCurrentTerm?.termType !== "fixed" && (
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
