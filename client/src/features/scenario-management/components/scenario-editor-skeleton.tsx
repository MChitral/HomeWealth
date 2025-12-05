import { Skeleton } from "@/shared/ui/skeleton";

export function ScenarioEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton className="h-10 w-60 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

