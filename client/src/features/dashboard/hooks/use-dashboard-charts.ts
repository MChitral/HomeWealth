import { useMemo } from "react";
import type { Mortgage } from "@shared/schema";

interface UseDashboardChartsProps {
  activeMortgage: Mortgage | null;
  netWorthProjections?: number[];
  mortgageBalanceProjections?: number[];
  investmentProjections?: number[];
}

export function useDashboardCharts({
  activeMortgage,
  netWorthProjections,
  mortgageBalanceProjections,
  investmentProjections,
}: UseDashboardChartsProps) {
  const netWorthChartData = useMemo(() => {
    if (!netWorthProjections || netWorthProjections.length === 0) return [];
    return netWorthProjections
      .map((value, index) => ({ year: index, netWorth: value }))
      .filter((_, index) => index % 2 === 0 || index === netWorthProjections.length - 1);
  }, [netWorthProjections]);

  const mortgageChartData = useMemo(() => {
    if (!mortgageBalanceProjections || mortgageBalanceProjections.length === 0) return [];
    const initial = activeMortgage ? Number(activeMortgage.currentBalance) : 0;
    return mortgageBalanceProjections
      .map((balance, year) => ({
        year,
        balance,
        principal: initial - balance,
        interest: 0,
      }))
      .filter((_, index) => index % 2 === 0 || index === mortgageBalanceProjections.length - 1);
  }, [mortgageBalanceProjections, activeMortgage]);

  const investmentChartData = useMemo(() => {
    if (!investmentProjections || investmentProjections.length === 0) return [];
    return investmentProjections
      .map((value, index) => ({ year: index, netWorth: value }))
      .filter((_, index) => index % 2 === 0 || index === investmentProjections.length - 1);
  }, [investmentProjections]);

  return {
    netWorthChartData,
    mortgageChartData,
    investmentChartData,
  };
}
