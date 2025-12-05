import { Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useScenarios, useScenarioListState } from "./hooks";
import {
  ScenarioCard,
  ScenarioListEmptyState,
  ScenarioListSkeleton,
  DeleteScenarioDialog,
} from "./components";
import { formatScenarioMetrics } from "./utils";
import type { ScenarioWithMetrics } from "@/entities";

export function ScenarioListFeature() {
  const [, setLocation] = useLocation();
  usePageTitle("Scenarios | Mortgage Strategy");

  const {
    data: scenarios = [],
    isLoading,
  } = useScenarios();

  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDelete,
    confirmDelete,
  } = useScenarioListState();

  if (isLoading) {
    return <ScenarioListSkeleton />;
  }

  if (scenarios.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader title="Scenarios" description="Compare different financial strategies" />
        <ScenarioListEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Scenarios"
        description="Compare different financial strategies"
        actions={
          <Link href="/scenarios/new">
            <Button data-testid="button-new-scenario">
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario: ScenarioWithMetrics) => {
          const { netWorth, mortgageBalance } = formatScenarioMetrics(scenario);

          return (
            <ScenarioCard
              key={scenario.id}
              id={scenario.id}
              name={scenario.name}
              description={scenario.description || undefined}
              lastModified={formatDistanceToNow(new Date(scenario.updatedAt), { addSuffix: true })}
              netWorth={netWorth}
              mortgageBalance={mortgageBalance}
              onEdit={() => setLocation(`/scenarios/${scenario.id}`)}
              onCompare={() => setLocation(`/comparison?scenarios=${scenario.id}`)}
              onDelete={() => handleDelete(scenario.id)}
            />
          );
        })}
      </div>

      <DeleteScenarioDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
