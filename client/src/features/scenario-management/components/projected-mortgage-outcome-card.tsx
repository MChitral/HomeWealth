import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { BarChart3, TableIcon } from "lucide-react";
import { MortgageBalanceChart } from "@/widgets/charts/mortgage-balance-chart";
import type { DraftPrepaymentEvent } from "../hooks/use-scenario-editor-state";

interface ProjectedMortgageOutcomeCardProps {
  prepaymentEvents: DraftPrepaymentEvent[];
  rateAssumption: number | null;
  projectedPayoff: number;
  totalInterest: number;
  interestSaved: number;
  mortgageProjection: Array<{ year: number; balance: number; principal: number; interest: number }>;
  yearlyAmortization: Array<{
    year: number;
    totalPaid: number;
    principalPaid: number;
    interestPaid: number;
    endingBalance: number;
    isHistorical?: boolean;
  }>;
}

export function ProjectedMortgageOutcomeCard({
  prepaymentEvents,
  rateAssumption,
  projectedPayoff,
  totalInterest,
  interestSaved,
  mortgageProjection,
  yearlyAmortization,
}: ProjectedMortgageOutcomeCardProps) {
  const [projectionView, setProjectionView] = useState<"chart" | "table">("chart");

  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Projected Mortgage Outcome</CardTitle>
            <CardDescription>
              Based on current prepayment strategy
              {prepaymentEvents.length > 0 &&
                ` (${prepaymentEvents.length} prepayment ${prepaymentEvents.length === 1 ? "event" : "events"})`}
            </CardDescription>
          </div>
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={projectionView === "chart" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setProjectionView("chart")}
              data-testid="button-view-chart"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Chart
            </Button>
            <Button
              variant={projectionView === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setProjectionView("table")}
              data-testid="button-view-table"
            >
              <TableIcon className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-primary/10 rounded-md">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Projected Payoff</p>
            <p className="text-2xl font-bold font-mono">{projectedPayoff} years</p>
            <p className="text-xs text-muted-foreground">from today</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Interest (future)</p>
            <p className="text-2xl font-bold font-mono">${totalInterest.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">from today forward</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Interest Saved</p>
            <p className="text-2xl font-bold font-mono text-green-600">
              ${interestSaved.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">vs minimum payments</p>
          </div>
        </div>
        <Separator />

        {projectionView === "chart" ? (
          <div>
            <p className="text-sm font-medium mb-3">
              Mortgage Balance Projection
              {rateAssumption !== null && (
                <span className="text-muted-foreground ml-2">
                  (at {rateAssumption.toFixed(2)}% rate)
                </span>
              )}
            </p>
            <MortgageBalanceChart data={mortgageProjection} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">
                Yearly Amortization Schedule
                {rateAssumption !== null && (
                  <span className="text-muted-foreground ml-2">
                    (at {rateAssumption.toFixed(2)}% rate)
                  </span>
                )}
              </p>
              {yearlyAmortization.some((r) => r.isHistorical) && (
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
                    Logged Payments
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-background border" />
                    Projected
                  </span>
                </div>
              )}
            </div>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Year</TableHead>
                    <TableHead className="text-right font-semibold">Total Paid</TableHead>
                    <TableHead className="text-right font-semibold">Principal</TableHead>
                    <TableHead className="text-right font-semibold">Interest</TableHead>
                    <TableHead className="text-right font-semibold">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearlyAmortization.map((row, index) => (
                    <TableRow
                      key={row.year}
                      className={
                        row.isHistorical
                          ? "bg-green-50 dark:bg-green-900/20 border-l-2 border-l-green-500"
                          : index % 2 === 0
                            ? "bg-background"
                            : "bg-muted/30"
                      }
                    >
                      <TableCell className="font-medium">
                        {row.year}
                        {row.isHistorical && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs py-0 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                          >
                            Logged
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${row.totalPaid.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        ${row.principalPaid.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-blue-600">
                        ${row.interestPaid.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${row.endingBalance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right font-mono">
                      $
                      {yearlyAmortization.reduce((sum, r) => sum + r.totalPaid, 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      $
                      {yearlyAmortization
                        .reduce((sum, r) => sum + r.principalPaid, 0)
                        .toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-blue-600">
                      $
                      {yearlyAmortization
                        .reduce((sum, r) => sum + r.interestPaid, 0)
                        .toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      $
                      {yearlyAmortization.length > 0
                        ? yearlyAmortization[
                            yearlyAmortization.length - 1
                          ].endingBalance.toLocaleString()
                        : "0"}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground italic">
          Adjust prepayment settings above to see how they affect your mortgage payoff timeline
        </p>
      </CardContent>
    </Card>
  );
}
