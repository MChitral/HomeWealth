import { useHelocAccounts } from "../hooks";
import { useMortgageData } from "@/features/mortgage-tracking/hooks/use-mortgage-data";
import { EquityStackChart } from "./equity-stack-chart";
import { CreditLimitProjectionWidget } from "./credit-limit-projection-widget";
import { InterestCostAnalysisWidget } from "./interest-cost-analysis-widget";
import { StrategicInsightsPanel } from "./strategic-insights-panel";
import { calculateAvailableCredit } from "@/shared/utils/heloc";
import { Loader2, LayoutDashboard, LineChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { mortgageApi } from "@/features/mortgage-tracking/api";

export function EquityStrategyDashboard() {
  const { data: helocAccounts, isLoading: helocLoading } = useHelocAccounts();
  const { mortgages, isLoading: mortgageLoading } = useMortgageData();

  // Fetch current prime rate for interest calculations
  const { data: primeRateData } = useQuery({
    queryKey: ["prime-rate"],
    queryFn: () => mortgageApi.fetchPrimeRate(),
  });

  if (helocLoading || mortgageLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center border rounded-lg bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Aggregate Data Logic
  const primaryMortgage = mortgages?.[0];

  if (!primaryMortgage) {
    // Fallback if no mortgage exists but HELOCs do
    return null;
  }

  const propertyValue = Number(primaryMortgage.propertyPrice);
  const mortgageBalance = Number(primaryMortgage.currentBalance);

  // Find HELOCs linked to this mortgage
  const linkedHelocs = helocAccounts?.filter((h) => h.mortgageId === primaryMortgage.id) || [];

  // Sum HELOC balances
  const helocBalance = linkedHelocs.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);

  // Sum limits
  const totalLimit = linkedHelocs.reduce((sum, acc) => sum + Number(acc.creditLimit), 0);

  // Calculate weighted average interest rate: Prime + Spread
  // HELOC accounts have interestSpread (Prime + X%), not a direct interestRate
  const currentPrimeRate = primeRateData?.primeRate || 7.2; // Fallback to 7.2 if not loaded

  const weightedInterestRate =
    helocBalance > 0
      ? linkedHelocs.reduce((sum, acc) => {
          const spread = Number(acc.interestSpread);
          const accountRate = currentPrimeRate + spread;
          return sum + accountRate * Number(acc.currentBalance);
        }, 0) / helocBalance
      : linkedHelocs[0]
        ? currentPrimeRate + Number(linkedHelocs[0].interestSpread)
        : 0;

  // Calculate Global Available
  const availableHeloc = linkedHelocs.reduce(
    (sum, acc) =>
      sum + calculateAvailableCredit(Number(acc.creditLimit), Number(acc.currentBalance)),
    0
  );

  // Max LTV
  const maxLtvPercent = linkedHelocs.reduce(
    (max, acc) => Math.max(max, Number(acc.maxLtvPercent)),
    65
  );

  const utilization = totalLimit > 0 ? (helocBalance / totalLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="strategy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Strategy & Projections
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Analysis & Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy" className="space-y-6 mt-4">
          <EquityStackChart
            propertyValue={propertyValue}
            mortgageBalance={mortgageBalance}
            helocBalance={helocBalance}
            availableHeloc={availableHeloc}
            maxLtvPercent={maxLtvPercent}
          />

          {primaryMortgage && linkedHelocs.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Future Limit Projections</h3>
              <CreditLimitProjectionWidget
                mortgageId={primaryMortgage.id}
                currentHelocLimit={totalLimit}
                currentHelocBalance={helocBalance}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="analysis"
          className="space-y-6 mt-4 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Cost of Borrowing</h3>
              <InterestCostAnalysisWidget
                currentBalance={helocBalance}
                interestRate={weightedInterestRate}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Strategic Review</h3>
              <StrategicInsightsPanel
                utilization={utilization}
                availableCredit={availableHeloc}
                isLinked={linkedHelocs.length > 0}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
