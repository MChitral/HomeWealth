import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

interface SummarySectionProps {
  monthlyIncome: number;
  extraPaychequesMonthly: number;
  annualBonusMonthly: number;
  totalMonthlyIncome: number;
  fixedHousingCosts: number;
  mortgagePayment: number;
  variableExpenses: number;
  otherDebtPayments: number;
  totalMonthlyExpenses: number;
  monthlySurplus: number;
  runwayMonths: number | null;
}

export function SummarySection({
  monthlyIncome,
  extraPaychequesMonthly,
  annualBonusMonthly,
  totalMonthlyIncome,
  fixedHousingCosts,
  mortgagePayment,
  variableExpenses,
  otherDebtPayments,
  totalMonthlyExpenses,
  monthlySurplus,
  runwayMonths,
}: SummarySectionProps) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle>Monthly Summary</CardTitle>
        <CardDescription>High-level view of cash inflows and outflows</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Monthly Income</p>
          <div className="rounded-md border p-4 space-y-2 bg-background">
            <div className="flex items-center justify-between text-sm">
              <span>Base Salary</span>
              <span className="font-medium">${monthlyIncome.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Extra Paycheques</span>
              <span className="font-medium">
                ${extraPaychequesMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Bonus (monthlyized)</span>
              <span className="font-medium">
                ${annualBonusMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total Monthly Income</span>
              <span>
                ${totalMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Monthly Expenses</p>
          <div className="rounded-md border p-4 space-y-2 bg-background">
            <div className="flex items-center justify-between text-sm">
              <span>Housing (non-mortgage)</span>
              <span className="font-medium">${fixedHousingCosts.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Mortgage Payment</span>
              <span className="font-medium">${mortgagePayment.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Variable Spending</span>
              <span className="font-medium">${variableExpenses.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Other Debt</span>
              <span className="font-medium">${otherDebtPayments.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total Monthly Expenses</span>
              <span>${totalMonthlyExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 rounded-md border p-4 bg-background space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Surplus / Deficit</p>
              <p className="text-3xl font-semibold">
                {monthlySurplus >= 0 ? "+" : "-"}${Math.abs(monthlySurplus).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Runway</p>
              <p className="text-2xl font-semibold">
                {runwayMonths ? `${runwayMonths} months` : "Review plan"}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Mortgage payment is mocked for now; once the amortization engine is connected this will
            reflect actual payments.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
