import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Separator } from "@/shared/ui/separator";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Calculator,
  Target,
  Clock,
  DollarSign,
} from "lucide-react";
import type { Mortgage } from "@shared/schema";
import type { UiTerm, UiPayment } from "../types";
import { formatCurrency } from "@/shared/lib/utils";
import { Alert, AlertDescription } from "@/shared/ui/alert";

interface PrepaymentStrategyRecommendationsProps {
  mortgage: Mortgage;
  currentTerm: UiTerm | null;
  payments: UiPayment[];
  currentBalance: number;
  currentRate: number;
  onUseAmount: (amount: number, type: "lump-sum" | "payment-increase") => void;
}

interface PrepaymentScenario {
  amount: number;
  type: "lump-sum" | "payment-increase";
  interestSavings: number;
  timeSavedMonths: number;
  newPayoffDate: Date;
  roi: number;
}

interface InvestmentComparison {
  prepaymentInterestSavings: number;
  investmentReturns: number;
  netDifference: number;
  recommendation: "prepayment" | "investment" | "balanced";
  reasoning: string;
}

export function PrepaymentStrategyRecommendations({
  mortgage,
  currentTerm,
  payments,
  currentBalance,
  currentRate,
  onUseAmount,
}: PrepaymentStrategyRecommendationsProps) {
  const [investmentRate, setInvestmentRate] = useState<string>("7");
  const [comparisonYears, setComparisonYears] = useState<number>(10);
  const [taxRate, setTaxRate] = useState<string>("30");

  // Calculate optimal prepayment scenarios
  const recommendations = useMemo(() => {
    if (!currentTerm || currentBalance <= 0 || currentRate <= 0) return [];

    const scenarios: PrepaymentScenario[] = [];
    const rateDecimal = currentRate / 100;
    const monthlyRate = Math.pow(1 + rateDecimal / 2, 2 / 12) - 1; // Semi-annual compounding
    const regularPayment = currentTerm.regularPaymentAmount;

    // Scenario 1: Small lump sum (e.g., $5,000)
    const smallLumpSum = Math.min(5000, currentBalance * 0.05);
    if (smallLumpSum >= 100) {
      const scenario = calculatePrepaymentImpact(
        currentBalance,
        smallLumpSum,
        "lump-sum",
        monthlyRate,
        regularPayment
      );
      if (scenario) scenarios.push(scenario);
    }

    // Scenario 2: Medium lump sum (e.g., $10,000)
    const mediumLumpSum = Math.min(10000, currentBalance * 0.1);
    if (mediumLumpSum >= 100) {
      const scenario = calculatePrepaymentImpact(
        currentBalance,
        mediumLumpSum,
        "lump-sum",
        monthlyRate,
        regularPayment
      );
      if (scenario) scenarios.push(scenario);
    }

    // Scenario 3: Payment increase (e.g., $200/month)
    const paymentIncrease = Math.min(200, regularPayment * 0.1);
    if (paymentIncrease >= 50) {
      const scenario = calculatePrepaymentImpact(
        currentBalance,
        paymentIncrease,
        "payment-increase",
        monthlyRate,
        regularPayment
      );
      if (scenario) scenarios.push(scenario);
    }

    // Scenario 4: Maximize annual prepayment limit
    const annualLimit =
      Number(mortgage.originalAmount) * ((mortgage.annualPrepaymentLimitPercent || 20) / 100);
    if (annualLimit >= 1000 && annualLimit <= currentBalance) {
      const scenario = calculatePrepaymentImpact(
        currentBalance,
        annualLimit,
        "lump-sum",
        monthlyRate,
        regularPayment
      );
      if (scenario) scenarios.push(scenario);
    }

    return scenarios.sort((a, b) => b.roi - a.roi);
  }, [currentTerm, currentBalance, currentRate, mortgage, payments.length]);

  // Calculate prepayment vs investment comparison
  const investmentComparison = useMemo((): InvestmentComparison | null => {
    if (!recommendations.length || !investmentRate) return null;

    const invRate = parseFloat(investmentRate) / 100;
    const taxRateDecimal = parseFloat(taxRate) / 100;
    const prepaymentAmount = recommendations[0]?.amount || 10000;
    const prepaymentSavings = recommendations[0]?.interestSavings || 0;

    // Investment returns (after tax)
    const investmentGains = prepaymentAmount * (Math.pow(1 + invRate, comparisonYears) - 1);
    const investmentAfterTax = investmentGains * (1 - taxRateDecimal);

    // Prepayment interest savings (tax-free, guaranteed)
    const prepaymentSavingsTotal = prepaymentSavings;

    const netDifference = prepaymentSavingsTotal - investmentAfterTax;

    let recommendation: "prepayment" | "investment" | "balanced";
    let reasoning: string;

    if (netDifference > prepaymentSavingsTotal * 0.1) {
      recommendation = "prepayment";
      reasoning = `Prepayment saves $${formatCurrency(Math.abs(netDifference))} more than investing, and it's guaranteed and tax-free.`;
    } else if (netDifference < -prepaymentSavingsTotal * 0.1) {
      recommendation = "investment";
      reasoning = `Investing could yield $${formatCurrency(Math.abs(netDifference))} more, but requires accepting market risk.`;
    } else {
      recommendation = "balanced";
      reasoning = `Both strategies are close. Consider your risk tolerance and tax situation.`;
    }

    return {
      prepaymentInterestSavings: prepaymentSavingsTotal,
      investmentReturns: investmentAfterTax,
      netDifference,
      recommendation,
      reasoning,
    };
  }, [recommendations, investmentRate, comparisonYears, taxRate]);

  // Optimal timing recommendation
  const timingRecommendation = useMemo(() => {
    if (!currentTerm) return null;

    const today = new Date();
    const termEndDate = new Date(currentTerm.endDate);
    const monthsToRenewal = Math.max(
      0,
      (termEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    if (monthsToRenewal < 6) {
      return {
        timing: "soon",
        message:
          "Consider waiting until renewal to make larger prepayments, as you may avoid penalties.",
      };
    } else if (monthsToRenewal > 18) {
      return {
        timing: "now",
        message:
          "Good time to prepay - you have plenty of time until renewal and will maximize interest savings.",
      };
    } else {
      return {
        timing: "moderate",
        message: "Prepayments are beneficial. Monitor your prepayment limit as renewal approaches.",
      };
    }
  }, [currentTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Prepayment Strategy Recommendations
        </CardTitle>
        <CardDescription>
          Get personalized recommendations for optimizing your prepayment strategy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="comparison">Prepayment vs Investment</TabsTrigger>
            <TabsTrigger value="timing">Optimal Timing</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4 mt-4">
            {timingRecommendation && (
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>{timingRecommendation.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Recommended Prepayment Scenarios</h3>
              {recommendations.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Unable to generate recommendations. Please check your mortgage details.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {recommendations.map((scenario, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {scenario.type === "lump-sum"
                              ? `Lump Sum: ${formatCurrency(scenario.amount)}`
                              : `Payment Increase: ${formatCurrency(scenario.amount)}/month`}
                          </CardTitle>
                          <Badge variant={scenario.roi > 5 ? "default" : "secondary"}>
                            ROI: {scenario.roi.toFixed(1)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Interest Saved</span>
                            <div className="font-semibold text-green-600">
                              {formatCurrency(scenario.interestSavings)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time Saved</span>
                            <div className="font-semibold">
                              {Math.floor(scenario.timeSavedMonths / 12)}y{" "}
                              {scenario.timeSavedMonths % 12}m
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div className="text-xs text-muted-foreground">
                          New Payoff: {scenario.newPayoffDate.toLocaleDateString()}
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => onUseAmount(scenario.amount, scenario.type)}
                        >
                          Use This Amount
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="investment-rate">Expected Investment Return (%)</Label>
                  <Input
                    id="investment-rate"
                    type="number"
                    step="0.1"
                    value={investmentRate}
                    onChange={(e) => setInvestmentRate(e.target.value)}
                    placeholder="7.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comparison-years">Comparison Period (Years)</Label>
                  <Input
                    id="comparison-years"
                    type="number"
                    min="1"
                    max="30"
                    value={comparisonYears}
                    onChange={(e) => setComparisonYears(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder="30"
                  />
                </div>
              </div>

              {investmentComparison && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Comparison Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Prepayment Savings</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(investmentComparison.prepaymentInterestSavings)}
                        </div>
                        <div className="text-xs text-muted-foreground">Guaranteed, tax-free</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Investment Returns</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(investmentComparison.investmentReturns)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          After tax, requires risk
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Net Difference</span>
                        <Badge
                          variant={
                            investmentComparison.recommendation === "prepayment"
                              ? "default"
                              : investmentComparison.recommendation === "investment"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {formatCurrency(Math.abs(investmentComparison.netDifference))}
                          {investmentComparison.netDifference > 0
                            ? " better with prepayment"
                            : " better with investment"}
                        </Badge>
                      </div>
                      <Alert>
                        {investmentComparison.recommendation === "prepayment" ? (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        ) : investmentComparison.recommendation === "investment" ? (
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Calculator className="h-4 w-4" />
                        )}
                        <AlertDescription>{investmentComparison.reasoning}</AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Optimal Prepayment Timing</h3>
              {timingRecommendation && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm">{timingRecommendation.message}</p>
                        {currentTerm && (
                          <div className="text-xs text-muted-foreground">
                            Current term ends: {new Date(currentTerm.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Timing Considerations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Early in Term</div>
                      <div className="text-muted-foreground">
                        Prepayments early in your term save the most interest due to compound
                        growth.
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Before Renewal</div>
                      <div className="text-muted-foreground">
                        Consider prepayment limits and potential penalties. Larger prepayments may
                        be better at renewal.
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-medium">When Rates Are High</div>
                      <div className="text-muted-foreground">
                        Higher mortgage rates make prepayments more valuable as you&apos;re saving
                        on higher-cost debt.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate prepayment impact
function calculatePrepaymentImpact(
  currentBalance: number,
  amount: number,
  type: "lump-sum" | "payment-increase",
  monthlyRate: number,
  regularPayment: number
): PrepaymentScenario | null {
  if (currentBalance <= 0 || amount <= 0 || monthlyRate <= 0) return null;

  let newBalance = currentBalance;
  let newPayment = regularPayment;

  if (type === "lump-sum") {
    newBalance = Math.max(0, currentBalance - amount);
  } else {
    newPayment = regularPayment + amount;
  }

  // Calculate remaining periods and interest
  const calculateAmortization = (
    balance: number,
    payment: number
  ): { periods: number; totalInterest: number } => {
    if (payment <= balance * monthlyRate) return { periods: 999, totalInterest: 0 };

    let tempBalance = balance;
    let totalInterest = 0;
    let periods = 0;
    const maxPeriods = 1200; // 100 years

    while (tempBalance > 0.01 && periods < maxPeriods) {
      const interest = tempBalance * monthlyRate;
      totalInterest += interest;
      const principal = payment - interest;
      tempBalance -= principal;
      periods++;
    }

    return { periods, totalInterest };
  };

  const baseline = calculateAmortization(currentBalance, regularPayment);
  const withPrepayment = calculateAmortization(newBalance, newPayment);

  if (withPrepayment.periods >= baseline.periods) return null;

  const interestSavings = baseline.totalInterest - withPrepayment.totalInterest;
  const timeSavedMonths = baseline.periods - withPrepayment.periods;
  const newPayoffDate = new Date();
  newPayoffDate.setMonth(newPayoffDate.getMonth() + withPrepayment.periods);

  // Simple ROI: interest savings / prepayment amount
  const roi = (interestSavings / amount) * 100;

  return {
    amount,
    type,
    interestSavings,
    timeSavedMonths,
    newPayoffDate,
    roi,
  };
}
