import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { GitCompare, Info } from "lucide-react";
import type { ScenarioForSelection } from "../types";

interface EmptyStateProps {
  allScenarios: ScenarioForSelection[];
  toggleScenario: (id: string) => void;
}

export function EmptyState({ allScenarios, toggleScenario }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10" data-testid="icon-empty-comparison">
        <GitCompare className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center max-w-md space-y-2">
        <h2 className="text-2xl font-semibold" data-testid="heading-empty-comparison">No Scenarios Selected</h2>
        <p className="text-muted-foreground">
          Select up to 4 scenarios from the list below to compare their financial projections side-by-side.
          See which strategy performs best over time.
        </p>
      </div>
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-lg">Available Scenarios:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allScenarios.map((scenario) => (
              <Button
                key={scenario.id}
                variant="outline"
                className="justify-start"
                onClick={() => toggleScenario(scenario.id)}
                data-testid={`button-empty-select-${scenario.id}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-xs font-semibold text-primary">
                    {scenario.name.charAt(0)}
                  </span>
                </div>
                <span className="font-medium">{scenario.name}</span>
              </Button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              <Info className="h-4 w-4 inline mr-1" />
              Select at least 2 scenarios to see a meaningful comparison
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
