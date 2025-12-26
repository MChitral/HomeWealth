/**
 * Interest Deduction Calculations
 *
 * Calculates eligible interest deductions for tax purposes in Canada.
 *
 * Key rules:
 * - Interest on money borrowed to earn investment income is deductible
 * - Must be used for income-producing purposes
 * - HELOC interest used for investments is deductible
 * - Interest on principal residence mortgage is NOT deductible
 */

export interface InterestDeductionResult {
  totalInterest: number;
  eligibleInterest: number;
  ineligibleInterest: number;
  investmentUsePercent: number;
  taxDeduction: number;
  taxSavings: number;
}

/**
 * Calculate eligible interest deduction
 * @param totalInterest Total interest paid (e.g., HELOC interest)
 * @param investmentUsePercent Percentage of borrowed funds used for investment (0-100)
 * @param marginalTaxRate Marginal tax rate (as decimal, e.g., 0.45 for 45%)
 * @returns Interest deduction calculation result
 */
export function calculateInterestDeduction(
  totalInterest: number,
  investmentUsePercent: number,
  marginalTaxRate: number
): InterestDeductionResult {
  // Ensure investment use percent is between 0 and 100
  const investmentPercent = Math.max(0, Math.min(100, investmentUsePercent));

  // Eligible interest is pro-rated by investment use percentage
  const eligibleInterest = totalInterest * (investmentPercent / 100);
  const ineligibleInterest = totalInterest - eligibleInterest;

  // Tax deduction equals eligible interest (full deduction)
  const taxDeduction = eligibleInterest;

  // Tax savings = deduction × marginal tax rate
  const taxSavings = taxDeduction * marginalTaxRate;

  return {
    totalInterest,
    eligibleInterest,
    ineligibleInterest,
    investmentUsePercent: investmentPercent,
    taxDeduction,
    taxSavings,
  };
}

/**
 * Calculate interest deduction for multiple HELOC accounts
 * @param accounts Array of accounts with interest and investment use percentage
 * @param marginalTaxRate Marginal tax rate (as decimal)
 * @returns Aggregate interest deduction result
 */
export function calculateAggregateInterestDeduction(
  accounts: Array<{ interest: number; investmentUsePercent: number }>,
  marginalTaxRate: number
): InterestDeductionResult {
  let totalInterest = 0;
  let totalEligibleInterest = 0;

  for (const account of accounts) {
    totalInterest += account.interest;
    const eligible = account.interest * (account.investmentUsePercent / 100);
    totalEligibleInterest += eligible;
  }

  const investmentUsePercent =
    totalInterest > 0 ? (totalEligibleInterest / totalInterest) * 100 : 0;

  return calculateInterestDeduction(totalInterest, investmentUsePercent, marginalTaxRate);
}
