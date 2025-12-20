import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Loader2, PlayCircle } from "lucide-react";
import { SimulationParams } from "../api/simulation-api";

interface SimulationConfigCardProps {
  mortgageId: string;
  onRun: (params: SimulationParams) => Promise<void>;
  isRunning: boolean;
}

export function SimulationConfigCard({ mortgageId, onRun, isRunning }: SimulationConfigCardProps) {
  const [iterations, setIterations] = useState(1000);

  const handleRun = () => {
    onRun({
      mortgageId,
      numIterations: iterations,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monte Carlo Settings</CardTitle>
        <CardDescription>
          Simulate thousands of possible future interest rate paths to assess risk.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="iterations">Iterations</Label>
          <Input
            id="iterations"
            type="number"
            min={100}
            max={10000}
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value) || 1000)}
          />
          <p className="text-xs text-muted-foreground">
            Higher iterations increase accuracy but take longer. Recommended: 1000-5000.
          </p>
        </div>

        <Button className="w-full" onClick={handleRun} disabled={isRunning}>
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Run Simulation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
