import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";

interface TaxSavingsCardProps {
  helocInterest: number;
  taxSavings: number;
  marginalTaxRate: number;
  eligibleInterest: number;
}

export function TaxSavingsCard({
  helocInterest,
  taxSavings,
  marginalTaxRate,
  eligibleInterest,
}: TaxSavingsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const netHelocCost = helocInterest - taxSavings;
  const taxSavingsPercent = helocInterest > 0 ? (taxSavings / helocInterest) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Tax Savings Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">HELOC Interest Paid</p>
            <p className="text-2xl font-bold">{formatCurrency(helocInterest)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Eligible Interest</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(eligibleInterest)}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Marginal Tax Rate</span>
            <span className="font-semibold">{formatPercent(marginalTaxRate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tax Savings</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(taxSavings)}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {formatPercent(taxSavingsPercent)} of HELOC interest
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Net HELOC Cost (After Tax Savings)</span>
            <span className="text-xl font-bold">{formatCurrency(netHelocCost)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Effective interest rate after tax deduction
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 mt-4">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Tax Benefit</p>
              <p className="text-muted-foreground">
                By deducting HELOC interest, you reduce your net borrowing cost by{" "}
                {formatCurrency(taxSavings)} annually.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

