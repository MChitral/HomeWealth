import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { NetWorthChart } from "@/widgets/charts/net-worth-chart";

interface InvestmentGrowthCardProps {
  investmentChartData: Array<{ year: number; netWorth: number }>;
}

export function InvestmentGrowthCard({ investmentChartData }: InvestmentGrowthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Investment Growth</CardTitle>
        <CardDescription>Total portfolio value projection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {investmentChartData.length > 0 ? (
            <NetWorthChart data={investmentChartData} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
              No investment data available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
