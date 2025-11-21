import { ScenarioCard } from "@/features/scenario-management/components/scenario-card";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
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
import { Plus, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { PageHeader } from "@/shared/ui/page-header";
import { formatDistanceToNow } from "date-fns";
import { useScenarios, useDeleteScenario } from "./hooks";
import type { ScenarioWithMetrics } from "@/entities";

export function ScenarioListFeature() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);

  usePageTitle("Scenarios | Mortgage Strategy");

  const {
    data: scenarios = [],
    isLoading,
  } = useScenarios();

  const deleteScenario = useDeleteScenario(
    () =>
      toast({
        title: "Scenario deleted",
        description: "The scenario has been removed.",
      }),
    () =>
      toast({
        title: "Error deleting scenario",
        description: "Please try again.",
        variant: "destructive",
      }),
  );

  const handleDelete = (scenarioId: string) => {
    setScenarioToDelete(scenarioId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (scenarioToDelete) {
      deleteScenario.mutate(scenarioToDelete);
    }
    setDeleteDialogOpen(false);
    setScenarioToDelete(null);
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no scenarios
  if (scenarios.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader title="Scenarios" description="Compare different financial strategies" />

        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10" data-testid="icon-empty-scenarios">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center max-w-md space-y-2">
            <h2 className="text-2xl font-semibold" data-testid="heading-empty-scenarios">No Scenarios Yet</h2>
            <p className="text-muted-foreground">
              Create your first financial strategy scenario to compare prepayment vs investment approaches. 
              Each scenario shows a 10-30 year projection of your net worth.
            </p>
          </div>
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-lg">What you can do with scenarios:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Compare Strategies</p>
                  <p className="text-xs text-muted-foreground">See how prepay vs invest affects your net worth over time</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Customize Settings</p>
                  <p className="text-xs text-muted-foreground">Adjust prepayment split, emergency fund priority, and more</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">View Projections</p>
                  <p className="text-xs text-muted-foreground">See charts and breakdowns of your mortgage, investments, and net worth</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Link href="/scenarios/new">
            <Button data-testid="button-create-first-scenario">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Scenario
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Scenarios"
        description="Compare different financial strategies"
        actions={
          <Link href="/scenarios/new">
            <Button data-testid="button-new-scenario">
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario: ScenarioWithMetrics) => {
          const metrics = scenario.metrics;
          const netWorth = metrics
            ? `$${(metrics.netWorth10yr / 1000).toFixed(0)}k`
            : "Calculating...";
          const mortgageBalance = metrics
            ? `$${(metrics.mortgageBalance10yr / 1000).toFixed(0)}k`
            : "Calculating...";
          
          return (
            <ScenarioCard
              key={scenario.id}
              id={scenario.id}
              name={scenario.name}
              description={scenario.description || undefined}
              lastModified={formatDistanceToNow(new Date(scenario.updatedAt), { addSuffix: true })}
              netWorth={netWorth}
              mortgageBalance={mortgageBalance}
              onEdit={() => setLocation(`/scenarios/${scenario.id}`)}
              onCompare={() => setLocation(`/comparison?scenarios=${scenario.id}`)}
              onDelete={() => handleDelete(scenario.id)}
            />
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scenario? This action cannot be undone.
              All projection data for this scenario will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
