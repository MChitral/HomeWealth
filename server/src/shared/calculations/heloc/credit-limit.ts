/**
 * HELOC Credit Limit Calculations
 * 
 * Credit limit is calculated as: (Home Value × Maximum LTV) - Mortgage Balance
 * This represents the maximum combined debt (mortgage + HELOC) allowed.
 */

/**
 * Calculate HELOC credit limit based on home value, maximum LTV, and mortgage balance
 * 
 * @param homeValue - Current home value
 * @param maxLTV - Maximum loan-to-value percentage (e.g., 65 for 65%)
 * @param mortgageBalance - Current mortgage balance
 * @returns Credit limit amount
 */
export function calculateCreditLimit(
  homeValue: number,
  maxLTV: number,
  mortgageBalance: number
): number {
  const maxCombinedDebt = homeValue * (maxLTV / 100);
  return Math.max(0, maxCombinedDebt - mortgageBalance);
}

/**
 * Recalculate credit limit after a prepayment
 * 
 * @param currentCreditLimit - Current credit limit
 * @param prepaymentAmount - Amount of prepayment made
 * @returns New credit limit after prepayment
 */
export function recalculateCreditLimitOnPrepayment(
  currentCreditLimit: number,
  prepaymentAmount: number
): number {
  return currentCreditLimit + prepaymentAmount;
}

/**
 * Recalculate credit limit after home value update
 * 
 * @param newHomeValue - Updated home value
 * @param maxLTV - Maximum loan-to-value percentage
 * @param mortgageBalance - Current mortgage balance
 * @returns New credit limit after home value update
 */
export function recalculateCreditLimitOnHomeValueUpdate(
  newHomeValue: number,
  maxLTV: number,
  mortgageBalance: number
): number {
  return calculateCreditLimit(newHomeValue, maxLTV, mortgageBalance);
}

