import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Info, Loader2 } from "lucide-react";
import type { PrimeRateResponse, CreatePaymentPayload } from "../api";
import { mortgageApi } from "../api";
import type { UiTerm } from "../types";
import type { Mortgage } from "@shared/schema";
import {
  calculatePaymentBreakdown,
  advancePaymentDate,
  type PaymentFrequency,
} from "../utils/mortgage-math";
import { useCallback } from "react";

type BackfillMutation = {
  mutate: (payload: CreatePaymentPayload[]) => void;
  isPending: boolean;
};

type BackfillPaymentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTerm: UiTerm;
  mortgage: Mortgage | null;
  backfillStartDate: string;
  setBackfillStartDate: (value: string) => void;
  backfillNumberOfPayments: string;
  setBackfillNumberOfPayments: (value: string) => void;
  backfillPaymentAmount: string;
  setBackfillPaymentAmount: (value: string) => void;
  previewEndDate: string;
  primeRateData?: PrimeRateResponse;
  backfillMutation: BackfillMutation;
};

export function BackfillPaymentsDialog({
  open,
  onOpenChange,
  currentTerm,
  mortgage,
  backfillStartDate,
  setBackfillStartDate,
  backfillNumberOfPayments,
  setBackfillNumberOfPayments,
  backfillPaymentAmount,
  setBackfillPaymentAmount,
  previewEndDate,
  primeRateData,
  backfillMutation,
}: BackfillPaymentsDialogProps) {
  const handleBackfill = useCallback(async () => {
    const numPayments = parseInt(backfillNumberOfPayments);
    const paymentAmount =
      parseFloat(backfillPaymentAmount) || currentTerm.regularPaymentAmount || 1500;

    if (!currentTerm || !backfillStartDate || numPayments < 1) {
      return;
    }

    const endDate = new Date(backfillStartDate);
    endDate.setMonth(endDate.getMonth() + numPayments - 1);
    const endDateStr = endDate.toISOString().split("T")[0];

    const queryStartDate = new Date(backfillStartDate);
    queryStartDate.setMonth(queryStartDate.getMonth() - 3);
    const queryStartDateStr = queryStartDate.toISOString().split("T")[0];

    let historicalRates: { date: string; primeRate: number }[] = [];

    if (currentTerm.termType !== "fixed") {
      try {
        const ratesResponse = await mortgageApi.fetchHistoricalPrimeRates(
          queryStartDateStr,
          endDateStr,
        );
        historicalRates = ratesResponse.rates || [];
      } catch (error) {
        console.error("Failed to fetch historical rates:", error);
      }
    }

    const getRateForDate = (dateStr: string): number => {
      if (currentTerm.termType === "fixed") {
        return currentTerm.fixedRate || 4.5;
      }

      const sortedRates = [...historicalRates].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      for (const rate of sortedRates) {
        if (rate.date <= dateStr) {
          return rate.primeRate + currentTerm.lockedSpread;
        }
      }

      return (primeRateData?.primeRate || 5.45) + currentTerm.lockedSpread;
    };

    const payments: CreatePaymentPayload[] = [];
    let runningBalance = Number(mortgage?.currentBalance || 300000);
    let paymentDate = new Date(backfillStartDate);
    const frequency = currentTerm.paymentFrequency as PaymentFrequency;

    for (let i = 0; i < numPayments; i++) {
      const paymentDateStr = paymentDate.toISOString().split("T")[0];
      const effectiveRateValue = getRateForDate(paymentDateStr);
      const primeRateForPayment =
        currentTerm.termType === "fixed"
          ? 0
          : effectiveRateValue - currentTerm.lockedSpread;

      const breakdown = calculatePaymentBreakdown({
        balance: runningBalance,
        paymentAmount,
        regularPaymentAmount: paymentAmount,
        extraPrepaymentAmount: 0,
        frequency,
        annualRate: effectiveRateValue / 100,
      });
      runningBalance = breakdown.remainingBalance;

      payments.push({
        termId: currentTerm.id,
        paymentDate: paymentDateStr,
        paymentPeriodLabel: `Payment ${i + 1}`,
        regularPaymentAmount: paymentAmount.toString(),
        prepaymentAmount: "0",
        paymentAmount: paymentAmount.toString(),
        principalPaid: breakdown.principal.toString(),
        interestPaid: breakdown.interest.toString(),
        remainingBalance: runningBalance.toString(),
        primeRate: primeRateForPayment.toString(),
        effectiveRate: effectiveRateValue.toString(),
        triggerRateHit: breakdown.triggerRateHit ? 1 : 0,
        remainingAmortizationMonths:
          breakdown.remainingAmortizationMonths ??
          Math.max((mortgage?.amortizationYears || 25) * 12 - i, 0),
      });

      paymentDate = advancePaymentDate(paymentDate, frequency);
    }

    backfillMutation.mutate(payments);
  }, [
    advancePaymentDate,
    backfillNumberOfPayments,
    backfillPaymentAmount,
    backfillStartDate,
    backfillMutation,
    currentTerm,
    mortgage,
    primeRateData,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Backfill Payments</DialogTitle>
          <DialogDescription>
            Quickly log multiple past payments at once (up to 60 payments)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {currentTerm.termType !== "fixed" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                For variable rate mortgages, historical Bank of Canada prime rates will be fetched
                automatically for each payment date to ensure accurate logging.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backfill-start">First Payment Date</Label>
              <Input
                id="backfill-start"
                type="date"
                value={backfillStartDate}
                onChange={(e) => setBackfillStartDate(e.target.value)}
                data-testid="input-backfill-start"
              />
              <p className="text-xs text-muted-foreground">Date of your first payment</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backfill-count">Number of Payments (1-60)</Label>
              <Input
                id="backfill-count"
                type="number"
                min="1"
                max="60"
                value={backfillNumberOfPayments}
                onChange={(e) => {
                  const val = Math.min(60, Math.max(1, parseInt(e.target.value) || 1));
                  setBackfillNumberOfPayments(val.toString());
                }}
                data-testid="input-backfill-count"
              />
              <p className="text-xs text-muted-foreground">Enter any number of months</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backfill-payment">Payment Amount ($)</Label>
            <Input
              id="backfill-payment"
              type="number"
              step="0.01"
              placeholder={currentTerm.regularPaymentAmount?.toString() || "1500.00"}
              value={backfillPaymentAmount}
              onChange={(e) => setBackfillPaymentAmount(e.target.value)}
              data-testid="input-backfill-payment"
            />
            <p className="text-xs text-muted-foreground">Your regular monthly payment amount</p>
          </div>

          {backfillStartDate && parseInt(backfillNumberOfPayments) > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Summary</p>
              <p className="text-sm text-muted-foreground">
                Creating <span className="font-medium">{backfillNumberOfPayments} payments</span> from{" "}
                <span className="font-medium">{backfillStartDate}</span> to{" "}
                <span className="font-medium">{previewEndDate || backfillStartDate}</span>
              </p>
              {backfillPaymentAmount && (
                <p className="text-sm text-muted-foreground mt-1">
                  Total:{" "}
                  <span className="font-medium font-mono">
                    {(
                      parseFloat(backfillPaymentAmount) * parseInt(backfillNumberOfPayments)
                    ).toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                  </span>
                </p>
              )}
              {currentTerm.termType !== "fixed" && (
                <p className="text-xs text-muted-foreground mt-2">
                  Prime rates will be fetched from Bank of Canada for accurate interest calculations
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleBackfill}
            disabled={
              !backfillStartDate ||
              !backfillPaymentAmount ||
              parseInt(backfillNumberOfPayments) < 1 ||
              backfillMutation.isPending
            }
            data-testid="button-save-backfill"
          >
            {backfillMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create {backfillNumberOfPayments} Payments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

