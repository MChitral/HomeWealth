import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { scenarioApi } from "@/features/scenario-management/api/scenario-api";
import { formatCurrency } from "@/shared/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function WhatIfRateAnalysis() {
  const [rateChanges, setRateChanges] = useState<string>("-1.0,-0.5,0,0.5,1.0");
  const [timeHorizon, setTimeHorizon] = useState(30);

  const analysisMutation = useMutation({
    mutationFn: scenarioApi.analyzeRateChange,
  });

  const handleAnalyze = () => {
    const changes = rateChanges
      .split(",")
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    analysisMutation.mutate({
      rateChanges: changes,
      timeHorizonYears: timeHorizon,
    });
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const formatRate = (value: number) => `${(value * 100).toFixed(2)}%`;

  if (analysisMutation.isPending) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const result = analysisMutation.data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>What-If Rate Change Analysis</CardTitle>
          <CardDescription>
            See how different interest rate changes would affect your mortgage and financial strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rateChanges">Rate Changes (%)</Label>
              <Input
                id="rateChanges"
                placeholder="-1.0,-0.5,0,0.5,1.0"
                value={rateChanges}
                onChange={(e) => setRateChanges(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of rate changes in percentage points
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeHorizon">Time Horizon (years)</Label>
              <Input
                id="timeHorizon"
                type="number"
                min="1"
                max="30"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(parseInt(e.target.value) || 30)}
              />
            </div>
          </div>
          <Button onClick={handleAnalyze} className="w-full">
            Analyze Rate Changes
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Impact Summary</CardTitle>
              <CardDescription>
                Baseline rate: {formatRate(result.baseline.rate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rate Change</TableHead>
                      <TableHead>New Rate</TableHead>
                      <TableHead>Net Worth Impact</TableHead>
                      <TableHead>Interest Impact</TableHead>
                      <TableHead>Payoff Year Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.scenarios.map((scenario: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {scenario.rateChange > 0 ? (
                              <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : scenario.rateChange < 0 ? (
                              <TrendingDown className="h-4 w-4 text-green-500" />
                            ) : (
                              <Minus className="h-4 w-4 text-gray-500" />
                            )}
                            {formatPercent(scenario.rateChange)}
                          </div>
                        </TableCell>
                        <TableCell>{formatRate(scenario.newRate)}</TableCell>
                        <TableCell
                          className={
                            scenario.impact.netWorthChange >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {formatPercent(
                            (scenario.impact.netWorthChange /
                              result.baseline.metrics.netWorth[timeHorizon]) *
                              100
                          )}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(scenario.impact.interestPaidChange)}
                        </TableCell>
                        <TableCell>
                          {scenario.impact.payoffYearChange > 0 ? "+" : ""}
                          {scenario.impact.payoffYearChange.toFixed(1)} years
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Comparison</CardTitle>
              <CardDescription>
                How net worth changes under different rate scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={result.baseline.projections.map((p: any, yearIndex: number) => {
                    const dataPoint: any = { year: p.year, baseline: p.netWorth };
                    result.scenarios.forEach((scenario: any) => {
                      dataPoint[`rate${scenario.rateChange}`] =
                        scenario.projections[yearIndex]?.netWorth ?? 0;
                    });
                    return dataPoint;
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    label={{ value: "Year", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    label={{ value: "Net Worth ($)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#8884d8"
                    name={`Baseline (${formatRate(result.baseline.rate)})`}
                  />
                  {result.scenarios.map((scenario: any, index: number) => (
                    <Line
                      key={index}
                      type="monotone"
                      dataKey={`rate${scenario.rateChange}`}
                      stroke={scenario.rateChange > 0 ? "#ff7300" : "#82ca9d"}
                      name={`${formatPercent(scenario.rateChange)} (${formatRate(scenario.newRate)})`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {analysisMutation.isError && (
        <Card>
          <CardContent className="text-sm text-destructive py-4">
            Error running analysis. Please check your parameters.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

