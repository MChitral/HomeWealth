import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NetWorthChart } from "@/components/net-worth-chart";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy } from "lucide-react";

export default function ComparisonPage() {
  const comparisonData = [
    { year: 0, aggressive: 100000, balanced: 100000, invest: 100000 },
    { year: 2, aggressive: 180000, balanced: 185000, invest: 190000 },
    { year: 4, aggressive: 270000, balanced: 280000, invest: 295000 },
    { year: 6, aggressive: 365000, balanced: 385000, invest: 415000 },
    { year: 8, aggressive: 470000, balanced: 500000, invest: 550000 },
    { year: 10, aggressive: 587000, balanced: 625000, invest: 680000 },
  ];

  const scenarios = [
    {
      name: "Aggressive Prepayment",
      color: "hsl(var(--chart-3))",
      netWorth10yr: "$587,000",
      mortgageBalance: "$125,000",
      investments: "$62,000",
    },
    {
      name: "Balanced Strategy",
      color: "hsl(var(--chart-1))",
      netWorth10yr: "$625,000",
      mortgageBalance: "$150,000",
      investments: "$125,000",
    },
    {
      name: "Investment Focus",
      color: "hsl(var(--chart-2))",
      netWorth10yr: "$680,000",
      mortgageBalance: "$185,000",
      investments: "$195,000",
      winner: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Scenario Comparison</h1>
        <p className="text-muted-foreground">Compare prepayment vs investment strategies</p>
      </div>

      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-semibold">Winner: Investment Focus</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Highest net worth at 10 years: <span className="font-mono font-semibold">$680,000</span>
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Net Worth Comparison (10 Years)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {/* Mock multi-line chart */}
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">Multi-scenario comparison chart</p>
              <div className="flex justify-center gap-4">
                {scenarios.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: s.color }} />
                    <span className="text-sm">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <Card key={scenario.name} className={scenario.winner ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">{scenario.name}</CardTitle>
                {scenario.winner && <Badge variant="default">Winner</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Net Worth (10yr)</p>
                <p className="text-2xl font-bold font-mono">{scenario.netWorth10yr}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mortgage Balance</span>
                  <span className="text-sm font-mono font-medium">{scenario.mortgageBalance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Investments</span>
                  <span className="text-sm font-mono font-medium">{scenario.investments}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-2 bg-primary rounded" />
            <p className="text-sm">
              <span className="font-medium">Investment Focus</span> strategy yields the highest net worth after 10 years,
              driven by market returns outpacing mortgage interest rates.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-chart-2 rounded" />
            <p className="text-sm">
              <span className="font-medium">Balanced Strategy</span> provides a middle ground with moderate debt reduction
              and investment growth.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 bg-chart-3 rounded" />
            <p className="text-sm">
              <span className="font-medium">Aggressive Prepayment</span> reduces mortgage fastest but misses out on
              investment growth potential.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
