import { EmptyState } from "@/shared/components";
import { Info } from "lucide-react";

interface MortgageEmptyStateProps {
  onOpenCreateMortgage: () => void;
}

export function MortgageEmptyState({ onOpenCreateMortgage }: MortgageEmptyStateProps) {
  return (
    <EmptyState
      icon={Info}
      title="Welcome to Mortgage Tracking"
      description="Track your Canadian mortgage with term-by-term history, payment breakdowns (principal vs interest), and renewal management. Get started by creating your first mortgage."
      actionLabel="Create Your First Mortgage"
      onAction={onOpenCreateMortgage}
      testId="button-create-mortgage"
      variant="centered"
      items={[
        {
          number: 1,
          title: "Payment History",
          description: "Principal, interest, and remaining balance per payment",
        },
        {
          number: 2,
          title: "Term Management",
          description: "Track fixed vs variable terms with Canadian semi-annual compounding",
        },
        {
          number: 3,
          title: "Renewal Tracking",
          description: "Simulate term renewals with new rates and payment schedules",
        },
      ]}
    />
  );
}

