import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import type { Mortgage } from "@shared/schema";
import { CurrentStatusStat } from "./current-status-stat";

interface CurrentFinancialStatusCardProps {
  homeValue: number;
  mortgageBalance: number;
  originalMortgageBalance: number;
  efBalance: number;
  efTargetAmount: number;
  activeMortgage: Mortgage | null;
  paymentPreview: {
    breakdown: {
      principal: number;
      interest: number;
      triggerRateHit?: boolean;
    };
    ratePercent: number;
  } | null;
}

export function CurrentFinancialStatusCard({
  homeValue,
  mortgageBalance,
  originalMortgageBalance,
  efBalance,
  efTargetAmount,
  activeMortgage,
  paymentPreview,
}: CurrentFinancialStatusCardProps) {
  return (
    <Card className="bg-accent/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Current Financial Status</CardTitle>
        <p className="text-sm text-muted-foreground">As of today</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CurrentStatusStat
            label="Home Equity"
            value={`$${(homeValue - mortgageBalance).toLocaleString()}`}
            testId="text-current-equity"
          />
          <CurrentStatusStat label="Emergency Fund" value={`$${efBalance.toLocaleString()}`} testId="text-current-ef">
            {efTargetAmount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">Target: ${efTargetAmount.toLocaleString()}</p>
            )}
          </CurrentStatusStat>
          <CurrentStatusStat label="Home Value" value={`$${homeValue.toLocaleString()}`} testId="text-home-value" />
          <CurrentStatusStat
            label="Mortgage Balance"
            value={`$${mortgageBalance.toLocaleString()}`}
            testId="text-mortgage-balance"
          />
        </div>

        {activeMortgage && (
          <>
            <Separator />
            <div>
              <h3 className="text-base font-semibold mb-4">Current Mortgage Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <CurrentStatusStat
                  label="Original Amount"
                  value={`$${Number(activeMortgage.originalAmount).toLocaleString()}`}
                />
                <CurrentStatusStat
                  label="Down Payment"
                  value={`$${Number(activeMortgage.downPayment).toLocaleString()}`}
                />
                <CurrentStatusStat label="Payment Frequency" value={activeMortgage.paymentFrequency} />
              </div>
              {paymentPreview?.breakdown && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CurrentStatusStat
                      label="Next Payment Principal"
                      value={`$${paymentPreview.breakdown.principal.toFixed(2)}`}
                    />
                    <CurrentStatusStat
                      label="Next Payment Interest"
                      value={`$${paymentPreview.breakdown.interest.toFixed(2)}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Using {paymentPreview.ratePercent.toFixed(2)}% rate · Canadian semi-annual compounding
                  </p>
                  {paymentPreview.breakdown.triggerRateHit && (
                    <p className="text-xs font-medium text-destructive">
                      Current payment is below the interest-only threshold. Consider increasing payments to avoid
                      trigger-rate calls.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

