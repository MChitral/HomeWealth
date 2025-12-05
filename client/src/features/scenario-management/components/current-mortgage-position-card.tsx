import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Info } from "lucide-react";

interface CurrentMortgagePositionCardProps {
  currentMortgageData: {
    homeValue: number;
    currentBalance: number;
    yearsIntoMortgage: number;
    currentRate: number;
    principalPaid: number;
    interestPaid: number;
    currentAmortization: number;
    monthlyPayment: number;
    termType: string;
    lockedSpread: number;
  };
  paymentPreview: {
    principal: number;
    interest: number;
    triggerRateHit?: boolean;
  } | null;
  rateUsedForPreview: number;
}

export function CurrentMortgagePositionCard({
  currentMortgageData,
  paymentPreview,
  rateUsedForPreview,
}: CurrentMortgagePositionCardProps) {
  return (
    <Card className="bg-accent/50">
      <CardHeader>
        <CardTitle>Current Mortgage Position</CardTitle>
        <CardDescription>Loaded from your Mortgage History (as of latest payment)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Home Value</p>
            <p className="text-lg font-mono font-semibold">${currentMortgageData.homeValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <p className="text-lg font-mono font-semibold">${currentMortgageData.currentBalance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Years Into Mortgage</p>
            <p className="text-lg font-mono font-semibold">{currentMortgageData.yearsIntoMortgage} years</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
            <p className="text-lg font-mono font-semibold">{currentMortgageData.currentRate}%</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Principal Paid So Far</p>
            <p className="text-base font-mono text-green-600">${currentMortgageData.principalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Interest Paid So Far</p>
            <p className="text-base font-mono text-orange-600">${currentMortgageData.interestPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Amortization</p>
            <p className="text-base font-mono">{currentMortgageData.currentAmortization} years</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
            <p className="text-base font-mono">${currentMortgageData.monthlyPayment.toLocaleString()}</p>
          </div>
        </div>
        {paymentPreview && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Next Payment Principal</p>
                <p className="text-base font-mono text-green-600">${paymentPreview.principal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Next Payment Interest</p>
                <p className="text-base font-mono text-orange-600">${paymentPreview.interest.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Using {rateUsedForPreview.toFixed(2)}% rate · Canadian semi-annual compounding
            </p>
            {paymentPreview.triggerRateHit && (
              <Alert variant="destructive">
                <AlertDescription>
                  Current payment is below the interest-only threshold. Increase the payment or adjust your strategy to
                  avoid trigger-rate calls.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Term Type</p>
            <p className="text-base font-medium">{currentMortgageData.termType}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Locked Spread</p>
            <p className="text-base font-mono">
              Prime {currentMortgageData.lockedSpread >= 0 ? "+" : ""}
              {currentMortgageData.lockedSpread}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

