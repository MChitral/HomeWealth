import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

interface RiskAssessmentProps {
  leverageRatio: number;
  interestCoverage: number;
  helocBalance: number;
  investmentValue: number;
  investmentIncome: number;
  helocInterest: number;
}

export function RiskAssessment({
  leverageRatio,
  interestCoverage,
  helocBalance,
  investmentValue,
  investmentIncome,
  helocInterest,
}: RiskAssessmentProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getLeverageRiskLevel = (
    ratio: number
  ): { level: "low" | "moderate" | "high"; color: string } => {
    if (ratio < 1.0) return { level: "low", color: "text-green-600" };
    if (ratio <= 2.0) return { level: "moderate", color: "text-yellow-600" };
    return { level: "high", color: "text-red-600" };
  };

  const getCoverageRiskLevel = (
    coverage: number
  ): { level: "low" | "moderate" | "high"; color: string } => {
    if (coverage >= 1.5) return { level: "low", color: "text-green-600" };
    if (coverage >= 1.0) return { level: "moderate", color: "text-yellow-600" };
    return { level: "high", color: "text-red-600" };
  };

  const leverageRisk = getLeverageRiskLevel(leverageRatio);
  const coverageRisk = getCoverageRiskLevel(interestCoverage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Leverage Ratio</span>
              <Badge
                variant={
                  leverageRisk.level === "high"
                    ? "destructive"
                    : leverageRisk.level === "moderate"
                      ? "secondary"
                      : "default"
                }
              >
                {leverageRisk.level.toUpperCase()}
              </Badge>
            </div>
            <p className={`text-2xl font-bold ${leverageRisk.color}`}>
              {leverageRatio.toFixed(2)}x
            </p>
            <p className="text-xs text-muted-foreground mt-1">HELOC Balance / Investment Value</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Interest Coverage</span>
              <Badge
                variant={
                  coverageRisk.level === "high"
                    ? "destructive"
                    : coverageRisk.level === "moderate"
                      ? "secondary"
                      : "default"
                }
              >
                {coverageRisk.level.toUpperCase()}
              </Badge>
            </div>
            <p className={`text-2xl font-bold ${coverageRisk.color}`}>
              {interestCoverage.toFixed(2)}x
            </p>
            <p className="text-xs text-muted-foreground mt-1">Investment Income / HELOC Interest</p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">HELOC Balance</span>
            <span className="font-semibold">{formatCurrency(helocBalance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Investment Value</span>
            <span className="font-semibold">{formatCurrency(investmentValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Investment Income</span>
            <span className="font-semibold">{formatCurrency(investmentIncome)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">HELOC Interest</span>
            <span className="font-semibold">{formatCurrency(helocInterest)}</span>
          </div>
        </div>

        {(leverageRisk.level === "high" || coverageRisk.level === "high") && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>High Risk Warning:</strong>{" "}
              {leverageRisk.level === "high" &&
                "Leverage ratio exceeds 2.0x, indicating high risk. Market downturns could result in significant losses."}
              {coverageRisk.level === "high" &&
                " Interest coverage is below 1.0x, meaning investment income cannot cover HELOC interest payments."}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/50 rounded-lg p-3 mt-4">
          <p className="text-sm font-medium mb-2">Risk Indicators:</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Leverage Ratio &lt; 1.0: Lower risk | 1.0-2.0: Moderate | &gt; 2.0: High</li>
            <li>Interest Coverage &gt; 1.5: Strong | 1.0-1.5: Adequate | &lt; 1.0: Insufficient</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
