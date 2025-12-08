import { EmptyState } from "@/shared/components";
import { Home } from "lucide-react";

/**
 * Empty state shown when user tries to create a scenario but has no mortgages.
 * 
 * Product Logic: Scenarios require mortgage data to function.
 * Users must create a mortgage before they can create scenarios,
 * as scenarios are projections based on mortgage balance, rate, and payment history.
 */
export function ScenarioEditorNoMortgageState() {
  return (
    <EmptyState
      icon={Home}
      title="No Mortgage Created"
      description="Create your first mortgage before creating scenarios. Scenarios require mortgage data to generate meaningful financial projections."
      actionLabel="Create Your First Mortgage"
      actionHref="/mortgage"
      testId="button-create-first-mortgage"
      variant="centered"
      items={[
        {
          number: 1,
          title: "Create Mortgage",
          description: "Enter your mortgage details, terms, and payment history",
        },
        {
          number: 2,
          title: "Create Scenario",
          description: "Build financial strategy scenarios based on your mortgage",
        },
        {
          number: 3,
          title: "Compare Strategies",
          description: "See how different approaches affect your net worth",
        },
      ]}
    />
  );
}

