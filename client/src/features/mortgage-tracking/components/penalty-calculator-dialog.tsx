import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { FormProvider } from "react-hook-form";
import { PenaltyCalculatorForm } from "./penalty-calculator-form";
import { PenaltyCalculatorResults } from "./penalty-calculator-results";
import { usePenaltyCalculatorForm } from "../hooks/use-penalty-calculator-form";
import { mortgageApi, type CalculatePenaltyResponse } from "../api";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Calculator } from "lucide-react";
import type { PenaltyCalculatorFormData } from "../hooks/use-penalty-calculator-form";
import { useQuery } from "@tanstack/react-query";
import { mortgageQueryKeys } from "../api";

interface PenaltyCalculatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Pre-fill data (optional)
  mortgageId?: string;
  termId?: string;
  initialBalance?: string;
  initialCurrentRate?: string;
  initialRemainingMonths?: string;
  initialTermType?: "fixed" | "variable-changing" | "variable-fixed";
  initialTermYears?: number;
}

export function PenaltyCalculatorDialog({
  open,
  onOpenChange,
  mortgageId,
  termId,
  initialBalance,
  initialCurrentRate,
  initialRemainingMonths,
  initialTermType,
  initialTermYears,
}: PenaltyCalculatorDialogProps) {
  // Fetch mortgage and term data if IDs provided
  const { data: mortgages } = useQuery({
    queryKey: mortgageQueryKeys.mortgages(),
    queryFn: () => mortgageApi.fetchMortgages(),
    enabled: !!mortgageId && open,
  });

  const { data: terms } = useQuery({
    queryKey: mortgageQueryKeys.mortgageTerms(mortgageId || null),
    queryFn: () => mortgageApi.fetchMortgageTerms(mortgageId!),
    enabled: !!mortgageId && open,
  });

  const mortgage = mortgages?.find((m) => m.id === mortgageId);
  const term = terms?.find((t) => t.id === termId);

  // Determine initial values (prefer props, then fetched data)
  const formInitialValues: Partial<PenaltyCalculatorFormData> = {
    balance:
      initialBalance ||
      (mortgage?.currentBalance ? parseFloat(mortgage.currentBalance).toFixed(2) : ""),
    currentRate: initialCurrentRate || "",
    remainingMonths: initialRemainingMonths || "",
    termType: initialTermType || (term?.termType as "fixed" | "variable-changing" | "variable-fixed" | undefined),
    termYears: initialTermYears || term?.termYears,
  };

  // If we have term data but no initial current rate, calculate it
  if (!formInitialValues.currentRate && term) {
    if (term.fixedRate) {
      formInitialValues.currentRate = (parseFloat(term.fixedRate) * 100).toFixed(2);
    } else if (term.primeRate && term.lockedSpread) {
      const rate = (parseFloat(term.primeRate) + parseFloat(term.lockedSpread)) * 100;
      formInitialValues.currentRate = rate.toFixed(2);
    }
  }

  const form = usePenaltyCalculatorForm(formInitialValues);

  const [results, setResults] = useState<CalculatePenaltyResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: PenaltyCalculatorFormData) => {
      return mortgageApi.calculatePenalty({
        balance: parseFloat(data.balance),
        currentRate: parseFloat(data.currentRate) / 100, // Convert percentage to decimal
        marketRate: parseFloat(data.marketRate) / 100,
        remainingMonths: parseInt(data.remainingMonths, 10),
        termType: data.termType,
        penaltyCalculationMethod: data.penaltyCalculationMethod,
      });
    },
    onSuccess: (data) => {
      setResults(data);
    },
    onError: (error) => {
      console.error("Failed to calculate penalty:", error);
      // Handle error (show toast or error message)
    },
  });

  const handleCalculate = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  const handleReset = () => {
    form.reset(formInitialValues);
    setResults(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Penalty Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate your mortgage penalty for early renewal or refinancing
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <div className="space-y-6">
            <PenaltyCalculatorForm />

            {results && <PenaltyCalculatorResults results={results} />}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleReset} disabled={mutation.isPending}>
                Reset
              </Button>
              <Button onClick={handleCalculate} disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate Penalty"
                )}
              </Button>
            </div>
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

