/**
 * Mortgage portability calculation result
 */
export interface PortabilityResult {
  oldPropertyPrice: number;
  newPropertyPrice: number;
  portedAmount: number;
  topUpAmount: number;
  requiresTopUp: boolean;
  blendedRate?: number; // If top-up required, this is the blended rate
  message?: string;
}

/**
 * Calculate mortgage portability options
 *
 * Mortgage portability allows transferring a mortgage to a new property.
 * Typically, you can port up to the original mortgage amount.
 * If the new property costs more, you may need a top-up (blended rate).
 *
 * @param currentBalance - Current mortgage balance
 * @param originalMortgageAmount - Original mortgage amount at origination
 * @param oldPropertyPrice - Price of old property
 * @param newPropertyPrice - Price of new property
 * @returns Portability calculation result
 */
export function calculatePortability(
  currentBalance: number,
  originalMortgageAmount: number,
  oldPropertyPrice: number,
  newPropertyPrice: number
): PortabilityResult {
  // Validate inputs
  if (currentBalance <= 0) {
    throw new Error("Current balance must be greater than zero");
  }
  if (originalMortgageAmount <= 0) {
    throw new Error("Original mortgage amount must be greater than zero");
  }
  if (oldPropertyPrice <= 0 || newPropertyPrice <= 0) {
    throw new Error("Property prices must be greater than zero");
  }

  // Typically, you can port up to the original mortgage amount
  // Some lenders allow porting the current balance, others allow up to original amount
  // For this implementation, we'll use the minimum of current balance and original amount
  const maxPortableAmount = Math.min(currentBalance, originalMortgageAmount);
  const portedAmount = Math.min(maxPortableAmount, newPropertyPrice * 0.95); // Can't port more than 95% of new property

  // Calculate top-up if new property is more expensive
  const topUpAmount = newPropertyPrice > oldPropertyPrice
    ? Math.max(0, newPropertyPrice - oldPropertyPrice - (oldPropertyPrice - originalMortgageAmount))
    : 0;

  const requiresTopUp = topUpAmount > 0;

  return {
    oldPropertyPrice,
    newPropertyPrice,
    portedAmount,
    topUpAmount,
    requiresTopUp,
  };
}

/**
 * Calculate blended rate if top-up is required
 *
 * @param portedAmount - Amount being ported
 * @param portedRate - Rate on ported amount
 * @param topUpAmount - Additional amount needed
 * @param topUpRate - Rate for top-up amount
 * @returns Blended rate (weighted average)
 */
export function calculateBlendedRate(
  portedAmount: number,
  portedRate: number,
  topUpAmount: number,
  topUpRate: number
): number {
  if (portedAmount <= 0 && topUpAmount <= 0) {
    return 0;
  }

  const totalAmount = portedAmount + topUpAmount;
  if (totalAmount === 0) {
    return 0;
  }

  const portedWeight = portedAmount / totalAmount;
  const topUpWeight = topUpAmount / totalAmount;

  return portedRate * portedWeight + topUpRate * topUpWeight;
}

