import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/shared/hooks/use-toast";
import { mortgageApi, mortgageQueryKeys } from "../api";
import type { UiPayment, UiTerm } from "../types";
import { calculatePaymentBreakdown, type PaymentFrequency } from "../utils/mortgage-math";

type EditPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: UiPayment | null;
  currentTerm: UiTerm | null;
  currentEffectiveRate: number;
};

function monthYearLabel(date: string): string {
  try {
    const paymentDate = new Date(date);
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
    return `${monthNames[paymentDate.getMonth()]}-${paymentDate.getFullYear()}`;
  } catch {
    return "";
  }
}

export function EditPaymentDialog({
  open,
  onOpenChange,
  payment,
  currentTerm,
  currentEffectiveRate,
}: EditPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Update this logged payment. Prepayment, regular amount, and date can be changed.
          </DialogDescription>
        </DialogHeader>
        {payment ? (
          <EditPaymentForm
            key={payment.id}
            payment={payment}
            currentTerm={currentTerm}
            currentEffectiveRate={currentEffectiveRate}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type EditPaymentFormProps = {
  payment: UiPayment;
  currentTerm: UiTerm | null;
  currentEffectiveRate: number;
  onClose: () => void;
};

function EditPaymentForm({
  payment,
  currentTerm,
  currentEffectiveRate,
  onClose,
}: EditPaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentDate, setPaymentDate] = useState(payment.date);
  const [paymentPeriodLabel, setPaymentPeriodLabel] = useState(
    payment.paymentPeriodLabel || monthYearLabel(payment.date)
  );
  const [regularPaymentAmount, setRegularPaymentAmount] = useState(
    payment.regularPaymentAmount.toString()
  );
  const [prepaymentAmount, setPrepaymentAmount] = useState(payment.prepaymentAmount.toString());

  const totalPaymentAmount =
    (parseFloat(regularPaymentAmount) || 0) + (parseFloat(prepaymentAmount) || 0);
  const balanceBeforePayment = payment.remainingBalance + payment.principal;

  const paymentBreakdown = useMemo(() => {
    if (!currentTerm) return null;
    if (!balanceBeforePayment || balanceBeforePayment <= 0) return null;
    if (!totalPaymentAmount || totalPaymentAmount <= 0) return null;
    return calculatePaymentBreakdown({
      balance: balanceBeforePayment,
      paymentAmount: totalPaymentAmount,
      regularPaymentAmount: parseFloat(regularPaymentAmount) || currentTerm.regularPaymentAmount,
      extraPrepaymentAmount: parseFloat(prepaymentAmount) || 0,
      frequency: currentTerm.paymentFrequency as PaymentFrequency,
      annualRate: payment.effectiveRate / 100,
    });
  }, [
    currentTerm,
    payment.effectiveRate,
    balanceBeforePayment,
    totalPaymentAmount,
    regularPaymentAmount,
    prepaymentAmount,
  ]);

  const updatePaymentMutation = useMutation({
    mutationFn: () => {
      const regular = parseFloat(regularPaymentAmount) || 0;
      const prepay = parseFloat(prepaymentAmount) || 0;
      return mortgageApi.updatePayment(payment.id, {
        paymentDate,
        paymentPeriodLabel: paymentPeriodLabel || null,
        regularPaymentAmount: regular.toFixed(2),
        prepaymentAmount: prepay.toFixed(2),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.all });
      toast({
        title: "Payment updated",
        description: "The payment was saved and later balances were recalculated",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment",
        variant: "destructive",
      });
    },
  });

  const disableSave =
    !paymentDate ||
    !currentTerm ||
    Number(regularPaymentAmount) < 0 ||
    Number(prepaymentAmount) < 0 ||
    totalPaymentAmount <= 0;

  return (
    <>
      <div className="space-y-4 py-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Principal, interest, and balance will be recalculated. Any later payments will be
            updated from the new balance.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-payment-date">Payment Date</Label>
            <Input
              id="edit-payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => {
                setPaymentDate(e.target.value);
                setPaymentPeriodLabel(monthYearLabel(e.target.value));
              }}
              data-testid="input-edit-payment-date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-payment-period-label">Payment Period</Label>
            <Input
              id="edit-payment-period-label"
              placeholder="e.g., Feb-2025"
              value={paymentPeriodLabel}
              onChange={(e) => setPaymentPeriodLabel(e.target.value)}
              data-testid="input-edit-payment-label"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-regular-payment-amount">Regular Payment ($)</Label>
            <Input
              id="edit-regular-payment-amount"
              type="number"
              step="0.01"
              min="0"
              value={regularPaymentAmount}
              onChange={(e) => setRegularPaymentAmount(e.target.value)}
              data-testid="input-edit-regular-payment"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-prepayment-amount">Prepayment ($)</Label>
            <Input
              id="edit-prepayment-amount"
              type="number"
              step="0.01"
              min="0"
              value={prepaymentAmount}
              onChange={(e) => setPrepaymentAmount(e.target.value)}
              data-testid="input-edit-prepayment-amount"
            />
          </div>
        </div>

        <div className="p-3 bg-accent/30 rounded-md">
          <p className="text-sm text-muted-foreground mb-1">Total Payment</p>
          <p className="text-2xl font-mono font-bold" data-testid="text-edit-total-payment">
            ${totalPaymentAmount.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Regular (${parseFloat(regularPaymentAmount) || 0}) + Prepayment ($
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
          </div>
        )}

        {paymentBreakdown ? (
          <div className="p-4 bg-muted rounded-md space-y-2">
            <p className="text-sm font-medium">Recalculated (semi-annual compounding)</p>
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
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-md text-sm text-muted-foreground">
            Enter a payment amount to preview the principal/interest split.
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => updatePaymentMutation.mutate()}
          disabled={disableSave || updatePaymentMutation.isPending}
          data-testid="button-save-edited-payment"
        >
          {updatePaymentMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
}
