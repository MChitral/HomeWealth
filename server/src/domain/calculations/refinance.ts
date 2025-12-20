import { calculatePayment } from "../../shared/calculations/mortgage";

export interface RefinanceResult {
  monthlySavings: number;
  breakEvenMonths: number;
  newPayment: number;
  totalTermSavings: number;
  isBeneficial: boolean;
}

/**
 * Calculates the financial benefit of refinancing.
 *
 * @param currentBalance Remaining mortgage balance
 * @param currentRate Annual interest rate (decimal, e.g. 0.05)
 * @param newRate Annual interest rate (decimal, e.g. 0.0399)
 * @param remainingAmortizationMonths Remaining amortization period
 * @param remainingTermMonths Remaining months in the OWN term (for calculating total term savings)
 * @param totalCostToBreak Penalty + Closing Costs
 */
export function calculateRefinanceBenefit(
  currentBalance: number,
  currentRate: number,
  newRate: number,
  remainingAmortizationMonths: number,
  remainingTermMonths: number,
  totalCostToBreak: number
): RefinanceResult {
  // 1. Calculate Old Payment (based on current balance & rem amortization to be fair comparison)
  // We assume the user keeps the same amortization timeline to see pure rate savings.
  const oldPayment = calculatePayment(
    currentBalance,
    currentRate,
    remainingAmortizationMonths,
    "monthly"
  );
  const newPayment = calculatePayment(
    currentBalance,
    newRate,
    remainingAmortizationMonths,
    "monthly"
  );

  const monthlySavings = oldPayment - newPayment;

  // 2. Break Even Point
  // months = Cost / Savings/mo
  let breakEvenMonths = 0;
  if (monthlySavings > 0) {
    breakEvenMonths = totalCostToBreak / monthlySavings;
  } else {
    breakEvenMonths = Infinity; // Never break even if rate is higher
  }

  // 3. Total Term Savings
  // Savings over the remaining months of the *current* term.
  // Often people want to know if they save money *before* their renewal would have happened.
  const totalTermSavings = monthlySavings * remainingTermMonths - totalCostToBreak;

  return {
    monthlySavings,
    breakEvenMonths,
    newPayment,
    totalTermSavings,
    isBeneficial: totalTermSavings > 0,
  };
}
