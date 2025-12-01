import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface SummaryStats {
  totalPayments: number;
  totalPaid: number;
  totalPrincipal: number;
  totalInterest: number;
  currentBalance: number;
  amortizationYears: number;
}

interface MortgageSummaryPanelsProps {
  stats: SummaryStats;
  formatAmortization: (years: number) => string;
}

export function MortgageSummaryPanels({ stats, formatAmortization }: MortgageSummaryPanelsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Total Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold font-mono">{stats.totalPayments}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Total: ${stats.totalPaid.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Principal Paid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold font-mono text-green-600">
            ${stats.totalPrincipal.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Interest Paid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold font-mono text-orange-600">
            ${stats.totalInterest.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Balance Remaining
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold font-mono">
            ${stats.currentBalance.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatAmortization(stats.amortizationYears)} amort.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

