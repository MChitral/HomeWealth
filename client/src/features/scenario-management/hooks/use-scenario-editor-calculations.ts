import { useMemo } from "react";
import {
  calculatePayment,
  calculatePaymentBreakdown,
  type PaymentFrequency,
} from "@/features/mortgage-tracking/utils/mortgage-math";
import type { Mortgage, Term, Payment } from "@shared/schema";
import type { CashFlow } from "@shared/schema";

interface UseScenarioEditorCalculationsProps {
  mortgage: Mortgage | null | undefined;
  terms: Term[] | null | undefined;
  payments: Payment[] | null | undefined;
  cashFlow: CashFlow | null | undefined;
  rateAssumption: number | null;
  paymentFrequency: PaymentFrequency;
}

export function useScenarioEditorCalculations({
  mortgage,
  terms,
  payments,
  cashFlow,
  rateAssumption,
  paymentFrequency,
}: UseScenarioEditorCalculationsProps) {
  // Get latest term and latest payment for current mortgage position (sorted by date)
  const sortedTerms = useMemo(() => {
    if (!terms?.length) return [];
    return [...terms].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [terms]);
  const latestTerm = sortedTerms[0] || null;

  const sortedPayments = useMemo(() => {
    if (!payments?.length) return [];
    return [...payments].sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }, [payments]);
  const latestPayment = sortedPayments[0] || null;
  const firstPayment = sortedPayments[sortedPayments.length - 1] || null;

  // Calculate totals from payment history
  const totalPrincipalPaid =
    payments?.reduce((sum, p) => sum + Number(p.principalPaid || 0), 0) || 0;
  const totalInterestPaid = payments?.reduce((sum, p) => sum + Number(p.interestPaid || 0), 0) || 0;

  // Calculate years into mortgage from first payment
  const yearsIntoMortgage = firstPayment
    ? (new Date().getTime() - new Date(firstPayment.paymentDate).getTime()) /
      (1000 * 60 * 60 * 24 * 365)
    : 0;

  // Current mortgage data from database
  const currentMortgageData = useMemo(() => {
    // Property price is required for accurate home value calculations
    // If missing, we'll use 0 and show a warning in the UI (don't use arbitrary fallback)
    const homeValue = mortgage?.propertyPrice ? Number(mortgage.propertyPrice) : 0;
    const originalPrincipal = mortgage?.originalAmount ? Number(mortgage.originalAmount) : 0;

    const balanceFromPayment = latestPayment ? Number(latestPayment.remainingBalance) : NaN;
    const currentBalance =
      Number.isFinite(balanceFromPayment) && balanceFromPayment > 0
        ? balanceFromPayment
        : Number(mortgage?.currentBalance || originalPrincipal);

    const principalPaid = Math.round(totalPrincipalPaid * 100) / 100;
    const interestPaid = Math.round(totalInterestPaid * 100) / 100;
    const yearsInto = Math.round(yearsIntoMortgage * 100) / 100;

    const termRate =
      latestTerm?.termType === "fixed"
        ? Number(latestTerm?.fixedRate ?? 0)
        : Number(latestTerm?.primeRate ?? 0) + Number(latestTerm?.lockedSpread ?? 0);
    const derivedRate = latestPayment ? Number(latestPayment.effectiveRate) : termRate;
    const currentRate = Number.isFinite(derivedRate) && derivedRate > 0 ? derivedRate : 5;

    const amortizationYears = latestPayment
      ? Number(latestPayment.remainingAmortizationMonths ?? 0) / 12
      : Number(mortgage?.amortizationYears || 25);
    const amortizationMonths = Math.max(1, Math.round((amortizationYears || 0) * 12));

    let paymentAmount = latestPayment
      ? Number(latestPayment.regularPaymentAmount)
      : Number(latestTerm?.regularPaymentAmount || 0);
    if (
      (!paymentAmount || paymentAmount <= 0) &&
      currentBalance > 0 &&
      amortizationMonths > 0 &&
      currentRate > 0
    ) {
      paymentAmount = calculatePayment(
        currentBalance,
        currentRate / 100,
        amortizationMonths,
        paymentFrequency
      );
    }
    paymentAmount = Math.round((paymentAmount || 0) * 100) / 100;

    const termType =
      latestTerm?.termType === "fixed"
        ? "Fixed Rate"
        : latestTerm?.termType === "variable-fixed"
          ? "Variable-Fixed Payment"
          : "Variable-Changing Payment";

    return {
      homeValue,
      originalPrincipal,
      currentBalance,
      principalPaid,
      interestPaid,
      yearsIntoMortgage: yearsInto,
      currentRate,
      currentAmortization: Math.max(0, Math.round((amortizationMonths / 12) * 10) / 10),
      monthlyPayment: paymentAmount,
      termType,
      lockedSpread: Number(latestTerm?.lockedSpread || 0),
      paymentFrequency,
    };
  }, [
    mortgage,
    latestTerm,
    latestPayment,
    totalPrincipalPaid,
    totalInterestPaid,
    yearsIntoMortgage,
    paymentFrequency,
  ]);

  const rateUsedForPreview =
    typeof rateAssumption === "number" ? rateAssumption : currentMortgageData.currentRate;

  const scenarioPaymentPreview = useMemo(() => {
    if (!currentMortgageData.currentBalance || currentMortgageData.currentBalance <= 0) return null;
    if (!currentMortgageData.monthlyPayment || currentMortgageData.monthlyPayment <= 0) return null;
    if (!rateUsedForPreview || rateUsedForPreview <= 0) return null;

    return calculatePaymentBreakdown({
      balance: currentMortgageData.currentBalance,
      paymentAmount: currentMortgageData.monthlyPayment,
      regularPaymentAmount: currentMortgageData.monthlyPayment,
      extraPrepaymentAmount: 0,
      frequency: paymentFrequency,
      annualRate: rateUsedForPreview / 100,
    });
  }, [
    currentMortgageData.currentBalance,
    currentMortgageData.monthlyPayment,
    rateUsedForPreview,
    paymentFrequency,
  ]);

  // Calculate monthly expenses from all expense fields
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
      Number(cashFlow.entertainment || 0) +
      Number(cashFlow.carLoan || 0) +
      Number(cashFlow.studentLoan || 0) +
      Number(cashFlow.creditCard || 0)
    );
  }, [cashFlow]);

  // Calculate surplus cash from cash flow
  const monthlySurplus = useMemo(() => {
    if (!cashFlow) return 0;
    const income = Number(cashFlow.monthlyIncome || 0);
    const mortgagePayment = currentMortgageData.monthlyPayment;
    return Math.max(0, income - monthlyExpenses - mortgagePayment);
  }, [cashFlow, monthlyExpenses, currentMortgageData.monthlyPayment]);

  return {
    currentMortgageData,
    scenarioPaymentPreview,
    rateUsedForPreview,
    monthlyExpenses,
    monthlySurplus,
    latestTerm,
    latestPayment,
  };
}
