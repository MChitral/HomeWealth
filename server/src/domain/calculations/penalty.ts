/**
 * Calculates the estimated 3-month interest penalty.
 * Standard Canadian penalty is often the greater of 3-month interest or IRD.
 *
 * @param balance Current mortgage balance
 * @param annualRate Annual interest rate (decimal, e.g., 0.05 for 5%)
 * @returns The penalty amount in dollars
 */
export function calculateThreeMonthInterestPenalty(balance: number, annualRate: number): number {
  if (balance < 0 || annualRate < 0) return 0;
  // Simple interest calculation: Balance * Rate * (3/12)
  return balance * annualRate * (3 / 12);
}

/**
 * Calculates the estimated Interest Rate Differential (IRD) penalty.
 * IRD applies when the current rate is higher than the current market rate for the remaining term.
 * The lender loses money by re-lending the funds at a lower rate.
 *
 * Approximation Formula:
 * IRD = Balance * (CurrentRate - ComparisonRate) * RemainingTimeInYears
 *
 * @param balance Current mortgage balance
 * @param currentAnnualRate Current mortgage rate (decimal)
 * @param comparisonAnnualRate Current market rate for the remaining term (decimal)
 * @param remainingMonths Number of months remaining in the term
 * @returns The penalty amount in dollars (0 if comparison rate >= current rate)
 */
export function calculateIRDPenalty(
  balance: number,
  currentAnnualRate: number,
  comparisonAnnualRate: number,
  remainingMonths: number
): number {
  if (balance < 0 || currentAnnualRate < 0 || comparisonAnnualRate < 0 || remainingMonths <= 0) {
    return 0;
  }

  // If market rates are higher, the lender can lend at a higher rate, so no loss (IRD is 0).
  if (comparisonAnnualRate >= currentAnnualRate) {
    return 0;
  }

  const rateDifference = currentAnnualRate - comparisonAnnualRate;
  const remainingYears = remainingMonths / 12;

  return balance * rateDifference * remainingYears;
}

/**
 * Determines the estimated penalty based on standard "Greater of" rule.
 *
 * @param balance Current balance
 * @param currentRate Current annual rate (decimal)
 * @param marketRate Current market rate for remaining term (decimal)
 * @param remainingMonths Months remaining in term
 * @returns Object containing the penalty amount and which method was applied
 */
export function calculateStandardPenalty(
  balance: number,
  currentRate: number,
  marketRate: number,
  remainingMonths: number
): { penalty: number; method: "IRD" | "3-Month Interest" } {
  const threeMonth = calculateThreeMonthInterestPenalty(balance, currentRate);
  const ird = calculateIRDPenalty(balance, currentRate, marketRate, remainingMonths);

  if (ird > threeMonth) {
    return { penalty: ird, method: "IRD" };
  } else {
    return { penalty: threeMonth, method: "3-Month Interest" };
  }
}
