import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  calculateStressTest,
  type StressTestRequest,
  type StressTestResult,
} from "../api/mortgage-api";
import { formatCurrency } from "@/shared/utils/format";

interface StressTestCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgageAmount?: number;
  contractRate?: number;
  amortizationMonths?: number;
}

export function StressTestCalculator({
  open,
  onOpenChange,
  mortgageAmount: initialMortgageAmount,
  contractRate: initialContractRate,
  amortizationMonths: initialAmortizationMonths,
}: StressTestCalculatorProps) {
  const [mortgageAmount, setMortgageAmount] = useState<string>(
    initialMortgageAmount?.toString() || ""
  );
  const [contractRate, setContractRate] = useState<string>(
    initialContractRate ? (initialContractRate * 100).toString() : ""
  );
  const [amortizationMonths, setAmortizationMonths] = useState<string>(
    initialAmortizationMonths?.toString() || ""
  );
  const [grossIncome, setGrossIncome] = useState<string>("");
  const [otherHousingCosts, setOtherHousingCosts] = useState<string>("");
  const [otherDebtPayments, setOtherDebtPayments] = useState<string>("");

  const stressTestMutation = useMutation({
    mutationFn: (data: StressTestRequest) => calculateStressTest(data),
  });

  const handleCalculate = () => {
    if (!mortgageAmount || !contractRate || !amortizationMonths || !grossIncome) {
      return;
    }

    stressTestMutation.mutate({
      mortgageAmount: parseFloat(mortgageAmount),
      contractRate: parseFloat(contractRate),
      amortizationMonths: parseInt(amortizationMonths),
      grossIncome: parseFloat(grossIncome),
      otherHousingCosts: otherHousingCosts ? parseFloat(otherHousingCosts) : 0,
      otherDebtPayments: otherDebtPayments ? parseFloat(otherDebtPayments) : 0,
    });
  };

  const result = stressTestMutation.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>B-20 Stress Test Calculator</DialogTitle>
          <DialogDescription>
            Calculate if your mortgage qualifies under B-20 stress test guidelines. Qualifying rate
            = max(contract rate + 2%, 5.25%).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mortgage-amount">Mortgage Amount</Label>
              <Input
                id="mortgage-amount"
                type="number"
                value={mortgageAmount}
                onChange={(e) => setMortgageAmount(e.target.value)}
                placeholder="500000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-rate">Contract Rate (%)</Label>
              <Input
                id="contract-rate"
                type="number"
                step="0.01"
                value={contractRate}
                onChange={(e) => setContractRate(e.target.value)}
                placeholder="5.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amortization">Amortization (months)</Label>
              <Input
                id="amortization"
                type="number"
                value={amortizationMonths}
                onChange={(e) => setAmortizationMonths(e.target.value)}
                placeholder="300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gross-income">Annual Gross Income</Label>
              <Input
                id="gross-income"
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                placeholder="100000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other-housing">Other Housing Costs (monthly)</Label>
              <Input
                id="other-housing"
                type="number"
                value={otherHousingCosts}
                onChange={(e) => setOtherHousingCosts(e.target.value)}
                placeholder="500"
              />
              <p className="text-xs text-muted-foreground">
                Property tax + heating + 50% of condo fees
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other-debt">Other Debt Payments (monthly)</Label>
              <Input
                id="other-debt"
                type="number"
                value={otherDebtPayments}
                onChange={(e) => setOtherDebtPayments(e.target.value)}
                placeholder="500"
              />
            </div>
          </div>

          {stressTestMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {stressTestMutation.error instanceof Error
                  ? stressTestMutation.error.message
                  : "Failed to calculate stress test"}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                {result.passes ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <h3 className="font-semibold">
                  {result.passes ? "Passes Stress Test" : "Fails Stress Test"}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Stress Test Rate</Label>
                  <p className="text-lg font-semibold">
                    {(result.stressTestRate * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Qualifying Payment</Label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(result.qualifyingPayment)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">GDS Ratio</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{result.actualGDS.toFixed(1)}%</p>
                    {result.gdsPass ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-xs text-muted-foreground">(Max: {result.maxGDS}%)</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">TDS Ratio</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{result.actualTDS.toFixed(1)}%</p>
                    {result.tdsPass ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-xs text-muted-foreground">(Max: {result.maxTDS}%)</span>
                  </div>
                </div>
              </div>

              {result.maxMortgageAmount > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Maximum Mortgage Amount</Label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(result.maxMortgageAmount)}
                  </p>
                </div>
              )}

              {result.recommendations && (
                <Alert variant={result.passes ? "default" : "destructive"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold">{result.recommendations.message}</p>
                    {result.recommendations.suggestions && (
                      <ul className="mt-2 list-disc list-inside">
                        {result.recommendations.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={handleCalculate}
              disabled={
                stressTestMutation.isPending ||
                !mortgageAmount ||
                !contractRate ||
                !amortizationMonths ||
                !grossIncome
              }
            >
              {stressTestMutation.isPending ? "Calculating..." : "Calculate"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
