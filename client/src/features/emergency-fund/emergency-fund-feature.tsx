import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Save, Shield, Calculator } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";
import { PageHeader } from "@/shared/ui/page-header";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { queryClient } from "@/shared/api/query-client";

import { useEmergencyFundData } from "./hooks";
import { EmergencyFundPayload, emergencyFundApi, emergencyFundQueryKeys } from "./api";
import { useCashFlowData } from "@/features/cash-flow/hooks";

export default function EmergencyFundFeature() {
  const { toast } = useToast();
  const { emergencyFund, isLoading: emergencyFundLoading } = useEmergencyFundData();
  const { cashFlow, isLoading: cashFlowLoading } = useCashFlowData();

  usePageTitle("Emergency Fund | Mortgage Strategy");

  const [targetMonths, setTargetMonths] = useState("6");
  const [currentBalance, setCurrentBalance] = useState("0");
  const [monthlyContribution, setMonthlyContribution] = useState("0");

  useEffect(() => {
    if (!emergencyFund) return;
    setTargetMonths(emergencyFund.targetMonths.toString());
    setCurrentBalance(emergencyFund.currentBalance);
    setMonthlyContribution(emergencyFund.monthlyContribution);
  }, [emergencyFund]);

  const fixedExpenses = useMemo(() => {
    if (!cashFlow) return 0;
    return (
      Number(cashFlow.propertyTax ?? 0) +
      Number(cashFlow.homeInsurance ?? 0) +
      Number(cashFlow.condoFees ?? 0) +
      Number(cashFlow.utilities ?? 0)
    );
  }, [cashFlow]);

  const variableExpenses = useMemo(() => {
    if (!cashFlow) return 0;
    return (
      Number(cashFlow.groceries ?? 0) +
      Number(cashFlow.dining ?? 0) +
      Number(cashFlow.transportation ?? 0) +
      Number(cashFlow.entertainment ?? 0)
    );
  }, [cashFlow]);

  const monthlyExpenses = fixedExpenses + variableExpenses;
  const hasExpenseData = monthlyExpenses > 0;
  const targetMonthsNumber = parseFloat(targetMonths || "6");
  const targetAmount = hasExpenseData ? monthlyExpenses * targetMonthsNumber : 0;
  const currentBalanceValue = Number(currentBalance || 0);
  const progressPercent =
    targetAmount > 0 && currentBalanceValue > 0 ? ((currentBalanceValue / targetAmount) * 100).toFixed(1) : "0.0";

  const saveMutation = useMutation({
    mutationFn: (payload: EmergencyFundPayload) => {
      if (emergencyFund?.id) {
        return emergencyFundApi.update(emergencyFund.id, payload);
      }
      return emergencyFundApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyFundQueryKeys.emergencyFund() });
      toast({
        title: "Emergency fund saved",
        description: "Your emergency fund settings have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving emergency fund",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const normalizedTargetMonths = Math.max(1, Math.min(12, Math.round(targetMonthsNumber)));
    const payload: EmergencyFundPayload = {
      targetMonths: normalizedTargetMonths,
      currentBalance: currentBalance || "0",
      monthlyContribution: monthlyContribution || "0",
    };
    saveMutation.mutate(payload);
  };

  const isLoading = emergencyFundLoading || cashFlowLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Fund Settings"
        description="Set your emergency fund target (applies to all scenarios)"
        sticky
        actions={
          <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Emergency Fund Target</CardTitle>
          </div>
          <CardDescription>Your financial safety net in case of job loss or emergencies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-primary/10 rounded-md">
            <p className="text-sm font-medium mb-2">What is an Emergency Fund?</p>
            <p className="text-sm text-muted-foreground">
              An emergency fund is cash set aside to cover unexpected expenses or income loss. Financial experts
              recommend 3-6 months of living expenses for most people, or 6-12 months if you're self-employed or have
              variable income.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-months">Target Coverage (Months)</Label>
                <Input
                  id="target-months"
                  type="number"
                  min="1"
                  max="12"
                  step="0.1"
                  value={targetMonths}
                  onChange={(event) => setTargetMonths(event.target.value)}
                  data-testid="input-target-months"
                />
                <p className="text-sm text-muted-foreground">Months of expenses to cover</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-balance">Current Balance</Label>
                <Input
                  id="current-balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentBalance}
                  onChange={(event) => setCurrentBalance(event.target.value)}
                  data-testid="input-current-balance"
                />
                <p className="text-sm text-muted-foreground">How much you have saved now</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-contribution">Monthly Contribution</Label>
              <Input
                id="monthly-contribution"
                type="number"
                min="0"
                step="0.01"
                value={monthlyContribution}
                onChange={(event) => setMonthlyContribution(event.target.value)}
                data-testid="input-monthly-contribution"
              />
              <p className="text-sm text-muted-foreground">How much you'll add each month until target is reached</p>
            </div>

            <Separator />

            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Your Target Emergency Fund</p>
              {hasExpenseData ? (
                <>
                  <p className="text-3xl font-mono font-bold mb-2" data-testid="text-target-amount">
                    ${targetAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    = {targetMonths} months × ${monthlyExpenses.toLocaleString()}/month
                  </p>
                  {currentBalanceValue > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Progress</p>
                      <p className="text-lg font-mono font-semibold">{progressPercent}%</p>
                      <p className="text-sm text-muted-foreground">
                        ${currentBalanceValue.toLocaleString()} of ${targetAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">No expense data available</p>
                  <p>
                    Please fill out your <a href="/cash-flow" className="text-primary underline">Cash Flow</a> page first
                    to calculate recommended targets.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Target Calculator</CardTitle>
          </div>
          <CardDescription>Calculate recommended target based on your expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasExpenseData ? (
            <>
              <div className="p-4 bg-muted/50 rounded-md mb-4">
                <p className="text-sm font-medium mb-2">Your Monthly Expenses</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Fixed Expenses</p>
                    <p className="text-base font-mono" data-testid="text-fixed-expenses">
                      ${fixedExpenses.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Variable Expenses</p>
                    <p className="text-base font-mono" data-testid="text-variable-expenses">
                      ${variableExpenses.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Monthly Expenses</p>
                  <p className="text-lg font-mono font-bold" data-testid="text-monthly-expenses">
                    ${monthlyExpenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">From Cash Flow page (excludes mortgage)</p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Recommendation</p>
                <p className="text-sm font-medium mb-2">
                  Financial experts recommend 3-6 months for stable employment, 6-12 months for self-employed
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[3, 6, 9, 12].map((months) => (
                    <Button
                      key={months}
                      variant="outline"
                      onClick={() => setTargetMonths(months.toString())}
                      data-testid={`button-set-${months}-months`}
                    >
                      {months} Months
                      <span className="text-xs text-muted-foreground ml-2">
                        ${(monthlyExpenses * months).toLocaleString()}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-muted/50 rounded-md text-center">
              <p className="text-sm font-medium mb-2">No Expense Data Available</p>
              <p className="text-sm text-muted-foreground mb-4">
                Please fill out your Cash Flow page first to see personalized recommendations based on your monthly
                expenses.
              </p>
              <Button variant="outline" asChild>
                <a href="/cash-flow" data-testid="link-go-to-cash-flow">
                  Go to Cash Flow →
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why This Matters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 bg-green-600 rounded" />
            <div>
              <p className="font-medium text-sm mb-1">Avoid High-Interest Debt</p>
              <p className="text-sm text-muted-foreground">
                With an emergency fund, you won't need to use credit cards or loans at 20%+ interest when unexpected
                expenses arise.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-blue-600 rounded" />
            <div>
              <p className="font-medium text-sm mb-1">Peace of Mind</p>
              <p className="text-sm text-muted-foreground">
                Knowing you have 6 months of expenses covered lets you focus on long-term goals without constant
                financial anxiety.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-purple-600 rounded" />
            <div>
              <p className="font-medium text-sm mb-1">Foundation for Other Goals</p>
              <p className="text-sm text-muted-foreground">
                Most financial advisors recommend building your emergency fund BEFORE aggressive investing or mortgage
                prepayment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-medium">Note:</span> How quickly you fill this fund and what you do after it's full is
            configured in each scenario. Different scenarios can have different contribution strategies while targeting
            the same amount.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

