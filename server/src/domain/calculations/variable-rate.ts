/**
 * Validate variable rate against cap and floor constraints
 *
 * @param currentRate - Current variable rate (decimal, e.g., 0.05 for 5%)
 * @param newRate - Proposed new rate (decimal)
 * @param rateCap - Maximum rate cap (decimal, optional)
 * @param rateFloor - Minimum rate floor (decimal, optional)
 * @returns Object with validation result and adjusted rate if needed
 */
export function validateVariableRate(
  currentRate: number,
  newRate: number,
  rateCap?: number | null,
  rateFloor?: number | null
): { valid: boolean; adjustedRate: number; message?: string } {
  let adjustedRate = newRate;

  // Apply floor constraint
  if (rateFloor !== null && rateFloor !== undefined && adjustedRate < rateFloor) {
    adjustedRate = rateFloor;
  }

  // Apply cap constraint (cap is typically relative to current rate)
  if (rateCap !== null && rateCap !== undefined) {
    const maxAllowedRate = currentRate + rateCap;
    if (adjustedRate > maxAllowedRate) {
      adjustedRate = maxAllowedRate;
    }
  }

  // Check if rate was adjusted
  if (adjustedRate !== newRate) {
    return {
      valid: false,
      adjustedRate,
      message: `Rate adjusted to ${(adjustedRate * 100).toFixed(3)}% due to cap/floor constraints`,
    };
  }

  return { valid: true, adjustedRate };
}

/**
 * Check if rate is approaching cap or floor
 *
 * @param currentRate - Current variable rate (decimal)
 * @param rateCap - Maximum rate cap (decimal, optional)
 * @param rateFloor - Minimum rate floor (decimal, optional)
 * @param threshold - Threshold percentage for alert (default: 0.1 = 10%)
 * @returns Object indicating if rate is approaching limits
 */
export function checkRateApproachingLimits(
  currentRate: number,
  rateCap?: number | null,
  rateFloor?: number | null,
  threshold: number = 0.1
): {
  approachingCap: boolean;
  approachingFloor: boolean;
  distanceToCap?: number;
  distanceToFloor?: number;
} {
  let approachingCap = false;
  let approachingFloor = false;
  let distanceToCap: number | undefined;
  let distanceToFloor: number | undefined;

  if (rateCap !== null && rateCap !== undefined) {
    const maxRate = currentRate + rateCap;
    const distance = maxRate - currentRate;
    const thresholdAmount = rateCap * threshold;
    distanceToCap = distance;
    approachingCap = distance <= thresholdAmount;
  }

  if (rateFloor !== null && rateFloor !== undefined) {
    const distance = currentRate - rateFloor;
    const thresholdAmount = rateFloor * threshold;
    distanceToFloor = distance;
    approachingFloor = distance <= thresholdAmount;
  }

  return {
    approachingCap,
    approachingFloor,
    distanceToCap,
    distanceToFloor,
  };
}
