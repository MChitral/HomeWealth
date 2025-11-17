import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, Shield, Calculator } from "lucide-react";
import { useState, useEffect } from "react";

export default function EmergencyFundPage() {
  const [monthsOfExpenses, setMonthsOfExpenses] = useState("6");

  // Set page title
  useEffect(() => {
    document.title = "Emergency Fund | Mortgage Strategy";
  }, []);
  
  // Mock data - would come from Cash Flow page
  const monthlyExpenses = 2250; // fixed + variable expenses
  const recommendedTarget = monthlyExpenses * parseFloat(monthsOfExpenses || "6");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Emergency Fund Settings</h1>
          <p className="text-muted-foreground">Set your emergency fund target (applies to all scenarios)</p>
        </div>
        <Button data-testid="button-save">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
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
            <div className="space-y-2">
              <Label htmlFor="target-amount">Target Amount</Label>
              <Input 
                id="target-amount" 
                type="number" 
                placeholder="30000" 
                defaultValue="30000"
                data-testid="input-target-amount" 
              />
              <p className="text-sm text-muted-foreground">Total emergency fund target in dollars</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-lg font-mono font-bold mb-1">$30,000</p>
              <p className="text-sm text-muted-foreground">Your emergency fund target</p>
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
          <div className="p-4 bg-muted/50 rounded-md mb-4">
            <p className="text-sm font-medium mb-2">Your Monthly Expenses</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Fixed Expenses</p>
                <p className="text-base font-mono">$750</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Variable Expenses</p>
                <p className="text-base font-mono">$1,500</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div>
              <p className="text-xs text-muted-foreground">Total Monthly Expenses</p>
              <p className="text-lg font-mono font-bold">${monthlyExpenses.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">From Cash Flow page (excludes mortgage)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="months-coverage">Months of Coverage</Label>
            <Input 
              id="months-coverage" 
              type="number" 
              min="1"
              max="12"
              value={monthsOfExpenses}
              onChange={(e) => setMonthsOfExpenses(e.target.value)}
              data-testid="input-months-coverage" 
            />
            <p className="text-sm text-muted-foreground">
              Recommended: 3-6 months for stable employment, 6-12 months for self-employed
            </p>
          </div>

          <Separator />

          <div className="p-4 bg-primary/10 rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Recommended Target</p>
            <p className="text-3xl font-mono font-bold text-primary mb-2">
              ${recommendedTarget.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              = {monthsOfExpenses} months × ${monthlyExpenses.toLocaleString()}/month
            </p>
            <Button 
              className="mt-4" 
              variant="outline" 
              size="sm"
              data-testid="button-use-recommendation"
            >
              Use This Amount
            </Button>
          </div>
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
