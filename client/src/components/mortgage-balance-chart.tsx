import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MortgageDataPoint {
  year: number;
  balance: number;
  principal: number;
  interest: number;
}

interface MortgageBalanceChartProps {
  data: MortgageDataPoint[];
}

export function MortgageBalanceChart({ data }: MortgageBalanceChartProps) {
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        <Area
          type="monotone"
          dataKey="interest"
          stackId="1"
          stroke="hsl(var(--chart-3))"
          fill="hsl(var(--chart-3))"
          name="Interest Paid"
        />
        <Area
          type="monotone"
          dataKey="principal"
          stackId="1"
          stroke="hsl(var(--chart-2))"
          fill="hsl(var(--chart-2))"
          name="Principal Paid"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
