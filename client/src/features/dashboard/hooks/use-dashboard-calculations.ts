import { useMemo } from "react";
import type { Mortgage, Term, Payment, EmergencyFund, CashFlow } from "@shared/schema";
import {
  calculatePayment,
  calculatePaymentBreakdown,
  type PaymentFrequency,
} from "@/features/mortgage-tracking/utils/mortgage-math";

interface UseDashboardCalculationsProps {
  activeMortgage: Mortgage | null;
  latestTerm: Term | null;
  latestPayment: Payment | null;
  emergencyFund: EmergencyFund | null;
  cashFlow: CashFlow | null;
  paymentFrequency: PaymentFrequency;
}

export function useDashboardCalculations({
  activeMortgage,
  latestTerm,
  latestPayment,
  emergencyFund,
  cashFlow,
  paymentFrequency,
}: UseDashboardCalculationsProps) {
  const homeValue = useMemo(() => {
    return activeMortgage && activeMortgage.propertyPrice
      ? Number(activeMortgage.propertyPrice)
      : 0;
  }, [activeMortgage]);

  const mortgageBalance = useMemo(() => {
    return activeMortgage && activeMortgage.currentBalance
      ? Number(activeMortgage.currentBalance)
      : 0;
  }, [activeMortgage]);

  const originalMortgageBalance = useMemo(() => {
    return activeMortgage && activeMortgage.originalAmount
      ? Number(activeMortgage.originalAmount)
      : 0;
  }, [activeMortgage]);

  const efBalance = useMemo(() => {
    return emergencyFund && emergencyFund.currentBalance ? Number(emergencyFund.currentBalance) : 0;
  }, [emergencyFund]);

  const currentNetWorth = useMemo(() => {
    return homeValue - mortgageBalance + efBalance;
  }, [homeValue, mortgageBalance, efBalance]);

  const monthlyExpenses = useMemo(() => {
    if (!cashFlow) return 0;
    return (
      Number(cashFlow.propertyTax || 0) +
      Number(cashFlow.homeInsurance || 0) +
      Number(cashFlow.condoFees || 0) +
      Number(cashFlow.utilities || 0) +
      Number(cashFlow.groceries || 0) +
      Number(cashFlow.dining || 0) +
      Number(cashFlow.transportation || 0) +
      Number(cashFlow.entertainment || 0)
    );
  }, [cashFlow]);

  const efTargetAmount = useMemo(() => {
    if (!emergencyFund || !emergencyFund.targetMonths || monthlyExpenses <= 0) return 0;
    return Number(emergencyFund.targetMonths) * monthlyExpenses;
  }, [emergencyFund, monthlyExpenses]);

  const paymentPreview = useMemo(() => {
    if (!activeMortgage) return null;

    const balance = latestPayment
      ? Number(latestPayment.remainingBalance)
      : Number(activeMortgage.currentBalance || activeMortgage.originalAmount || 0);
    if (!balance || balance <= 0) {
      return null;
    }

    const amortizationMonths = latestPayment
      ? Number(latestPayment.remainingAmortizationMonths || 0)
      : Math.max(1, Number(activeMortgage.amortizationYears || 25) * 12);

    const termRate =
      latestTerm?.termType === "fixed"
        ? Number(latestTerm?.fixedRate ?? 0)
        : Number(latestTerm?.primeRate ?? 0) + Number(latestTerm?.lockedSpread ?? 0);
    const ratePercent = Number(latestPayment?.effectiveRate ?? termRate);
    if (!ratePercent || ratePercent <= 0) {
      return null;
    }

    let paymentAmount = latestPayment
      ? Number(latestPayment.regularPaymentAmount)
      : Number(latestTerm?.regularPaymentAmount || 0);
    if ((!paymentAmount || paymentAmount <= 0) && amortizationMonths > 0) {
      paymentAmount = calculatePayment(
        balance,
        ratePercent / 100,
        amortizationMonths,
        paymentFrequency
      );
    }

    if (!paymentAmount || paymentAmount <= 0) {
      return null;
    }

    const breakdown = calculatePaymentBreakdown({
      balance,
      paymentAmount,
      regularPaymentAmount: paymentAmount,
      extraPrepaymentAmount: 0,
      frequency: paymentFrequency,
      annualRate: ratePercent / 100,
    });

    return {
      breakdown,
      ratePercent,
    };
  }, [activeMortgage, latestPayment, latestTerm, paymentFrequency]);

  return {
    homeValue,
    mortgageBalance,
    originalMortgageBalance,
    efBalance,
    currentNetWorth,
    monthlyExpenses,
    efTargetAmount,
    paymentPreview,
  };
}
