import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { TrendingUp, CreditCard, Loader2 } from "lucide-react";
import { helocApi } from "@/features/heloc/api";
import type { Mortgage, HelocAccount } from "@shared/schema";

interface AccountImpactDisplayProps {
  account: HelocAccount;
  mortgage: Mortgage;
  currentMortgageBalance: number;
  projectedMortgageBalance: number;
  formatCurrency: (amount: number) => string;
}

function AccountImpactDisplay({
  account,
  mortgage,
  currentMortgageBalance,
  projectedMortgageBalance,
  formatCurrency,
}: AccountImpactDisplayProps) {
  const homeValue = Number(account.homeValueReference || mortgage.propertyPrice);
  const maxLTV = Number(account.maxLtvPercent);
  const helocBalance = Number(account.currentBalance);

  // Use API to calculate credit limit impact
  const { data: impact, isLoading: isCalculating } = useQuery({
    queryKey: [
      "heloc-credit-limit-impact",
      account.id,
      homeValue,
      maxLTV,
      currentMortgageBalance,
      projectedMortgageBalance,
      helocBalance,
    ],
    queryFn: () =>
      helocApi.calculateCreditLimitImpact({
        homeValue,
        maxLTV,
        currentMortgageBalance,
        projectedMortgageBalance,
        helocBalance,
      }),
  });

  if (isCalculating) {
    return (
      <div className="p-3 bg-white rounded-lg border">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Calculating impact...
        </div>
      </div>
    );
  }

  if (!impact) return null;

  const {
    currentCreditLimit,
    projectedCreditLimit,
    creditRoomIncrease,
    currentAvailableCredit,
    projectedAvailableCredit,
    availableCreditIncrease,
  } = impact;

  return (
    <div className="space-y-3 p-3 bg-white rounded-lg border">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {account.accountName}
          </div>
          <p className="text-xs text-muted-foreground">{account.lenderName}</p>
        </div>
        {account.isReAdvanceable === 1 && (
          <Badge variant="outline" className="text-xs">
            Re-advanceable
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">Current Credit Limit</div>
          <div className="font-semibold">{formatCurrency(currentCreditLimit)}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Projected Credit Limit</div>
          <div className="font-semibold text-green-600">{formatCurrency(projectedCreditLimit)}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Credit Room Increase</div>
          <div className="font-semibold text-green-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {formatCurrency(creditRoomIncrease)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Available Credit After</div>
          <div className="font-semibold text-green-600">
            {formatCurrency(projectedAvailableCredit)}
          </div>
        </div>
      </div>

      {availableCreditIncrease > 0 && (
        <div className="pt-2 border-t">
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            +{formatCurrency(availableCreditIncrease)} available credit
          </Badge>
        </div>
      )}
    </div>
  );
}

interface HelocCreditLimitImpactProps {
  mortgage: Mortgage;
  prepaymentAmount: number;
}

export function HelocCreditLimitImpact({
  mortgage,
  prepaymentAmount,
}: HelocCreditLimitImpactProps) {
  const { data: allAccounts, isLoading } = useQuery({
    queryKey: ["/api/heloc/accounts"],
    queryFn: () => helocApi.fetchAccounts(),
  });

  // Filter accounts linked to this mortgage
  const linkedAccounts = allAccounts?.filter((account) => account.mortgageId === mortgage.id) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading HELOC information...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (linkedAccounts.length === 0 || prepaymentAmount <= 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const currentMortgageBalance = Number(mortgage.currentBalance);
  const projectedMortgageBalance = Math.max(0, currentMortgageBalance - prepaymentAmount);

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-green-600" />
          HELOC Credit Limit Impact
        </CardTitle>
        <CardDescription>How this prepayment affects your HELOC credit limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkedAccounts.map((account) => (
          <AccountImpactDisplay
            key={account.id}
            account={account}
            mortgage={mortgage}
            currentMortgageBalance={currentMortgageBalance}
            projectedMortgageBalance={projectedMortgageBalance}
            formatCurrency={formatCurrency}
          />
        ))}
      </CardContent>
    </Card>
  );
}
