import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { Plus, Download, AlertTriangle, RefreshCw, Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Separator } from "@/shared/ui/separator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/query-client";
import { useToast } from "@/shared/hooks/use-toast";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";
import { useMemo } from "react";
import { InfoTooltip } from "@/shared/ui/info-tooltip";
import { PageHeader } from "@/shared/ui/page-header";
import { useMortgageData } from "./hooks";
import {
  mortgageApi,
  mortgageQueryKeys,
  type CreateMortgagePayload,
  type CreateTermPayload,
  type UpdateMortgagePayload,
  type PrimeRateResponse,
} from "./api";

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
  paymentFrequency: "monthly" | "biweekly" | "accelerated-biweekly" | "semi-monthly" | "weekly" | "accelerated-weekly";
  regularPaymentAmount: number;
};

type UiPayment = {
  id: string;
  date: string;
  year: number;
  paymentPeriodLabel?: string;
  regularPaymentAmount: number;
  prepaymentAmount: number;
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
    paymentFrequency: term.paymentFrequency as "monthly" | "biweekly" | "accelerated-biweekly" | "semi-monthly" | "weekly" | "accelerated-weekly",
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
      paymentPeriodLabel: p.paymentPeriodLabel || undefined,
      regularPaymentAmount: Number(p.regularPaymentAmount || 0),
      prepaymentAmount: Number(p.prepaymentAmount || 0),
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

export default function MortgageFeature() {
  const { toast } = useToast();
  usePageTitle("Mortgage Tracking | Mortgage Strategy");
  
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
  const [renewalPaymentAmount, setRenewalPaymentAmount] = useState("");
  
  // Payment form state
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentPeriodLabel, setPaymentPeriodLabel] = useState("");
  const [regularPaymentAmount, setRegularPaymentAmount] = useState("");
  const [prepaymentAmount, setPrepaymentAmount] = useState("0");
  
  // Calculate total payment amount from regular + prepayment
  const totalPaymentAmount = (parseFloat(regularPaymentAmount) || 0) + (parseFloat(prepaymentAmount) || 0);
  
  // Create mortgage form state (multi-step wizard)
  const [isCreateMortgageOpen, setIsCreateMortgageOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [createPropertyPrice, setCreatePropertyPrice] = useState("");
  const [createDownPayment, setCreateDownPayment] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");
  const [createAmortization, setCreateAmortization] = useState("25");
  const [createFrequency, setCreateFrequency] = useState("monthly");
  // Step 2: Term details
  const [createTermType, setCreateTermType] = useState("variable-fixed");
  const [createTermYears, setCreateTermYears] = useState("5");
  const [createFixedRate, setCreateFixedRate] = useState("");
  const [createPrimeRate, setCreatePrimeRate] = useState("6.45");
  const [createSpread, setCreateSpread] = useState("-0.80");
  const [createPaymentAmount, setCreatePaymentAmount] = useState("");
  const [isCreatingMortgage, setIsCreatingMortgage] = useState(false);
  
  // Edit mortgage form state
  const [isEditMortgageOpen, setIsEditMortgageOpen] = useState(false);
  const [editPropertyPrice, setEditPropertyPrice] = useState("");
  const [editCurrentBalance, setEditCurrentBalance] = useState("");
  const [editPaymentFrequency, setEditPaymentFrequency] = useState("");
  
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

  const { mortgage, terms, payments, isLoading } = useMortgageData();

  // Fetch Bank of Canada prime rate
  const { data: primeRateData, isLoading: isPrimeRateLoading, refetch: refetchPrimeRate } = useQuery<PrimeRateResponse>({
    queryKey: mortgageQueryKeys.primeRate(),
    queryFn: () => mortgageApi.fetchPrimeRate(),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Auto-fill prime rate when data is fetched (only if field is empty to preserve user edits)
  useEffect(() => {
    if (primeRateData?.primeRate) {
      // Update create wizard prime rate only if empty
      if (isCreateMortgageOpen && createTermType !== "fixed" && !createPrimeRate) {
        setCreatePrimeRate(primeRateData.primeRate.toString());
      }
      // Update renewal dialog prime rate only if empty
      if (isTermRenewalOpen && renewalTermType !== "fixed" && !renewalPrime) {
        setRenewalPrime(primeRateData.primeRate.toString());
      }
      // Update global prime rate state
      setPrimeRate(primeRateData.primeRate.toString());
    }
  }, [primeRateData, isCreateMortgageOpen, isTermRenewalOpen, createTermType, renewalTermType]);

  // Normalize data to UI-friendly format
  const uiCurrentTerm = useMemo(() => normalizeTerm(terms ? terms[terms.length - 1] : undefined), [terms]);
  const paymentHistory = useMemo(() => normalizePayments(payments, terms), [payments, terms]);

  // Mutation for creating a new payment
  const createPaymentMutation = useMutation({
    mutationFn: async (payment: {
      paymentDate: string;
      paymentPeriodLabel?: string | null;
      regularPaymentAmount: number;
      prepaymentAmount: number;
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
      return mortgageApi.createPayment(mortgage.id, {
        termId: uiCurrentTerm.id,
        paymentDate: payment.paymentDate,
        paymentPeriodLabel: payment.paymentPeriodLabel || undefined,
        regularPaymentAmount: payment.regularPaymentAmount.toString(),
        prepaymentAmount: payment.prepaymentAmount.toString(),
        paymentAmount: payment.paymentAmount.toString(),
        principalPaid: payment.principalPaid.toFixed(2),
        interestPaid: payment.interestPaid.toFixed(2),
        remainingBalance: payment.remainingBalance.toFixed(2),
        primeRate: payment.primeRate ? payment.primeRate.toString() : undefined,
        effectiveRate: payment.effectiveRate.toString(),
        triggerRateHit: payment.triggerRateHit,
        remainingAmortizationMonths: payment.remainingAmortizationMonths,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgagePayments(mortgage?.id ?? null) });
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

  // Validate Step 2 inputs
  const isStep2Valid = () => {
    const paymentValid = createPaymentAmount && parseFloat(createPaymentAmount) > 0;
    if (createTermType === 'fixed') {
      return paymentValid && createFixedRate && parseFloat(createFixedRate) > 0;
    }
    return paymentValid && createSpread !== "" && createPrimeRate && parseFloat(createPrimeRate) > 0;
  };

  // Combined mutation for creating mortgage + initial term
  const createMortgageWithTerm = async () => {
    // Validate Step 2 before submission
    if (!isStep2Valid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required term details",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingMortgage(true);
    let newMortgageId: string | null = null;
    
    try {
      const originalAmount = loanAmount;
      const termYears = Number(createTermYears) || 5;
      const termStartDate = createStartDate;
      const termEndDate = new Date(termStartDate);
      termEndDate.setFullYear(termEndDate.getFullYear() + termYears);

      // Step 1: Create mortgage
      const newMortgage = await mortgageApi.createMortgage({
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
      newMortgageId = newMortgage.id;

      // Step 2: Create initial term
      await mortgageApi.createTerm(newMortgage.id, {
        termType: createTermType,
        startDate: termStartDate,
        endDate: termEndDate.toISOString().split('T')[0],
        termYears,
        fixedRate: createTermType === 'fixed' ? createFixedRate : undefined,
        lockedSpread: createTermType !== 'fixed' ? createSpread : "0",
        paymentFrequency: createFrequency,
        regularPaymentAmount: createPaymentAmount,
      });

      // Invalidate queries and show success
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      toast({
        title: "Mortgage created",
        description: "Your mortgage and initial term have been set up successfully",
      });
      
      // Reset form and close dialog
      setIsCreateMortgageOpen(false);
      setWizardStep(1);
      setCreatePropertyPrice("");
      setCreateDownPayment("");
      setCreateStartDate("");
      setCreateAmortization("25");
      setCreateFrequency("monthly");
      setCreateTermType("variable-fixed");
      setCreateTermYears("5");
      setCreateFixedRate("");
      setCreateSpread("-0.80");
      setCreatePaymentAmount("");
    } catch (error: any) {
      // Handle partial failure: mortgage created but term failed
      if (newMortgageId) {
        queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
        toast({
          title: "Term creation failed",
          description: "Mortgage was created but term setup failed. Please create a term manually.",
          variant: "destructive",
        });
        setIsCreateMortgageOpen(false);
        setWizardStep(1);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create mortgage",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreatingMortgage(false);
    }
  };

  // Mutation for creating a new term (renewal)
  const createTermMutation = useMutation({
    mutationFn: (term: CreateTermPayload) => {
      if (!mortgage?.id) throw new Error("No mortgage selected");
      return mortgageApi.createTerm(mortgage.id, term);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgageTerms(mortgage?.id ?? null) });
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

  // Mutation for editing mortgage
  const editMortgageMutation = useMutation({
    mutationFn: (updates: UpdateMortgagePayload) => {
      if (!mortgage?.id) throw new Error("No mortgage selected");
      return mortgageApi.updateMortgage(mortgage.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      toast({
        title: "Mortgage updated",
        description: "Your mortgage details have been updated successfully",
      });
      setIsEditMortgageOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update mortgage",
        variant: "destructive",
      });
    },
  });
  
  // Initialize edit form when dialog opens
  useEffect(() => {
    if (isEditMortgageOpen && mortgage) {
      setEditPropertyPrice(mortgage.propertyPrice || "");
      setEditCurrentBalance(mortgage.currentBalance || "");
      setEditPaymentFrequency(mortgage.paymentFrequency || "");
    }
  }, [isEditMortgageOpen, mortgage]);

  const handleTermRenewal = () => {
    const termYears = Number(renewalTermYears) || 5;
    const startDate = renewalStartDate || uiCurrentTerm?.endDate || new Date().toISOString().split('T')[0];
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + termYears);

    // Update prime rate if variable and user entered a value
    if (renewalTermType.startsWith('variable') && renewalPrime) {
      setPrimeRate(renewalPrime);
    }

    createTermMutation.mutate({
      termType: renewalTermType,
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      termYears,
      fixedRate: renewalTermType === 'fixed' ? renewalRate : undefined,
      lockedSpread: renewalTermType.startsWith('variable') ? renewalSpread : undefined,
      paymentFrequency: renewalPaymentFrequency,
      regularPaymentAmount: renewalPaymentAmount,
    });
  };

  // Show loading state while data fetches
  if (isLoading) {
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
        <Dialog open={isCreateMortgageOpen} onOpenChange={(open) => {
          setIsCreateMortgageOpen(open);
          if (!open) setWizardStep(1);
        }}>
          <DialogTrigger asChild>
            <Button size="lg" data-testid="button-create-mortgage">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Mortgage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {wizardStep === 1 ? "Step 1: Mortgage Details" : "Step 2: Term Details"}
              </DialogTitle>
              <DialogDescription>
                {wizardStep === 1 
                  ? "Enter your property and loan information" 
                  : "Set up your initial mortgage term with interest rate"}
              </DialogDescription>
              <div className="flex gap-2 pt-2">
                <div className={`h-1.5 flex-1 rounded-full ${wizardStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`h-1.5 flex-1 rounded-full ${wizardStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              </div>
            </DialogHeader>
            
            {wizardStep === 1 ? (
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
                      <p className="text-sm text-destructive">{propertyPriceError}</p>
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
                      <p className="text-sm text-destructive">{downPaymentError}</p>
                    )}
                    {loanAmountError && !downPaymentError && (
                      <p className="text-sm text-destructive">{loanAmountError}</p>
                    )}
                    {!downPaymentError && !loanAmountError && propertyPrice > 0 && downPayment > 0 && (
                      <p className="text-sm text-muted-foreground font-medium">
                        Loan amount: ${loanAmount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Mortgage Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={createStartDate}
                    onChange={(e) => setCreateStartDate(e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amortization-years">Amortization (years)</Label>
                    <Select value={createAmortization} onValueChange={setCreateAmortization}>
                      <SelectTrigger data-testid="select-amortization">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 Years</SelectItem>
                        <SelectItem value="20">20 Years</SelectItem>
                        <SelectItem value="25">25 Years</SelectItem>
                        <SelectItem value="30">30 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-frequency">Payment Frequency</Label>
                    <Select value={createFrequency} onValueChange={setCreateFrequency}>
                      <SelectTrigger data-testid="select-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="accelerated-biweekly">Accelerated Bi-weekly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p><strong>Loan:</strong> ${loanAmount.toLocaleString()} over {createAmortization} years</p>
                  <p><strong>Payments:</strong> {createFrequency.replace('-', ' ')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Mortgage Type</Label>
                      <InfoTooltip content="Fixed: Rate stays constant. Variable: Rate adjusts with Prime rate." />
                    </div>
                    <Select value={createTermType} onValueChange={setCreateTermType}>
                      <SelectTrigger data-testid="select-term-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Rate</SelectItem>
                        <SelectItem value="variable-changing">Variable (Changing Payment)</SelectItem>
                        <SelectItem value="variable-fixed">Variable (Fixed Payment)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Term Length</Label>
                    <Select value={createTermYears} onValueChange={setCreateTermYears}>
                      <SelectTrigger data-testid="select-term-years">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="2">2 Years</SelectItem>
                        <SelectItem value="3">3 Years</SelectItem>
                        <SelectItem value="5">5 Years</SelectItem>
                        <SelectItem value="7">7 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {createTermType === "fixed" ? (
                  <div className="space-y-2">
                    <Label htmlFor="fixed-rate">Fixed Interest Rate (%)</Label>
                    <Input
                      id="fixed-rate"
                      type="number"
                      step="0.01"
                      placeholder="4.99"
                      value={createFixedRate}
                      onChange={(e) => setCreateFixedRate(e.target.value)}
                      data-testid="input-fixed-rate"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="prime-rate">Current Prime Rate (%)</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => refetchPrimeRate()}
                          disabled={isPrimeRateLoading}
                          data-testid="button-refresh-prime"
                        >
                          {isPrimeRateLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          <span className="ml-1">Refresh</span>
                        </Button>
                      </div>
                      <Input
                        id="prime-rate"
                        type="number"
                        step="0.01"
                        placeholder="6.45"
                        value={createPrimeRate}
                        onChange={(e) => setCreatePrimeRate(e.target.value)}
                        data-testid="input-prime-rate"
                      />
                      {primeRateData && (
                        <p className="text-xs text-muted-foreground">
                          Bank of Canada rate as of {new Date(primeRateData.effectiveDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spread">Your Spread (+/- from Prime)</Label>
                      <Input
                        id="spread"
                        type="number"
                        step="0.01"
                        placeholder="-0.80"
                        value={createSpread}
                        onChange={(e) => setCreateSpread(e.target.value)}
                        data-testid="input-spread"
                      />
                      <p className="text-xs text-muted-foreground">
                        Effective rate: {(parseFloat(createPrimeRate || "0") + parseFloat(createSpread || "0")).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Regular Payment Amount ($)</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    placeholder="2500.00"
                    value={createPaymentAmount}
                    onChange={(e) => setCreatePaymentAmount(e.target.value)}
                    data-testid="input-payment-amount"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              {wizardStep === 1 ? (
                <>
                  <Button variant="outline" onClick={() => setIsCreateMortgageOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!isFormValid) {
                        toast({
                          title: "Validation Error",
                          description: propertyPriceError || downPaymentError || loanAmountError || "Please fill in all required fields",
                          variant: "destructive",
                        });
                        return;
                      }
                      setWizardStep(2);
                    }}
                    disabled={!isFormValid}
                    data-testid="button-next-step"
                  >
                    Next: Term Details
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setWizardStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={createMortgageWithTerm}
                    disabled={isCreatingMortgage || !isStep2Valid()}
                    data-testid="button-create-mortgage-term"
                  >
                    {isCreatingMortgage && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Mortgage
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  // Show message if no term exists - with create term dialog
  if (!uiCurrentTerm) {
    const defaultStartDate = mortgage?.startDate || new Date().toISOString().split('T')[0];
    const termYears = Number(renewalTermYears) || 5;
    const getEndDate = (start: string, years: number) => {
      const d = new Date(start);
      d.setFullYear(d.getFullYear() + years);
      return d.toISOString().split('T')[0];
    };

    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">No Term Data</h2>
          <p className="text-muted-foreground max-w-md">
            Your mortgage has been created! Now create your first mortgage term to start tracking payments.
          </p>
        </div>
        
        <Dialog open={isTermRenewalOpen} onOpenChange={setIsTermRenewalOpen}>
          <DialogTrigger asChild>
            <Button size="lg" data-testid="button-create-first-term">
              <Plus className="h-5 w-5 mr-2" />
              Create First Term
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Mortgage Term</DialogTitle>
              <DialogDescription>
                Set up your initial mortgage term with interest rate and payment details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="first-term-start">Term Start Date</Label>
                <Input 
                  id="first-term-start" 
                  type="date" 
                  value={renewalStartDate || defaultStartDate}
                  onChange={(e) => setRenewalStartDate(e.target.value)}
                  data-testid="input-first-term-start-date"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="first-term-type">Mortgage Type</Label>
                  <InfoTooltip content="Fixed Rate: Interest rate stays the same for the entire term. Variable-Changing Payment: Your payment adjusts when Prime rate changes. Variable-Fixed Payment: Payment stays constant, but if Prime rises too much, you may hit the 'trigger rate'." />
                </div>
                <Select value={renewalTermType} onValueChange={setRenewalTermType}>
                  <SelectTrigger id="first-term-type" data-testid="select-first-term-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Rate</SelectItem>
                    <SelectItem value="variable-changing">Variable Rate (Changing Payment)</SelectItem>
                    <SelectItem value="variable-fixed">Variable Rate (Fixed Payment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first-payment-frequency">Payment Frequency</Label>
                <Select value={renewalPaymentFrequency} onValueChange={setRenewalPaymentFrequency}>
                  <SelectTrigger id="first-payment-frequency" data-testid="select-first-payment-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly (12 payments/year)</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly (26 payments/year)</SelectItem>
                    <SelectItem value="accelerated-biweekly">Accelerated Bi-weekly</SelectItem>
                    <SelectItem value="semi-monthly">Semi-monthly (24 payments/year)</SelectItem>
                    <SelectItem value="weekly">Weekly (52 payments/year)</SelectItem>
                    <SelectItem value="accelerated-weekly">Accelerated Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first-term-length">Term Length</Label>
                <Select value={renewalTermYears} onValueChange={setRenewalTermYears}>
                  <SelectTrigger id="first-term-length" data-testid="select-first-term-length">
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

              {renewalTermType === "fixed" ? (
                <div className="space-y-2">
                  <Label htmlFor="first-fixed-rate">Fixed Interest Rate (%)</Label>
                  <Input
                    id="first-fixed-rate"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 4.99"
                    value={renewalRate}
                    onChange={(e) => setRenewalRate(e.target.value)}
                    data-testid="input-first-fixed-rate"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="first-prime-rate">Current Prime Rate (%)</Label>
                    <Input
                      id="first-prime-rate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 6.45"
                      value={renewalPrime || primeRate}
                      onChange={(e) => setRenewalPrime(e.target.value)}
                      data-testid="input-first-prime-rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="first-spread">Your Spread (+/- from Prime)</Label>
                    <Input
                      id="first-spread"
                      type="number"
                      step="0.01"
                      placeholder="e.g., -0.80 (Prime minus 0.80%)"
                      value={renewalSpread}
                      onChange={(e) => setRenewalSpread(e.target.value)}
                      data-testid="input-first-spread"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="first-payment-amount">Regular Payment Amount ($)</Label>
                <Input
                  id="first-payment-amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2500.00"
                  value={renewalPaymentAmount}
                  onChange={(e) => setRenewalPaymentAmount(e.target.value)}
                  data-testid="input-first-payment-amount"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTermRenewalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const startDate = renewalStartDate || defaultStartDate;
                  const endDate = getEndDate(startDate, termYears);
                  
                  createTermMutation.mutate({
                    termType: renewalTermType,
                    startDate,
                    endDate,
                    termYears,
                    lockedSpread: renewalTermType !== "fixed" ? renewalSpread : "0",
                    fixedRate: renewalTermType === "fixed" ? renewalRate : undefined,
                    paymentFrequency: renewalPaymentFrequency,
                    regularPaymentAmount: renewalPaymentAmount,
                  });
                }}
                disabled={createTermMutation.isPending || !renewalPaymentAmount || (renewalTermType === "fixed" ? !renewalRate : !renewalSpread)}
                data-testid="button-save-first-term"
              >
                {createTermMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Term
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const summaryStats = {
    totalPayments: paymentHistory.length,
    totalPaid: paymentHistory.reduce((sum, p) => sum + p.paymentAmount, 0),
    totalPrincipal: paymentHistory.reduce((sum, p) => sum + p.principal, 0),
    totalInterest: paymentHistory.reduce((sum, p) => sum + p.interest, 0),
    currentBalance: mortgage ? Number(mortgage.currentBalance) : (paymentHistory[paymentHistory.length - 1]?.remainingBalance || 400000),
    currentRate: paymentHistory[paymentHistory.length - 1]?.effectiveRate || 5.65,
    currentPrimeRate: paymentHistory[paymentHistory.length - 1]?.primeRate || 6.45,
    amortizationYears: mortgage ? mortgage.amortizationYears : (paymentHistory[paymentHistory.length - 1]?.amortizationYears || 25.0),
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
      <PageHeader
        title="Mortgage"
        description="Track your actual mortgage payments (Canadian term-based mortgages)"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" data-testid="button-edit-mortgage" onClick={() => setIsEditMortgageOpen(true)}>
              Edit Details
            </Button>
            <Button data-testid="button-add-payment" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Log Payment
            </Button>
          </div>
        }
      />

      <Dialog open={isEditMortgageOpen} onOpenChange={setIsEditMortgageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Mortgage Details</DialogTitle>
            <DialogDescription>Update your property value, current balance, and payment settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-property-price">Property Value ($)</Label>
              <Input
                id="edit-property-price"
                type="number"
                placeholder="650000"
                value={editPropertyPrice}
                onChange={(e) => setEditPropertyPrice(e.target.value)}
                data-testid="input-edit-property-price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-current-balance">Current Balance ($)</Label>
              <Input
                id="edit-current-balance"
                type="number"
                placeholder="550000"
                value={editCurrentBalance}
                onChange={(e) => setEditCurrentBalance(e.target.value)}
                data-testid="input-edit-current-balance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-payment-frequency">Payment Frequency</Label>
              <Select value={editPaymentFrequency} onValueChange={setEditPaymentFrequency}>
                <SelectTrigger data-testid="select-edit-payment-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="accelerated-biweekly">Accelerated Biweekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="accelerated-weekly">Accelerated Weekly</SelectItem>
                  <SelectItem value="semi-monthly">Semi-monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMortgageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                editMortgageMutation.mutate({
                  propertyPrice: editPropertyPrice,
                  currentBalance: editCurrentBalance,
                  paymentFrequency: editPaymentFrequency,
                });
              }}
              disabled={editMortgageMutation.isPending || !editPropertyPrice || !editCurrentBalance}
              data-testid="button-save-edit-mortgage"
            >
              {editMortgageMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Mortgage Payment</DialogTitle>
            <DialogDescription>Record a mortgage payment (using your current term's locked rate/spread)</DialogDescription>
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
                  <p className="font-medium font-mono">
                    Prime {uiCurrentTerm.lockedSpread >= 0 ? "+" : ""}
                    {uiCurrentTerm.lockedSpread}%
                  </p>
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
              <Label htmlFor="payment-period">Payment Period (Optional)</Label>
              <Input
                id="payment-period"
                type="text"
                placeholder="e.g., January 2025, Payment #23, Week 3"
                value={paymentPeriodLabel}
                onChange={(e) => setPaymentPeriodLabel(e.target.value)}
                data-testid="input-payment-period"
              />
              <p className="text-xs text-muted-foreground">Label to identify which scheduled payment this is</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regular-payment">Regular Payment ($)</Label>
                <Input
                  id="regular-payment"
                  type="number"
                  step="0.01"
                  placeholder="2100.00"
                  value={regularPaymentAmount}
                  onChange={(e) => setRegularPaymentAmount(e.target.value)}
                  data-testid="input-regular-payment"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prepayment-amount">Prepayment ($)</Label>
                <Input
                  id="prepayment-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={prepaymentAmount}
                  onChange={(e) => setPrepaymentAmount(e.target.value)}
                  data-testid="input-prepayment-amount"
                />
              </div>
            </div>

            <div className="p-3 bg-accent/30 rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Total Payment</p>
              <p className="text-2xl font-mono font-bold" data-testid="text-total-payment">
                ${totalPaymentAmount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Regular (${parseFloat(regularPaymentAmount) || 0}) + Prepayment (${parseFloat(prepaymentAmount) || 0})
              </p>
            </div>

            {uiCurrentTerm?.termType === "fixed" ? (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Locked Fixed Rate</p>
                <p className="text-2xl font-mono font-bold">{uiCurrentTerm.fixedRate}%</p>
                <p className="text-sm text-muted-foreground mt-1">Rate is constant until {uiCurrentTerm.endDate}</p>
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
                  Only Prime changes during your term. Your spread ({uiCurrentTerm.lockedSpread >= 0 ? "+" : ""}
                  {uiCurrentTerm.lockedSpread}%) is locked until {uiCurrentTerm.endDate}
                </p>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Effective Rate</p>
                  <p className="text-2xl font-mono font-bold">{effectiveRate}%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {primeRate}% (Prime) {uiCurrentTerm.lockedSpread >= 0 ? "+" : ""} {uiCurrentTerm.lockedSpread}% ={" "}
                    {effectiveRate}%
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
                const regularPayment = parseFloat(regularPaymentAmount) || 0;
                const prepayment = parseFloat(prepaymentAmount) || 0;
                const totalAmount = regularPayment + prepayment;

                const principal = Math.round(totalAmount * 0.3 * 100) / 100;
                const interest = Math.round(totalAmount * 0.7 * 100) / 100;
                const lastBalance =
                  paymentHistory[paymentHistory.length - 1]?.remainingBalance || Number(mortgage?.currentBalance || 400000);
                const newBalance = lastBalance - principal;

                createPaymentMutation.mutate({
                  paymentDate: paymentDate || new Date().toISOString().split("T")[0],
                  paymentPeriodLabel: paymentPeriodLabel || null,
                  regularPaymentAmount: regularPayment,
                  prepaymentAmount: prepayment,
                  paymentAmount: totalAmount,
                  principalPaid: principal,
                  interestPaid: interest,
                  remainingBalance: newBalance,
                  primeRate: parseFloat(primeRate),
                  effectiveRate: parseFloat(effectiveRate),
                  triggerRateHit: 0,
                  remainingAmortizationMonths: Math.round((paymentHistory[paymentHistory.length - 1]?.amortizationYears || 25) * 12),
                });
              }}
              disabled={!paymentDate || !regularPaymentAmount || createPaymentMutation.isPending}
              data-testid="button-save-payment"
            >
              {createPaymentMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="new-term-type">Mortgage Type</Label>
                      <InfoTooltip content="Fixed Rate: Interest rate stays the same for the entire term. Variable-Changing Payment: Your payment adjusts when Prime rate changes. Variable-Fixed Payment: Payment stays constant, but if Prime rises too much, you may hit the 'trigger rate' where payment doesn't cover interest." />
                    </div>
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
                        <SelectItem value="semi-monthly">Semi-monthly (24 payments/year)</SelectItem>
                        <SelectItem value="weekly">Weekly (52 payments/year)</SelectItem>
                        <SelectItem value="accelerated-weekly">Accelerated Weekly (pays off faster)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Accelerated payments pay your mortgage off faster by making the equivalent of one extra monthly payment per year
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
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-payment-amount">Regular Payment Amount ($)</Label>
                    <Input 
                      id="new-payment-amount" 
                      type="number" 
                      step="0.01" 
                      placeholder="2100.00" 
                      value={renewalPaymentAmount}
                      onChange={(e) => setRenewalPaymentAmount(e.target.value)}
                      data-testid="input-payment-amount"
                    />
                    <p className="text-sm text-muted-foreground">
                      Your regular payment amount for this term. This can be calculated based on your balance and rate.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTermRenewalOpen(false)} data-testid="button-cancel-renewal">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleTermRenewal}
                    disabled={
                      !renewalStartDate || 
                      !renewalTermYears || 
                      (renewalTermType === 'fixed' && !renewalRate) ||
                      (renewalTermType.startsWith('variable') && (!renewalSpread || !renewalPrime)) ||
                      !renewalPaymentAmount
                    }
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
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Prime</TableHead>
                  <TableHead className="text-right">Spread</TableHead>
                  <TableHead className="text-right">Eff. Rate</TableHead>
                  <TableHead className="text-right">Regular</TableHead>
                  <TableHead className="text-right">Prepayment</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Amort.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
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
                      <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                        {payment.paymentPeriodLabel || "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {payment.primeRate ? `${payment.primeRate}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {payment.termSpread !== undefined ? `${payment.termSpread >= 0 ? '+' : ''}${payment.termSpread}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{payment.effectiveRate}%</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        ${payment.regularPaymentAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {payment.prepaymentAmount > 0 ? (
                          <span className="text-primary font-medium">+${payment.prepaymentAmount.toLocaleString()}</span>
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
