import { MetricCard } from "@/components/metric-card";
import { NetWorthChart } from "@/components/net-worth-chart";
import { MortgageBalanceChart } from "@/components/mortgage-balance-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, TrendingUp, Wallet, AlertCircle, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Scenario, EmergencyFund, Mortgage, CashFlow } from "@shared/schema";

type ScenarioWithMetrics = Scenario & {
  metrics: {
    netWorth10yr: number;
    netWorth20yr: number;
    netWorth30yr: number;
    mortgageBalance10yr: number;
    mortgageBalance20yr: number;
    mortgageBalance30yr: number;
    investments10yr: number;
    investments20yr: number;
    investments30yr: number;
    investmentReturns10yr: number;
    investmentReturns20yr: number;
    investmentReturns30yr: number;
    mortgagePayoffYear: number;
    totalInterestPaid: number;
    emergencyFundYears: number;
    avgMonthlySurplus: number;
    netWorthProjections: number[];
    mortgageBalanceProjections: number[];
    investmentProjections: number[];
  };
};

export default function DashboardPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<10 | 20 | 30>(10);

  // Set page title
  useEffect(() => {
    document.title = "Dashboard | Mortgage Strategy";
  }, []);

  // Fetch all data from backend
  const { data: scenarios, isLoading: scenariosLoading } = useQuery<ScenarioWithMetrics[]>({
    queryKey: ['/api/scenarios/with-projections'],
  });

  const { data: emergencyFund, isLoading: efLoading } = useQuery<EmergencyFund | null>({
    queryKey: ['/api/emergency-fund'],
  });

  const { data: mortgages, isLoading: mortgageLoading } = useQuery<Mortgage[]>({
    queryKey: ['/api/mortgages'],
  });

  const { data: cashFlow, isLoading: cashFlowLoading } = useQuery<CashFlow | null>({
    queryKey: ['/api/cash-flow'],
  });

  // Get first mortgage (MVP assumes single mortgage)
  const mortgage = mortgages && mortgages.length > 0 ? mortgages[0] : null;

  // Set default selected scenario to first one
  useEffect(() => {
    if (scenarios && scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].id);
    }
  }, [scenarios, selectedScenarioId]);

  // Helper to get metric value based on selected horizon
  const getMetricForHorizon = (metricName: 'netWorth' | 'mortgageBalance' | 'investments' | 'investmentReturns'): number => {
    if (!selectedScenario?.metrics) return 0;
    const key = `${metricName}${selectedHorizon}yr` as keyof typeof selectedScenario.metrics;
    return Number(selectedScenario.metrics[key] || 0);
  };

  const isLoading = scenariosLoading || efLoading || mortgageLoading || cashFlowLoading;

  // Get selected scenario data
  const selectedScenario = scenarios?.find(s => s.id === selectedScenarioId);

  // Calculate current financial status with guards to prevent NaN
  const homeValue = mortgage && mortgage.propertyPrice ? Number(mortgage.propertyPrice) : 0;
  const mortgageBalance = mortgage && mortgage.currentBalance ? Number(mortgage.currentBalance) : 0;
  const originalMortgageBalance = mortgage && mortgage.originalAmount ? Number(mortgage.originalAmount) : 0;
  const efBalance = emergencyFund && emergencyFund.currentBalance ? Number(emergencyFund.currentBalance) : 0;
  
  const currentNetWorth = (homeValue - mortgageBalance) + efBalance;
  
  // Calculate emergency fund target from months
  const monthlyExpenses = cashFlow ? 
    (Number(cashFlow.propertyTax || 0) + Number(cashFlow.homeInsurance || 0) + 
     Number(cashFlow.condoFees || 0) + Number(cashFlow.utilities || 0) + 
     Number(cashFlow.groceries || 0) + Number(cashFlow.dining || 0) + 
     Number(cashFlow.transportation || 0) + Number(cashFlow.entertainment || 0)) : 0;
  
  const efTargetAmount = emergencyFund && emergencyFund.targetMonths && monthlyExpenses > 0 ? 
    Number(emergencyFund.targetMonths) * monthlyExpenses : 0;

  // Helper to convert projection arrays to chart data (every 2 years for readability)
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

  // Show loading skeleton
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

  // Show empty state if no scenarios
  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">Your financial overview and projections</p>
          </div>
          <Link href="/scenarios/new">
            <Button data-testid="button-new-scenario">
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          </Link>
        </div>

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">Your financial overview and projections</p>
        </div>
        <Link href="/scenarios/new">
          <Button data-testid="button-new-scenario">
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </Link>
      </div>

      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Current Financial Status</CardTitle>
          <p className="text-sm text-muted-foreground">As of today</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Home Equity</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-current-equity">
                ${(homeValue - mortgageBalance).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Emergency Fund</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-current-ef">
                ${efBalance.toLocaleString()}
              </p>
              {efTargetAmount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Target: ${efTargetAmount.toLocaleString()}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Home Value</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-home-value">
                ${homeValue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Mortgage Balance</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-mortgage-balance">
                ${mortgageBalance.toLocaleString()}
              </p>
            </div>
          </div>

          {mortgage && (
            <>
              <Separator />
              <div>
                <h3 className="text-base font-semibold mb-4">Current Mortgage Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Original Amount</p>
                    <p className="text-base font-mono font-medium">${Number(mortgage.originalAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Down Payment</p>
                    <p className="text-base font-mono font-medium">${Number(mortgage.downPayment).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Frequency</p>
                    <p className="text-base font-mono font-medium capitalize">{mortgage.paymentFrequency}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Projections</h2>
          <p className="text-sm text-muted-foreground">{selectedHorizon}-year forecast based on selected scenario</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Time Horizon:</span>
          <div className="flex gap-1 border rounded-md p-1" data-testid="horizon-selector">
            {([10, 20, 30] as const).map((horizon) => (
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
      </div>

      {selectedScenario && selectedScenario.metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title={`Net Worth (${selectedHorizon}yr)`}
              value={`$${getMetricForHorizon('netWorth').toLocaleString()}`}
              subtitle="Projected total"
              icon={TrendingUp}
              data-testid={`card-networth-${selectedHorizon}yr`}
            />
            <MetricCard
              title={`Mortgage (${selectedHorizon}yr)`}
              value={`$${getMetricForHorizon('mortgageBalance').toLocaleString()}`}
              subtitle="Remaining balance"
              icon={Home}
              data-testid={`card-mortgage-${selectedHorizon}yr`}
            />
            <MetricCard
              title={`Investments (${selectedHorizon}yr)`}
              value={`$${getMetricForHorizon('investments').toLocaleString()}`}
              subtitle="Portfolio value"
              icon={Wallet}
              data-testid={`card-investments-${selectedHorizon}yr`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Mortgage Details - {selectedScenario.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Projected mortgage journey</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Projected Payoff</p>
                  <p className="text-xl font-bold font-mono" data-testid="text-payoff-year">
                    {selectedScenario.metrics.mortgagePayoffYear.toFixed(1)} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-xl font-bold font-mono" data-testid="text-total-interest">
                    ${selectedScenario.metrics.totalInterestPaid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Monthly Surplus</p>
                  <p className="text-xl font-bold font-mono" data-testid="text-avg-surplus">
                    ${selectedScenario.metrics.avgMonthlySurplus.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="relative">
                <MortgageBalanceChart data={getMortgageChartData(selectedScenario.metrics.mortgageBalanceProjections)} />
                <div className="absolute top-4 left-4 bg-card/90 border border-border rounded-md px-3 py-2">
                  <p className="text-xs text-muted-foreground">← You are here (Year 0)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Net Worth Projection</CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on <span className="font-medium">{selectedScenario.name}</span>
              </p>
            </CardHeader>
            <CardContent>
              <NetWorthChart data={getChartData(selectedScenario.metrics.netWorthProjections)} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Investment Growth</CardTitle>
                <p className="text-sm text-muted-foreground">Total portfolio value projection</p>
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
                <p className="text-sm text-muted-foreground">{selectedScenario.name}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{selectedHorizon}-Year Net Worth</span>
                    <span className="text-lg font-mono font-semibold text-green-600" data-testid={`text-summary-net-worth-(${selectedHorizon}yr)`}>
                      ${getMetricForHorizon('netWorth').toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mortgage Reduction ({selectedHorizon}yr)</span>
                    <span className="text-lg font-mono font-semibold" data-testid={`text-summary-mortgage-reduction-(${selectedHorizon}yr)`}>
                      ${(mortgageBalance - getMetricForHorizon('mortgageBalance')).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Investment Returns</span>
                    <span className="text-lg font-mono font-semibold text-blue-600" data-testid={`text-summary-investment-returns-(${selectedHorizon}yr)`}>
                      +${getMetricForHorizon('investmentReturns').toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Emergency Fund Filled By</span>
                    <span className="text-lg font-mono font-semibold" data-testid="text-summary-ef-years">
                      Year {selectedScenario.metrics.emergencyFundYears}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
