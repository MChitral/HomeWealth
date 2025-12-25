import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface NetBenefitAnalysisProps {
  investmentReturns: number;
  investmentTax: number;
  helocInterest: number;
  taxSavings: number;
  netBenefit: number;
}

export function NetBenefitAnalysis({
  investmentReturns,
  investmentTax,
  helocInterest,
  taxSavings,
  netBenefit,
}: NetBenefitAnalysisProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const afterTaxInvestmentReturns = investmentReturns - investmentTax;
  const netHelocCost = helocInterest - taxSavings;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Net Benefit Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Investment Returns (After Tax)</span>
            </div>
            <span className="font-bold text-green-600">{formatCurrency(afterTaxInvestmentReturns)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Net HELOC Cost (After Tax Savings)</span>
            </div>
            <span className="font-bold text-red-600">{formatCurrency(netHelocCost)}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">Net Benefit</span>
            <span
              className={`text-2xl font-bold ${
                netBenefit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(netBenefit)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {netBenefit >= 0
              ? "Strategy is generating positive returns"
              : "Strategy costs exceed returns (consider adjusting parameters)"}
          </div>
        </div>

        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Gross Investment Returns</span>
            <span>{formatCurrency(investmentReturns)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Investment Tax</span>
            <span>-{formatCurrency(investmentTax)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">HELOC Interest</span>
            <span>-{formatCurrency(helocInterest)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tax Savings</span>
            <span className="text-green-600">+{formatCurrency(taxSavings)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

