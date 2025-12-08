import { EmptyState } from "@/shared/components";
import { Home } from "lucide-react";

/**
 * Empty state shown when user has no mortgages created.
 * 
 * Product Logic: Mortgages are the foundation of the application.
 * Users must create a mortgage before they can:
 * - Create scenarios (projections require mortgage data)
 * - Compare strategies (need mortgage to compare prepayment vs investment)
 * - View meaningful projections
 * 
 * This follows the Canadian mortgage lifecycle:
 * Origination → Amortization → Scenarios/Projections
 */
export function DashboardNoMortgageState() {
  return (
    <EmptyState
      icon={Home}
      title="No Mortgage Created"
      description="Create your first mortgage to start tracking payments, comparing strategies, and viewing financial projections"
      actionLabel="Create Your First Mortgage"
      actionHref="/mortgage"
      testId="button-create-first-mortgage"
      variant="default"
    />
  );
}

