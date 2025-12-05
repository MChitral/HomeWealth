import { PageSkeleton } from "@/shared/components";

export function DashboardSkeleton() {
  return (
    <PageSkeleton
      showHeader={true}
      showCards={true}
      cardCount={4}
      showCharts={true}
      chartCount={2}
    />
  );
}

