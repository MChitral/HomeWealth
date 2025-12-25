/**
 * Net Benefit Calculations
 * Calculate net benefit from Smith Maneuver strategy
 */

/**
 * Calculate net benefit from Smith Maneuver
 * 
 * Net Benefit = Investment Returns (after tax) - HELOC Cost (after tax savings) + Tax Savings
 * 
 * @param investmentReturns - Gross investment returns
 * @param investmentTax - Tax on investment income
 * @param helocInterest - HELOC interest paid
 * @param taxSavings - Tax savings from HELOC interest deduction
 * @returns Net benefit amount
 */
export function calculateNetBenefit(
  investmentReturns: number,
  investmentTax: number,
  helocInterest: number,
  taxSavings: number
): number {
  const afterTaxInvestmentReturns = investmentReturns - investmentTax;
  const netHelocCost = helocInterest - taxSavings;
  const netBenefit = afterTaxInvestmentReturns - netHelocCost;

  return netBenefit;
}

/**
 * Calculate annual net benefit
 * 
 * @param investmentReturns - Annual investment returns
 * @param investmentTaxRate - Effective tax rate on investment income
 * @param helocInterest - Annual HELOC interest
 * @param marginalTaxRate - Marginal tax rate for HELOC deduction
 * @param investmentUsePercent - Percentage of HELOC used for investment
 * @returns Annual net benefit
 */
export function calculateAnnualNetBenefit(
  investmentReturns: number,
  investmentTaxRate: number,
  helocInterest: number,
  marginalTaxRate: number,
  investmentUsePercent: number
): number {
  // Calculate tax on investment income
  const investmentTax = investmentReturns * (investmentTaxRate / 100);
  
  // Calculate tax savings from HELOC interest deduction
  const eligibleInterest = helocInterest * (investmentUsePercent / 100);
  const taxSavings = eligibleInterest * (marginalTaxRate / 100);
  
  // Calculate net benefit
  return calculateNetBenefit(investmentReturns, investmentTax, helocInterest, taxSavings);
}

/**
 * Calculate cumulative net benefit over time
 * 
 * @param annualNetBenefits - Array of annual net benefits
 * @returns Cumulative net benefit for each year
 */
export function calculateCumulativeNetBenefit(annualNetBenefits: number[]): number[] {
  const cumulative: number[] = [];
  let runningTotal = 0;

  for (const annualBenefit of annualNetBenefits) {
    runningTotal += annualBenefit;
    cumulative.push(runningTotal);
  }

  return cumulative;
}

