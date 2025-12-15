import { Link } from "wouter";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { useEmergencyFundData } from "@/features/emergency-fund/hooks";
import { useCashFlowData } from "@/features/cash-flow/hooks";

export function EmergencyFundStrategyCard() {
  const { emergencyFund } = useEmergencyFundData();
  const { cashFlow } = useCashFlowData();

  // Calculate actual target amount and months
  const targetAmount = useMemo(() => {
    if (!emergencyFund?.targetMonths || !cashFlow) return null;

    // Calculate monthly expenses from cash flow
    const monthlyExpenses =
      Number(cashFlow.propertyTax || 0) +
      Number(cashFlow.homeInsurance || 0) +
      Number(cashFlow.condoFees || 0) +
      Number(cashFlow.utilities || 0) +
      Number(cashFlow.groceries || 0) +
      Number(cashFlow.dining || 0) +
      Number(cashFlow.transportation || 0) +
      Number(cashFlow.entertainment || 0) +
      Number(cashFlow.carLoan || 0) +
      Number(cashFlow.studentLoan || 0) +
      Number(cashFlow.creditCard || 0);

    const targetMonths = Number(emergencyFund.targetMonths);
    return monthlyExpenses * targetMonths;
  }, [emergencyFund, cashFlow]);

  const targetMonths = emergencyFund?.targetMonths ? Number(emergencyFund.targetMonths) : null;

  // Track monthly contribution for dynamic timeline calculation
  const [monthlyContribution, setMonthlyContribution] = useState<string>("500");

  // Calculate timeline dynamically
  const timelineMonths = useMemo(() => {
    if (!targetAmount || !monthlyContribution) return null;
    const contribution = parseFloat(monthlyContribution);
    if (isNaN(contribution) || contribution <= 0) return null;
    return Math.ceil(targetAmount / contribution);
  }, [targetAmount, monthlyContribution]);

  return (
    <>
      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle>Emergency Fund Target</CardTitle>
          <CardDescription>
            Configured on Emergency Fund page (applies to all scenarios)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-background rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Current Target</p>
            {targetAmount !== null && targetMonths !== null ? (
              <>
                <p className="text-2xl font-mono font-bold mb-2">
                  $
                  {targetAmount.toLocaleString("en-CA", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  = {targetMonths} {targetMonths === 1 ? "month" : "months"} of expenses
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-mono font-bold mb-2 text-muted-foreground">Not Set</p>
                <p className="text-sm text-muted-foreground">
                  Configure your emergency fund target on the Emergency Fund page
                </p>
              </>
            )}
            <Link href="/emergency-fund">
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                data-testid="button-edit-ef-target"
              >
                {targetAmount !== null ? "Edit Target" : "Set Target"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Fund Strategy</CardTitle>
          <CardDescription>Configure how this scenario fills the emergency fund</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ef-contribution">Monthly Contribution</Label>
            <Input
              id="ef-contribution"
              type="number"
              placeholder="500"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              data-testid="input-ef-contribution"
            />
            <p className="text-sm text-muted-foreground">
              How much to contribute each month until target is reached
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="ef-reroute">After Target is Reached, Redirect To:</Label>
            <Select defaultValue="split">
              <SelectTrigger id="ef-reroute" data-testid="select-ef-reroute">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="split">Split per Surplus Allocation (recommended)</SelectItem>
                <SelectItem value="investments">100% to Investments</SelectItem>
                <SelectItem value="prepay">100% to Mortgage Prepayment</SelectItem>
                <SelectItem value="none">None (save as cash)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              "Split" option uses the Surplus Allocation slider from Mortgage tab
            </p>
          </div>

          <Separator />

          {targetAmount !== null && (
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm font-medium mb-2">Timeline Estimate</p>
              {timelineMonths !== null ? (
                <p className="text-sm text-muted-foreground">
                  At ${parseFloat(monthlyContribution || "0").toLocaleString("en-CA")}/month
                  contribution, emergency fund will be fully funded in{" "}
                  <span className="font-mono font-semibold">
                    {timelineMonths} {timelineMonths === 1 ? "month" : "months"} (
                    {Math.round((timelineMonths / 12) * 10) / 10} years)
                  </span>
                  . After that, this $
                  {parseFloat(monthlyContribution || "0").toLocaleString("en-CA")}/month will be
                  redirected according to your selection above.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enter a monthly contribution amount to see the timeline estimate.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
