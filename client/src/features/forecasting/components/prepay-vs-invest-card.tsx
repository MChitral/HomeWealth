import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { NetWorthChart } from "@/widgets/charts/net-worth-chart";

interface PrepayVsInvestCardProps {
  investmentChartData: Array<{ year: number; netWorth: number }>;
}

export function PrepayVsInvestCard({ investmentChartData }: PrepayVsInvestCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Prepay vs. Invest</CardTitle>
        <CardDescription>Projected value from investing surplus instead of prepaying</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {investmentChartData.length > 0 ? (
            <NetWorthChart data={investmentChartData} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md" data-testid="text-no-invest-data">
              No comparison data available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
