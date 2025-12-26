import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { PropertyValueTrend } from "../api/property-value-api";

interface PropertyValueTrendChartProps {
  trend: PropertyValueTrend;
}

export function PropertyValueTrendChart({ trend }: PropertyValueTrendChartProps) {
  // Prepare chart data from history
  const chartData = trend.history
    .map((entry) => ({
      date: format(parseISO(entry.valueDate), "MMM yyyy"),
      value: parseFloat(entry.propertyValue),
      fullDate: entry.valueDate,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  // Calculate trend line data points (linear projection)
  const trendLineData =
    chartData.length > 1
      ? chartData.map((point, index) => {
          if (index === 0) return null;
          const prevPoint = chartData[index - 1];
          const timeDiff =
            new Date(point.fullDate).getTime() - new Date(prevPoint.fullDate).getTime();
          const valueDiff = point.value - prevPoint.value;
          const slope = timeDiff > 0 ? valueDiff / (timeDiff / (1000 * 60 * 60 * 24 * 30)) : 0; // Monthly slope
          return {
            ...point,
            trendValue: prevPoint.value + slope,
          };
        })
      : [];

  // Add projection point if available
  if (trend.projectedValue && chartData.length > 0) {
    const lastPoint = chartData[chartData.length - 1];
    const futureDate = new Date(lastPoint.fullDate);
    futureDate.setMonth(futureDate.getMonth() + 12); // 1 year projection
    chartData.push({
      date: format(futureDate, "MMM yyyy"),
      value: trend.projectedValue,
      fullDate: futureDate.toISOString(),
    });
  }

  const getTrendColor = () => {
    switch (trend.trendDirection) {
      case "increasing":
        return "#22c55e"; // green
      case "decreasing":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value: number) => [
              `$${value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
              "Property Value",
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Property Value"
          />
          {trend.projectedValue && chartData.length > 1 && (
            <Line
              type="monotone"
              dataKey="value"
              stroke={getTrendColor()}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: getTrendColor() }}
              name="Projected Value"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
