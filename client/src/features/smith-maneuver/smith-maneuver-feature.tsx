import { useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  DisclaimerBanner,
  StrategyDashboard,
  StrategyForm,
  ProjectionCharts,
  TaxSavingsCard,
  NetBenefitAnalysis,
  RiskAssessment,
} from "./components";
import {
  useSmithManeuverStrategies,
  useSmithManeuverStrategy,
  useGenerateProjections,
} from "./hooks";
import { useHelocAccounts } from "@/features/heloc";
import { useMortgageSelection } from "@/features/mortgage-tracking";
import type { SmithManeuverStrategy } from "@shared/schema";

export function SmithManeuverFeature() {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<SmithManeuverStrategy | null>(null);

  const { data: strategies } = useSmithManeuverStrategies();
  const { data: strategy } = useSmithManeuverStrategy(selectedStrategyId);
  const generateProjections = useGenerateProjections();
  const { data: helocAccounts = [] } = useHelocAccounts();
  const { mortgages = [] } = useMortgageSelection();

  const handleSelectStrategy = (selectedStrategy: SmithManeuverStrategy) => {
    setSelectedStrategyId(selectedStrategy.id);
  };

  const handleCreateStrategy = () => {
    setEditingStrategy(null);
    setIsFormOpen(true);
  };

  const handleEditStrategy = (strategyToEdit: SmithManeuverStrategy) => {
    setEditingStrategy(strategyToEdit);
    setIsFormOpen(true);
  };

  const handleGenerateProjections = async () => {
    if (!selectedStrategyId) return;
    try {
      await generateProjections.mutateAsync({
        strategyId: selectedStrategyId,
        years: strategy?.projectionYears || 30,
      });
    } catch (error) {
      console.error("Failed to generate projections:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smith Maneuver</h1>
        <p className="text-muted-foreground mt-1">
          Model tax-optimized mortgage strategies using the Smith Maneuver
        </p>
      </div>

      <DisclaimerBanner />

      <Tabs defaultValue="strategies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          {selectedStrategyId && <TabsTrigger value="analysis">Analysis</TabsTrigger>}
        </TabsList>

        <TabsContent value="strategies" className="space-y-4">
          <StrategyDashboard
            onSelectStrategy={handleSelectStrategy}
            onCreateStrategy={handleCreateStrategy}
          />
        </TabsContent>

        {selectedStrategyId && strategy && (
          <TabsContent value="analysis" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{strategy.strategyName}</h2>
                <p className="text-muted-foreground">
                  Created {new Date(strategy.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEditStrategy(strategy)}>
                  Edit Strategy
                </Button>
                <Button
                  onClick={handleGenerateProjections}
                  disabled={generateProjections.isPending}
                >
                  {generateProjections.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Projections"
                  )}
                </Button>
              </div>
            </div>

            {generateProjections.data && generateProjections.data.length > 0 && (
              <>
                <ProjectionCharts projections={generateProjections.data} />

                {generateProjections.data.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {(() => {
                      const latest = generateProjections.data[generateProjections.data.length - 1];
                      const helocInterest = Number(latest.helocInterestPaid);
                      const taxSavings = Number(latest.taxSavings);
                      const marginalTaxRate = strategy.marginalTaxRate
                        ? Number(strategy.marginalTaxRate)
                        : 0;
                      const eligibleInterest = helocInterest; // Assuming 100% investment use

                      return (
                        <>
                          <TaxSavingsCard
                            helocInterest={helocInterest}
                            taxSavings={taxSavings}
                            marginalTaxRate={marginalTaxRate}
                            eligibleInterest={eligibleInterest}
                          />
                          <NetBenefitAnalysis
                            investmentReturns={Number(latest.investmentReturns)}
                            investmentTax={0} // Would need to calculate this
                            helocInterest={helocInterest}
                            taxSavings={taxSavings}
                            netBenefit={Number(latest.netBenefit)}
                          />
                        </>
                      );
                    })()}
                  </div>
                )}

                {generateProjections.data.length > 0 && (
                  <RiskAssessment
                    leverageRatio={Number(
                      generateProjections.data[generateProjections.data.length - 1].leverageRatio
                    )}
                    interestCoverage={Number(
                      generateProjections.data[generateProjections.data.length - 1].interestCoverage
                    )}
                    helocBalance={Number(
                      generateProjections.data[generateProjections.data.length - 1].helocBalance
                    )}
                    investmentValue={Number(
                      generateProjections.data[generateProjections.data.length - 1].investmentValue
                    )}
                    investmentIncome={Number(
                      generateProjections.data[generateProjections.data.length - 1].investmentReturns
                    )}
                    helocInterest={Number(
                      generateProjections.data[generateProjections.data.length - 1].helocInterestPaid
                    )}
                  />
                )}
              </>
            )}

            {generateProjections.data && generateProjections.data.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Click "Generate Projections" to see analysis and charts
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      <StrategyForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        strategy={editingStrategy}
        mortgages={mortgages}
        helocAccounts={helocAccounts}
      />
    </div>
  );
}

