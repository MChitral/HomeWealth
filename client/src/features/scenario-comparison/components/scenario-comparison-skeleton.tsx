import { PageSkeleton } from "@/shared/components";
import { Skeleton } from "@/shared/ui/skeleton";

export function ScenarioComparisonSkeleton() {
  return (
    <div className="space-y-6">
      <PageSkeleton showHeader={true} showCards={false} showCharts={false} />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-96 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}
