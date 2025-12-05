import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ComparisonCharts } from "./comparison-charts";
import { ComparisonTable } from "./comparison-table";
import type { ScenarioWithProjections, TimeHorizon, MetricName } from "../types";

interface ComparisonTabsProps {
  scenarios: ScenarioWithProjections[];
  chartData: {
    netWorth: any[];
    mortgage: any[];
    investment: any[];
  };
  timeHorizon: TimeHorizon;
  getMetricForHorizon: (metrics: any, metricName: MetricName) => number;
}

export function ComparisonTabs({
  scenarios,
  chartData,
  timeHorizon,
  getMetricForHorizon,
}: ComparisonTabsProps) {
  return (
    <Tabs defaultValue="charts" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="charts" data-testid="tab-charts">
          Charts
        </TabsTrigger>
        <TabsTrigger value="metrics" data-testid="tab-metrics">
          All Metrics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="charts" className="space-y-6">
        <ComparisonCharts scenarios={scenarios} chartData={chartData} />
      </TabsContent>

      <TabsContent value="metrics" className="space-y-6">
        <ComparisonTable
          scenarios={scenarios}
          timeHorizon={timeHorizon}
          getMetricForHorizon={getMetricForHorizon}
        />
      </TabsContent>
    </Tabs>
  );
}

