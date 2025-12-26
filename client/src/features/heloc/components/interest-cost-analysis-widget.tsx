import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { DollarSign, Percent, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

interface InterestCostAnalysisWidgetProps {
  currentBalance: number;
  interestRate: number; // Percentage (e.g., 7.2)
}

export function InterestCostAnalysisWidget({
  currentBalance,
  interestRate,
}: InterestCostAnalysisWidgetProps) {
  const [showRoiComparison, setShowRoiComparison] = useState(false);

  // Daily interest = Balance * (Rate / 100) / 365
  const dailyCost = (currentBalance * (interestRate / 100)) / 365;
  const monthlyCost = dailyCost * 30.42; // Average days in month
  const yearlyCost = dailyCost * 365;

  // Hypothetical Investment Comparison
  // If borrowed funds were invested at X% (e.g., 8%)
  const investmentReturnRate = 8.0;
  const potentialInvestmentReturn = currentBalance * (investmentReturnRate / 100);
  const netBenefit = potentialInvestmentReturn - yearlyCost;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 2,
    }).format(val);

  if (currentBalance <= 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>No active balance to analyze interest costs.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-amber-600" />
              Cost of Borrowing
            </CardTitle>
            <CardDescription>Analysis of your current interest obligations.</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-roi"
              checked={showRoiComparison}
              onCheckedChange={setShowRoiComparison}
            />
            <Label htmlFor="show-roi" className="text-xs">
              Investment ROI Mode
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Effective Rate</span>
            </div>
            <div className="text-2xl font-bold">{interestRate.toFixed(2)}%</div>
            <div className="text-xs text-muted-foreground mt-1">Prime + Spread</div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Monthly Cost
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {formatCurrency(monthlyCost)}
            </div>
            <div className="text-xs text-amber-600/80 mt-1">~{formatCurrency(dailyCost)} / day</div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Yearly Projection</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(yearlyCost)}</div>
            <div className="text-xs text-muted-foreground mt-1">At current balance</div>
          </div>
        </div>

        {/* ROI Comparison Mode */}
        {showRoiComparison && (
          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/20 animate-in fade-in slide-in-from-top-2">
            <h4 className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100 mb-3">
              <TrendingUp className="h-4 w-4" />
              Leverage Analysis (Smith Manoeuvre Potential)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Cost of Funds ({interestRate}%):</span>
                <div className="font-semibold text-red-600">-{formatCurrency(yearlyCost)}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">
                  Potential Return ({investmentReturnRate}%):
                </span>
                <div className="font-semibold text-green-600">
                  +{formatCurrency(potentialInvestmentReturn)}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 flex justify-between items-center">
              <span className="font-medium text-blue-900 dark:text-blue-100">
                Net Annual Benefit (Pre-Tax):
              </span>
              <Badge variant={netBenefit > 0 ? "default" : "destructive"} className="text-lg">
                {netBenefit > 0 ? "+" : ""}
                {formatCurrency(netBenefit)}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              *Hypothetical scenario for illustrative purposes only. Does not constitute financial
              advice. Tax deductions not calculated here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
