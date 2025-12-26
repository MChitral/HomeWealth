/**
 * Client-side utility functions for HELOC
 * These are simple data manipulation functions, not financial calculations.
 * Financial calculations should be done on the server via API.
 */

/**
 * Calculate available credit (how much can be borrowed)
 * This is a simple subtraction, but for consistency with server-side calculations,
 * we keep it as a utility function.
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
 * This is a simple percentage calculation for display purposes.
 *
 * @param currentBalance - Current HELOC balance
 * @param creditLimit - Total credit limit
 * @returns Utilization percentage (0-100)
 */
export function calculateCreditUtilization(currentBalance: number, creditLimit: number): number {
  if (creditLimit === 0) return 0;
  return Math.min(100, (currentBalance / creditLimit) * 100);
}
