import { ScenarioCard } from "@/components/scenario-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Info } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Scenario } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function ScenarioListPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Set page title
  useEffect(() => {
    document.title = "Scenarios | Mortgage Strategy";
  }, []);

  // Fetch scenarios from backend
  const { data: scenarios = [], isLoading } = useQuery<Scenario[]>({
    queryKey: ["/api/scenarios"],
  });

  // Delete scenario mutation
  const deleteMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      return apiRequest("DELETE", `/api/scenarios/${scenarioId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scenarios"] });
      toast({
        title: "Scenario deleted",
        description: "The scenario has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error deleting scenario",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (scenarioId: string) => {
    if (confirm("Are you sure you want to delete this scenario? This cannot be undone.")) {
      deleteMutation.mutate(scenarioId);
    }
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Scenarios</h1>
            <p className="text-muted-foreground">Compare different financial strategies</p>
          </div>
        </div>

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Scenarios</h1>
          <p className="text-muted-foreground">Compare different financial strategies</p>
        </div>
        <Link href="/scenarios/new">
          <Button data-testid="button-new-scenario">
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            id={scenario.id}
            name={scenario.name}
            description={scenario.description || undefined}
            lastModified={formatDistanceToNow(new Date(scenario.updatedAt), { addSuffix: true })}
            netWorth="TBD"
            mortgageBalance="TBD"
            onEdit={() => setLocation(`/scenarios/${scenario.id}`)}
            onCompare={() => setLocation(`/comparison?scenarios=${scenario.id}`)}
            onDelete={() => handleDelete(scenario.id)}
          />
        ))}
      </div>
    </div>
  );
}
