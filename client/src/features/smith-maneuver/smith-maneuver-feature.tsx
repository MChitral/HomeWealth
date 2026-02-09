import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Loader2, Plus, TrendingUp, RefreshCw } from "lucide-react";
import {
  DisclaimerBanner,
  StrategyForm,
  ProjectionCharts,
  TaxSavingsCard,
  NetBenefitAnalysis,
  RiskAssessment,
  ROIAnalysisCard,
  PrepaymentComparisonCard,
} from "./components";
import { StrategySelector } from "./components/strategy-selector";
import {
  useSmithManeuverStrategies,
  useSmithManeuverStrategy,
  useGenerateProjections,
} from "./hooks";
import { useHelocAccounts } from "@/features/heloc/hooks";
import { useMortgageSelection } from "@/features/mortgage-tracking";
import type { SmithManeuverStrategy } from "@shared/schema";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { Badge } from "@/shared/ui/badge";

export function SmithManeuverFeature() {
  usePageTitle("Smith Maneuver | Mortgage Strategy");

  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<SmithManeuverStrategy | null>(null);

  const lastGeneratedKeyRef = useRef<string>("");
  const pendingGenerationRef = useRef<{ id: string; years: number } | null>(null);

  const { data: strategies } = useSmithManeuverStrategies();
  const { data: strategy } = useSmithManeuverStrategy(selectedStrategyId);
  const generateProjections = useGenerateProjections();
  const { data: helocAccounts = [] } = useHelocAccounts();
  const { mortgages = [] } = useMortgageSelection();

  const triggerProjections = (strategyId: string, years: number) => {
    const key = `${strategyId}-${years}`;
    if (generateProjections.isPending) {
      pendingGenerationRef.current = { id: strategyId, years };
      return;
    }
    lastGeneratedKeyRef.current = key;
    pendingGenerationRef.current = null;
    generateProjections.mutate({ strategyId, years });
  };

  useEffect(() => {
    if (strategies && strategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strategies[0].id);
    }
  }, [strategies, selectedStrategyId]);

  useEffect(() => {
    if (!selectedStrategyId || !strategy) return;
    const key = `${selectedStrategyId}-${strategy.projectionYears || 30}`;
    if (key !== lastGeneratedKeyRef.current) {
      triggerProjections(selectedStrategyId, strategy.projectionYears || 30);
    }
  }, [selectedStrategyId, strategy?.id, strategy?.projectionYears, strategy?.expectedReturnRate, strategy?.prepaymentAmount, strategy?.borrowingPercentage, strategy?.marginalTaxRate]);

  useEffect(() => {
    if (!generateProjections.isPending && pendingGenerationRef.current) {
      const { id, years } = pendingGenerationRef.current;
      pendingGenerationRef.current = null;
      const key = `${id}-${years}`;
      if (key !== lastGeneratedKeyRef.current) {
        lastGeneratedKeyRef.current = key;
        generateProjections.mutate({ strategyId: id, years });
      }
    }
  }, [generateProjections.isPending]);

  const handleSelectStrategy = (selected: SmithManeuverStrategy) => {
    if (selected.id === selectedStrategyId) return;
    lastGeneratedKeyRef.current = "";
    setSelectedStrategyId(selected.id);
  };

  const handleCreateStrategy = () => {
    setEditingStrategy(null);
    setIsFormOpen(true);
  };

  const handleEditStrategy = (strategyToEdit: SmithManeuverStrategy) => {
    setEditingStrategy(strategyToEdit);
    setIsFormOpen(true);
  };

  const handleStrategyCreated = (newStrategy: SmithManeuverStrategy) => {
    lastGeneratedKeyRef.current = "";
    setSelectedStrategyId(newStrategy.id);
    setIsFormOpen(false);
  };

  const handleStrategyUpdated = () => {
    lastGeneratedKeyRef.current = "";
    setIsFormOpen(false);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
  };

  const handleRegenerate = () => {
    if (!selectedStrategyId || !strategy) return;
    lastGeneratedKeyRef.current = "";
    triggerProjections(selectedStrategyId, strategy.projectionYears || 30);
  };

  const hasStrategies = strategies && strategies.length > 0;
  const projections = generateProjections.data;
  const hasProjections = projections && projections.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smith Maneuver</h1>
          <p className="text-muted-foreground mt-1">
            Convert non-deductible mortgage interest into tax-deductible investment interest
          </p>
        </div>
        {!hasStrategies && (
          <Button
            onClick={handleCreateStrategy}
            data-testid="button-create-first-strategy"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Strategy
          </Button>
        )}
      </div>

      <DisclaimerBanner />

      {!hasStrategies ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-empty-state">
              Model Your First Strategy
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              The Smith Maneuver lets you borrow against your home equity to invest, making
              your mortgage interest tax-deductible. Create a strategy to see projected
              tax savings, investment growth, and net benefit analysis.
            </p>
            <Button
              onClick={handleCreateStrategy}
              data-testid="button-create-strategy-empty"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Strategy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <StrategySelector
            selectedStrategyId={selectedStrategyId}
            onSelectStrategy={handleSelectStrategy}
            onCreateStrategy={handleCreateStrategy}
            onEditStrategy={handleEditStrategy}
          />

          {selectedStrategyId && strategy && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-semibold" data-testid="text-strategy-name">
                    {strategy.strategyName}
                  </h2>
                  <Badge variant="outline" className="text-xs">
                    {strategy.projectionYears} year projection
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={generateProjections.isPending}
                  data-testid="button-regenerate"
                >
                  {generateProjections.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {generateProjections.isPending ? "Generating..." : "Refresh"}
                </Button>
              </div>

              {generateProjections.isPending && !hasProjections && (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground">
                        Generating projections for your strategy...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {hasProjections && (
                <>
                  <StrategyOverviewStrip strategy={strategy} projections={projections} />

                  <ProjectionCharts projections={projections} />

                  <div className="grid gap-4 md:grid-cols-2">
                    {(() => {
                      const latest = projections[projections.length - 1];
                      const helocInterest = Number(latest.helocInterestPaid);
                      const taxSavings = Number(latest.taxSavings);
                      const marginalTaxRate = strategy.marginalTaxRate
                        ? Number(strategy.marginalTaxRate)
                        : 0;

                      return (
                        <>
                          <TaxSavingsCard
                            helocInterest={helocInterest}
                            taxSavings={taxSavings}
                            marginalTaxRate={marginalTaxRate}
                            eligibleInterest={helocInterest}
                          />
                          <NetBenefitAnalysis
                            investmentReturns={Number(latest.investmentReturns)}
                            investmentTax={0}
                            helocInterest={helocInterest}
                            taxSavings={taxSavings}
                            netBenefit={Number(latest.netBenefit)}
                          />
                        </>
                      );
                    })()}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <ROIAnalysisCard
                      strategyId={selectedStrategyId}
                      years={strategy.projectionYears || 10}
                    />
                    <PrepaymentComparisonCard
                      strategyId={selectedStrategyId}
                      years={strategy.projectionYears || 10}
                    />
                  </div>

                  <RiskAssessment
                    leverageRatio={Number(projections[projections.length - 1].leverageRatio)}
                    interestCoverage={Number(projections[projections.length - 1].interestCoverage)}
                    helocBalance={Number(projections[projections.length - 1].helocBalance)}
                    investmentValue={Number(projections[projections.length - 1].investmentValue)}
                    investmentIncome={Number(projections[projections.length - 1].investmentReturns)}
                    helocInterest={Number(projections[projections.length - 1].helocInterestPaid)}
                  />
                </>
              )}

              {generateProjections.isError && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-destructive mb-3">
                      Failed to generate projections. Please try again.
                    </p>
                    <Button variant="outline" onClick={handleRegenerate}>
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      <StrategyForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        strategy={editingStrategy}
        mortgages={mortgages}
        helocAccounts={helocAccounts}
        onCreated={handleStrategyCreated}
        onUpdated={handleStrategyUpdated}
      />
    </div>
  );
}

interface StrategyOverviewStripProps {
  strategy: SmithManeuverStrategy;
  projections: Array<{
    netBenefit: number;
    taxSavings: number;
    investmentValue: number;
    helocBalance: number;
  }>;
}

function StrategyOverviewStrip({ strategy, projections }: StrategyOverviewStripProps) {
  const latest = projections[projections.length - 1];
  const cumulativeNetBenefit = projections.reduce(
    (sum, p) => sum + Number(p.netBenefit),
    0
  );
  const cumulativeTaxSavings = projections.reduce(
    (sum, p) => sum + Number(p.taxSavings),
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = [
    {
      label: "Cumulative Net Benefit",
      value: formatCurrency(cumulativeNetBenefit),
      positive: cumulativeNetBenefit >= 0,
      testId: "text-cumulative-benefit",
    },
    {
      label: "Total Tax Savings",
      value: formatCurrency(cumulativeTaxSavings),
      positive: true,
      testId: "text-total-tax-savings",
    },
    {
      label: "Investment Value",
      value: formatCurrency(Number(latest.investmentValue)),
      positive: true,
      testId: "text-investment-value",
    },
    {
      label: "HELOC Balance",
      value: formatCurrency(Number(latest.helocBalance)),
      positive: false,
      testId: "text-heloc-balance",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="strategy-overview-strip">
      {metrics.map((metric) => (
        <Card key={metric.testId}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
            <p
              className={`text-xl font-bold ${
                metric.positive ? "text-green-600 dark:text-green-400" : "text-primary"
              }`}
              data-testid={metric.testId}
            >
              {metric.value}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              After {strategy.projectionYears} years
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
