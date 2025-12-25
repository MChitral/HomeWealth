import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CheckCircle2 } from "lucide-react";
import type { BlendAndExtendResponse } from "../api";
import type { TermRenewalFormData } from "../hooks/use-term-renewal-form";

interface BlendAndExtendComparisonProps {
  blendAndExtendResults: BlendAndExtendResponse;
  newTermData?: TermRenewalFormData;
  onSelectBlendAndExtend: () => void;
  onSelectNewTerm: () => void;
  onApplyBlendAndExtend?: () => void;
  selectedOption?: "blend-extend" | "new-term";
}

export function BlendAndExtendComparison({
  blendAndExtendResults,
  newTermData,
  onSelectBlendAndExtend,
  onSelectNewTerm,
  onApplyBlendAndExtend,
  selectedOption,
}: BlendAndExtendComparisonProps) {
  const newTermPayment = newTermData?.paymentAmount
    ? parseFloat(newTermData.paymentAmount)
    : null;

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {/* New Term Option */}
      <Card className={selectedOption === "new-term" ? "border-2 border-indigo-500" : ""}>
        <CardHeader>
          <CardTitle className="text-base">New Term Renewal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {newTermPayment && (
            <div>
              <div className="text-sm text-muted-foreground">Payment Amount</div>
              <div className="text-2xl font-bold">
                ${newTermPayment.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          )}
          <Button
            variant={selectedOption === "new-term" ? "default" : "outline"}
            className="w-full"
            onClick={onSelectNewTerm}
          >
            {selectedOption === "new-term" && <CheckCircle2 className="mr-2 h-4 w-4" />}
            Select New Term
          </Button>
        </CardContent>
      </Card>

      {/* Blend-and-Extend Option */}
      <Card className={selectedOption === "blend-extend" ? "border-2 border-green-500" : ""}>
        <CardHeader>
          <CardTitle className="text-base">Blend-and-Extend</CardTitle>
          <Badge variant="secondary" className="mt-2">
            {blendAndExtendResults.blendedRatePercent}% blended rate
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm text-muted-foreground">Payment Amount</div>
            <div className="text-2xl font-bold text-green-600">
              ${blendAndExtendResults.newPaymentAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          {blendAndExtendResults.interestSavingsPerPayment > 0 && (
            <div className="text-xs text-green-600">
              Save ${blendAndExtendResults.interestSavingsPerPayment.toFixed(2)} per payment
            </div>
          )}
          <div className="space-y-2">
            <Button
              variant={selectedOption === "blend-extend" ? "default" : "outline"}
              className="w-full"
              onClick={onSelectBlendAndExtend}
            >
              {selectedOption === "blend-extend" && <CheckCircle2 className="mr-2 h-4 w-4" />}
              Select Blend-and-Extend
            </Button>
            {onApplyBlendAndExtend && (
              <Button
                variant="secondary"
                className="w-full"
                size="sm"
                onClick={onApplyBlendAndExtend}
              >
                Apply to New Term Form
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

