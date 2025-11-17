import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Home, DollarSign, PiggyBank, Calendar, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight, X, GitCompare, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ComparisonNetWorthChart } from "@/components/comparison-net-worth-chart";
import { ComparisonLineChart } from "@/components/comparison-line-chart";

// Chart colors for scenarios
const SCENARIO_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default function ComparisonPage() {
  const [location] = useLocation();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [timeHorizon, setTimeHorizon] = useState("10");

  // Fetch scenarios with calculated projections
  const { data: scenariosWithMetrics, isLoading } = useQuery<any[]>({
    queryKey: ['/api/scenarios/with-projections']
  });

  // Set page title
  useEffect(() => {
    document.title = "Scenario Comparison | Mortgage Strategy";
  }, []);

  // Read URL params on mount and select scenarios
  useEffect(() => {
    if (!scenariosWithMetrics || scenariosWithMetrics.length === 0) return;
    
    const params = new URLSearchParams(window.location.search);
    const scenariosParam = params.get('scenarios');
    
    if (scenariosParam) {
      // If coming from scenario card, add that scenario to selection
      const newScenarios = [...selectedScenarios];
      if (!newScenarios.includes(scenariosParam)) {
        newScenarios.push(scenariosParam);
      }
      setSelectedScenarios(newScenarios.slice(0, 4)); // Max 4 scenarios
    } else if (selectedScenarios.length === 0 && scenariosWithMetrics.length > 0) {
      // Default: select first 2-4 scenarios (up to 4)
      const defaultIds = scenariosWithMetrics.slice(0, 4).map(s => s.id);
      setSelectedScenarios(defaultIds);
    }
  }, [location, scenariosWithMetrics]);

  const toggleScenario = (scenarioId: string) => {
    if (selectedScenarios.includes(scenarioId)) {
      // Remove if already selected (but keep at least 1)
      if (selectedScenarios.length > 1) {
        setSelectedScenarios(selectedScenarios.filter(id => id !== scenarioId));
      }
    } else {
      // Add if not selected (max 4)
      if (selectedScenarios.length < 4) {
        setSelectedScenarios([...selectedScenarios, scenarioId]);
      }
    }
  };

  // Map scenarios with colors and format data
  const scenarios = (scenariosWithMetrics || []).reduce((acc: any, scenario, index) => {
    acc[scenario.id] = {
      ...scenario,
      color: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
      metrics: scenario.metrics || {}
    };
    return acc;
  }, {});

  // All available scenarios for selection
  const allScenarios = (scenariosWithMetrics || []).map(s => ({
    id: s.id,
    name: s.name
  }));

  const selectedScenarioData = selectedScenarios
    .map(id => scenarios[id])
    .filter(Boolean);
  
  // Helper to get horizon-specific metrics
  const getMetricForHorizon = (metrics: any, metricName: 'netWorth' | 'mortgageBalance' | 'investments' | 'investmentReturns') => {
    const suffix = timeHorizon === "10" ? "10yr" : timeHorizon === "20" ? "20yr" : "30yr";
    return metrics?.[`${metricName}${suffix}`] || 0;
  };

  const winner = selectedScenarioData.length > 0 
    ? selectedScenarioData.reduce((prev, current) => 
        getMetricForHorizon(current.metrics, 'netWorth') > getMetricForHorizon(prev.metrics, 'netWorth') ? current : prev
      )
    : null;

  // Generate chart data from real projections
  const generateChartData = (dataKey: 'netWorth' | 'mortgageBalance' | 'investmentValue') => {
    if (!selectedScenarioData.length || !selectedScenarioData[0].projections) return [];
    
    const maxYears = parseInt(timeHorizon);
    const data: any[] = [];
    
    // Sample every 2 years for chart readability (year 0, 2, 4, ... maxYears)
    for (let displayYear = 0; displayYear <= maxYears; displayYear += 2) {
      const dataPoint: any = { year: displayYear };
      
      selectedScenarioData.forEach(scenario => {
        if (scenario.projections && scenario.projections[displayYear]) {
          // projections array now includes year 0, indexed 0-30 for years 0-30
          dataPoint[scenario.id] = scenario.projections[displayYear][dataKey];
        }
      });
      
      data.push(dataPoint);
    }
    
    return data;
  };

  const netWorthData = generateChartData('netWorth');
  const mortgageData = generateChartData('mortgageBalance');
  const investmentData = generateChartData('investmentValue');

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no scenarios selected
  if (selectedScenarios.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold">Scenario Comparison</h1>
            <p className="text-muted-foreground">Compare different financial strategies side-by-side</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10" data-testid="icon-empty-comparison">
            <GitCompare className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center max-w-md space-y-2">
            <h2 className="text-2xl font-semibold" data-testid="heading-empty-comparison">No Scenarios Selected</h2>
            <p className="text-muted-foreground">
              Select up to 4 scenarios from the list below to compare their financial projections side-by-side.
              See which strategy performs best over time.
            </p>
          </div>
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="text-lg">Available Scenarios:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allScenarios.map((scenario) => (
                  <Button
                    key={scenario.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => toggleScenario(scenario.id)}
                    data-testid={`button-empty-select-${scenario.id}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="text-xs font-semibold text-primary">
                        {scenario.name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium">{scenario.name}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <Info className="h-4 w-4 inline mr-1" />
                  Select at least 2 scenarios to see a meaningful comparison
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

      {/* Scenario Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Scenarios to Compare</CardTitle>
          <CardDescription>Choose 1-4 scenarios to compare (click to toggle)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {allScenarios.map((scenario) => {
              const isSelected = selectedScenarios.includes(scenario.id);
              const canDeselect = selectedScenarios.length > 1;
              const canSelect = selectedScenarios.length < 4;
              
              return (
                <Button
                  key={scenario.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => toggleScenario(scenario.id)}
                  disabled={isSelected && !canDeselect || !isSelected && !canSelect}
                  data-testid={`button-select-${scenario.id}`}
                  className="gap-2"
                >
                  {scenario.name}
                  {isSelected && canDeselect && <X className="h-3 w-3" />}
                </Button>
              );
            })}
          </div>
          {selectedScenarios.length === 4 && (
            <p className="text-sm text-muted-foreground mt-3">
              Maximum of 4 scenarios reached. Remove one to add another.
            </p>
          )}
          {selectedScenarios.length === 1 && (
            <p className="text-sm text-muted-foreground mt-3">
              At least 1 scenario must be selected. Add more to compare.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Winner Card */}
      {winner && selectedScenarioData.length > 1 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-2">
                  Best Strategy: {winner.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Highest net worth at {timeHorizon} years with optimal balance of growth and risk
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Net Worth</p>
                    <p className="font-mono font-semibold text-xl text-primary">
                      ${getMetricForHorizon(winner.metrics, 'netWorth').toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mortgage Payoff</p>
                    <p className="font-mono font-semibold text-xl">
                      {winner.metrics.mortgagePayoffYear} years
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                    <p className="font-mono font-semibold text-xl">
                      ${winner.metrics.totalInterestPaid.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Investment Value</p>
                    <p className="font-mono font-semibold text-xl text-green-600">
                      ${getMetricForHorizon(winner.metrics, 'investments').toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Best Overall
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Recommended
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedScenarioData.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Select at least one scenario above to see comparison</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {selectedScenarioData.map((scenario) => {
          const isWinner = winner && scenario.id === winner.id;
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
                  <p className="text-3xl font-bold font-mono">${getMetricForHorizon(scenario.metrics, 'netWorth').toLocaleString()}</p>
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
                      <span className="text-sm font-mono font-medium">${getMetricForHorizon(scenario.metrics, 'investments').toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <PiggyBank className="h-3 w-3" />
                        Investment Returns
                      </span>
                      <span className="text-sm font-mono font-medium text-green-600">+${getMetricForHorizon(scenario.metrics, 'investmentReturns').toLocaleString()}</span>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
          <TabsTrigger value="metrics" data-testid="tab-metrics">All Metrics</TabsTrigger>
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
                          ${getMetricForHorizon(scenario.metrics, 'netWorth').toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover-elevate">
                      <td className="py-3 px-4 text-sm font-medium">Mortgage Balance ({timeHorizon} years)</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                          ${getMetricForHorizon(scenario.metrics, 'mortgageBalance').toLocaleString()}
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
                          ${getMetricForHorizon(scenario.metrics, 'investments').toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover-elevate">
                      <td className="py-3 px-4 text-sm font-medium">Investment Returns Earned</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm text-green-600">
                          +${getMetricForHorizon(scenario.metrics, 'investmentReturns').toLocaleString()}
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
                      <td className="py-3 px-4 text-sm font-medium">Average Monthly Surplus</td>
                      {selectedScenarioData.map((scenario) => (
                        <td key={scenario.id} className="text-right py-3 px-4 font-mono text-sm">
                          ${scenario.metrics.avgMonthlySurplus.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
