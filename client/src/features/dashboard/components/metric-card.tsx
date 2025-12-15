import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div
          className="text-4xl font-bold font-mono"
          data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {value}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <p
            className={`text-sm mt-2 ${trend.direction === "up" ? "text-green-600" : trend.direction === "down" ? "text-red-600" : "text-muted-foreground"}`}
          >
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
