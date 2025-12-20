import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { PageHeader } from "@/shared/ui/page-header";
import { useMortgageData } from "@/features/mortgage-tracking/hooks";
import { SimulationConfigCard } from "./components/simulation-config-card";
import { ProbabilityChart } from "./components/probability-chart";
import { runTriggerRateSimulation, SimulationResult, SimulationParams } from "./api/simulation-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/shared/ui/alert";
import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

interface AnalyticsDashboardProps {
  mortgageId?: string;
}

export function AnalyticsDashboard({ mortgageId: propMortgageId }: AnalyticsDashboardProps) {
  const params = useParams<{ id: string }>();
  // Use prop if available (Tabs mode), otherwise param (Direct Link mode)
  const mortgageId = propMortgageId || params.id || "";

  const { mortgage, isLoading: isMortgageLoading } = useMortgageData(mortgageId);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const simulationMutation = useMutation({
    mutationFn: (params: SimulationParams) => runTriggerRateSimulation(params),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  if (isMortgageLoading) {
    return <div>Loading...</div>;
  }

  if (!mortgage) {
    return <div>Mortgage not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Analytics"
        description="Probabilistic analysis of your mortgage health"
      />

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 space-y-6">
          <SimulationConfigCard
            mortgageId={mortgageId}
            onRun={async (p) => {
              await simulationMutation.mutateAsync(p);
            }}
            isRunning={simulationMutation.isPending}
          />

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Payoff Probability (5yr)</div>
                  <div className="text-2xl font-bold">
                    {(result.probabilityOfPayoff * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Projected Balance (5yr)</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Best Case (10%):</div>
                    <div>{formatCurrency(result.balanceDistribution.p10)}</div>

                    <div className="text-muted-foreground">Median (50%):</div>
                    <div>{formatCurrency(result.balanceDistribution.p50)}</div>

                    <div className="text-muted-foreground">Worst Case (90%):</div>
                    <div>{formatCurrency(result.balanceDistribution.p90)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-8">
          <Card className="h-full min-h-[500px]">
            <CardHeader>
              <CardTitle>Projected Balance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {simulationMutation.isError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{(simulationMutation.error as Error).message}</AlertDescription>
                </Alert>
              ) : (
                <ProbabilityChart simulationResult={result} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
