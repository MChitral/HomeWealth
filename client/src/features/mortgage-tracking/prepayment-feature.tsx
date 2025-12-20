import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calculator, DollarSign, Calendar, TrendingDown, PiggyBank } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Separator } from "@/shared/ui/separator";
import { Progress } from "@/shared/ui/progress";
import { useMortgageTrackingState } from "./hooks/use-mortgage-tracking-state";
import { getEffectivePeriodicRate, getPaymentsPerYear } from "./utils/mortgage-math";
import { formatCurrency } from "@/shared/lib/utils";
import { useToast } from "@/shared/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format, addMonths } from "date-fns";

export default function PrepaymentFeature() {
  const { mortgage, uiCurrentTerm, summaryStats, createPaymentMutation, isLoading } =
    useMortgageTrackingState();
  const { toast } = useToast();

  // Redirect if no mortgage selected (handled by layout/parent usually, but good safe guard)
  // For now we assume context is loaded.

  // --- State ---
  const [simulationType, setSimulationType] = useState<"lump-sum" | "payment-increase">("lump-sum");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // --- Data Fetching ---
  // Fetch prepayment opportunity data to get surplus
  // We reuse the hook or fetch logic from PrepaymentCard if possible,
  // but simpler to just fetch surplus here or pass it in.
  // For now, we'll fetch it directly to be self-contained.
  const { data: opportunityData } = useQuery({
    queryKey: ["prepayment-opportunity", mortgage?.id],
    queryFn: async () => {
      if (!mortgage?.id) return null;
      const res = await fetch(`/api/prepayment/${mortgage.id}/opportunity`);
      if (!res.ok) throw new Error("Failed to fetch opportunity");
      return res.json();
    },
    enabled: !!mortgage?.id,
  });

  // --- Calculations ---
  // 1. Current Trajectory
  const currentPayoffDate = useMemo(() => {
    if (!summaryStats) return null;
    const today = new Date();
    // Crude estimate based on amortization years remaining
    // Better: use the math utils.
    // Let's use currentBalance, rate, payment.
    if (!mortgage || !uiCurrentTerm) return null;

    // We already have summaryStats.amortizationYears
    const months = Math.round(summaryStats.amortizationYears * 12);
    return addMonths(today, months);
  }, [summaryStats, mortgage, uiCurrentTerm]);

  // 2. Simulated Trajectory
  const simulationResults = useMemo(() => {
    if (!mortgage || !uiCurrentTerm || !amount || parseFloat(amount) <= 0 || !summaryStats)
      return null;

    const simAmount = parseFloat(amount);
    const currentBalance = summaryStats.currentBalance;
    const rateDecimal = summaryStats.currentRate / 100;
    const regPayment = uiCurrentTerm.regularPaymentAmount;
    const frequency = uiCurrentTerm.paymentFrequency;

    const paymentsPerYear = getPaymentsPerYear(frequency);
    const periodicRate = getEffectivePeriodicRate(rateDecimal, frequency);

    let simulatedBalance = currentBalance;
    let simulatedPayment = regPayment;

    if (simulationType === "lump-sum") {
      simulatedBalance = Math.max(0, currentBalance - simAmount);
    } else {
      simulatedPayment = regPayment + simAmount;
    }

    const runLoop = (startBalance: number, pmt: number) => {
      let tempBalance = startBalance;
      let totalInterest = 0;
      let periods = 0;
      const maxPeriods = 100 * paymentsPerYear; // 100 years cap

      while (tempBalance > 0 && periods < maxPeriods) {
        const interest = tempBalance * periodicRate;
        totalInterest += interest;
        const principal = pmt - interest;

        if (principal <= 0 && startBalance > 0) {
          periods = maxPeriods;
          break;
        }

        tempBalance -= principal;
        periods++;
      }
      return { periods, totalInterest };
    };

    const simResult = runLoop(simulatedBalance, simulatedPayment);
    const origResult = runLoop(currentBalance, regPayment);

    const interestSaved = Math.max(0, origResult.totalInterest - simResult.totalInterest);

    const simMonths = Math.ceil((simResult.periods / paymentsPerYear) * 12);
    const origMonths = Math.ceil((origResult.periods / paymentsPerYear) * 12);

    const timeSavedMonths = Math.max(0, origMonths - simMonths);
    const newPayoffDate = addMonths(new Date(), simMonths);

    return {
      newPayoffDate,
      interestSaved,
      timeSavedMonths,
    };
  }, [amount, simulationType, mortgage, uiCurrentTerm, summaryStats]);

  // --- Handlers ---
  const handleSave = () => {
    if (!mortgage || !amount || !uiCurrentTerm) return;

    if (simulationType === "lump-sum") {
      const numAmount = parseFloat(amount);
      const currentBalance = summaryStats?.currentBalance || 0;
      // Assume pure principal prepayment for this simplified view
      const newBalance = Math.max(0, currentBalance - numAmount);

      // Calculate remaining amortization for the payload
      // We can use the simulation logic's result or a quick re-calc
      // Re-using the simulation logic from useMemo if available would be best, but it might be null.
      // Let's do a quick calc:
      const rate = summaryStats?.currentRate ? summaryStats.currentRate / 100 : 0;
      let months = 0;
      if (newBalance > 0 && rate > 0) {
        // rough NPER
        const monthlyRate = Math.pow(1 + rate / 2, 2 / 12) - 1;
        const payment = uiCurrentTerm.regularPaymentAmount;
        if (payment > newBalance * monthlyRate) {
          const nper =
            -Math.log(1 - (monthlyRate * newBalance) / payment) / Math.log(1 + monthlyRate);
          months = Math.ceil(nper);
        }
      }

      createPaymentMutation.mutate(
        {
          paymentDate: date,
          regularPaymentAmount: 0,
          prepaymentAmount: numAmount,
          paymentAmount: numAmount,
          principalPaid: numAmount,
          interestPaid: 0,
          remainingBalance: newBalance,
          effectiveRate: summaryStats?.currentRate || 0,
          primeRate: summaryStats?.currentPrimeRate,
          triggerRateHit: 0,
          remainingAmortizationMonths: months,
          paymentPeriodLabel: "Lump Sum Prepayment",
        },
        {
          onSuccess: () => {
            toast({
              title: "Prepayment Logged",
              description: "Your prepayment has been recorded.",
            });
            setAmount("");
          },
        }
      );
    } else {
      // Payment Increase logic would go here (requires updateTermMutation or new logic)
      toast({
        title: "Coming Soon",
        description: "Update your term details to change regular payments.",
      });
    }
  };

  const handleUseSurplus = () => {
    if (opportunityData?.monthlySurplus) {
      setAmount(opportunityData.monthlySurplus.toString());
      setSimulationType("payment-increase"); // Surplus implies monthly usually, but could be lump sum accumulated
    }
  };

  const handleUseRoom = () => {
    if (opportunityData?.prepaymentRoom) {
      setAmount(opportunityData.prepaymentRoom.remaining.toString());
      setSimulationType("lump-sum");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!mortgage || !uiCurrentTerm)
    return (
      <div className="p-8 text-center">Please select a mortgage from the dashboard first.</div>
    );

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prepayment Simulator</h1>
          <p className="text-muted-foreground">
            Visualize the impact of extra payments on your mortgage freedom date.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Context & Input */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mortgage Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="font-semibold">
                  {formatCurrency(summaryStats?.currentBalance || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-semibold">{summaryStats?.currentRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Payoff</span>
                <span className="font-semibold">
                  {currentPayoffDate ? format(currentPayoffDate, "MMM yyyy") : "-"}
                </span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Surplus</span>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-green-600 hover:bg-transparent hover:underline"
                    onClick={handleUseSurplus}
                  >
                    {opportunityData?.monthlySurplus
                      ? formatCurrency(Number(opportunityData.monthlySurplus))
                      : "$0.00"}
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Annual Limit Remaining</span>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-blue-600 hover:bg-transparent hover:underline"
                    onClick={handleUseRoom}
                  >
                    {opportunityData?.prepaymentRoom
                      ? formatCurrency(Number(opportunityData.prepaymentRoom.remaining))
                      : "$0.00"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configure Prepayment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Prepayment Type</Label>
                <RadioGroup
                  value={simulationType}
                  onValueChange={(v) => setSimulationType(v as any)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="lump-sum" id="lump-sum" />
                    <Label htmlFor="lump-sum" className="cursor-pointer">
                      Lump Sum
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="payment-increase" id="payment-increase" />
                    <Label htmlFor="payment-increase" className="cursor-pointer">
                      Monthly +
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-9"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-9"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Impact Visualization */}
        <div className="md:col-span-7 space-y-6">
          <Card className="h-full border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                Projected Impact
              </CardTitle>
              <CardDescription>See how this change affects your mortgage freedom.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {!simulationResults ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground space-y-4">
                  <Calculator className="h-16 w-16 opacity-20" />
                  <p>Enter an amount to see the impact.</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-background rounded-xl border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <PiggyBank className="h-4 w-4" />
                        Interest Saved
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(simulationResults.interestSaved)}
                      </div>
                    </div>
                    <div className="p-4 bg-background rounded-xl border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Time Saved
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.floor(simulationResults.timeSavedMonths / 12)}y{" "}
                        {simulationResults.timeSavedMonths % 12}m
                      </div>
                    </div>
                  </div>

                  {/* Payoff Date Comparison */}
                  <div className="space-y-4 p-6 bg-background rounded-xl border">
                    <h3 className="font-semibold">Mortgage Freedom Date</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Original Projection</span>
                        <span className="font-mono text-lg text-muted-foreground">
                          {currentPayoffDate ? format(currentPayoffDate, "MMMM yyyy") : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-green-700">New Projection</span>
                        <span className="font-mono text-2xl font-bold text-green-600">
                          {format(simulationResults.newPayoffDate, "MMMM yyyy")}
                        </span>
                      </div>
                      {/* Visual Bar representation could go here */}
                      <Progress value={100} className="h-2 bg-green-100" />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setAmount("")}>
                      Clear
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {simulationType === "lump-sum"
                        ? "Log This Prepayment"
                        : "Update Payment Plan"}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    * Estimations based on current rate ({summaryStats.currentRate.toFixed(2)}%)
                    remaining constant. Actual savings may vary with variable rates.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
