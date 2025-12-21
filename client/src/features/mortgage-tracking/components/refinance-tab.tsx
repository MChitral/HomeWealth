import { useQuery } from "@tanstack/react-query";
import { RefinanceScenarioCard } from "@/features/dashboard/components/refinance-card";
import { mortgageApi } from "@/features/mortgage-tracking/api";
import { EmptyWidgetState } from "@/features/dashboard/components/empty-widget-state";

interface RefinanceTabProps {
  mortgageId: string;
}

export function RefinanceTab({ mortgageId }: RefinanceTabProps) {
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
      </div>
    </div>
  );
}
