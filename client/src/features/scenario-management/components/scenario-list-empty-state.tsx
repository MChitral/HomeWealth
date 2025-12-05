import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Plus, FileText } from "lucide-react";
import { Link } from "wouter";

export function ScenarioListEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
      <div
        className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10"
        data-testid="icon-empty-scenarios"
      >
        <FileText className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center max-w-md space-y-2">
        <h2 className="text-2xl font-semibold" data-testid="heading-empty-scenarios">
          No Scenarios Yet
        </h2>
        <p className="text-muted-foreground">
          Create your first financial strategy scenario to compare prepayment vs investment approaches. Each scenario
          shows a 10-30 year projection of your net worth.
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
              <p className="text-xs text-muted-foreground">
                See how prepay vs invest affects your net worth over time
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium text-sm">Customize Settings</p>
              <p className="text-xs text-muted-foreground">
                Adjust prepayment split, emergency fund priority, and more
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium text-sm">View Projections</p>
              <p className="text-xs text-muted-foreground">
                See charts and breakdowns of your mortgage, investments, and net worth
              </p>
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
  );
}

