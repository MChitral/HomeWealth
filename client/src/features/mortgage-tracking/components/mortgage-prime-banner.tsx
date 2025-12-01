import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";

interface MortgagePrimeBannerProps {
  primeRate: number | string;
  effectiveDate?: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function MortgagePrimeBanner({
  primeRate,
  effectiveDate,
  onRefresh,
  isRefreshing,
}: MortgagePrimeBannerProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border bg-muted/30 px-4 py-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            BoC Prime Snapshot
          </Badge>
          <span className="text-sm font-semibold">
            {Number.isFinite(Number(primeRate)) ? Number(primeRate).toFixed(2) : primeRate}% APY
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {effectiveDate
            ? `Effective ${new Date(effectiveDate).toLocaleDateString()}`
            : "Latest Bank of Canada prime rate"}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
        )}
        Refresh
      </Button>
    </div>
  );
}

