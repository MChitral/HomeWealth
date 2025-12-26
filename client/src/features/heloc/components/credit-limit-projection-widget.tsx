import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Slider } from "@/shared/ui/slider";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, DollarSign, Calculator } from "lucide-react";
import { useMortgageData } from "@/features/mortgage-tracking/hooks/use-mortgage-data";
import {
  calculatePaymentBreakdown,
  calculatePayment,
} from "@/features/mortgage-tracking/utils/mortgage-math";

interface CreditLimitProjectionWidgetProps {
  mortgageId: string;
  currentHelocLimit: number;
  currentHelocBalance: number;
}

export function CreditLimitProjectionWidget({
  mortgageId,
  currentHelocLimit,
  currentHelocBalance: _currentHelocBalance,
}: CreditLimitProjectionWidgetProps) {
  // Use the hook to get terms for the specific mortgage by passing the ID if needed,
  // but useMortgageData currently only fetches terms for the 'active' one passed or first one.
  // To ensure we have terms for the specific mortgageId passed to this widget, we relies on
  // the parent context or assume this is the active one.
  // Given EquityStrategyDashboard passes primaryMortgage.id, we should ensure useMortgageData is compliant.
  // A safer bet is to assume the `terms` returned match if it's the primary mortgage.
  const { mortgages, terms } = useMortgageData(mortgageId);
  const mortgage = mortgages.find((m) => m.id === mortgageId);

  // Find the active term (simplification: take the first one or most relevant if array)
  // In a real app we'd filter by date, but usually only active term is returned or sorted.
  const activeTerm = terms?.[0];

  const [yearsToProject, setYearsToProject] = useState(5);
  const [monthlyPrepayment, setMonthlyPrepayment] = useState(0);

  const projectionData = useMemo(() => {
    if (!mortgage) return [];

    const data = [];
    let currentBalance = Number(mortgage.currentBalance ?? 0);

    // RATE DETERMINATION
    // Determine rate from Term (Fixed vs Variable)
    let annualRate = 0.05; // Default 5%
    if (activeTerm) {
      if (activeTerm.termType === "fixed" && activeTerm.fixedRate) {
        annualRate = Number(activeTerm.fixedRate) / 100;
      } else if (activeTerm.primeRate && activeTerm.lockedSpread) {
        // Variable: Prime + Spread
        annualRate = (Number(activeTerm.primeRate) + Number(activeTerm.lockedSpread)) / 100;
      }
    }

    // PAYMENT DETERMINATION
    // Use term payment or calculate standard monthly payment if missing
    let standardPayment = activeTerm ? Number(activeTerm.regularPaymentAmount ?? 0) : 0;

    // Fallback: If payment is 0/NaN, calculate it based on remaining amortization or default 25y
    if (
      (!standardPayment || isNaN(standardPayment) || standardPayment <= 0) &&
      currentBalance > 0
    ) {
      // Assume 25 year amortization (300 months) default if unknown
      standardPayment = calculatePayment(currentBalance, annualRate, 300, "monthly");
    }

    // Normalized monthly base payment
    let monthlyBasePayment = standardPayment;
    const freq = activeTerm?.paymentFrequency || mortgage.paymentFrequency || "monthly";

    if (freq === "biweekly" || freq === "accelerated-biweekly") {
      monthlyBasePayment = (standardPayment * 26) / 12;
    } else if (freq === "weekly" || freq === "accelerated-weekly") {
      monthlyBasePayment = (standardPayment * 52) / 12;
    } else if (freq === "semi-monthly") {
      monthlyBasePayment = standardPayment * 2;
    }

    let accumulatedLimitIncrease = 0; // Starts at 0
    const validLimit = isNaN(currentHelocLimit) ? 0 : currentHelocLimit;

    // Safety break
    if (isNaN(monthlyBasePayment) || monthlyBasePayment <= 0) {
      data.push({
        month: 0,
        year: "0",
        projectedLimit: validLimit,
        balance: currentBalance,
        limitIncrease: 0,
      });
      return data;
    }

    for (let month = 0; month <= yearsToProject * 12; month++) {
      // Record state at start of month
      if (month % 6 === 0) {
        // Optimize data points (every 6 months)
        data.push({
          month,
          year: (month / 12).toFixed(1),
          projectedLimit: Math.round(validLimit + accumulatedLimitIncrease),
          balance: Math.round(currentBalance),
          limitIncrease: Math.round(accumulatedLimitIncrease),
        });
      }

      // Calculate Principal paid this month
      const totalMonthlyPayment =
        monthlyBasePayment + (isNaN(monthlyPrepayment) ? 0 : monthlyPrepayment);

      const breakdown = calculatePaymentBreakdown({
        balance: currentBalance,
        paymentAmount: totalMonthlyPayment,
        extraPrepaymentAmount: isNaN(monthlyPrepayment) ? 0 : monthlyPrepayment,
        frequency: "monthly",
        annualRate: isNaN(annualRate) ? 0.05 : annualRate,
      });

      // Update for next iteration
      accumulatedLimitIncrease += breakdown.principal;
      currentBalance = breakdown.remainingBalance;
    }

    return data;
  }, [mortgage, activeTerm, yearsToProject, monthlyPrepayment, currentHelocLimit]);

  if (!mortgage) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Mortgage data not found for projection.
        </CardContent>
      </Card>
    );
  }

  const finalProjection = projectionData[projectionData.length - 1];
  const totalLimitGain = finalProjection ? finalProjection.limitIncrease : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(isNaN(val) ? 0 : val);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Projected Borrowing Power
            </CardTitle>
            <CardDescription>
              Forecast how your mortgage payments unlock future HELOC credit.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {yearsToProject} Year Projection
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="bg-muted/30 p-4 rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Monthly Prepayment Scenario
              </Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={monthlyPrepayment || ""}
                    onChange={(e) => setMonthlyPrepayment(Number(e.target.value))}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 w-full space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Projection Period: {yearsToProject} Years
              </Label>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[yearsToProject]}
                onValueChange={(vals) => setYearsToProject(vals[0])}
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[250px] w-full">
          {projectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLimit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="year"
                  tickFormatter={(val) => `Year ${val}`}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={["dataMin", "auto"]}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }}
                  formatter={(val: number, name: string) => [
                    formatCurrency(val),
                    name === "projectedLimit" ? "Projected Limit" : "Mortgage Balance",
                  ]}
                  labelFormatter={(label) => `After ${label} Years`}
                />
                <Area
                  type="monotone"
                  dataKey="projectedLimit"
                  name="Projected Limit"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLimit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Unable to calculate projection. Please ensure mortgage payment details are set.
            </div>
          )}
        </div>

        {/* Dynamic Insight */}
        <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/20">
          <Calculator className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Limit increases by {formatCurrency(totalLimitGain)}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              By making{" "}
              {monthlyPrepayment > 0
                ? `standard payments plus $${monthlyPrepayment}/mo`
                : "standard payments"}
              , you will unlock an additional <strong>{formatCurrency(totalLimitGain)}</strong> in
              borrowing power over the next {yearsToProject} years.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
