import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useSmithManeuverStrategies, useDeleteSmithManeuverStrategy } from "../hooks";
import type { SmithManeuverStrategy } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

interface StrategySelectorProps {
  selectedStrategyId: string | null;
  onSelectStrategy: (strategy: SmithManeuverStrategy) => void;
  onCreateStrategy: () => void;
  onEditStrategy: (strategy: SmithManeuverStrategy) => void;
}

export function StrategySelector({
  selectedStrategyId,
  onSelectStrategy,
  onCreateStrategy,
  onEditStrategy,
}: StrategySelectorProps) {
  const { data: strategies, isLoading } = useSmithManeuverStrategies();
  const deleteStrategy = useDeleteSmithManeuverStrategy();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    await deleteStrategy.mutateAsync(deleteTargetId);
    setDeleteTargetId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading strategies...</span>
      </div>
    );
  }

  if (!strategies || strategies.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Your Strategies
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateStrategy}
            data-testid="button-add-strategy"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New
          </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {strategies.map((strategy) => {
            const isSelected = selectedStrategyId === strategy.id;
            return (
              <Card
                key={strategy.id}
                data-testid={`card-strategy-${strategy.id}`}
                className={cn(
                  "cursor-pointer transition-all min-w-[220px] max-w-[280px] flex-shrink-0",
                  isSelected
                    ? "ring-2 ring-primary shadow-md"
                    : "hover-elevate"
                )}
                onClick={() => onSelectStrategy(strategy)}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TrendingUp className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {strategy.strategyName}
                      </span>
                    </div>
                    <Badge
                      variant={strategy.status === "active" ? "default" : "secondary"}
                      className="text-[10px] h-5 px-1.5 flex-shrink-0"
                    >
                      {strategy.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(strategy.prepaymentAmount)}/{strategy.prepaymentFrequency}</span>
                    <span>{strategy.projectionYears}yr</span>
                  </div>
                  {isSelected && (
                    <div className="flex gap-1 pt-1 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs flex-1"
                        data-testid={`button-edit-strategy-${strategy.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditStrategy(strategy);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive hover:text-destructive flex-1"
                        data-testid={`button-delete-strategy-${strategy.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(strategy.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Strategy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently remove this strategy and all its projection data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-strategy"
            >
              {deleteStrategy.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
