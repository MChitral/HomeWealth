import { useEffect, useState, useRef } from "react";
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
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { AlertTriangle, Info, TrendingUp, Calendar } from "lucide-react";
import { useSkipPayment } from "../hooks/use-skip-payment";
import type { UiTerm } from "../types";
import type { MortgagePayment } from "@shared/schema";
import type { PaymentFrequency } from "@server-shared/calculations/mortgage";

interface SkipPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgageId: string;
  currentTerm: UiTerm | null;
  currentBalance: number;
  currentAmortizationMonths: number;
  currentEffectiveRate: number;
  payments: MortgagePayment[];
  maxSkipsPerYear?: number;
}

export function SkipPaymentDialog({
  open,
  onOpenChange,
  mortgageId,
  currentTerm,
  currentBalance,
  currentAmortizationMonths,
  currentEffectiveRate,
  payments,
  maxSkipsPerYear = 2,
}: SkipPaymentDialogProps) {
  const [dialogKey, setDialogKey] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const previousOpenRef = useRef(open);

  // Update key when dialog opens/closes to force remount and reset state
  // Use startTransition or update in a way that doesn't trigger warnings
  useEffect(() => {
    if (open && !previousOpenRef.current) {
      // Dialog just opened - generate new key
      setDialogKey(performance.now());
    } else if (!open && previousOpenRef.current) {
      // Dialog just closed - reset key and state
      setDialogKey(0);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setIsConfirmed(false);
    }
    previousOpenRef.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const {
    skipPaymentMutation,
    canSkip,
    skippedThisYear,
    skipLimit,
    skipImpact,
    calculateSkipImpact,
    resetSkipImpact,
  } = useSkipPayment({
    mortgageId,
    termId: currentTerm?.id || "",
    currentBalance,
    currentAmortizationMonths,
    effectiveRate: currentEffectiveRate / 100, // Convert percentage to decimal
    paymentFrequency: (currentTerm?.paymentFrequency || "monthly") as PaymentFrequency,
    payments,
    maxSkipsPerYear,
  });

  // Calculate impact when payment date changes
  useEffect(() => {
    if (open && paymentDate && currentTerm && canSkip) {
      calculateSkipImpact(paymentDate);
    }
  }, [paymentDate, currentTerm, canSkip, open, calculateSkipImpact]);

  const handleSkipPayment = () => {
    if (!paymentDate || !canSkip) return;

    skipPaymentMutation.mutate({
      paymentDate,
      maxSkipsPerYear,
    });
  };

  const handleClose = () => {
    if (!skipPaymentMutation.isPending) {
      setIsConfirmed(false);
      resetSkipImpact();
      onOpenChange(false);
    }
  };

  const skipProgress = (skippedThisYear / skipLimit) * 100;
  const skipsRemaining = skipLimit - skippedThisYear;

  return (
    <Dialog key={dialogKey} open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Skip Payment</DialogTitle>
          <DialogDescription>
            Skip a mortgage payment. Interest will accrue and your balance will increase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Eligibility Status */}
          <div className="p-4 bg-accent/40 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Skip Eligibility</p>
                <p className="text-xs text-muted-foreground">
                  {canSkip
                    ? `You can skip ${skipsRemaining} more payment${skipsRemaining !== 1 ? "s" : ""} this year`
                    : `You have reached your skip limit (${skipLimit} per year)`}
                </p>
              </div>
              <Badge variant={canSkip ? "default" : "destructive"}>
                {canSkip ? "Eligible" : "Not Eligible"}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Skips Used This Year</span>
                <span className="font-medium">
                  {skippedThisYear} of {skipLimit}
                </span>
              </div>
              <Progress value={skipProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Limit resets on January 1st, {new Date().getFullYear() + 1}
              </p>
            </div>
          </div>

          {!canSkip && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have already skipped {skippedThisYear} payment{skippedThisYear !== 1 ? "s" : ""}{" "}
                this year. The limit of {skipLimit} skip{skipLimit !== 1 ? "s" : ""} per calendar
                year has been reached.
              </AlertDescription>
            </Alert>
          )}

          {canSkip && (
            <>
              {/* Payment Date */}
              <div className="space-y-2">
                <Label htmlFor="skip-payment-date">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Payment Date to Skip
                </Label>
                <Input
                  id="skip-payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  data-testid="input-skip-payment-date"
                />
                <p className="text-xs text-muted-foreground">
                  Select the date of the payment you want to skip
                </p>
              </div>

              {/* Impact Preview */}
              {skipImpact && (
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-md space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <p className="text-sm font-semibold">Impact of Skipping This Payment</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Interest That Will Accrue</p>
                        <p className="text-lg font-mono font-semibold text-orange-600">
                          $
                          {skipImpact.interestAccrued.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">New Balance After Skip</p>
                        <p className="text-lg font-mono font-semibold">
                          $
                          {skipImpact.newBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Extended Amortization</p>
                        <p className="text-lg font-mono font-semibold">
                          {Math.round((skipImpact.extendedAmortizationMonths / 12) * 10) / 10} years
                          <span className="text-xs text-muted-foreground ml-1">
                            ({skipImpact.extendedAmortizationMonths} months)
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance Increase</p>
                        <p className="text-lg font-mono font-semibold text-red-600">
                          +$
                          {skipImpact.interestAccrued.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warning:</strong> Skipping this payment will result in negative
                      amortization. Your mortgage balance will increase by $
                      {skipImpact.interestAccrued.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      , and your amortization period will extend.
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Skipped payments still accrue interest. This
                      interest is added to your principal balance, which means you&apos;ll pay
                      interest on interest over time. Consider this carefully before proceeding.
                    </AlertDescription>
                  </Alert>

                  {/* Confirmation Checkbox */}
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <input
                      type="checkbox"
                      id="confirm-skip"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="mt-1"
                      data-testid="checkbox-confirm-skip"
                    />
                    <Label htmlFor="confirm-skip" className="text-sm cursor-pointer">
                      I understand that skipping this payment will increase my balance by{" "}
                      <strong>
                        $
                        {skipImpact.interestAccrued.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>{" "}
                      and extend my amortization period. I confirm that I want to skip this payment.
                    </Label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={skipPaymentMutation.isPending}>
            Cancel
          </Button>
          {canSkip && (
            <Button
              onClick={handleSkipPayment}
              disabled={
                !paymentDate || !isConfirmed || !skipImpact || skipPaymentMutation.isPending
              }
              variant="destructive"
              data-testid="button-confirm-skip-payment"
            >
              {skipPaymentMutation.isPending ? "Skipping..." : "Skip Payment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
