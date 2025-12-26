import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { formatCurrency } from "@/shared/lib/utils";
import { TrendingUp, Home, Banknote } from "lucide-react";
import { Progress } from "@/shared/ui/progress";

interface WealthHeroProps {
  netWorth: number;
  homeValue: number;
  mortgageBalance: number;
}

export function WealthHero({ netWorth, homeValue, mortgageBalance }: WealthHeroProps) {
  const ownershipPercentage = homeValue > 0 ? (netWorth / homeValue) * 100 : 0;

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Your Net Position
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <div className="text-4xl font-bold tracking-tight text-primary">
              {formatCurrency(netWorth)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Current Net Equity</p>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Asset Value</p>
                <p className="font-semibold">{formatCurrency(homeValue)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Banknote className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Liability</p>
                <p className="font-semibold">{formatCurrency(mortgageBalance)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Ownership Progress</span>
            <span>{ownershipPercentage.toFixed(1)}% Owned</span>
          </div>
          <Progress value={ownershipPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
