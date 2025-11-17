import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Home, DollarSign, PiggyBank, Calendar, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ComparisonNetWorthChart } from "@/components/comparison-net-worth-chart";
import { ComparisonLineChart } from "@/components/comparison-line-chart";

export default function ComparisonPage() {
  const [selectedScenarios, setSelectedScenarios] = useState(["balanced", "aggressive", "invest"]);
  const [timeHorizon, setTimeHorizon] = useState("10");

  // Mock scenario data - TODO: fetch from backend
  const scenarios = {
    balanced: {
      id: "balanced",
      name: "Balanced Strategy",
      description: "50% prepay, 50% invest surplus",
      color: "hsl(var(--chart-1))",
      metrics: {
        netWorth10yr: 625000,
        netWorth20yr: 1245000,
        mortgageBalance10yr: 195000,
        mortgagePayoffYear: 18.5,
        totalInterestPaid: 92500,
        investments10yr: 185000,
        investmentReturns10yr: 35000,
        emergencyFundYears: 2.1,
        avgCashFlow: 1200,
      },
    },
    aggressive: {
      id: "aggressive",
      name: "Aggressive Prepayment",
      description: "80% prepay, 20% invest surplus",
      color: "hsl(var(--chart-3))",
      metrics: {
        netWorth10yr: 587000,
        netWorth20yr: 1180000,
        mortgageBalance10yr: 125000,
        mortgagePayoffYear: 14.2,
        totalInterestPaid: 68000,
        investments10yr: 95000,
        investmentReturns10yr: 18000,
        emergencyFundYears: 2.1,
        avgCashFlow: 850,
      },
    },
    invest: {
      id: "invest",
      name: "Investment Focus",
      description: "20% prepay, 80% invest surplus",
      color: "hsl(var(--chart-2))",
      metrics: {
        netWorth10yr: 680000,
        netWorth20yr: 1425000,
        mortgageBalance10yr: 245000,
        mortgagePayoffYear: 22.8,
        totalInterestPaid: 118000,
        investments10yr: 285000,
        investmentReturns10yr: 55000,
        emergencyFundYears: 2.1,
        avgCashFlow: 1550,
      },
    },
  };

  const selectedScenarioData = selectedScenarios.map(id => scenarios[id as keyof typeof scenarios]);
  const winner = selectedScenarioData.reduce((prev, current) => 
    current.metrics.netWorth10yr > prev.metrics.netWorth10yr ? current : prev
  );

  // Chart data
  const netWorthData = [
    { year: 0, balanced: 105000, aggressive: 105000, invest: 105000 },
    { year: 2, balanced: 185000, aggressive: 180000, invest: 190000 },
    { year: 4, balanced: 280000, aggressive: 270000, invest: 295000 },
    { year: 6, balanced: 385000, aggressive: 365000, invest: 415000 },
    { year: 8, balanced: 500000, aggressive: 470000, invest: 550000 },
    { year: 10, balanced: 625000, aggressive: 587000, invest: 680000 },
  ];

  const mortgageData = [
    { year: 0, balanced: 397745, aggressive: 397745, invest: 397745 },
    { year: 2, balanced: 355000, aggressive: 340000, invest: 365000 },
    { year: 4, balanced: 310000, aggressive: 275000, invest: 330000 },
    { year: 6, balanced: 260000, aggressive: 205000, invest: 295000 },
    { year: 8, balanced: 205000, aggressive: 130000, invest: 255000 },
    { year: 10, balanced: 145000, aggressive: 50000, invest: 210000 },
  ];

  const investmentData = [
    { year: 0, balanced: 5000, aggressive: 5000, invest: 5000 },
    { year: 2, balanced: 45000, aggressive: 28000, invest: 62000 },
    { year: 4, balanced: 95000, aggressive: 58000, invest: 135000 },
    { year: 6, balanced: 155000, aggressive: 95000, invest: 225000 },
    { year: 8, balanced: 225000, aggressive: 138000, invest: 330000 },
    { year: 10, balanced: 305000, aggressive: 188000, invest: 450000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Scenario Comparison</h1>
          <p className="text-muted-foreground">Compare different financial strategies side-by-side</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Time Horizon</label>
            <Select value={timeHorizon} onValueChange={setTimeHorizon}>
              <SelectTrigger className="w-32" data-testid="select-horizon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 Years</SelectItem>
                <SelectItem value="20">20 Years</SelectItem>
                <SelectItem value="30">30 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Winner Card */}
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Highest Net Worth: {winner.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  ${winner.metrics.netWorth10yr.toLocaleString()} at {timeHorizon} years
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Best Overall
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {selectedScenarioData.map((scenario) => {
          const isWinner = scenario.id === winner.id;
          return (
            <Card key={scenario.id} className={isWinner ? "border-primary" : ""}>
              <CardHeader className="space-y-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">{scenario.description}</CardDescription>
                  </div>
                  {isWinner && (
                    <Badge variant="default" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      Winner
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Net Worth ({timeHorizon}yr)</p>
                  <p className="text-3xl font-bold font-mono">${scenario.metrics.netWorth10yr.toLocaleString()}</p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        Mortgage Payoff
                      </span>
                      <span className="text-sm font-mono font-medium">{scenario.metrics.mortgagePayoffYear} yrs</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Total Interest
                      </span>
                      <span className="text-sm font-mono font-medium">${scenario.metrics.totalInterestPaid.toLocaleString()}</span>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Investments ({timeHorizon}yr)
                      </span>
                      <span className="text-sm font-mono font-medium">${scenario.metrics.investments10yr.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <PiggyBank className="h-3 w-3" />
                        Investment Returns
                      </span>
                      <span className="text-sm font-mono font-medium text-green-600">+${scenario.metrics.investmentReturns10yr.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
          <TabsTrigger value="metrics" data-testid="tab-metrics">All Metrics</TabsTrigger>
          <TabsTrigger value="tradeoffs" data-testid="tab-tradeoffs">Trade-offs</TabsTrigger>
          <TabsTrigger value="sensitivity" data-testid="tab-sensitivity">Sensitivity</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Over Time</CardTitle>
              <CardDescription>How your total net worth grows under each strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <ComparisonNetWorthChart 
                data={netWorthData} 
                scenarios={selectedScenarioData.map(s => ({ id: s.id, name: s.name, color: s.color }))}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mortgage Balance</CardTitle>
                <CardDescription>How quickly each strategy pays down the mortgage</CardDescription>
              </CardHeader>
              <CardContent>
                <ComparisonLineChart 
                  data={mortgageData} 
                  scenarios={selectedScenarioData.map(s => ({ id: s.id, name: s.name, color: s.color }))}
                  yAxisLabel="Mortgage Balance"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Growth</CardTitle>
                <CardDescription>Investment portfolio value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ComparisonLineChart 
                  data={investmentData} 
                  scenarios={selectedScenarioData.map(s => ({ id: s.id, name: s.name, color: s.color }))}
                  yAxisLabel="Investment Value"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Metric Comparison</CardTitle>
              <CardDescription>All key financial metrics at {timeHorizon} years</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Metric</th>
                      {selectedScenarioData.map((scenario) => (
                        <th key={scenario.id} className="text-right py-3 px-4 text-sm font-medium">
                          {scenario.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover-elevate">
                      <td className="py-3 px-4 text-sm font-medium">Net Worth ({timeHorizon} years)</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                          ${scenario.metrics.netWorth10yr.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover-elevate">
                      <td className="py-3 px-4 text-sm font-medium">Mortgage Balance ({timeHorizon} years)</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                          ${scenario.metrics.mortgageBalance10yr.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover-elevate">
                      <td className="py-3 px-4 text-sm font-medium">Years to Mortgage Freedom</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                          {scenario.metrics.mortgagePayoffYear} years
                        </td>
                      ))}
                    </tr>
                    <tr className="hover-elevate">
                      <td className="py-3 px-4 text-sm font-medium">Total Interest Paid</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm text-orange-600">
                          ${scenario.metrics.totalInterestPaid.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover-elevate">
                      <td className="py-3 px-4 text-sm font-medium">Investment Portfolio ({timeHorizon} years)</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                          ${scenario.metrics.investments10yr.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover-elevate">
                      <td className="py-3 px-4 text-sm font-medium">Investment Returns Earned</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm text-green-600">
                          +${scenario.metrics.investmentReturns10yr.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover-elevate">
                      <td className="py-3 px-4 text-sm font-medium">Emergency Fund Filled By</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                          Year {scenario.metrics.emergencyFundYears}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover-elevate">
                      <td className="py-3 px-4 text-sm font-medium">Average Monthly Cash Flow</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                          ${scenario.metrics.avgCashFlow.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tradeoffs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Advantages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="font-medium mb-2 text-sm">{scenarios.aggressive.name}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Mortgage freedom 4.3 years faster (14.2 vs 18.5 years)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Save $24,500 in interest vs balanced strategy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Guaranteed return equal to mortgage rate (6.40%)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Lower financial stress with reduced debt</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-2 text-sm">{scenarios.invest.name}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Highest net worth: $55,000 more than aggressive prepay</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Larger investment returns: $55,000 vs $18,000</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Better liquidity and financial flexibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Higher monthly cash flow ($1,550 vs $850)</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Disadvantages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="font-medium mb-2 text-sm">{scenarios.aggressive.name}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Lowest net worth: $93,000 less than invest-focused</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Missed investment growth opportunity ($37,000 less returns)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Lower liquidity - funds locked in home equity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Reduced monthly cash flow ($850 vs $1,550)</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-2 text-sm">{scenarios.invest.name}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Mortgage freedom delayed by 8.6 years (22.8 vs 14.2)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Pay $50,000 more in total interest</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Higher risk - returns not guaranteed like mortgage savings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowDownRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Market volatility exposure</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Decision Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="font-medium mb-2">Choose Aggressive Prepayment If:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• You value debt-free living and peace of mind</li>
                  <li>• You're risk-averse and want guaranteed returns</li>
                  <li>• You're approaching retirement and want to eliminate housing costs</li>
                  <li>• You expect interest rates to stay high or rise</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="font-medium mb-2">Choose Investment Focus If:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• You want to maximize long-term wealth accumulation</li>
                  <li>• You have a long time horizon (10+ years)</li>
                  <li>• You're comfortable with market volatility</li>
                  <li>• You value liquidity and financial flexibility</li>
                </ul>
              </div>
              <div className="p-4 bg-primary/10 rounded-md">
                <p className="font-medium mb-2">Choose Balanced Strategy If:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• You want a middle-ground approach</li>
                  <li>• You want to reduce debt while building investments</li>
                  <li>• You're unsure about future rate and return scenarios</li>
                  <li>• You value diversification and flexibility</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensitivity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sensitivity Analysis</CardTitle>
              <CardDescription>How do different market conditions affect each strategy?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">If Investment Returns Drop to 4% (from 6%)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Aggressive Prepay</p>
                    <p className="text-lg font-mono font-semibold">No change</p>
                    <p className="text-xs text-muted-foreground mt-1">Not dependent on returns</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Balanced</p>
                    <p className="text-lg font-mono font-semibold text-orange-600">-$22,000</p>
                    <p className="text-xs text-muted-foreground mt-1">Still beats aggressive</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Investment Focus</p>
                    <p className="text-lg font-mono font-semibold text-orange-600">-$48,000</p>
                    <p className="text-xs text-muted-foreground mt-1">Still wins overall</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3">If Mortgage Rate Drops to 4.5% (from 6.4%)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Aggressive Prepay</p>
                    <p className="text-lg font-mono font-semibold text-green-600">+$15,000</p>
                    <p className="text-xs text-muted-foreground mt-1">Lower interest cost</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Balanced</p>
                    <p className="text-lg font-mono font-semibold text-green-600">+$12,000</p>
                    <p className="text-xs text-muted-foreground mt-1">Moderate benefit</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Investment Focus</p>
                    <p className="text-lg font-mono font-semibold text-green-600">+$8,000</p>
                    <p className="text-xs text-muted-foreground mt-1">Least benefit (still best)</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3">Breakeven Point: When Does Invest Beat Prepay?</h3>
                <div className="p-4 bg-primary/10 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium mb-2">Investment Returns Needed</p>
                      <p className="text-2xl font-mono font-bold">5.1%</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        At current mortgage rate of 6.4%, investments need to return at least 5.1% annually 
                        (after accounting for semi-annual mortgage compounding) for invest-focus to beat prepay
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Time Horizon Required</p>
                      <p className="text-2xl font-mono font-bold">8+ years</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Investment-focused strategy needs at least 8 years to overcome the guaranteed 
                        mortgage interest savings from prepayment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
