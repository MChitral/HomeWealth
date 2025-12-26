import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefinanceScenarioCard } from "@/features/dashboard/components/refinance-card";
import { mortgageApi } from "@/features/mortgage-tracking/api";
import { EmptyWidgetState } from "@/features/dashboard/components/empty-widget-state";
import { PortabilityDialog } from "./portability-dialog";
import { RefinanceAnalysisDialog } from "./refinance-analysis-dialog";
import { Button } from "@/shared/ui/button";
import { Home, Calculator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface RefinanceTabProps {
  mortgageId: string;
  currentPropertyPrice?: number;
}

export function RefinanceTab({ mortgageId, currentPropertyPrice = 0 }: RefinanceTabProps) {
  const [isPortabilityOpen, setIsPortabilityOpen] = useState(false);
  const [isRefinanceAnalysisOpen, setIsRefinanceAnalysisOpen] = useState(false);
  const { data: refinanceAnalysis, isLoading } = useQuery({
    queryKey: ["refinance", mortgageId],
    queryFn: () => mortgageApi.fetchRefinanceAnalysis(mortgageId),
    enabled: !!mortgageId,
  });

  if (isLoading) return <div>Loading analysis...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {refinanceAnalysis ? (
          <RefinanceScenarioCard analysis={refinanceAnalysis} />
        ) : (
          <EmptyWidgetState
            title="Refinance Opportunities"
            description="Could not load refinance analysis."
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Refinance Analysis</CardTitle>
            <CardDescription>
              Calculate refinance impact with custom closing costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get a detailed analysis including closing costs breakdown (legal fees, appraisal,
              discharge fees, etc.) to see the true break-even point.
            </p>
            <Button onClick={() => setIsRefinanceAnalysisOpen(true)} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate with Closing Costs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Mortgage Portability
            </CardTitle>
            <CardDescription>
              Transfer your mortgage to a new property without penalty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Port your mortgage to a new property to avoid prepayment penalties. Calculate
              portability options and blended rates if a top-up is required.
            </p>
            <Button onClick={() => setIsPortabilityOpen(true)} className="w-full">
              Calculate Portability
            </Button>
          </CardContent>
        </Card>
      </div>

      {currentPropertyPrice > 0 && (
        <PortabilityDialog
          open={isPortabilityOpen}
          onOpenChange={setIsPortabilityOpen}
          mortgageId={mortgageId}
          currentPropertyPrice={currentPropertyPrice}
        />
      )}

      <RefinanceAnalysisDialog
        open={isRefinanceAnalysisOpen}
        onOpenChange={setIsRefinanceAnalysisOpen}
        mortgageId={mortgageId}
      />
    </div>
  );
}
