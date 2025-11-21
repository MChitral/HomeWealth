import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Home, TrendingUp, Wallet, AlertCircle, Plus } from "lucide-react";
import { useDashboardData } from "./hooks/use-dashboard-data";
import type { ScenarioWithMetrics } from "@/entities";
import { MetricCard } from "./components/metric-card";
import { NetWorthChart } from "@/widgets/charts/net-worth-chart";
import { MortgageBalanceChart } from "@/widgets/charts/mortgage-balance-chart";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageHeader } from "@/shared/ui/page-header";
import { usePageTitle } from "@/shared/hooks/use-page-title";

const HORIZONS = [10, 20, 30] as const;
type Horizon = (typeof HORIZONS)[number];

export function DashboardFeature() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<Horizon>(10);

  usePageTitle("Dashboard | Mortgage Strategy");

  const { scenarios, emergencyFund, mortgage, cashFlow, isLoading } = useDashboardData();
  const newScenarioAction = (
    <Link href="/scenarios/new">
      <Button data-testid="button-new-scenario">
        <Plus className="h-4 w-4 mr-2" />
        New Scenario
      </Button>
    </Link>
  );

  useEffect(() => {
    if (scenarios && scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].id);
    }
  }, [scenarios, selectedScenarioId]);

  const selectedScenario = scenarios?.find((s) => s.id === selectedScenarioId);
  const getMetricForHorizon = (
    scenario: ScenarioWithMetrics | undefined,
    metric: "netWorth" | "mortgageBalance" | "investments" | "investmentReturns",
  ) => {
    if (!scenario?.metrics) return 0;
    const key = `${metric}${selectedHorizon}yr` as keyof ScenarioWithMetrics["metrics"];
    return Number(scenario.metrics[key] || 0);
  };

  const homeValue = mortgage && mortgage.propertyPrice ? Number(mortgage.propertyPrice) : 0;
  const mortgageBalance = mortgage && mortgage.currentBalance ? Number(mortgage.currentBalance) : 0;
  const originalMortgageBalance = mortgage && mortgage.originalAmount ? Number(mortgage.originalAmount) : 0;
  const efBalance = emergencyFund && emergencyFund.currentBalance ? Number(emergencyFund.currentBalance) : 0;

  const currentNetWorth = homeValue - mortgageBalance + efBalance;
  const monthlyExpenses = cashFlow
    ? Number(cashFlow.propertyTax || 0) +
      Number(cashFlow.homeInsurance || 0) +
      Number(cashFlow.condoFees || 0) +
      Number(cashFlow.utilities || 0) +
      Number(cashFlow.groceries || 0) +
      Number(cashFlow.dining || 0) +
      Number(cashFlow.transportation || 0) +
      Number(cashFlow.entertainment || 0)
    : 0;
  const efTargetAmount =
    emergencyFund && emergencyFund.targetMonths && monthlyExpenses > 0
      ? Number(emergencyFund.targetMonths) * monthlyExpenses
      : 0;

  const getChartData = (projections: number[] | undefined) => {
    if (!projections || projections.length === 0) return [];
    return projections
      .map((value, index) => ({ year: index, netWorth: value }))
      .filter((_, index) => index % 2 === 0 || index === projections.length - 1);
  };

  const getMortgageChartData = (balanceProjections: number[] | undefined) => {
    if (!balanceProjections || balanceProjections.length === 0) return [];
    const initial = mortgage ? Number(mortgage.currentBalance) : 0;
    return balanceProjections
      .map((balance, year) => ({
        year,
        balance,
        principal: initial - balance,
        interest: 0,
      }))
      .filter((_, index) => index % 2 === 0 || index === balanceProjections.length - 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton key="chart1" className="h-96 w-full" />
          <Skeleton key="chart2" className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Your financial overview and projections"
          actions={newScenarioAction}
        />

        <Card className="bg-accent/10 border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Scenarios Created</h3>
              <p className="text-muted-foreground mb-4">
                Create your first scenario to see projections and compare strategies
              </p>
              <Link href="/scenarios/new">
                <Button data-testid="button-create-first-scenario">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Scenario
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Your financial overview and projections" actions={newScenarioAction} />

      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Current Financial Status</CardTitle>
          <p className="text-sm text-muted-foreground">As of today</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CurrentStatusStat label="Home Equity" value={`$${(homeValue - mortgageBalance).toLocaleString()}`} testId="text-current-equity" />
            <CurrentStatusStat label="Emergency Fund" value={`$${efBalance.toLocaleString()}`} testId="text-current-ef">
              {efTargetAmount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">Target: ${efTargetAmount.toLocaleString()}</p>
              )}
            </CurrentStatusStat>
            <CurrentStatusStat label="Home Value" value={`$${homeValue.toLocaleString()}`} testId="text-home-value" />
            <CurrentStatusStat label="Mortgage Balance" value={`$${mortgageBalance.toLocaleString()}`} testId="text-mortgage-balance" />
          </div>

          {mortgage && (
            <>
              <Separator />
              <div>
                <h3 className="text-base font-semibold mb-4">Current Mortgage Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <CurrentStatusStat label="Original Amount" value={`$${Number(mortgage.originalAmount).toLocaleString()}`} />
                  <CurrentStatusStat label="Down Payment" value={`$${Number(mortgage.downPayment).toLocaleString()}`} />
                  <CurrentStatusStat label="Payment Frequency" value={mortgage.paymentFrequency} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Projections</h2>
          <p className="text-sm text-muted-foreground">
            {selectedHorizon}-year forecast based on selected scenario
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Time Horizon:</span>
          <div className="flex gap-1 border rounded-md p-1" data-testid="horizon-selector">
            {HORIZONS.map((horizon) => (
              <Button
                key={horizon}
                variant={selectedHorizon === horizon ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedHorizon(horizon)}
                data-testid={`button-horizon-${horizon}`}
                className="min-w-[60px]"
              >
                {horizon} Years
              </Button>
            ))}
          </div>
          <Separator orientation="vertical" className="h-8" />
          <span className="text-sm text-muted-foreground">Scenario:</span>
          <Select value={selectedScenarioId || undefined} onValueChange={setSelectedScenarioId}>
            <SelectTrigger className="w-[240px]" data-testid="select-scenario">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {selectedScenario?.metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title={`Net Worth (${selectedHorizon}yr)`}
              value={`$${getMetricForHorizon(selectedScenario, "netWorth").toLocaleString()}`}
              subtitle="Projected total"
              icon={TrendingUp}
              data-testid={`card-networth-${selectedHorizon}yr`}
            />
            <MetricCard
              title={`Mortgage (${selectedHorizon}yr)`}
              value={`$${getMetricForHorizon(selectedScenario, "mortgageBalance").toLocaleString()}`}
              subtitle="Remaining balance"
              icon={Home}
              data-testid={`card-mortgage-${selectedHorizon}yr`}
            />
            <MetricCard
              title={`Investments (${selectedHorizon}yr)`}
              value={`$${getMetricForHorizon(selectedScenario, "investments").toLocaleString()}`}
              subtitle="Portfolio value"
              icon={Wallet}
              data-testid={`card-investments-${selectedHorizon}yr`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Mortgage Details - {selectedScenario.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Projected mortgage journey</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <CurrentStatusStat
                  label="Projected Payoff"
                  value={`${selectedScenario.metrics.mortgagePayoffYear.toFixed(1)} years`}
                  testId="text-payoff-year"
                />
                <CurrentStatusStat
                  label="Total Interest"
                  value={`$${selectedScenario.metrics.totalInterestPaid.toLocaleString()}`}
                  testId="text-total-interest"
                />
                <CurrentStatusStat
                  label="Avg Monthly Surplus"
                  value={`$${selectedScenario.metrics.avgMonthlySurplus.toLocaleString()}`}
                  testId="text-avg-surplus"
                />
              </div>
              <div className="relative">
                <MortgageBalanceChart
                  data={getMortgageChartData(selectedScenario.metrics.mortgageBalanceProjections)}
                />
                <div className="absolute top-4 left-4 bg-card/90 border border-border rounded-md px-3 py-2">
                  <p className="text-xs text-muted-foreground">← You are here (Year 0)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Net Worth Projection</CardTitle>
              <CardDescription>
                Based on <span className="font-medium">{selectedScenario.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NetWorthChart data={getChartData(selectedScenario.metrics.netWorthProjections)} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Investment Growth</CardTitle>
                <CardDescription>Total portfolio value projection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <NetWorthChart data={getChartData(selectedScenario.metrics.investmentProjections)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Strategy Summary</CardTitle>
                <CardDescription>{selectedScenario.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SummaryItem label="Investments" value={`$${getMetricForHorizon(selectedScenario, "investments").toLocaleString()}`} />
                  <SummaryItem
                    label="Investment Returns"
                    value={`$${getMetricForHorizon(selectedScenario, "investmentReturns").toLocaleString()}`}
                  />
                  <SummaryItem
                    label="Net Worth"
                    value={`$${getMetricForHorizon(selectedScenario, "netWorth").toLocaleString()}`}
                  />
                    <SummaryItem
                      label="Emergency Fund Coverage"
                      value={
                        selectedScenario.metrics?.emergencyFundYears != null
                          ? `${selectedScenario.metrics.emergencyFundYears.toFixed(1)} months`
                          : "—"
                      }
                    />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function CurrentStatusStat({
  label,
  value,
  testId,
  children,
}: {
  label: string;
  value: string;
  testId?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
      <p className="text-2xl font-bold font-mono" data-testid={testId}>
        {value}
      </p>
      {children}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-mono font-medium">{value}</p>
    </div>
  );
}

