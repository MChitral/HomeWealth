import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { mortgageApi, type RecastCalculationResult, type RecastApplyResponse } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Calculator, CheckCircle2 } from "lucide-react";
import { RecastResults } from "./recast-results";
import { mortgageQueryKeys } from "../api";
import { useToast } from "@/shared/hooks/use-toast";

interface RecastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgageId: string;
}

export function RecastDialog({ open, onOpenChange, mortgageId }: RecastDialogProps) {
  const [prepaymentAmount, setPrepaymentAmount] = useState("");
  const [calculationResult, setCalculationResult] = useState<RecastCalculationResult | null>(null);
  const [appliedResult, setAppliedResult] = useState<RecastApplyResponse | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: async (amount: number) => {
      return mortgageApi.calculateRecast(mortgageId, {
        prepaymentAmount: amount,
      });
    },
    onSuccess: (data) => {
      setCalculationResult(data);
      if (!data.canRecast) {
        toast({
          title: "Cannot Recast",
          description: data.message || "Recast calculation failed",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Failed to calculate recast:", error);
      toast({
        title: "Error",
        description: "Failed to calculate recast. Please try again.",
        variant: "destructive",
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (amount: number) => {
      return mortgageApi.applyRecast(mortgageId, {
        prepaymentAmount: amount,
      });
    },
    onSuccess: (data) => {
      setAppliedResult(data);
      // Invalidate queries to refresh mortgage data
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgageTerms(mortgageId) });
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgagePayments(mortgageId) });
      toast({
        title: "Recast Applied",
        description: "Your mortgage payment has been recalculated successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to apply recast:", error);
      toast({
        title: "Error",
        description: "Failed to apply recast. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    const amount = parseFloat(prepaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid prepayment amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    calculateMutation.mutate(amount);
  };

  const handleApply = () => {
    if (!calculationResult || !calculationResult.canRecast) {
      return;
    }
    const amount = parseFloat(prepaymentAmount);
    applyMutation.mutate(amount);
  };

  const handleClose = () => {
    setPrepaymentAmount("");
    setCalculationResult(null);
    setAppliedResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Mortgage Recast
          </DialogTitle>
          <DialogDescription>
            Recalculate your mortgage payment after a large prepayment. Your payment amount will
            decrease while keeping the same amortization period.
          </DialogDescription>
        </DialogHeader>

        {appliedResult ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Recast Applied Successfully</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your mortgage payment has been updated from{" "}
                <strong>
                  $
                  {parseFloat(
                    calculationResult?.previousPaymentAmount.toString() || "0"
                  ).toLocaleString()}
                </strong>{" "}
                to{" "}
                <strong>
                  $
                  {parseFloat(
                    calculationResult?.newPaymentAmount.toString() || "0"
                  ).toLocaleString()}
                </strong>
                .
              </p>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prepayment-amount">Prepayment Amount</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="prepayment-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={prepaymentAmount}
                    onChange={(e) => setPrepaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
                <Button
                  onClick={handleCalculate}
                  disabled={calculateMutation.isPending || !prepaymentAmount}
                >
                  {calculateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Calculate"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the amount you plan to prepay. The system will calculate your new payment
                amount.
              </p>
            </div>

            {calculationResult && calculationResult.canRecast && (
              <>
                <RecastResults results={calculationResult} />
                <div className="flex gap-2">
                  <Button
                    onClick={handleApply}
                    disabled={applyMutation.isPending}
                    className="flex-1"
                  >
                    {applyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      "Apply Recast"
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {calculationResult && !calculationResult.canRecast && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive font-medium">
                  {calculationResult.message || "Cannot apply recast"}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
