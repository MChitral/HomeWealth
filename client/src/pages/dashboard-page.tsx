import { MetricCard } from "@/components/metric-card";
import { NetWorthChart } from "@/components/net-worth-chart";
import { MortgageBalanceChart } from "@/components/mortgage-balance-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Home, TrendingUp, Wallet, PiggyBank, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function DashboardPage() {
  const [selectedScenario, setSelectedScenario] = useState("balanced");

  // Mock scenarios for the selector
  const scenarios = [
    { id: "balanced", name: "Balanced Strategy" },
    { id: "aggressive", name: "Aggressive Prepayment" },
    { id: "invest", name: "Investment Focus" },
  ];

  // Scenario-specific projection data
  const scenarioData = {
    balanced: {
      netWorthData: [
        { year: 0, netWorth: 100000 },
        { year: 2, netWorth: 185000 },
        { year: 4, netWorth: 280000 },
        { year: 6, netWorth: 385000 },
        { year: 8, netWorth: 500000 },
        { year: 10, netWorth: 625000 },
      ],
      mortgageData: [
        { year: 0, balance: 400000, principal: 0, interest: 0 },
        { year: 2, balance: 360000, principal: 30000, interest: 10000 },
        { year: 4, balance: 315000, principal: 65000, interest: 20000 },
        { year: 6, balance: 265000, principal: 105000, interest: 30000 },
        { year: 8, balance: 210000, principal: 150000, interest: 40000 },
        { year: 10, balance: 150000, principal: 200000, interest: 50000 },
      ],
      investmentData: [
        { year: 0, netWorth: 15000 },
        { year: 2, netWorth: 35000 },
        { year: 4, netWorth: 65000 },
        { year: 6, netWorth: 105000 },
        { year: 8, netWorth: 155000 },
        { year: 10, netWorth: 195000 },
      ],
      projected10YearNetWorth: "$625,000",
      projected10YearMortgage: "$150,000",
      projected10YearInvestments: "$195,000",
    },
    aggressive: {
      netWorthData: [
        { year: 0, netWorth: 100000 },
        { year: 2, netWorth: 180000 },
        { year: 4, netWorth: 270000 },
        { year: 6, netWorth: 365000 },
        { year: 8, netWorth: 470000 },
        { year: 10, netWorth: 587000 },
      ],
      mortgageData: [
        { year: 0, balance: 400000, principal: 0, interest: 0 },
        { year: 2, balance: 340000, principal: 45000, interest: 15000 },
        { year: 4, balance: 275000, principal: 95000, interest: 30000 },
        { year: 6, balance: 205000, principal: 150000, interest: 45000 },
        { year: 8, balance: 130000, principal: 210000, interest: 60000 },
        { year: 10, balance: 50000, principal: 275000, interest: 75000 },
      ],
      investmentData: [
        { year: 0, netWorth: 15000 },
        { year: 2, netWorth: 25000 },
        { year: 4, netWorth: 40000 },
        { year: 6, netWorth: 60000 },
        { year: 8, netWorth: 85000 },
        { year: 10, netWorth: 115000 },
      ],
      projected10YearNetWorth: "$587,000",
      projected10YearMortgage: "$50,000",
      projected10YearInvestments: "$115,000",
    },
    invest: {
      netWorthData: [
        { year: 0, netWorth: 100000 },
        { year: 2, netWorth: 190000 },
        { year: 4, netWorth: 295000 },
        { year: 6, netWorth: 415000 },
        { year: 8, netWorth: 550000 },
        { year: 10, netWorth: 680000 },
      ],
      mortgageData: [
        { year: 0, balance: 400000, principal: 0, interest: 0 },
        { year: 2, balance: 375000, principal: 20000, interest: 5000 },
        { year: 4, balance: 345000, principal: 45000, interest: 10000 },
        { year: 6, balance: 310000, principal: 75000, interest: 15000 },
        { year: 8, balance: 270000, principal: 110000, interest: 20000 },
        { year: 10, balance: 225000, principal: 150000, interest: 25000 },
      ],
      investmentData: [
        { year: 0, netWorth: 15000 },
        { year: 2, netWorth: 45000 },
        { year: 4, netWorth: 85000 },
        { year: 6, netWorth: 135000 },
        { year: 8, netWorth: 195000 },
        { year: 10, netWorth: 265000 },
      ],
      projected10YearNetWorth: "$680,000",
      projected10YearMortgage: "$225,000",
      projected10YearInvestments: "$265,000",
    },
  };

  const currentData = scenarioData[selectedScenario as keyof typeof scenarioData];

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

      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Current Financial Status</CardTitle>
          <p className="text-sm text-muted-foreground">As of today</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Net Worth</p>
              <p className="text-2xl font-bold font-mono">$100,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Mortgage Balance</p>
              <p className="text-2xl font-bold font-mono">$400,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Emergency Fund</p>
              <p className="text-2xl font-bold font-mono">$5,000</p>
              <p className="text-sm text-muted-foreground mt-1">Target: $30,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Investments</p>
              <p className="text-2xl font-bold font-mono">$15,000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Projections</h2>
          <p className="text-sm text-muted-foreground">10-year forecast based on selected scenario</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Viewing Scenario:</span>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Net Worth (10yr)"
          value={currentData.projected10YearNetWorth}
          subtitle="Projected total"
          icon={TrendingUp}
          trend={{ value: "+525% from current", direction: "up" }}
        />
        <MetricCard
          title="Mortgage (10yr)"
          value={currentData.projected10YearMortgage}
          subtitle="Remaining balance"
          icon={Home}
        />
        <MetricCard
          title="Investments (10yr)"
          value={currentData.projected10YearInvestments}
          subtitle="Portfolio value"
          icon={Wallet}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Net Worth Projection</CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on <span className="font-medium">{scenarios.find(s => s.id === selectedScenario)?.name}</span>
          </p>
        </CardHeader>
        <CardContent>
          <NetWorthChart data={currentData.netWorthData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Mortgage Paydown</CardTitle>
            <p className="text-sm text-muted-foreground">Principal vs interest over time</p>
          </CardHeader>
          <CardContent>
            <MortgageBalanceChart data={currentData.mortgageData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Investment Growth</CardTitle>
            <p className="text-sm text-muted-foreground">Total portfolio value</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <NetWorthChart data={currentData.investmentData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
