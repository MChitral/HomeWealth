import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface PageSkeletonProps {
  showHeader?: boolean;
  showCards?: boolean;
  cardCount?: number;
  showCharts?: boolean;
  chartCount?: number;
  className?: string;
}

export function PageSkeleton({
  showHeader = true,
  showCards = true,
  cardCount = 4,
  showCharts = false,
  chartCount = 2,
  className,
}: PageSkeletonProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      )}
      {showCards && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(cardCount)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(chartCount)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      )}
    </div>
  );
}

