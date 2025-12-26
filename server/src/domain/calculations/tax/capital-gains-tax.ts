/**
 * Capital Gains Tax Calculations
 * 
 * Calculates capital gains tax in Canada.
 * 
 * Key rules:
 * - 50% inclusion rate (only 50% of capital gains are taxable)
 * - Taxed at marginal tax rate
 * - Capital losses can offset capital gains
 */

export interface CapitalGainsTaxResult {
  capitalGain: number;
  taxableGain: number; // 50% of capital gain
  taxAmount: number;
  afterTaxGain: number;
  effectiveTaxRate: number; // Effective rate on the full gain
}

/**
 * Calculate capital gains tax
 * @param proceeds Sale proceeds from the investment
 * @param costBasis Original cost basis (purchase price + fees)
 * @param marginalTaxRate Marginal tax rate (as decimal, e.g., 0.45 for 45%)
 * @param capitalLosses Capital losses to offset (optional)
 * @returns Capital gains tax calculation result
 */
export function calculateCapitalGainsTax(
  proceeds: number,
  costBasis: number,
  marginalTaxRate: number,
  capitalLosses: number = 0
): CapitalGainsTaxResult {
  // Calculate capital gain (or loss)
  const capitalGain = proceeds - costBasis;

  // Apply capital losses if any
  const netCapitalGain = Math.max(0, capitalGain - capitalLosses);

  // Only 50% of capital gains are taxable (inclusion rate)
  const taxableGain = netCapitalGain * 0.5;

  // Tax is calculated on the taxable portion at marginal rate
  const taxAmount = taxableGain * marginalTaxRate;

  // After-tax gain
  const afterTaxGain = capitalGain - taxAmount;

  // Effective tax rate on the full capital gain
  const effectiveTaxRate = capitalGain > 0 ? taxAmount / capitalGain : 0;

  return {
    capitalGain,
    taxableGain,
    taxAmount,
    afterTaxGain,
    effectiveTaxRate,
  };
}

/**
 * Calculate capital gains tax for multiple transactions
 * @param transactions Array of transactions with proceeds and costBasis
 * @param marginalTaxRate Marginal tax rate (as decimal)
 * @returns Aggregate capital gains tax result
 */
export function calculateAggregateCapitalGainsTax(
  transactions: Array<{ proceeds: number; costBasis: number }>,
  marginalTaxRate: number
): CapitalGainsTaxResult {
  let totalProceeds = 0;
  let totalCostBasis = 0;

  for (const transaction of transactions) {
    totalProceeds += transaction.proceeds;
    totalCostBasis += transaction.costBasis;
  }

  return calculateCapitalGainsTax(totalProceeds, totalCostBasis, marginalTaxRate);
}

