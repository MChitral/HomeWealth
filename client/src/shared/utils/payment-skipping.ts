/**
 * Client-side utility functions for payment skipping
 * These are simple data manipulation functions, not financial calculations.
 * Financial calculations should be done on the server via API.
 */

/**
 * Count skipped payments in a given year
 * This is a simple filter/count operation, not a financial calculation.
 *
 * @param payments - Array of payments with isSkipped flag
 * @param year - Year to count (defaults to current year)
 * @returns Number of skipped payments in the year
 */
export function countSkippedPaymentsInYear(
  payments: Array<{ paymentDate: string | Date; isSkipped: number | boolean }>,
  year?: number
): number {
  const targetYear = year ?? new Date().getFullYear();

  return payments.filter((payment) => {
    const paymentDate = new Date(payment.paymentDate);
    const isSkipped =
      typeof payment.isSkipped === "boolean" ? payment.isSkipped : payment.isSkipped === 1;

    return paymentDate.getFullYear() === targetYear && isSkipped;
  }).length;
}

/**
 * Check if a payment can be skipped based on skip limit
 * This is a simple business rule check, not a financial calculation.
 *
 * @param skippedPaymentsThisYear - Number of payments already skipped this calendar year
 * @param maxSkipsPerYear - Maximum allowed skips per year (default: 2)
 * @returns True if payment can be skipped
 */
export function canSkipPayment(
  skippedPaymentsThisYear: number,
  maxSkipsPerYear: number = 2
): boolean {
  return skippedPaymentsThisYear < maxSkipsPerYear;
}
