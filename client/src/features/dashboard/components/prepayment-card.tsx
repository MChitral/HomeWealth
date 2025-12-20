import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { TrendingUp, AlertCircle, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface PrepaymentOpportunity {
  yearlyLimit: number;
  usedAmount: number;
  remainingRoom: number;
  monthlySurplus: number;
  recommendation: string;
}

interface PrepaymentCardProps {
  mortgageId: string;
  className?: string;
}

export function PrepaymentCard({ mortgageId, className }: PrepaymentCardProps) {
  const { data: opportunity, isLoading } = useQuery<PrepaymentOpportunity>({
    queryKey: ["prepayment-opportunity", mortgageId],
    queryFn: async () => {
      const res = await fetch(`/api/prepayment/${mortgageId}/opportunity`);
      if (!res.ok) throw new Error("Failed to fetch opportunity");
      return res.json();
    },
  });

  if (isLoading || !opportunity) return null;

  // Don't show if no surplus AND no room (unless user manually wants to see it - for now hide to reduce clutter)
  if (opportunity.monthlySurplus <= 0 && opportunity.remainingRoom <= 0) return null;

  const percentUsed = (opportunity.usedAmount / opportunity.yearlyLimit) * 100;
  const isSurplusAvailable = opportunity.monthlySurplus > 0;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            Prepayment Opportunity
          </CardTitle>
          {isSurplusAvailable && (
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            >
              Surplus Detected
            </Badge>
          )}
        </div>
        <CardDescription>Optimize your mortgage using your annual privileges.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prepayment Room Status */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Annual Prepayment Limit</span>
            <span className="font-medium">{formatCurrency(opportunity.yearlyLimit)}</span>
          </div>
          <Progress value={percentUsed} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(opportunity.usedAmount)} used</span>
            <span className="font-medium text-foreground">
              {formatCurrency(opportunity.remainingRoom)} remaining
            </span>
          </div>
        </div>

        {/* Surplus & Recommendation */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            {isSurplusAvailable ? (
              <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {isSurplusAvailable ? "Monthly Surplus Available" : "Tight Cash Flow"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {opportunity.recommendation}
              </p>
            </div>
          </div>

          {isSurplusAvailable && (
            <div className="pl-8">
              <p className="text-2xl font-bold tracking-tight">
                {formatCurrency(opportunity.monthlySurplus)}
                <span className="text-sm font-normal text-muted-foreground ml-1">/mo</span>
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/mortgages/${mortgageId}/prepay`}>Make Prepayment</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/mortgages/${mortgageId}/analytics`}>Simulate Risk</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
