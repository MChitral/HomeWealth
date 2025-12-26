import { useQuery } from "@tanstack/react-query";
import { RenewalCard } from "@/features/dashboard/components/renewal-card";
import { mortgageApi } from "@/features/mortgage-tracking/api";
import { EmptyWidgetState } from "@/features/dashboard/components/empty-widget-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calculator, TrendingUp, FileText, ArrowRight } from "lucide-react";
import { PenaltyCalculatorDialog } from "./penalty-calculator-dialog";
import { useState } from "react";
import { TermRenewalDialog } from "./term-renewal-dialog";
import { useTermRenewalForm } from "../hooks/use-term-renewal-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/hooks/use-toast";
import { RenewalHistorySection } from "./renewal-history-section";

interface RenewalTabProps {
  mortgageId: string;
  onTermRenewalDialogOpenChange?: (open: boolean) => void;
  currentTerm?: any;
}

export function RenewalTab({
  mortgageId,
  onTermRenewalDialogOpenChange,
  currentTerm,
}: RenewalTabProps) {
  const [penaltyCalculatorOpen, setPenaltyCalculatorOpen] = useState(false);
  const [termRenewalOpen, setTermRenewalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: renewalStatus, isLoading } = useQuery({
    queryKey: ["renewal", mortgageId],
    queryFn: () => mortgageApi.fetchRenewalStatus(mortgageId),
    enabled: !!mortgageId,
  });

  // Fetch market rate for comparison
  const { data: marketRate } = useQuery({
    queryKey: ["market-rate", currentTerm?.termType, currentTerm?.termYears],
    queryFn: () => {
      if (currentTerm?.termType && currentTerm?.termYears) {
        return mortgageApi.fetchMarketRate(currentTerm.termType, currentTerm.termYears);
      }
      return null;
    },
    enabled: !!currentTerm?.termType && !!currentTerm?.termYears,
  });

  const { data: primeRateData } = useQuery({
    queryKey: ["prime-rate"],
    queryFn: () => mortgageApi.fetchPrimeRate(),
  });

  const renewalForm = useTermRenewalForm({
    primeRateData,
    defaultStartDate: currentTerm?.endDate,
  });

  const createTermMutation = useMutation({
    mutationFn: (data: any) => mortgageApi.createTerm(mortgageId, data),
    onSuccess: async (newTerm) => {
      queryClient.invalidateQueries({ queryKey: ["mortgage", mortgageId] });
      queryClient.invalidateQueries({ queryKey: ["renewal", mortgageId] });
      queryClient.invalidateQueries({ queryKey: ["/api/mortgages", mortgageId, "terms"] });
      queryClient.invalidateQueries({ queryKey: ["renewal-history", mortgageId] });
      queryClient.invalidateQueries({ queryKey: ["renewal-analytics", mortgageId] });

      // Record renewal decision if we have the required data
      if (currentTerm && newTerm?.id && renewalStatus) {
        try {
          const formData = renewalForm.form.getValues();
          const previousRate = renewalStatus.currentRate;

          // Extract new rate from created term or form data
          let newRate = previousRate;
          if (newTerm.fixedRate) {
            newRate = parseFloat(newTerm.fixedRate) * 100;
          } else if (newTerm.primeRate && newTerm.lockedSpread) {
            newRate = (parseFloat(newTerm.primeRate) + parseFloat(newTerm.lockedSpread)) * 100;
          } else if (formData.fixedRate) {
            newRate = parseFloat(formData.fixedRate) * 100;
          } else if (formData.primeRate && formData.lockedSpread) {
            newRate = (parseFloat(formData.primeRate) + parseFloat(formData.lockedSpread)) * 100;
          }

          // Determine decision type (stayed vs switched)
          // For now, assume "stayed" - this could be enhanced to detect lender changes
          const decisionType: "stayed" | "switched" | "refinanced" = "stayed";

          await mortgageApi.recordRenewalDecision(mortgageId, {
            termId: newTerm.id,
            renewalDate:
              formData.startDate || newTerm.startDate || new Date().toISOString().split("T")[0],
            previousRate,
            newRate,
            decisionType,
            lenderName: undefined, // Could be enhanced to track lender
            estimatedSavings: undefined, // Could be calculated
            notes: undefined,
          });
        } catch (error) {
          // Don't fail the renewal if recording the decision fails
          console.error("Failed to record renewal decision:", error);
        }
      }

      toast({
        title: "Term Renewed",
        description: "Your new mortgage term has been created successfully.",
      });
      setTermRenewalOpen(false);
      renewalForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create new term",
        variant: "destructive",
      });
    },
  });

  const handleRenewalSubmit = () => {
    const formData = renewalForm.form.getValues();
    createTermMutation.mutate(formData);
  };

  if (isLoading) return <div>Loading analysis...</div>;

  if (!renewalStatus) {
    return (
      <div className="space-y-6">
        <EmptyWidgetState title="Renewal Analysis" description="Could not load renewal data." />
      </div>
    );
  }

  const currentRatePercent = renewalStatus.currentRate;
  const marketRatePercent = marketRate?.rate ? marketRate.rate * 100 : null;
  const rateDifference = marketRatePercent ? marketRatePercent - currentRatePercent : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <RenewalCard status={renewalStatus} />

        {/* Rate Comparison Card */}
        {marketRatePercent !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                Rate Comparison
              </CardTitle>
              <CardDescription>Compare your current rate with market rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Your Current Rate</span>
                  <span className="text-lg font-semibold">{currentRatePercent.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Market Rate</span>
                  <span className="text-lg font-semibold">{marketRatePercent.toFixed(2)}%</span>
                </div>
                {rateDifference !== null && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Difference</span>
                      <Badge
                        variant={rateDifference > 0 ? "destructive" : "default"}
                        className="text-sm"
                      >
                        {rateDifference > 0 ? "+" : ""}
                        {rateDifference.toFixed(2)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {rateDifference > 0
                        ? "Market rates are higher. Your current rate is favorable."
                        : "Market rates are lower. You may be able to secure a better rate."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-500" />
              Penalty Calculator
            </CardTitle>
            <CardDescription>Calculate exact penalty for breaking your mortgage</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPenaltyCalculatorOpen(true)}
            >
              Calculate Penalty
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              Renew Term
            </CardTitle>
            <CardDescription>Start a new term with updated rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" onClick={() => setTermRenewalOpen(true)}>
              Renew Term
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Blend & Extend
            </CardTitle>
            <CardDescription>Combine current and new rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Open term renewal dialog with blend-and-extend tab
                setTermRenewalOpen(true);
                // The dialog will handle showing the blend-and-extend tab
              }}
            >
              Explore Options
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Renewal Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Information</CardTitle>
          <CardDescription>Key details about your upcoming renewal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Renewal Date</p>
              <p className="font-semibold">
                {new Date(renewalStatus.renewalDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Days Remaining</p>
              <p className="font-semibold">{renewalStatus.daysUntilRenewal} days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
              <p className="font-semibold">{currentRatePercent.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estimated Penalty</p>
              <p className="font-semibold">
                $
                {renewalStatus.estimatedPenalty.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renewal History Section */}
      <RenewalHistorySection mortgageId={mortgageId} />

      <PenaltyCalculatorDialog
        open={penaltyCalculatorOpen}
        onOpenChange={setPenaltyCalculatorOpen}
        mortgageId={mortgageId}
        initialCurrentRate={currentRatePercent.toFixed(2)}
      />

      {currentTerm && (
        <TermRenewalDialog
          open={termRenewalOpen}
          onOpenChange={(open) => {
            setTermRenewalOpen(open);
            if (onTermRenewalDialogOpenChange) {
              onTermRenewalDialogOpenChange(open);
            }
          }}
          form={renewalForm.form}
          onSubmit={handleRenewalSubmit}
          isSubmitting={createTermMutation.isPending}
          isValid={renewalForm.isValid}
          currentTerm={currentTerm}
          primeRateData={primeRateData}
          onRefreshPrime={() => queryClient.invalidateQueries({ queryKey: ["prime-rate"] })}
          isPrimeRateLoading={false}
        />
      )}
    </div>
  );
}
