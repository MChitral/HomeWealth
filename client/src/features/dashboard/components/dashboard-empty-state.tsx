import { EmptyState } from "@/shared/components";

export function DashboardEmptyState() {
  return (
    <EmptyState
      title="No Scenarios Created"
      description="Create your first scenario to see projections and compare strategies"
      actionLabel="Create Your First Scenario"
      actionHref="/scenarios/new"
      testId="button-create-first-scenario"
      variant="default"
    />
  );
}
