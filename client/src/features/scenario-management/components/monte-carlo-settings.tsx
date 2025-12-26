import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { scenarioApi } from "../api/scenario-api";
import type { MonteCarloResult } from "@/types/monte-carlo";

interface MonteCarloSettingsProps {
  onResult: (result: MonteCarloResult) => void;
}

export function MonteCarloSettings({ onResult }: MonteCarloSettingsProps) {
  const [timeHorizonMonths, setTimeHorizonMonths] = useState(60);
  const [numIterations, setNumIterations] = useState(1000);
  const [rateModel, setRateModel] = useState<"gbm" | "vasicek">("gbm");
  const [interestRateVolatility, setInterestRateVolatility] = useState(0.15);
  const [interestRateDrift, setInterestRateDrift] = useState(0.0);
  const [meanReversionSpeed, setMeanReversionSpeed] = useState(0.1);
  const [longTermMeanRate, setLongTermMeanRate] = useState<number | undefined>(undefined);
  const [rateCap, setRateCap] = useState<number | undefined>(undefined);
  const [rateFloor, setRateFloor] = useState<number | undefined>(undefined);
  const [useHistoricalVolatility, setUseHistoricalVolatility] = useState(false);

  const simulationMutation = useMutation({
    mutationFn: scenarioApi.runMonteCarloSimulation,
    onSuccess: (data) => {
      onResult(data);
    },
  });

  const handleRunSimulation = () => {
    simulationMutation.mutate({
      timeHorizonMonths,
      numIterations,
      rateModel,
      interestRateVolatility,
      interestRateDrift,
      meanReversionSpeed,
      longTermMeanRate,
      rateCap,
      rateFloor,
      useHistoricalVolatility,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monte Carlo Rate Simulation</CardTitle>
        <CardDescription>
          Simulate interest rate uncertainty to understand potential outcomes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeHorizon">Time Horizon (months)</Label>
            <Input
              id="timeHorizon"
              type="number"
              min="1"
              max="360"
              value={timeHorizonMonths}
              onChange={(e) => setTimeHorizonMonths(parseInt(e.target.value) || 60)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iterations">Iterations</Label>
            <Input
              id="iterations"
              type="number"
              min="100"
              max="10000"
              step="100"
              value={numIterations}
              onChange={(e) => setNumIterations(parseInt(e.target.value) || 1000)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rateModel">Rate Model</Label>
          <Select value={rateModel} onValueChange={(v) => setRateModel(v as "gbm" | "vasicek")}>
            <SelectTrigger id="rateModel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gbm">Geometric Brownian Motion (GBM)</SelectItem>
              <SelectItem value="vasicek">Vasicek (Mean-Reverting)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="volatility">Interest Rate Volatility</Label>
            <Input
              id="volatility"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={interestRateVolatility}
              onChange={(e) => setInterestRateVolatility(parseFloat(e.target.value) || 0.15)}
            />
            <p className="text-xs text-muted-foreground">
              Annualized volatility (e.g., 0.15 = 15%)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="drift">Interest Rate Drift</Label>
            <Input
              id="drift"
              type="number"
              step="0.01"
              value={interestRateDrift}
              onChange={(e) => setInterestRateDrift(parseFloat(e.target.value) || 0.0)}
            />
            <p className="text-xs text-muted-foreground">Expected annual drift (0 = neutral)</p>
          </div>
        </div>

        {rateModel === "vasicek" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meanReversion">Mean Reversion Speed</Label>
              <Input
                id="meanReversion"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={meanReversionSpeed}
                onChange={(e) => setMeanReversionSpeed(parseFloat(e.target.value) || 0.1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longTermMean">Long-Term Mean Rate</Label>
              <Input
                id="longTermMean"
                type="number"
                min="0"
                max="1"
                step="0.001"
                value={longTermMeanRate ?? ""}
                onChange={(e) =>
                  setLongTermMeanRate(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="Auto (current rate)"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rateCap">Rate Cap (optional)</Label>
            <Input
              id="rateCap"
              type="number"
              min="0"
              max="1"
              step="0.001"
              value={rateCap ?? ""}
              onChange={(e) => setRateCap(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="No cap"
            />
            <p className="text-xs text-muted-foreground">Maximum rate (e.g., 0.15 = 15%)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rateFloor">Rate Floor (optional)</Label>
            <Input
              id="rateFloor"
              type="number"
              min="0"
              max="1"
              step="0.001"
              value={rateFloor ?? ""}
              onChange={(e) =>
                setRateFloor(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              placeholder="No floor"
            />
            <p className="text-xs text-muted-foreground">Minimum rate (e.g., 0.01 = 1%)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="useHistorical"
            checked={useHistoricalVolatility}
            onCheckedChange={setUseHistoricalVolatility}
          />
          <Label htmlFor="useHistorical">Use Historical Volatility</Label>
        </div>

        <Button
          onClick={handleRunSimulation}
          disabled={simulationMutation.isPending}
          className="w-full"
        >
          {simulationMutation.isPending ? "Running Simulation..." : "Run Simulation"}
        </Button>

        {simulationMutation.isError && (
          <div className="text-sm text-destructive">
            Error running simulation. Please check your parameters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
