import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface StrategicInsightsPanelProps {
  utilization: number;
  availableCredit: number;
  isLinked: boolean;
}

export function StrategicInsightsPanel({
  utilization,
  availableCredit,
  isLinked,
}: StrategicInsightsPanelProps) {
  const insights = [];

  // Risk Insight
  if (utilization > 75) {
    insights.push({
      type: "warning",
      title: "High Utilization Alert",
      message: `You are using ${utilization.toFixed(1)}% of your credit limit. Lenders may view this as high risk. Consider paying down balance to below 65% to improve your credit score impact.`,
      icon: AlertTriangle,
    });
  } else if (utilization > 0 && utilization < 30) {
    insights.push({
      type: "success",
      title: "Healthy Utilization",
      message:
        "Your credit utilization is excellent (<30%). This positively impacts your credit score.",
      icon: CheckCircle,
    });
  }

  // Opportunity Insight
  if (availableCredit > 20000) {
    insights.push({
      type: "opportunity",
      title: "Investment Capacity",
      message: `You have significant available equity ($${(availableCredit / 1000).toFixed(0)}k). This could be used for home improvements (ROI ~50-70%) or diversified investments.`,
      icon: TrendingUp,
    });
  }

  // Linking Insight
  if (!isLinked) {
    insights.push({
      type: "info",
      title: "Unlock Re-advanceable Features",
      message:
        "This account is not linked to a mortgage. Link it to specific mortgage to enable automatic credit limit growth tracking (The Smith Maneuver foundation).",
      icon: Lightbulb,
    });
  }

  if (insights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Strategic Insights
        </CardTitle>
        <CardDescription>Personalized recommendations for your equity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, idx) => (
          <Alert
            key={idx}
            variant={insight.type === "warning" ? "destructive" : "default"}
            className={cn(
              insight.type === "opportunity" &&
                "border-green-200 bg-green-50 dark:bg-green-900/10 text-green-900 dark:text-green-100",
              insight.type === "success" &&
                "border-blue-200 bg-blue-50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-100",
              insight.type === "info" && "border-slate-200 bg-slate-50 dark:bg-slate-900/10"
            )}
          >
            <insight.icon className="h-4 w-4" />
            <AlertTitle>{insight.title}</AlertTitle>
            <AlertDescription>{insight.message}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
