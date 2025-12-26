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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { mortgageApi, type RefinanceAnalysisResponse, type RefinanceAnalysisRequest } from "../api";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Calculator, DollarSign } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { RefinanceScenarioCard } from "@/features/dashboard/components/refinance-card";

interface RefinanceAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgageId: string;
}

export function RefinanceAnalysisDialog({
  open,
  onOpenChange,
  mortgageId,
}: RefinanceAnalysisDialogProps) {
  const [totalClosingCosts, setTotalClosingCosts] = useState("");
  const [legalFees, setLegalFees] = useState("");
  const [appraisalFees, setAppraisalFees] = useState("");
  const [dischargeFees, setDischargeFees] = useState("");
  const [otherFees, setOtherFees] = useState("");
  const [analysis, setAnalysis] = useState<RefinanceAnalysisResponse | null>(null);
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: async (closingCosts?: RefinanceAnalysisRequest) => {
      return mortgageApi.fetchRefinanceAnalysis(mortgageId, closingCosts);
    },
    onSuccess: (data) => {
      setAnalysis(data);
      if (!data) {
        toast({
          title: "Analysis Unavailable",
          description: "Could not perform refinance analysis. Please check your mortgage configuration.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Failed to calculate refinance analysis:", error);
      toast({
        title: "Error",
        description: "Failed to calculate refinance analysis. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    const closingCosts: RefinanceAnalysisRequest = {};

    if (totalClosingCosts) {
      closingCosts.closingCosts = { total: parseFloat(totalClosingCosts) };
    } else {
      // Build breakdown if total not provided
      const breakdown: any = {};
      if (legalFees) breakdown.legalFees = parseFloat(legalFees);
      if (appraisalFees) breakdown.appraisalFees = parseFloat(appraisalFees);
      if (dischargeFees) breakdown.dischargeFees = parseFloat(dischargeFees);
      if (otherFees) breakdown.otherFees = parseFloat(otherFees);

      if (Object.keys(breakdown).length > 0) {
        closingCosts.closingCosts = breakdown;
      }
    }

    calculateMutation.mutate(Object.keys(closingCosts).length > 0 ? closingCosts : undefined);
  };

  const handleReset = () => {
    setTotalClosingCosts("");
    setLegalFees("");
    setAppraisalFees("");
    setDischargeFees("");
    setOtherFees("");
    setAnalysis(null);
  };

  const calculateBreakdownTotal = () => {
    return (
      (legalFees ? parseFloat(legalFees) : 0) +
      (appraisalFees ? parseFloat(appraisalFees) : 0) +
      (dischargeFees ? parseFloat(dischargeFees) : 0) +
      (otherFees ? parseFloat(otherFees) : 0)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Refinance Analysis
          </DialogTitle>
          <DialogDescription>
            Analyze the financial impact of refinancing your mortgage, including closing costs.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="costs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="costs">Closing Costs</TabsTrigger>
            <TabsTrigger value="results">Analysis Results</TabsTrigger>
          </TabsList>

          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enter Closing Costs</CardTitle>
                <CardDescription>
                  Enter either a total amount or provide a breakdown of individual fees. Leave blank
                  to use default estimate ($1,500).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="total-closing-costs">Total Closing Costs (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="total-closing-costs"
                      type="number"
                      step="0.01"
                      min="0"
                      value={totalClosingCosts}
                      onChange={(e) => setTotalClosingCosts(e.target.value)}
                      placeholder="1500.00"
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Or provide a breakdown below. If total is provided, breakdown will be ignored.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="legal-fees">Legal Fees</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="legal-fees"
                        type="number"
                        step="0.01"
                        min="0"
                        value={legalFees}
                        onChange={(e) => setLegalFees(e.target.value)}
                        placeholder="0.00"
                        className="pl-7"
                        disabled={!!totalClosingCosts}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appraisal-fees">Appraisal Fees</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="appraisal-fees"
                        type="number"
                        step="0.01"
                        min="0"
                        value={appraisalFees}
                        onChange={(e) => setAppraisalFees(e.target.value)}
                        placeholder="0.00"
                        className="pl-7"
                        disabled={!!totalClosingCosts}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discharge-fees">Discharge Fees</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="discharge-fees"
                        type="number"
                        step="0.01"
                        min="0"
                        value={dischargeFees}
                        onChange={(e) => setDischargeFees(e.target.value)}
                        placeholder="0.00"
                        className="pl-7"
                        disabled={!!totalClosingCosts}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="other-fees">Other Fees</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="other-fees"
                        type="number"
                        step="0.01"
                        min="0"
                        value={otherFees}
                        onChange={(e) => setOtherFees(e.target.value)}
                        placeholder="0.00"
                        className="pl-7"
                        disabled={!!totalClosingCosts}
                      />
                    </div>
                  </div>

                  {!totalClosingCosts && (legalFees || appraisalFees || dischargeFees || otherFees) && (
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Breakdown Total:</span>
                        <span className="text-lg font-bold">
                          ${calculateBreakdownTotal().toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCalculate}
                    disabled={calculateMutation.isPending}
                    className="flex-1"
                  >
                    {calculateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-4 w-4" />
                        Calculate Analysis
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {analysis ? (
              <div className="space-y-4">
                <RefinanceScenarioCard analysis={analysis} />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Cost Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Penalty:</span>
                      <span className="font-semibold">
                        ${analysis.penalty.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Closing Costs:</span>
                      <span className="font-semibold">
                        ${analysis.closingCosts.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span>Total Cost to Break:</span>
                      <span className="text-red-600">
                        ${(analysis.penalty + analysis.closingCosts).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No analysis available. Please calculate with closing costs first.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

