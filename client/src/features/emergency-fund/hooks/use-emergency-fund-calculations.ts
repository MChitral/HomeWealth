import { useMemo } from "react";
import type { CashFlow } from "@shared/schema";

interface UseEmergencyFundCalculationsProps {
  cashFlow: CashFlow | null;
  targetMonths: string;
  currentBalance: string;
}

export function useEmergencyFundCalculations({
  cashFlow,
  targetMonths,
  currentBalance,
}: UseEmergencyFundCalculationsProps) {
  const fixedExpenses = useMemo(() => {
    if (!cashFlow) return 0;
    return (
      Number(cashFlow.propertyTax ?? 0) +
      Number(cashFlow.homeInsurance ?? 0) +
      Number(cashFlow.condoFees ?? 0) +
      Number(cashFlow.utilities ?? 0)
    );
  }, [cashFlow]);

  const variableExpenses = useMemo(() => {
    if (!cashFlow) return 0;
    return (
      Number(cashFlow.groceries ?? 0) +
      Number(cashFlow.dining ?? 0) +
      Number(cashFlow.transportation ?? 0) +
      Number(cashFlow.entertainment ?? 0)
    );
  }, [cashFlow]);

  const monthlyExpenses = fixedExpenses + variableExpenses;
  const hasExpenseData = monthlyExpenses > 0;
  const targetMonthsNumber = parseFloat(targetMonths || "6");
  const targetAmount = hasExpenseData ? monthlyExpenses * targetMonthsNumber : 0;
  const currentBalanceValue = Number(currentBalance || 0);
  const progressPercent =
    targetAmount > 0 && currentBalanceValue > 0
      ? parseFloat(((currentBalanceValue / targetAmount) * 100).toFixed(1))
      : 0;

  return {
    fixedExpenses,
    variableExpenses,
    monthlyExpenses,
    hasExpenseData,
    targetMonthsNumber,
    targetAmount,
    currentBalanceValue,
    progressPercent,
  };
}
