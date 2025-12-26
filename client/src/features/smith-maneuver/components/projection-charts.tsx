import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
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
import type { YearlyProjection } from "../api";

interface ProjectionChartsProps {
  projections: YearlyProjection[];
}

export function ProjectionCharts({ projections }: ProjectionChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = projections.map((p) => ({
    year: p.year,
    mortgageBalance: Number(p.mortgageBalance),
    helocBalance: Number(p.helocBalance),
    investmentValue: Number(p.investmentValue),
    netBenefit: Number(p.netBenefit),
    taxSavings: Number(p.taxSavings),
    cumulativeNetBenefit: projections
      .filter((proj) => proj.year <= p.year)
      .reduce((sum, proj) => sum + Number(proj.netBenefit), 0),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Net Benefit Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="netBenefit"
                stroke="#10b981"
                name="Annual Net Benefit"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cumulativeNetBenefit"
                stroke="#3b82f6"
                name="Cumulative Net Benefit"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Balances Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="mortgageBalance"
                stroke="#ef4444"
                name="Mortgage Balance"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="helocBalance"
                stroke="#f59e0b"
                name="HELOC Balance"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="investmentValue"
                stroke="#10b981"
                name="Investment Value"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Savings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="taxSavings"
                stroke="#8b5cf6"
                name="Annual Tax Savings"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
