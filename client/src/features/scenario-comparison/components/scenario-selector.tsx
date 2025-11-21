import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { X } from "lucide-react";
import type { ScenarioForSelection } from "../types";

interface ScenarioSelectorProps {
  allScenarios: ScenarioForSelection[];
  selectedScenarios: string[];
  toggleScenario: (id: string) => void;
}

export function ScenarioSelector({ allScenarios, selectedScenarios, toggleScenario }: ScenarioSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Scenarios to Compare</CardTitle>
        <CardDescription>Choose 1-4 scenarios to compare (click to toggle)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {allScenarios.map((scenario) => {
            const isSelected = selectedScenarios.includes(scenario.id);
            const canDeselect = selectedScenarios.length > 1;
            const canSelect = selectedScenarios.length < 4;
            
            return (
              <Button
                key={scenario.id}
                variant={isSelected ? "default" : "outline"}
                onClick={() => toggleScenario(scenario.id)}
                disabled={isSelected && !canDeselect || !isSelected && !canSelect}
                data-testid={`button-select-${scenario.id}`}
                data-selected={isSelected ? "true" : "false"}
                aria-pressed={isSelected}
                className="gap-2"
              >
                {scenario.name}
                {isSelected && canDeselect && <X className="h-3 w-3" />}
              </Button>
            );
          })}
        </div>
        {selectedScenarios.length === 4 && (
          <p className="text-sm text-muted-foreground mt-3">
            Maximum of 4 scenarios reached. Remove one to add another.
          </p>
        )}
        {selectedScenarios.length === 1 && (
          <p className="text-sm text-muted-foreground mt-3">
            At least 1 scenario must be selected. Add more to compare.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
