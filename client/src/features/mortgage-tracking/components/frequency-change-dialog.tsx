import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { mortgageApi, type FrequencyChangeResult, type FrequencyChangeApplyResponse } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Calculator, CheckCircle2 } from "lucide-react";
import { FrequencyChangeResults } from "./frequency-change-results";
import { mortgageQueryKeys } from "../api";
import { useToast } from "@/shared/hooks/use-toast";

interface FrequencyChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgageId: string;
  termId: string;
  currentFrequency: string;
}

const frequencyOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "semi-monthly", label: "Semi-Monthly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "accelerated-biweekly", label: "Accelerated Bi-weekly" },
  { value: "weekly", label: "Weekly" },
  { value: "accelerated-weekly", label: "Accelerated Weekly" },
];

export function FrequencyChangeDialog({
  open,
  onOpenChange,
  mortgageId,
  termId,
  currentFrequency,
}: FrequencyChangeDialogProps) {
  const [newFrequency, setNewFrequency] = useState<string>("");
  const [calculationResult, setCalculationResult] = useState<FrequencyChangeResult | null>(null);
  const [appliedResult, setAppliedResult] = useState<FrequencyChangeApplyResponse | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: async (frequency: string) => {
      return mortgageApi.calculateFrequencyChange(termId, {
        newFrequency: frequency,
      });
    },
    onSuccess: (data) => {
      setCalculationResult(data);
      if (!data.canChange) {
        toast({
          title: "Cannot Change Frequency",
          description: data.message || "Frequency change calculation failed",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Failed to calculate frequency change:", error);
      toast({
        title: "Error",
        description: "Failed to calculate frequency change. Please try again.",
        variant: "destructive",
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (frequency: string) => {
      return mortgageApi.applyFrequencyChange(termId, {
        newFrequency: frequency,
      });
    },
    onSuccess: (data) => {
      setAppliedResult(data);
      // Invalidate queries to refresh mortgage data
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgageTerms(mortgageId) });
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgagePayments(mortgageId) });
      toast({
        title: "Frequency Changed",
        description: "Your payment frequency has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to apply frequency change:", error);
      toast({
        title: "Error",
        description: "Failed to apply frequency change. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    if (!newFrequency || newFrequency === currentFrequency) {
      toast({
        title: "Invalid Selection",
        description: "Please select a different frequency than your current one.",
        variant: "destructive",
      });
      return;
    }
    calculateMutation.mutate(newFrequency);
  };

  const handleApply = () => {
    if (!calculationResult || !calculationResult.canChange) {
      return;
    }
    applyMutation.mutate(newFrequency);
  };

  const handleClose = () => {
    setNewFrequency("");
    setCalculationResult(null);
    setAppliedResult(null);
    onOpenChange(false);
  };

  const currentFrequencyLabel = frequencyOptions.find((opt) => opt.value === currentFrequency)?.label || currentFrequency;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Change Payment Frequency
          </DialogTitle>
          <DialogDescription>
            Change your payment frequency mid-term. Your payment amount will be recalculated based
            on the new frequency while maintaining the same interest rate and term end date.
          </DialogDescription>
        </DialogHeader>

        {appliedResult ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Frequency Changed Successfully</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your payment frequency has been updated from{" "}
                <strong>{currentFrequencyLabel}</strong> to{" "}
                <strong>
                  {frequencyOptions.find((opt) => opt.value === calculationResult?.newFrequency)
                    ?.label || calculationResult?.newFrequency}
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
              <Label htmlFor="current-frequency">Current Frequency</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{currentFrequencyLabel}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-frequency">New Frequency</Label>
              <Select value={newFrequency} onValueChange={setNewFrequency}>
                <SelectTrigger id="new-frequency">
                  <SelectValue placeholder="Select new frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions
                    .filter((opt) => opt.value !== currentFrequency)
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a different payment frequency. The payment amount will be recalculated.
              </p>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending || !newFrequency}
              className="w-full"
            >
              {calculateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate Impact"
              )}
            </Button>

            {calculationResult && calculationResult.canChange && (
              <>
                <FrequencyChangeResults results={calculationResult} />
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
                      "Apply Change"
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {calculationResult && !calculationResult.canChange && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive font-medium">
                  {calculationResult.message || "Cannot change frequency"}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

