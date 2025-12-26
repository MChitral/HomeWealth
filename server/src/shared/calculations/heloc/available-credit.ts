/**
 * HELOC Available Credit Calculations
 *
 * Available credit = Credit Limit - Current Balance
 */

/**
 * Calculate available credit (how much can be borrowed)
 *
 * @param creditLimit - Total credit limit
 * @param currentBalance - Current HELOC balance
 * @returns Available credit amount (cannot be negative)
 */
export function calculateAvailableCredit(creditLimit: number, currentBalance: number): number {
  return Math.max(0, creditLimit - currentBalance);
}

/**
 * Calculate credit utilization percentage
 *
 * @param currentBalance - Current HELOC balance
 * @param creditLimit - Total credit limit
 * @returns Utilization percentage (0-100)
 */
export function calculateCreditUtilization(currentBalance: number, creditLimit: number): number {
  if (creditLimit === 0) return 0;
  return Math.min(100, (currentBalance / creditLimit) * 100);
}
