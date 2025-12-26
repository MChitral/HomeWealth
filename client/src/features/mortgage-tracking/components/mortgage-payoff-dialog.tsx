import { useState } from "react";
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
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { recordMortgagePayoff, type RecordPayoffRequest } from "../api/mortgage-api";
import { formatCurrency } from "@/shared/utils/format";

interface MortgagePayoffDialogProps {
  mortgageId: string;
  currentBalance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MortgagePayoffDialog({
  mortgageId,
  currentBalance,
  open,
  onOpenChange,
}: MortgagePayoffDialogProps) {
  const [payoffDate, setPayoffDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [finalPaymentAmount, setFinalPaymentAmount] = useState<string>(currentBalance.toFixed(2));
  const [remainingBalance, setRemainingBalance] = useState<string>("0.00");
  const [penaltyAmount, setPenaltyAmount] = useState<string>("0.00");
  const [notes, setNotes] = useState<string>("");
  const queryClient = useQueryClient();

  const payoffMutation = useMutation({
    mutationFn: (data: RecordPayoffRequest) => recordMortgagePayoff(mortgageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mortgages"] });
      queryClient.invalidateQueries({ queryKey: ["mortgage-payoff", mortgageId] });
      onOpenChange(false);
      // Reset form
      setPayoffDate(new Date().toISOString().split("T")[0]);
      setFinalPaymentAmount(currentBalance.toFixed(2));
      setRemainingBalance("0.00");
      setPenaltyAmount("0.00");
      setNotes("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = parseFloat(finalPaymentAmount);
    const remaining = parseFloat(remainingBalance);
    const penalty = parseFloat(penaltyAmount || "0");

    if (isNaN(finalAmount) || finalAmount <= 0) {
      return;
    }

    payoffMutation.mutate({
      payoffDate,
      finalPaymentAmount: finalAmount,
      remainingBalance: remaining,
      penaltyAmount: penalty > 0 ? penalty : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const totalCost = parseFloat(finalPaymentAmount || "0") + parseFloat(penaltyAmount || "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Mortgage Payoff</DialogTitle>
          <DialogDescription>
            Record the final payment and payoff details for this mortgage. This will update the
            mortgage balance to zero.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Balance</Label>
            <div className="text-lg font-semibold">{formatCurrency(currentBalance)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payoff-date">Payoff Date</Label>
              <Input
                id="payoff-date"
                type="date"
                value={payoffDate}
                onChange={(e) => setPayoffDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="final-payment">Final Payment Amount</Label>
              <Input
                id="final-payment"
                type="number"
                step="0.01"
                min="0"
                value={finalPaymentAmount}
                onChange={(e) => setFinalPaymentAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remaining-balance">Remaining Balance After Payment</Label>
              <Input
                id="remaining-balance"
                type="number"
                step="0.01"
                min="0"
                value={remainingBalance}
                onChange={(e) => setRemainingBalance(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="penalty-amount">Penalty Amount (if applicable)</Label>
              <Input
                id="penalty-amount"
                type="number"
                step="0.01"
                min="0"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {totalCost > 0 && (
            <div className="space-y-2 border-t pt-4">
              <Label>Total Cost</Label>
              <div className="text-lg font-semibold">{formatCurrency(totalCost)}</div>
              <p className="text-sm text-muted-foreground">
                Final payment ({formatCurrency(parseFloat(finalPaymentAmount || "0"))}) + Penalty (
                {formatCurrency(parseFloat(penaltyAmount || "0"))})
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the payoff..."
              rows={3}
            />
          </div>

          {payoffMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {payoffMutation.error instanceof Error
                  ? payoffMutation.error.message
                  : "Failed to record mortgage payoff"}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={payoffMutation.isPending}>
              {payoffMutation.isPending ? "Recording..." : "Record Payoff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
