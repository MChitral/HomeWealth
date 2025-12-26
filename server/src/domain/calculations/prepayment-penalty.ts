/**
 * Calculate penalty for over-limit prepayments
 *
 * Canadian lenders typically charge a penalty (1-3% of over-limit amount)
 * when prepayments exceed the annual limit.
 *
 * @param overLimitAmount - Amount that exceeds the prepayment limit
 * @param penaltyPercent - Penalty percentage (default: 1.5%)
 * @returns Penalty amount
 */
export function calculateOverLimitPenalty(
  overLimitAmount: number,
  penaltyPercent: number = 1.5
): number {
  if (overLimitAmount <= 0) {
    return 0;
  }

  return (overLimitAmount * penaltyPercent) / 100;
}

/**
 * Calculate total prepayment amount including penalty if over limit
 *
 * @param requestedAmount - Requested prepayment amount
 * @param availableLimit - Available prepayment limit (annual limit + carry-forward - used)
 * @param penaltyPercent - Penalty percentage if over limit (default: 1.5%)
 * @returns Object with prepayment amount, penalty amount, and total cost
 */
export function calculatePrepaymentWithPenalty(
  requestedAmount: number,
  availableLimit: number,
  penaltyPercent: number = 1.5
): {
  prepaymentAmount: number;
  overLimitAmount: number;
  penaltyAmount: number;
  totalCost: number;
} {
  const overLimitAmount = Math.max(0, requestedAmount - availableLimit);
  const penaltyAmount = calculateOverLimitPenalty(overLimitAmount, penaltyPercent);
  const totalCost = requestedAmount + penaltyAmount;

  return {
    prepaymentAmount: requestedAmount,
    overLimitAmount,
    penaltyAmount,
    totalCost,
  };
}
