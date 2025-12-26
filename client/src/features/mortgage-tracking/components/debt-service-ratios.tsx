import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  calculateDebtServiceRatios,
  type DebtServiceRatiosRequest,
  type DebtServiceRatiosResult,
} from "../api/mortgage-api";
import { formatCurrency } from "@/shared/utils/format";

interface DebtServiceRatiosProps {
  mortgagePayment?: number;
  grossIncome?: number;
}

export function DebtServiceRatios({
  mortgagePayment: initialMortgagePayment,
  grossIncome: initialGrossIncome,
}: DebtServiceRatiosProps) {
  const [mortgagePayment, setMortgagePayment] = useState<string>(
    initialMortgagePayment?.toString() || ""
  );
  const [grossIncome, setGrossIncome] = useState<string>(initialGrossIncome?.toString() || "");
  const [propertyTax, setPropertyTax] = useState<string>("");
  const [heatingCosts, setHeatingCosts] = useState<string>("");
  const [condoFees, setCondoFees] = useState<string>("");
  const [otherDebtPayments, setOtherDebtPayments] = useState<string>("");

  const ratiosMutation = useMutation({
    mutationFn: (data: DebtServiceRatiosRequest) => calculateDebtServiceRatios(data),
  });

  const handleCalculate = () => {
    if (!mortgagePayment || !grossIncome) {
      return;
    }

    ratiosMutation.mutate({
      mortgagePayment: parseFloat(mortgagePayment),
      grossIncome: parseFloat(grossIncome),
      propertyTax: propertyTax ? parseFloat(propertyTax) : 0,
      heatingCosts: heatingCosts ? parseFloat(heatingCosts) : 0,
      condoFees: condoFees ? parseFloat(condoFees) : 0,
      otherDebtPayments: otherDebtPayments ? parseFloat(otherDebtPayments) : 0,
    });
  };

  const result = ratiosMutation.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>GDS/TDS Ratio Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mortgage-payment">Monthly Mortgage Payment</Label>
            <Input
              id="mortgage-payment"
              type="number"
              value={mortgagePayment}
              onChange={(e) => setMortgagePayment(e.target.value)}
              placeholder="3500"
              required
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
            <Label htmlFor="property-tax">Monthly Property Tax</Label>
            <Input
              id="property-tax"
              type="number"
              value={propertyTax}
              onChange={(e) => setPropertyTax(e.target.value)}
              placeholder="500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heating-costs">Monthly Heating Costs</Label>
            <Input
              id="heating-costs"
              type="number"
              value={heatingCosts}
              onChange={(e) => setHeatingCosts(e.target.value)}
              placeholder="200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condo-fees">Monthly Condo Fees</Label>
            <Input
              id="condo-fees"
              type="number"
              value={condoFees}
              onChange={(e) => setCondoFees(e.target.value)}
              placeholder="400"
            />
            <p className="text-xs text-muted-foreground">50% included in GDS/TDS</p>
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

        {ratiosMutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {ratiosMutation.error instanceof Error
                ? ratiosMutation.error.message
                : "Failed to calculate ratios"}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              {result.overallPass ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <h3 className="font-semibold">
                {result.overallPass ? "Ratios Within Limits" : "Ratios Exceed Limits"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">GDS Ratio</Label>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold">{result.gds.toFixed(1)}%</p>
                  {result.gdsPass ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Max: 39% (B-20 Guidelines)</p>
                {result.gdsWarning && <p className="text-xs text-yellow-600">Approaching limit</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">TDS Ratio</Label>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold">{result.tds.toFixed(1)}%</p>
                  {result.tdsPass ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Max: 44% (B-20 Guidelines)</p>
                {result.tdsWarning && <p className="text-xs text-yellow-600">Approaching limit</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Monthly Housing Costs</Label>
                <p className="font-semibold">{formatCurrency(result.housingCosts)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Monthly Income</Label>
                <p className="font-semibold">{formatCurrency(result.monthlyIncome)}</p>
              </div>
            </div>

            {result.warnings.length > 0 && (
              <Alert variant={result.overallPass ? "default" : "destructive"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {result.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Button
          onClick={handleCalculate}
          disabled={ratiosMutation.isPending || !mortgagePayment || !grossIncome}
          className="w-full"
        >
          {ratiosMutation.isPending ? "Calculating..." : "Calculate Ratios"}
        </Button>
      </CardContent>
    </Card>
  );
}
