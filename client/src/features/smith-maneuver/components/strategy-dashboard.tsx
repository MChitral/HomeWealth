import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Plus, TrendingUp, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import { useSmithManeuverStrategies } from "../hooks";
import { useState } from "react";
import type { SmithManeuverStrategy } from "@shared/schema";

interface StrategyDashboardProps {
  onSelectStrategy?: (strategy: SmithManeuverStrategy) => void;
  onCreateStrategy?: () => void;
}

export function StrategyDashboard({ onSelectStrategy, onCreateStrategy }: StrategyDashboardProps) {
  const { data: strategies, isLoading } = useSmithManeuverStrategies();
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatPercent = (value: string | number) => {
    return `${Number(value).toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading strategies...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smith Maneuver Strategies</h2>
          <p className="text-muted-foreground mt-1">
            Manage and track your tax-optimization strategies
          </p>
        </div>
        <Button onClick={onCreateStrategy}>
          <Plus className="h-4 w-4 mr-2" />
          Create Strategy
        </Button>
      </div>

      {!strategies || strategies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Strategies Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first Smith Maneuver strategy to start modeling tax-optimized mortgage strategies.
            </p>
            <Button onClick={onCreateStrategy}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Strategy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {strategies.map((strategy) => (
            <Card
              key={strategy.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedStrategyId === strategy.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                setSelectedStrategyId(strategy.id);
                onSelectStrategy?.(strategy);
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{strategy.strategyName}</CardTitle>
                    <CardDescription className="mt-1">
                      Started {new Date(strategy.startDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={strategy.status === "active" ? "default" : "secondary"}>
                    {strategy.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Prepayment</p>
                    <p className="font-semibold">{formatCurrency(strategy.prepaymentAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {strategy.prepaymentFrequency}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expected Return</p>
                    <p className="font-semibold">{formatPercent(strategy.expectedReturnRate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Borrowing %</p>
                    <p className="font-semibold">{formatPercent(strategy.borrowingPercentage)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tax Rate</p>
                    <p className="font-semibold">
                      {strategy.marginalTaxRate ? formatPercent(strategy.marginalTaxRate) : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Projection</span>
                    <span className="font-semibold">{strategy.projectionYears} years</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

