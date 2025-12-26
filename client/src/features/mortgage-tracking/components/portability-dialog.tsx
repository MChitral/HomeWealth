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
import { mortgageApi, type PortabilityCalculationResult, type PortabilityApplyResponse } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Calculator, CheckCircle2 } from "lucide-react";
import { PortabilityResults } from "./portability-results";
import { mortgageQueryKeys } from "../api";
import { useToast } from "@/shared/hooks/use-toast";

interface PortabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgageId: string;
  currentPropertyPrice: number;
}

export function PortabilityDialog({
  open,
  onOpenChange,
  mortgageId,
  currentPropertyPrice,
}: PortabilityDialogProps) {
  const [newPropertyPrice, setNewPropertyPrice] = useState("");
  const [calculationResult, setCalculationResult] = useState<PortabilityCalculationResult | null>(
    null
  );
  const [appliedResult, setAppliedResult] = useState<PortabilityApplyResponse | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: async (price: number) => {
      return mortgageApi.calculatePortability(mortgageId, {
        newPropertyPrice: price,
      });
    },
    onSuccess: (data) => {
      setCalculationResult(data);
      if (!data.canPort) {
        toast({
          title: "Cannot Port Mortgage",
          description: data.message || "Portability calculation failed",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Failed to calculate portability:", error);
      toast({
        title: "Error",
        description: "Failed to calculate portability. Please try again.",
        variant: "destructive",
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (price: number) => {
      return mortgageApi.applyPortability(mortgageId, {
        newPropertyPrice: price,
      });
    },
    onSuccess: (data) => {
      setAppliedResult(data);
      // Invalidate queries to refresh mortgage data
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgageTerms(mortgageId) });
      toast({
        title: "Portability Applied",
        description: "Your mortgage has been ported to the new property successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to apply portability:", error);
      toast({
        title: "Error",
        description: "Failed to apply portability. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    const price = parseFloat(newPropertyPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid property price greater than zero.",
        variant: "destructive",
      });
      return;
    }
    calculateMutation.mutate(price);
  };

  const handleApply = () => {
    if (!calculationResult || !calculationResult.canPort) {
      return;
    }
    const price = parseFloat(newPropertyPrice);
    applyMutation.mutate(price);
  };

  const handleClose = () => {
    setNewPropertyPrice("");
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
            Mortgage Portability
          </DialogTitle>
          <DialogDescription>
            Transfer your mortgage to a new property. You can typically port up to your original
            mortgage amount. If the new property costs more, you may need a top-up.
          </DialogDescription>
        </DialogHeader>

        {appliedResult ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Portability Applied Successfully</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your mortgage has been ported from a property worth{" "}
                <strong>${currentPropertyPrice.toLocaleString()}</strong> to a property worth{" "}
                <strong>${parseFloat(newPropertyPrice).toLocaleString()}</strong>.
              </p>
              {calculationResult?.requiresTopUp && (
                <p className="text-sm text-muted-foreground">
                  A top-up of{" "}
                  <strong>
                    ${parseFloat(calculationResult.topUpAmount.toString()).toLocaleString()}
                  </strong>{" "}
                  was added to your mortgage.
                </p>
              )}
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-property-price">Current Property Price</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">${currentPropertyPrice.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-property-price">New Property Price</Label>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="new-property-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPropertyPrice}
                  onChange={(e) => setNewPropertyPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the purchase price of the new property.
              </p>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending || !newPropertyPrice}
              className="w-full"
            >
              {calculateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate Portability"
              )}
            </Button>

            {calculationResult && calculationResult.canPort && (
              <>
                <PortabilityResults results={calculationResult} />
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
                      "Apply Portability"
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {calculationResult && !calculationResult.canPort && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive font-medium">
                  {calculationResult.message || "Cannot port mortgage"}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

