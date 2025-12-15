import { EmptyState } from "@/shared/components";
import { Home } from "lucide-react";

/**
 * Empty state shown when user has no mortgages created.
 *
 * Product Logic: Scenarios require mortgage data to function.
 * Users must create a mortgage before they can create scenarios,
 * as scenarios are projections based on mortgage balance, rate, and payment history.
 */
export function ScenarioListNoMortgageState() {
  return (
    <EmptyState
      icon={Home}
      title="No Mortgage Created"
      description="Create your first mortgage to start comparing financial strategies. Scenarios require mortgage data to generate projections."
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
          title: "Create Scenarios",
          description: "Compare prepayment vs investment strategies",
        },
        {
          number: 3,
          title: "View Projections",
          description: "See how different strategies affect your net worth over time",
        },
      ]}
    />
  );
}
