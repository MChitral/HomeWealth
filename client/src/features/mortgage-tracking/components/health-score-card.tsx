import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/shared/ui/button";
import { getHealthScore } from "../api/health-api"; // Fixing import path
import { Activity, Shield, TrendingUp, Zap, HelpCircle } from "lucide-react";
import { Progress } from "@/shared/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface HealthScoreCardProps {
  mortgageId: string;
  className?: string;
}

export function HealthScoreCard({ mortgageId, className }: HealthScoreCardProps) {
  const { data: health, isLoading } = useQuery({
    queryKey: ["health-score", mortgageId],
    queryFn: () => getHealthScore(mortgageId),
    enabled: !!mortgageId,
  });

  if (isLoading || !health) return null;

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const scoreColor = getScoreColor(health.totalScore);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Mortgage Health
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">
                  A composite score (0-100) based on Risk, Efficiency, and Flexibility.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Optimization status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative flex items-center justify-center">
            {/* Simple SVG Circular Gauge could go here, or just big text for MVP */}
            <div className={cn("text-5xl font-bold tracking-tighter", scoreColor)}>
              {health.totalScore}
            </div>
            {/* Ring Background (Visual Flair) */}
            <div className="absolute inset-0 rounded-full border-4 border-muted opacity-20 scale-150 w-24 h-24 -z-10" />
            <div
              className={cn(
                "absolute inset-0 rounded-full border-4 border-current opacity-20 scale-150 w-24 h-24 -z-10",
                scoreColor
              )}
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% ${health.totalScore}%, 0 ${health.totalScore}%)`,
              }}
              /* Note: Simple ClipPath not ideal for radial without complex CSS, keeping simple for MVP */
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            {health.totalScore >= 80
              ? "Excellent Condition"
              : health.totalScore >= 60
                ? "Good - Room for optimizations"
                : "Needs Attention"}
          </p>
        </div>

        {/* Pillars */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Shield className="h-3.5 w-3.5 text-blue-500" /> Risk Safety
              </span>
              <span className="text-muted-foreground">{health.riskScore}/100</span>
            </div>
            <Progress value={health.riskScore} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Efficiency
              </span>
              <span className="text-muted-foreground">{health.efficiencyScore}/100</span>
            </div>
            <Progress value={health.efficiencyScore} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> Flexibility
              </span>
              <span className="text-muted-foreground">{health.flexibilityScore}/100</span>
            </div>
            <Progress value={health.flexibilityScore} className="h-1.5" />
          </div>
        </div>

        {/* Insights */}
        {health.breakdown.length > 0 && (
          <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1">
            <p className="font-semibold text-foreground mb-2">Key Insights:</p>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              {health.breakdown.slice(0, 3).map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          <Link href={`/mortgages/${mortgageId}/analytics`}>
            <Button variant="outline" className="w-full text-xs h-8">
              View Risk Analytics
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
