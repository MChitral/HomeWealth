import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { ScenarioWithMetrics } from "@/entities";

const HORIZONS = [10, 20, 30] as const;
type Horizon = (typeof HORIZONS)[number];

interface ProjectionsHeaderProps {
  selectedHorizon: Horizon;
  setSelectedHorizon: (horizon: Horizon) => void;
  selectedScenarioId: string | null;
  setSelectedScenarioId: (id: string | null) => void;
  scenarios: ScenarioWithMetrics[];
}

export function ProjectionsHeader({
  selectedHorizon,
  setSelectedHorizon,
  selectedScenarioId,
  setSelectedScenarioId,
  scenarios,
}: ProjectionsHeaderProps) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold">Projections</h2>
        <p className="text-sm text-muted-foreground">{selectedHorizon}-year forecast based on selected scenario</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Time Horizon:</span>
        <div className="flex gap-1 border rounded-md p-1" data-testid="horizon-selector">
          {HORIZONS.map((horizon) => (
            <Button
              key={horizon}
              variant={selectedHorizon === horizon ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedHorizon(horizon)}
              data-testid={`button-horizon-${horizon}`}
              className="min-w-[60px]"
            >
              {horizon} Years
            </Button>
          ))}
        </div>
        <Separator orientation="vertical" className="h-8" />
        <span className="text-sm text-muted-foreground">Scenario:</span>
        <Select value={selectedScenarioId || undefined} onValueChange={setSelectedScenarioId}>
          <SelectTrigger className="w-[240px]" data-testid="select-scenario">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((scenario) => (
              <SelectItem key={scenario.id} value={scenario.id}>
                {scenario.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}

