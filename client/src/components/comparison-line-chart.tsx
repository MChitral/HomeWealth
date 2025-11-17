import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ComparisonDataPoint {
  year: number;
  [key: string]: number;
}

interface ComparisonLineChartProps {
  data: ComparisonDataPoint[];
  scenarios: Array<{ id: string; name: string; color: string }>;
  title?: string;
  yAxisLabel?: string;
}

export function ComparisonLineChart({ data, scenarios, yAxisLabel }: ComparisonLineChartProps) {
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="year" 
          stroke="hsl(var(--muted-foreground))"
          label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          tickFormatter={formatCurrency} 
          stroke="hsl(var(--muted-foreground))"
          label={{ value: yAxisLabel || 'Value', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: number) => `$${value.toLocaleString()}`}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Legend />
        {scenarios.map((scenario) => (
          <Line
            key={scenario.id}
            type="monotone"
            dataKey={scenario.id}
            stroke={scenario.color}
            strokeWidth={2}
            dot={false}
            name={scenario.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
