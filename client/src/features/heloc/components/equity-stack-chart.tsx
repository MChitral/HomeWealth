import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { Info, Lock, TrendingUp, DollarSign } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

interface EquityStackChartProps {
  propertyValue: number;
  mortgageBalance: number;
  helocBalance: number;
  availableHeloc: number;
  maxLtvPercent: number;
}

export function EquityStackChart({
  propertyValue,
  mortgageBalance,
  helocBalance,
  availableHeloc,
  maxLtvPercent,
}: EquityStackChartProps) {
  // If no property value, we can't show a meaningful ratio
  if (propertyValue <= 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No property value data available to calculate equity stack.
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages relative to property value for the bar height
  const mortgagePct = (mortgageBalance / propertyValue) * 100;
  const helocUsedPct = (helocBalance / propertyValue) * 100;
  const availablePct = (availableHeloc / propertyValue) * 100;

  // The rest is inaccessible equity (either above LTV cap or reserved)
  // Note: 100% - (Components) might include the 20% equity requirement
  const remainingEquity = propertyValue - mortgageBalance - helocBalance - availableHeloc;
  const remainingPct = (remainingEquity / propertyValue) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Capital Stack & Equity</span>
          <span className="text-sm font-normal text-muted-foreground">
            Total: {formatCurrency(propertyValue)}
          </span>
        </CardTitle>
        <CardDescription>
          Visualize your home&apos;s value distribution and borrowing power
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch h-full">
          {/* The Stacked Bar */}
          <div className="w-24 md:w-32 h-[300px] flex flex-col rounded-lg overflow-hidden border bg-slate-100 dark:bg-slate-900 shadow-inner relative shrink-0">
            {/* Top Segment: Remaining / Locked Equity */}
            {remainingPct > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="w-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 transition-colors hover:bg-slate-300 dark:hover:bg-slate-700 cursor-help"
                      style={{ height: `${remainingPct}%` }}
                    >
                      <Lock className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-semibold">Locked / Remaining Equity</p>
                    <p>
                      {formatCurrency(remainingEquity)} ({remainingPct.toFixed(1)}%)
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                      This portion includes your mandatory 20% equity stake plus any equity
                      exceeding your credit limit approval.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Available HELOC Segment */}
            {availablePct > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="w-full flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 transition-colors hover:bg-green-200 dark:hover:bg-green-900/50 cursor-help border-t border-white/20"
                      style={{ height: `${availablePct}%` }}
                    >
                      <span className="text-xs font-bold writing-v rotate-180 md:rotate-0 tracking-wider">
                        AVAILABLE
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-semibold text-green-600">Available Borrowing Power</p>
                    <p>
                      {formatCurrency(availableHeloc)} ({availablePct.toFixed(1)}%)
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                      This is your currently accessible equity that you can borrow against without
                      new approvals.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* HELOC Used Segment */}
            {helocUsedPct > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="w-full flex items-center justify-center bg-amber-400 dark:bg-amber-600 text-amber-900 dark:text-amber-100 transition-colors hover:bg-amber-500 cursor-help border-t border-white/20"
                      style={{ height: `${helocUsedPct}%` }}
                    >
                      <span className="text-xs font-bold">USED</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-semibold text-amber-600">HELOC Balance Used</p>
                    <p>
                      {formatCurrency(helocBalance)} ({helocUsedPct.toFixed(1)}%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Mortgage Segment */}
            {mortgagePct > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="w-full flex items-center justify-center bg-blue-500 dark:bg-blue-600 text-white transition-colors hover:bg-blue-600 cursor-help border-t border-white/20"
                      style={{ height: `${mortgagePct}%` }}
                    >
                      <span className="text-xs font-bold">MORTGAGE</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-semibold text-blue-600">Mortgage Balance</p>
                    <p>
                      {formatCurrency(mortgageBalance)} ({mortgagePct.toFixed(1)}%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* LTV Limit Line Overlay */}
            <div
              className="absolute w-full border-t-2 border-dashed border-red-500 pointer-events-none"
              style={{ bottom: `${maxLtvPercent}%`, zIndex: 10 }}
            />
            <div
              className="absolute right-0 translate-x-full pr-1 text-[10px] font-bold text-red-500 pointer-events-none flex items-center"
              style={{ bottom: `${maxLtvPercent}%`, transform: "translateY(50%) translateX(4px)" }}
            >
              MAX {maxLtvPercent}%
            </div>
          </div>

          {/* Legend / Stats Panel */}
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Available to Borrow
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Net equity accessible now
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(availableHeloc)}
                  </p>
                  <p className="text-xs text-green-600">{availablePct.toFixed(1)}% of Home Value</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-muted-foreground">Mortgage Debt</span>
                  </div>
                  <p className="font-semibold">{formatCurrency(mortgageBalance)}</p>
                </div>
                <div className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <span className="text-xs text-muted-foreground">HELOC Used</span>
                  </div>
                  <p className="font-semibold">{formatCurrency(helocBalance)}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Debt Service</span>
                  </div>
                  <span className="font-bold">
                    {formatCurrency(mortgageBalance + helocBalance)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div
                    className="bg-slate-500 h-1.5 rounded-full"
                    style={{
                      width: `${((mortgageBalance + helocBalance) / propertyValue) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>
                    Current LTV:{" "}
                    {(((mortgageBalance + helocBalance) / propertyValue) * 100).toFixed(1)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/10 p-3 rounded border border-blue-100 dark:border-blue-900/20 flex gap-2">
              <Info className="h-4 w-4 text-blue-500 shrink-0" />
              <p>
                Canadian regulations typically limit total borrowing (Mortgage + HELOC) to 80% of
                your home's value. Re-advanceable mortgages allow your limit to increase
                automatically as you pay down your principal.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
