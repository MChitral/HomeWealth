import { PageSkeleton } from "@/shared/components";

export function ScenarioListSkeleton() {
  return <PageSkeleton showHeader={true} showCards={true} cardCount={3} showCharts={false} />;
}
