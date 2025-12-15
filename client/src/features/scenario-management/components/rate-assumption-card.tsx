import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Slider } from "@/shared/ui/slider";
import { Separator } from "@/shared/ui/separator";

interface RateAssumptionCardProps {
  currentRate: number;
  rateAssumption: number | null;
  setRateAssumption: (rate: number | null) => void;
}

export function RateAssumptionCard({
  currentRate,
  rateAssumption,
  setRateAssumption,
}: RateAssumptionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Assumption for Projections</CardTitle>
        <CardDescription>
          Model what happens if rates change (affects amortization timeline)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Projected Rate</Label>
            <Badge variant="outline" className="font-mono">
              {rateAssumption !== null
                ? `${rateAssumption.toFixed(2)}%`
                : `${currentRate.toFixed(2)}% (current)`}
            </Badge>
          </div>

          <div className="space-y-2">
            <Slider
              value={[rateAssumption ?? currentRate]}
              onValueChange={(values) => setRateAssumption(values[0])}
              min={1.0}
              max={10.0}
              step={0.25}
              className="w-full"
              data-testid="slider-rate"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1.00%</span>
              <span>Current: {currentRate.toFixed(2)}%</span>
              <span>10.00%</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRateAssumption(null)}
              className={rateAssumption === null ? "border-primary" : ""}
              data-testid="button-rate-current"
            >
              Use Current
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRateAssumption(currentRate - 1)}
              data-testid="button-rate-down-1"
            >
              -1.00%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRateAssumption(currentRate - 0.5)}
              data-testid="button-rate-down-half"
            >
              -0.50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRateAssumption(currentRate + 0.5)}
              data-testid="button-rate-up-half"
            >
              +0.50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRateAssumption(currentRate + 1)}
              data-testid="button-rate-up-1"
            >
              +1.00%
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {rateAssumption !== null && rateAssumption < currentRate
              ? `If rates drop to ${rateAssumption.toFixed(2)}%, you'll pay off faster and save on interest.`
              : rateAssumption !== null && rateAssumption > currentRate
                ? `If rates rise to ${rateAssumption.toFixed(2)}%, your amortization will extend.`
                : "Using your current rate for projections."}
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="appreciation-rate">Property Appreciation Rate (% annual)</Label>
          <Input
            id="appreciation-rate"
            type="number"
            step="0.1"
            defaultValue="2.0"
            data-testid="input-appreciation-rate"
          />
        </div>
      </CardContent>
    </Card>
  );
}
