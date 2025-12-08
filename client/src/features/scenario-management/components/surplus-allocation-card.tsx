import { Link } from "wouter";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Separator } from "@/shared/ui/separator";
import { AlertTriangle } from "lucide-react";

interface SurplusAllocationCardProps {
  monthlySurplus: number;
  prepaymentSplit: number[];
  setPrepaymentSplit: (split: number[]) => void;
  hasCashFlow: boolean;
}

export function SurplusAllocationCard({
  monthlySurplus,
  prepaymentSplit,
  setPrepaymentSplit,
  hasCashFlow,
}: SurplusAllocationCardProps) {
  return (
    <>
      <Separator />
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <Label htmlFor="split-slider">Surplus Cash Allocation</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Monthly surplus:{" "}
                <span className="font-mono font-medium text-foreground">
                  ${monthlySurplus.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                {!hasCashFlow && (
                  <span className="text-orange-600 font-medium ml-2">
                    ⚠️ Set up Cash Flow to calculate
                  </span>
                )}
              </p>
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              {prepaymentSplit[0]}% / {100 - prepaymentSplit[0]}%
            </span>
          </div>
          <Slider
            id="split-slider"
            min={0}
            max={100}
            step={5}
            value={prepaymentSplit}
            onValueChange={setPrepaymentSplit}
            data-testid="slider-split"
          />
          <div className="flex justify-between text-sm">
            <div className="space-y-1">
              <p className="font-medium text-primary">Mortgage Prepay</p>
              <p className="font-mono text-lg">
                ${Math.round((monthlySurplus * prepaymentSplit[0]) / 100).toLocaleString()}
                <span className="text-muted-foreground text-sm">/mo</span>
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="font-medium text-chart-2">Investments</p>
              <p className="font-mono text-lg">
                ${Math.round((monthlySurplus * (100 - prepaymentSplit[0])) / 100).toLocaleString()}
                <span className="text-muted-foreground text-sm">/mo</span>
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            How to split surplus cash (after EF is full) between mortgage prepayment and investments
          </p>
          {!hasCashFlow && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-semibold">Cash Flow Required:</span> Without income and expense data, 
                surplus calculations are $0 and projections will not reflect your actual financial situation.{" "}
                <Link href="/cash-flow" className="font-medium underline hover:no-underline">
                  Set up Cash Flow
                </Link>{" "}
                to enable accurate scenario projections.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}

