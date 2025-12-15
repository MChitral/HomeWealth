import { useEffect, useMemo, useState } from "react";
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
import { AlertTriangle } from "lucide-react";
import type { UiTerm } from "../types";
import { calculatePaymentBreakdown, type PaymentFrequency } from "../utils/mortgage-math";

type LogPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTerm: UiTerm | null;
  currentPrimeRate: number;
  currentEffectiveRate: number;
  lastKnownBalance: number;
  lastKnownAmortizationMonths: number;
  monthsRemainingInTerm: number;
  onSubmit: (payload: {
    paymentDate: string;
    paymentPeriodLabel?: string | null;
    regularPaymentAmount: number;
    prepaymentAmount: number;
    paymentAmount: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
    primeRate?: number;
    effectiveRate: number;
    triggerRateHit: number;
    remainingAmortizationMonths: number;
  }) => void;
  isSubmitting: boolean;
};

export function LogPaymentDialog({
  open,
  onOpenChange,
  currentTerm,
  currentPrimeRate,
  currentEffectiveRate,
  lastKnownBalance,
  lastKnownAmortizationMonths,
  monthsRemainingInTerm,
  onSubmit,
  isSubmitting,
}: LogPaymentDialogProps) {
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentPeriodLabel, setPaymentPeriodLabel] = useState("");

  // Auto-generate month-year format when payment date changes
  // Auto-generate month-year format when payment date changes
  useEffect(() => {
    if (paymentDate) {
      try {
        const paymentDateObj = new Date(paymentDate);
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const month = monthNames[paymentDateObj.getMonth()];
        const year = paymentDateObj.getFullYear();
        setPaymentPeriodLabel(`${month}-${year}`);
      } catch {
        // Ignore invalid dates
      }
    }
  }, [paymentDate]);
  const [regularPaymentAmount, setRegularPaymentAmount] = useState("");
  const [prepaymentAmount, setPrepaymentAmount] = useState("0");

  useEffect(() => {
    if (open && currentTerm) {
      setRegularPaymentAmount(currentTerm.regularPaymentAmount.toString());
      setPrepaymentAmount("0");
      const today = new Date().toISOString().split("T")[0];
      setPaymentDate(today);
      // Auto-generate month-year format
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const paymentDateObj = new Date(today);
      const month = monthNames[paymentDateObj.getMonth()];
      const year = paymentDateObj.getFullYear();
      setPaymentPeriodLabel(`${month}-${year}`);
    }
  }, [open, currentTerm]);

  // Auto-update payment period label when payment date changes
  useEffect(() => {
    if (paymentDate) {
      try {
        const paymentDateObj = new Date(paymentDate);
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const month = monthNames[paymentDateObj.getMonth()];
        const year = paymentDateObj.getFullYear();
        setPaymentPeriodLabel(`${month}-${year}`);
      } catch {
        // Ignore invalid dates
      }
    }
  }, [paymentDate]);

  const totalPaymentAmount =
    (parseFloat(regularPaymentAmount) || 0) + (parseFloat(prepaymentAmount) || 0);

  const paymentBreakdown = useMemo(() => {
    if (!currentTerm) return null;
    if (!lastKnownBalance || lastKnownBalance <= 0) return null;
    if (!totalPaymentAmount || totalPaymentAmount <= 0) return null;
    const annualRatePercent =
      currentTerm.termType === "fixed" && currentTerm.fixedRate
        ? currentTerm.fixedRate
        : currentPrimeRate + (currentTerm.lockedSpread || 0);
    return calculatePaymentBreakdown({
      balance: lastKnownBalance,
      paymentAmount: totalPaymentAmount,
      regularPaymentAmount: parseFloat(regularPaymentAmount) || currentTerm.regularPaymentAmount,
      extraPrepaymentAmount: parseFloat(prepaymentAmount) || 0,
      frequency: currentTerm.paymentFrequency as PaymentFrequency,
      annualRate: annualRatePercent / 100,
    });
  }, [
    currentTerm,
    lastKnownBalance,
    totalPaymentAmount,
    regularPaymentAmount,
    prepaymentAmount,
    currentPrimeRate,
  ]);

  const handleSave = () => {
    if (!currentTerm || !paymentDate || !regularPaymentAmount) return;
    const regular = parseFloat(regularPaymentAmount) || 0;
    const prepay = parseFloat(prepaymentAmount) || 0;
    const total = regular + prepay;
    const fallbackPrincipal = Math.round(total * 0.3 * 100) / 100;
    const fallbackInterest = Math.round(total * 0.7 * 100) / 100;
    onSubmit({
      paymentDate,
      paymentPeriodLabel: paymentPeriodLabel || null,
      regularPaymentAmount: regular,
      prepaymentAmount: prepay,
      paymentAmount: total,
      principalPaid: paymentBreakdown ? paymentBreakdown.principal : fallbackPrincipal,
      interestPaid: paymentBreakdown ? paymentBreakdown.interest : fallbackInterest,
      remainingBalance: paymentBreakdown
        ? paymentBreakdown.remainingBalance
        : Math.max(0, lastKnownBalance - fallbackPrincipal),
      primeRate: currentTerm.termType === "fixed" ? undefined : currentPrimeRate,
      effectiveRate: currentEffectiveRate,
      triggerRateHit: paymentBreakdown?.triggerRateHit ? 1 : 0,
      remainingAmortizationMonths:
        paymentBreakdown?.remainingAmortizationMonths ?? lastKnownAmortizationMonths,
    });
  };

  const disableSave =
    !paymentDate || !regularPaymentAmount || Number(regularPaymentAmount) <= 0 || !currentTerm;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Payment</DialogTitle>
          <DialogDescription>Record a mortgage payment with optional prepayment</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {currentTerm && (
            <div className="p-4 bg-accent/40 rounded-md space-y-2">
              <p className="text-sm font-semibold">Current Term Snapshot</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">
                    {currentTerm.termType === "fixed" ? "Fixed Rate" : "Variable Rate"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Term Length</p>
                  <p className="font-medium">{currentTerm.termYears} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Locked Spread</p>
                  <p className="font-mono font-medium">
                    Prime {currentTerm.lockedSpread >= 0 ? "+" : ""}
                    {currentTerm.lockedSpread ?? 0}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Months Remaining</p>
                  <p className="font-medium">{monthsRemainingInTerm}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                data-testid="input-payment-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-period-label">Payment Period (auto-generated)</Label>
              <Input
                id="payment-period-label"
                placeholder="e.g., Feb-2025"
                value={paymentPeriodLabel}
                onChange={(e) => setPaymentPeriodLabel(e.target.value)}
                data-testid="input-payment-label"
              />
              <p className="text-xs text-muted-foreground">
                Automatically set to month-year format based on payment date. You can edit if
                needed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regular-payment-amount">Regular Payment ($)</Label>
              <Input
                id="regular-payment-amount"
                type="number"
                step="0.01"
                placeholder="2000.00"
                value={regularPaymentAmount}
                onChange={(e) => setRegularPaymentAmount(e.target.value)}
                data-testid="input-regular-payment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepayment-amount">Prepayment ($)</Label>
              <Input
                id="prepayment-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={prepaymentAmount}
                onChange={(e) => setPrepaymentAmount(e.target.value)}
                data-testid="input-prepayment-amount"
              />
            </div>
          </div>

          <div className="p-3 bg-accent/30 rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Total Payment</p>
            <p className="text-2xl font-mono font-bold" data-testid="text-total-payment">
              ${totalPaymentAmount.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Regular (${parseFloat(regularPaymentAmount) || 0}) + Prepayment (
              {parseFloat(prepaymentAmount) || 0})
            </p>
          </div>

          {currentTerm && (
            <div className="p-3 bg-muted rounded-md space-y-1">
              <p className="text-sm font-medium">
                {currentTerm.termType === "fixed" ? "Locked Fixed Rate" : "Effective Rate"}
              </p>
              <p className="text-2xl font-mono font-bold">
                {currentTerm.termType === "fixed"
                  ? `${currentTerm.fixedRate != null ? currentTerm.fixedRate.toFixed(2) : "0.00"}%`
                  : `${currentEffectiveRate.toFixed(2)}%`}
              </p>
              {currentTerm.termType === "fixed" ? (
                <p className="text-xs text-muted-foreground">
                  Rate is constant until {currentTerm.endDate}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Prime {currentPrimeRate.toFixed(2)}% + Spread{" "}
                  {currentTerm.lockedSpread >= 0 ? "+" : ""}
                  {currentTerm.lockedSpread ?? 0}% = {currentEffectiveRate.toFixed(2)}%
                </p>
              )}
            </div>
          )}

          {paymentBreakdown ? (
            <div className="p-4 bg-muted rounded-md space-y-2">
              <p className="text-sm font-medium">Calculated (semi-annual compounding)</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Principal (incl. prepayment)</p>
                  <p className="font-mono font-medium text-green-600">
                    ${paymentBreakdown.principal.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Interest</p>
                  <p className="font-mono font-medium text-orange-600">
                    ${paymentBreakdown.interest.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">New Balance</p>
                <p className="font-mono font-medium">
                  $
                  {paymentBreakdown.remainingBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              {paymentBreakdown.triggerRateHit && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Payment is below interest-only threshold. Lender may require a payment increase.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-md text-sm text-muted-foreground">
              Enter a payment amount to preview the principal/interest split.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={disableSave || isSubmitting}
            data-testid="button-save-payment"
          >
            {isSubmitting && <span className="mr-2">Saving...</span>}
            Save Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
