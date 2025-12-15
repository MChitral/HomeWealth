import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Calculator } from "lucide-react";

interface EmergencyFundCalculatorCardProps {
  fixedExpenses: number;
  variableExpenses: number;
  monthlyExpenses: number;
  hasExpenseData: boolean;
  onSetTargetMonths: (months: number) => void;
}

export function EmergencyFundCalculatorCard({
  fixedExpenses,
  variableExpenses,
  monthlyExpenses,
  hasExpenseData,
  onSetTargetMonths,
}: EmergencyFundCalculatorCardProps) {
  return (
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
                <p className="text-xs text-muted-foreground mt-1">
                  From Cash Flow page (excludes mortgage)
                </p>
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Recommendation</p>
              <p className="text-sm font-medium mb-2">
                Financial experts recommend 3-6 months for stable employment, 6-12 months for
                self-employed
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[3, 6, 9, 12].map((months) => (
                  <Button
                    key={months}
                    variant="outline"
                    onClick={() => onSetTargetMonths(months)}
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
              Please fill out your Cash Flow page first to see personalized recommendations based on
              your monthly expenses.
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
  );
}
