import { EmptyState } from "@/shared/components";
import { FileText, Plus } from "lucide-react";

export function ScenarioListEmptyState() {
  return (
    <EmptyState
      icon={FileText}
      title="No Scenarios Yet"
      description="Create your first financial strategy scenario to compare prepayment vs investment approaches. Each scenario shows a 10-30 year projection of your net worth."
      actionLabel="Create Your First Scenario"
      actionHref="/scenarios/new"
      testId="button-create-first-scenario"
      variant="centered"
      items={[
        {
          number: 1,
          title: "Compare Strategies",
          description: "See how prepay vs invest affects your net worth over time",
        },
        {
          number: 2,
          title: "Customize Settings",
          description: "Adjust prepayment split, emergency fund priority, and more",
        },
        {
          number: 3,
          title: "View Projections",
          description: "See charts and breakdowns of your mortgage, investments, and net worth",
        },
      ]}
    />
  );
}
