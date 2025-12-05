import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { AlertCircle, Plus } from "lucide-react";
import { Link } from "wouter";

export function DashboardEmptyState() {
  return (
    <Card className="bg-accent/10 border-dashed">
      <CardContent className="py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold mb-2">No Scenarios Created</h3>
          <p className="text-muted-foreground mb-4">
            Create your first scenario to see projections and compare strategies
          </p>
          <Link href="/scenarios/new">
            <Button data-testid="button-create-first-scenario">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Scenario
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

