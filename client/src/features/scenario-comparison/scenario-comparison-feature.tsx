import { Skeleton } from "@/shared/ui/skeleton";
import { PageHeader } from "@/shared/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { useScenarioComparison } from "./hooks";
import { 
  ScenarioSelector, 
  WinnerCard, 
  ComparisonMetrics, 
  ComparisonCharts, 
  ComparisonTable,
  EmptyState 
} from "./components";

export function ScenarioComparisonFeature() {
  const comparison = useScenarioComparison();

  usePageTitle("Scenario Comparison | Mortgage Strategy");

  // Loading state
  if (comparison.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no scenarios selected
  if (comparison.selectedScenarios.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Scenario Comparison"
          description="Compare different financial strategies side-by-side"
        />
        <EmptyState 
          allScenarios={comparison.allScenarios}
          toggleScenario={comparison.toggleScenario}
        />
      </div>
    );
  }

  // Horizon selector component
  const horizonSelector = (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">Time Horizon</label>
      <Select value={comparison.timeHorizon} onValueChange={(value) => comparison.setTimeHorizon(value as "10" | "20" | "30")}>
        <SelectTrigger className="w-32" data-testid="select-horizon">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 Years</SelectItem>
          <SelectItem value="20">20 Years</SelectItem>
          <SelectItem value="30">30 Years</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Main comparison view
  return (
    <div className="space-y-6">
      <PageHeader
        title="Scenario Comparison"
        description="Compare different financial strategies side-by-side"
        actions={<div className="flex items-center gap-3">{horizonSelector}</div>}
      />

      <ScenarioSelector 
        allScenarios={comparison.allScenarios}
        selectedScenarios={comparison.selectedScenarios}
        toggleScenario={comparison.toggleScenario}
      />

      {comparison.winner && comparison.selectedScenarioData.length > 1 && (
        <WinnerCard 
          winner={comparison.winner}
          timeHorizon={comparison.timeHorizon}
          getMetricForHorizon={comparison.getMetricForHorizon}
        />
      )}

      <ComparisonMetrics 
        scenarios={comparison.selectedScenarioData}
        winner={comparison.winner}
        timeHorizon={comparison.timeHorizon}
        getMetricForHorizon={comparison.getMetricForHorizon}
      />

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
          <TabsTrigger value="metrics" data-testid="tab-metrics">All Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <ComparisonCharts 
            scenarios={comparison.selectedScenarioData}
            chartData={comparison.chartData}
          />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <ComparisonTable 
            scenarios={comparison.selectedScenarioData}
            timeHorizon={comparison.timeHorizon}
            getMetricForHorizon={comparison.getMetricForHorizon}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
