import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { MonteCarloResult } from "@/types/monte-carlo";
import { formatCurrency } from "@/shared/lib/utils";

interface MonteCarloResultsProps {
  result: MonteCarloResult;
}

export function MonteCarloResults({ result }: MonteCarloResultsProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatRate = (value: number) => `${(value * 100).toFixed(2)}%`;

  // Prepare data for rate path chart
  const ratePathData = result.ratePathStats.map((stat) => ({
    month: stat.month,
    mean: stat.mean * 100,
    p10: stat.p10 * 100,
    p50: stat.p50 * 100,
    p90: stat.p90 * 100,
    min: stat.min * 100,
    max: stat.max * 100,
  }));

  // Prepare data for balance distribution chart
  const balancePathData = result.samplePaths[0]
    ?.map((_, monthIndex) => {
      const balances = result.samplePaths
        .map((path) => path[monthIndex]?.balance ?? 0)
        .filter((b) => b > 0);
      if (balances.length === 0) return null;

      balances.sort((a, b) => a - b);
      const p10Index = Math.floor(balances.length * 0.1);
      const p50Index = Math.floor(balances.length * 0.5);
      const p90Index = Math.floor(balances.length * 0.9);

      return {
        month: monthIndex,
        p10: balances[p10Index],
        p50: balances[p50Index],
        p90: balances[p90Index],
        mean: balances.reduce((sum, b) => sum + b, 0) / balances.length,
      };
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Probability of Payoff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(result.probabilityOfPayoff)}</div>
            <p className="text-xs text-muted-foreground">{result.iterations} iterations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Median Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(result.balanceDistribution.p50)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(result.balanceDistribution.p10)} -{" "}
              {formatCurrency(result.balanceDistribution.p90)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Median Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(result.interestDistribution.p50)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(result.interestDistribution.p10)} -{" "}
              {formatCurrency(result.interestDistribution.p90)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance Std Dev</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(result.balanceDistribution.stdDev)}
            </div>
            <p className="text-xs text-muted-foreground">Uncertainty measure</p>
          </CardContent>
        </Card>
      </div>

      {/* Rate Path Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Interest Rate Paths</CardTitle>
          <CardDescription>Simulated interest rate paths with confidence intervals</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={ratePathData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={{ value: "Month", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "Rate (%)", angle: -90, position: "insideLeft" }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                formatter={(value: number) => formatRate(value / 100)}
                labelFormatter={(month) => `Month ${month}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="min"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.1}
                name="Min Rate"
              />
              <Area
                type="monotone"
                dataKey="p10"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
                name="10th Percentile"
              />
              <Area
                type="monotone"
                dataKey="p50"
                stackId="1"
                stroke="#ffc658"
                fill="#ffc658"
                fillOpacity={0.5}
                name="Median (50th)"
              />
              <Area
                type="monotone"
                dataKey="p90"
                stackId="1"
                stroke="#ff7300"
                fill="#ff7300"
                fillOpacity={0.3}
                name="90th Percentile"
              />
              <Area
                type="monotone"
                dataKey="max"
                stackId="1"
                stroke="#ff0000"
                fill="#ff0000"
                fillOpacity={0.1}
                name="Max Rate"
              />
              <Line
                type="monotone"
                dataKey="mean"
                stroke="#000000"
                strokeWidth={2}
                dot={false}
                name="Mean Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Balance Distribution Chart */}
      {balancePathData && balancePathData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Balance Distribution Over Time</CardTitle>
            <CardDescription>Mortgage balance paths with confidence intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={balancePathData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  label={{ value: "Month", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Balance ($)", angle: -90, position: "insideLeft" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(month) => `Month ${month}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="p10"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                  name="10th Percentile"
                />
                <Area
                  type="monotone"
                  dataKey="p50"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                  fillOpacity={0.5}
                  name="Median (50th)"
                />
                <Area
                  type="monotone"
                  dataKey="p90"
                  stackId="1"
                  stroke="#ff7300"
                  fill="#ff7300"
                  fillOpacity={0.3}
                  name="90th Percentile"
                />
                <Line
                  type="monotone"
                  dataKey="mean"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={false}
                  name="Mean Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Distribution Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Balance Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">10th Percentile:</span>
              <span className="font-medium">{formatCurrency(result.balanceDistribution.p10)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Median (50th):</span>
              <span className="font-medium">{formatCurrency(result.balanceDistribution.p50)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">90th Percentile:</span>
              <span className="font-medium">{formatCurrency(result.balanceDistribution.p90)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mean:</span>
              <span className="font-medium">{formatCurrency(result.balanceDistribution.mean)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Std Deviation:</span>
              <span className="font-medium">
                {formatCurrency(result.balanceDistribution.stdDev)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interest Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">10th Percentile:</span>
              <span className="font-medium">{formatCurrency(result.interestDistribution.p10)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Median (50th):</span>
              <span className="font-medium">{formatCurrency(result.interestDistribution.p50)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">90th Percentile:</span>
              <span className="font-medium">{formatCurrency(result.interestDistribution.p90)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mean:</span>
              <span className="font-medium">
                {formatCurrency(result.interestDistribution.mean)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Interest:</span>
              <span className="font-medium">
                {formatCurrency(result.interestDistribution.totalInterestPaid)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
