import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { correctPayment, fetchPaymentCorrections, type PaymentCorrection } from "../api/mortgage-api";
import { formatCurrency } from "@/shared/utils/format";
import { History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

interface PaymentCorrectionsDialogProps {
  paymentId: string;
  currentAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentCorrectionsDialog({
  paymentId,
  currentAmount,
  open,
  onOpenChange,
}: PaymentCorrectionsDialogProps) {
  const [correctedAmount, setCorrectedAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: corrections = [], refetch } = useQuery({
    queryKey: ["payment-corrections", paymentId],
    queryFn: () => fetchPaymentCorrections(paymentId),
    enabled: open,
  });

  const correctMutation = useMutation({
    mutationFn: (data: { correctedAmount: number; reason: string }) =>
      correctPayment(paymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mortgage-payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-corrections", paymentId] });
      setCorrectedAmount("");
      setReason("");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(correctedAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    if (!reason.trim()) {
      return;
    }
    correctMutation.mutate({ correctedAmount: amount, reason: reason.trim() });
  };

  const latestCorrection = corrections.length > 0 ? corrections[corrections.length - 1] : null;
  const effectiveAmount = latestCorrection
    ? parseFloat(latestCorrection.correctedAmount)
    : currentAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Corrections</DialogTitle>
          <DialogDescription>
            Record corrections or adjustments to this payment. All corrections are tracked for audit
            purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Current Payment Amount</Label>
            <div className="text-lg font-semibold">{formatCurrency(effectiveAmount)}</div>
            {latestCorrection && (
              <p className="text-sm text-muted-foreground">
                Original amount: {formatCurrency(parseFloat(latestCorrection.originalAmount))}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="corrected-amount">Corrected Amount</Label>
              <Input
                id="corrected-amount"
                type="number"
                step="0.01"
                min="0"
                value={correctedAmount}
                onChange={(e) => setCorrectedAmount(e.target.value)}
                placeholder="Enter corrected amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Correction</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the reason for this correction..."
                rows={3}
                required
              />
            </div>

            {correctMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {correctMutation.error instanceof Error
                    ? correctMutation.error.message
                    : "Failed to record correction"}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={correctMutation.isPending}>
                {correctMutation.isPending ? "Recording..." : "Record Correction"}
              </Button>
            </DialogFooter>
          </form>

          {corrections.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <Label>Correction History</Label>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Original</TableHead>
                    <TableHead>Corrected</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {corrections.map((correction: PaymentCorrection) => (
                    <TableRow key={correction.id}>
                      <TableCell>
                        {new Date(correction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{formatCurrency(parseFloat(correction.originalAmount))}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(correction.correctedAmount))}</TableCell>
                      <TableCell className="max-w-xs truncate">{correction.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

