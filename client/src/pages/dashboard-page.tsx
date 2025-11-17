import { MetricCard } from "@/components/metric-card";
import { NetWorthChart } from "@/components/net-worth-chart";
import { MortgageBalanceChart } from "@/components/mortgage-balance-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, TrendingUp, Wallet, PiggyBank, Plus } from "lucide-react";
import { Link } from "wouter";

export default function DashboardPage() {
  const netWorthData = [
    { year: 0, netWorth: 100000 },
    { year: 2, netWorth: 185000 },
    { year: 4, netWorth: 280000 },
    { year: 6, netWorth: 385000 },
    { year: 8, netWorth: 500000 },
    { year: 10, netWorth: 625000 },
  ];

  const mortgageData = [
    { year: 0, balance: 400000, principal: 0, interest: 0 },
    { year: 2, balance: 360000, principal: 30000, interest: 10000 },
    { year: 4, balance: 315000, principal: 65000, interest: 20000 },
    { year: 6, balance: 265000, principal: 105000, interest: 30000 },
    { year: 8, balance: 210000, principal: 150000, interest: 40000 },
    { year: 10, balance: 150000, principal: 200000, interest: 50000 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your financial strategy</p>
        </div>
        <Link href="/scenarios/new">
          <Button data-testid="button-new-scenario">
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Net Worth"
          value="$625,000"
          subtitle="10 year projection"
          icon={TrendingUp}
          trend={{ value: "+12.5% vs baseline", direction: "up" }}
        />
        <MetricCard
          title="Mortgage Balance"
          value="$150,000"
          subtitle="Remaining principal"
          icon={Home}
        />
        <MetricCard
          title="Emergency Fund"
          value="$30,000"
          subtitle="Target reached"
          icon={PiggyBank}
        />
        <MetricCard
          title="Investments"
          value="$195,000"
          subtitle="TFSA + RRSP"
          icon={Wallet}
          trend={{ value: "+6.2% annual return", direction: "up" }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Net Worth Projection</CardTitle>
          <p className="text-sm text-muted-foreground">10-year forecast based on current scenario</p>
        </CardHeader>
        <CardContent>
          <NetWorthChart data={netWorthData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Mortgage Paydown</CardTitle>
            <p className="text-sm text-muted-foreground">Principal vs interest over time</p>
          </CardHeader>
          <CardContent>
            <MortgageBalanceChart data={mortgageData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Investment Growth</CardTitle>
            <p className="text-sm text-muted-foreground">Total portfolio value</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <NetWorthChart
                data={[
                  { year: 0, netWorth: 5000 },
                  { year: 2, netWorth: 25000 },
                  { year: 4, netWorth: 55000 },
                  { year: 6, netWorth: 95000 },
                  { year: 8, netWorth: 145000 },
                  { year: 10, netWorth: 195000 },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
