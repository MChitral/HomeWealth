import { Skeleton } from "@/shared/ui/skeleton";

export function ForecastingSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-80" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-28 rounded-md" />
        <Skeleton className="h-28 rounded-md" />
        <Skeleton className="h-28 rounded-md" />
      </div>
      <Skeleton className="h-[400px] rounded-md" />
      <Skeleton className="h-[400px] rounded-md" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[340px] rounded-md" />
        <Skeleton className="h-[340px] rounded-md" />
      </div>
    </div>
  );
}
