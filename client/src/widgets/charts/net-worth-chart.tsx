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

interface NetWorthDataPoint {
  year: number;
  netWorth: number;
  scenario?: string;
}

interface NetWorthChartProps {
  data: NetWorthDataPoint[];
  scenarios?: string[];
}

export function NetWorthChart({ data, scenarios = ["Current"] }: NetWorthChartProps) {
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
        <YAxis tickFormatter={formatCurrency} stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          formatter={(value: number) => `$${value.toLocaleString()}`}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="netWorth"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={false}
          name="Net Worth"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
