import { EmptyState } from "@/shared/components";
import { Home } from "lucide-react";

/**
 * Empty state shown when user has no mortgages created.
 *
 * Product Logic: Scenario comparison requires scenarios, which in turn require mortgages.
 * Users must create a mortgage before they can create scenarios to compare.
 */
export function ComparisonNoMortgageState() {
  return (
    <EmptyState
      icon={Home}
      title="No Mortgage Created"
      description="Create your first mortgage to start comparing financial strategies. Scenarios require mortgage data to generate meaningful comparisons."
      actionLabel="Create Your First Mortgage"
      actionHref="/mortgage"
      testId="button-create-first-mortgage"
      variant="centered"
      items={[
        {
          number: 1,
          title: "Create Mortgage",
          description: "Enter your mortgage details and payment history",
        },
        {
          number: 2,
          title: "Create Scenarios",
          description: "Build different financial strategy scenarios",
        },
        {
          number: 3,
          title: "Compare Strategies",
          description: "See which approach maximizes your net worth",
        },
      ]}
    />
  );
}
