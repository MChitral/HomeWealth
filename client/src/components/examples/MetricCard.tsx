import { MetricCard } from "../metric-card";
import { TrendingUp } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="p-6 bg-background">
      <MetricCard
        title="Net Worth"
        value="$625,000"
        subtitle="10 year projection"
        icon={TrendingUp}
        trend={{ value: "+12.5% vs baseline", direction: "up" }}
      />
    </div>
  );
}
