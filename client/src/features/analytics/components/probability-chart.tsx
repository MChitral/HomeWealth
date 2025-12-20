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
import { SimulationResult } from "../api/simulation-api";
import { formatCurrency } from "@/shared/lib/utils";

interface ProbabilityChartProps {
  simulationResult: SimulationResult | null;
}

export function ProbabilityChart({ simulationResult }: ProbabilityChartProps) {
  if (!simulationResult) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 border border-dashed rounded-lg">
        <p className="text-muted-foreground">Run simulation to see projections</p>
      </div>
    );
  }

  // Flatten sample paths for Recharts?
  // Recharts Standard LineChart expects one array of objects with keys for lines.
  // Or we can render multiple Line components.
  // Since we have N paths, we want a dataset like:
  // [{ month: 0, path0: 100k, path1: 100k }, { month: 1, path0: 99k, path1: 98k }]

  // Transform data
  const data: any[] = [];
  const maxMonths = 60; // Horizon from backend

  // Initialize data array
  for (let m = 0; m <= maxMonths; m++) {
    data.push({ month: m });
  }

  // Merge paths
  simulationResult.samplePaths.forEach((path, pathIndex) => {
    path.forEach((point) => {
      if (data[point.month]) {
        data[point.month][`path${pathIndex}`] = point.balance;
      }
    });
  });

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="month"
            label={{ value: "Months", position: "insideBottomRight", offset: -5 }}
          />
          <YAxis tickFormatter={(val) => `$${val / 1000}k`} width={80} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `Month ${label}`}
          />

          {/* Render lines for paths - limiting to first 20 for performance in UI if there are many */}
          {simulationResult.samplePaths.slice(0, 20).map((_, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={`path${index}`}
              stroke="#8884d8"
              strokeWidth={1}
              opacity={0.3}
              dot={false}
              isAnimationActive={false} // Performance
            />
          ))}

          {/* We could add percentile reference lines at the end if we calculated them per month,
              but backend currently only gives final percentiles. */}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Showing {Math.min(20, simulationResult.samplePaths.length)} sample paths of{" "}
        {simulationResult.iterations} iterations.
      </div>
    </div>
  );
}
