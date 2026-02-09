import { Link } from "wouter";
import { LineChart } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

export function ForecastingEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2" data-testid="text-empty-forecasting">No Scenarios Yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Create a scenario to see long-term mortgage paydown projections, prepay vs. invest comparisons, and wealth forecasts.
        </p>
        <Link href="/scenarios/new">
          <Button data-testid="button-create-scenario">Create Your First Scenario</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
