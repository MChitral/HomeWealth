import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Shield, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EmergencyFund, CashFlow } from "@shared/schema";

export default function EmergencyFundPage() {
  const { toast } = useToast();
  const [targetMonths, setTargetMonths] = useState("6");
  const [currentBalance, setCurrentBalance] = useState("0");
  const [monthlyContribution, setMonthlyContribution] = useState("0");

  // Set page title
  useEffect(() => {
    document.title = "Emergency Fund | Mortgage Strategy";
  }, []);

  // Fetch emergency fund data
  const { data: emergencyFund, isLoading: isLoadingEF } = useQuery<EmergencyFund | null>({
    queryKey: ["/api/emergency-fund"],
  });

  // Fetch cash flow data to get monthly expenses
  const { data: cashFlow, isLoading: isLoadingCF } = useQuery<CashFlow | null>({
    queryKey: ["/api/cash-flow"],
  });

  // Initialize form when data loads
  useEffect(() => {
    if (emergencyFund) {
      setTargetMonths(emergencyFund.targetMonths.toString());
      setCurrentBalance(emergencyFund.currentBalance);
      setMonthlyContribution(emergencyFund.monthlyContribution);
    }
  }, [emergencyFund]);

  // Calculate monthly expenses from cash flow
  const fixedExpenses = cashFlow ? (
    parseFloat(cashFlow.propertyTax || "0") +
    parseFloat(cashFlow.homeInsurance || "0") +
    parseFloat(cashFlow.condoFees || "0") +
    parseFloat(cashFlow.utilities || "0")
  ) : 0;

  const variableExpenses = cashFlow ? (
    parseFloat(cashFlow.groceries || "0") +
    parseFloat(cashFlow.dining || "0") +
    parseFloat(cashFlow.transportation || "0") +
    parseFloat(cashFlow.entertainment || "0") +
    parseFloat(cashFlow.shopping || "0") +
    parseFloat(cashFlow.subscriptions || "0") +
    parseFloat(cashFlow.healthcare || "0") +
    parseFloat(cashFlow.other || "0")
  ) : 0;

  const monthlyExpenses = fixedExpenses + variableExpenses;
  const recommendedTarget = monthlyExpenses > 0 ? monthlyExpenses * parseFloat(targetMonths || "6") : 0;
  const hasExpenseData = monthlyExpenses > 0;

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        targetMonths: parseInt(targetMonths || "6"),
        currentBalance: currentBalance || "0",
        monthlyContribution: monthlyContribution || "0",
      };

      if (emergencyFund?.id) {
        return apiRequest("PATCH", `/api/emergency-fund/${emergencyFund.id}`, data);
      } else {
        return apiRequest("POST", "/api/emergency-fund", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-fund"] });
      toast({
        title: "Emergency fund saved",
        description: "Your emergency fund settings have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error saving emergency fund",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const isLoading = isLoadingEF || isLoadingCF;

  // Show loading skeleton
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

  const targetAmountDollars = hasExpenseData ? monthlyExpenses * parseFloat(targetMonths || "6") : 0;
  const currentBalanceNum = parseFloat(currentBalance || "0");
  const progressPercent = targetAmountDollars > 0 && currentBalanceNum > 0
    ? ((currentBalanceNum / targetAmountDollars) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap sticky top-0 bg-background z-10 py-4 -mt-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Emergency Fund Settings</h1>
          <p className="text-muted-foreground">Set your emergency fund target (applies to all scenarios)</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          data-testid="button-save"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

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
              An emergency fund is cash set aside to cover unexpected expenses or income loss. 
              Financial experts recommend 3-6 months of living expenses for most people, 
              or 6-12 months if you're self-employed or have variable income.
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
                  onChange={(e) => setTargetMonths(e.target.value)}
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
                  onChange={(e) => setCurrentBalance(e.target.value)}
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
                onChange={(e) => setMonthlyContribution(e.target.value)}
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
                    ${targetAmountDollars.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    = {targetMonths} months × ${monthlyExpenses.toLocaleString()}/month
                  </p>
                  {currentBalanceNum > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Progress</p>
                      <p className="text-lg font-mono font-semibold">
                        {progressPercent}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${currentBalanceNum.toLocaleString()} of ${targetAmountDollars.toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">No expense data available</p>
                  <p>Please fill out your <a href="/cash-flow" className="text-primary underline">Cash Flow</a> page first to calculate recommended targets.</p>
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
                  <Button 
                    variant="outline"
                    onClick={() => setTargetMonths("3")}
                    data-testid="button-set-3-months"
                  >
                    3 Months
                    <span className="text-xs text-muted-foreground ml-2">
                      ${(monthlyExpenses * 3).toLocaleString()}
                    </span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setTargetMonths("6")}
                    data-testid="button-set-6-months"
                  >
                    6 Months
                    <span className="text-xs text-muted-foreground ml-2">
                      ${(monthlyExpenses * 6).toLocaleString()}
                    </span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setTargetMonths("9")}
                    data-testid="button-set-9-months"
                  >
                    9 Months
                    <span className="text-xs text-muted-foreground ml-2">
                      ${(monthlyExpenses * 9).toLocaleString()}
                    </span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setTargetMonths("12")}
                    data-testid="button-set-12-months"
                  >
                    12 Months
                    <span className="text-xs text-muted-foreground ml-2">
                      ${(monthlyExpenses * 12).toLocaleString()}
                    </span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-muted/50 rounded-md text-center">
              <p className="text-sm font-medium mb-2">No Expense Data Available</p>
              <p className="text-sm text-muted-foreground mb-4">
                Please fill out your Cash Flow page first to see personalized recommendations based on your monthly expenses.
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
                With an emergency fund, you won't need to use credit cards or loans at 20%+ interest 
                when unexpected expenses arise.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-blue-600 rounded" />
            <div>
              <p className="font-medium text-sm mb-1">Peace of Mind</p>
              <p className="text-sm text-muted-foreground">
                Knowing you have 6 months of expenses covered lets you focus on long-term goals 
                without constant financial anxiety.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-purple-600 rounded" />
            <div>
              <p className="font-medium text-sm mb-1">Foundation for Other Goals</p>
              <p className="text-sm text-muted-foreground">
                Most financial advisors recommend building your emergency fund BEFORE aggressive 
                investing or mortgage prepayment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-medium">Note:</span> How quickly you fill this fund and what you do 
            after it's full is configured in each scenario. Different scenarios can have different 
            contribution strategies while targeting the same amount.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
