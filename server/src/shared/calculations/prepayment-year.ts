/**
 * Determine which prepayment year a payment date belongs to
 *
 * If prepaymentLimitResetDate is set, use anniversary-based year (resets on anniversary date)
 * If prepaymentLimitResetDate is null, use calendar year (resets on January 1st)
 *
 * @param paymentDate - Date of the payment
 * @param prepaymentLimitResetDate - Anniversary date for reset (null = calendar year)
 * @param mortgageStartDate - Start date of the mortgage (used to calculate anniversary)
 * @returns Year identifier for prepayment tracking
 */
export function getPrepaymentYear(
  paymentDate: string | Date,
  prepaymentLimitResetDate: string | null | undefined,
  mortgageStartDate: string | Date
): string {
  const payment = typeof paymentDate === "string" ? new Date(paymentDate) : paymentDate;
  const startDate =
    typeof mortgageStartDate === "string" ? new Date(mortgageStartDate) : mortgageStartDate;

  // If no reset date specified, use calendar year
  if (!prepaymentLimitResetDate) {
    return `calendar-${payment.getFullYear()}`;
  }

  // Use anniversary-based year
  const resetDate = new Date(prepaymentLimitResetDate);
  const resetMonth = resetDate.getMonth();
  const resetDay = resetDate.getDate();

  // Calculate which anniversary year this payment falls into
  const paymentYear = payment.getFullYear();
  const paymentMonth = payment.getMonth();
  const paymentDay = payment.getDate();

  // If payment is before the reset date in the current year, it belongs to previous year
  if (paymentMonth < resetMonth || (paymentMonth === resetMonth && paymentDay < resetDay)) {
    return `anniversary-${paymentYear - 1}`;
  }

  return `anniversary-${paymentYear}`;
}

/**
 * Get the start and end dates for a prepayment year
 *
 * @param prepaymentYear - Year identifier from getPrepaymentYear
 * @param prepaymentLimitResetDate - Anniversary date for reset (null = calendar year)
 * @param mortgageStartDate - Start date of the mortgage
 * @returns Object with start and end dates for the prepayment year
 */
export function getPrepaymentYearDates(
  prepaymentYear: string,
  prepaymentLimitResetDate: string | null | undefined,
  mortgageStartDate: string | Date
): { startDate: Date; endDate: Date } {
  if (!prepaymentLimitResetDate) {
    // Calendar year
    const year = parseInt(prepaymentYear.replace("calendar-", ""));
    return {
      startDate: new Date(year, 0, 1), // January 1
      endDate: new Date(year, 11, 31, 23, 59, 59), // December 31
    };
  }

  // Anniversary year
  const year = parseInt(prepaymentYear.replace("anniversary-", ""));
  const resetDate = new Date(prepaymentLimitResetDate);
  const resetMonth = resetDate.getMonth();
  const resetDay = resetDate.getDate();

  return {
    startDate: new Date(year, resetMonth, resetDay),
    endDate: new Date(year + 1, resetMonth, resetDay, 23, 59, 59),
  };
}
