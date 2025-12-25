/**
 * HELOC Interest Calculations
 * 
 * HELOC interest is calculated daily and compounds monthly.
 * Rate structure: Prime + Spread (variable rate)
 */

/**
 * Calculate daily interest on HELOC balance
 * 
 * @param balance - Current HELOC balance
 * @param primeRate - Bank of Canada Prime Rate (as percentage, e.g., 6.45)
 * @param spread - Interest rate spread (as percentage, e.g., 0.5 for Prime + 0.5%)
 * @returns Daily interest amount
 */
export function calculateDailyInterest(
  balance: number,
  primeRate: number,
  spread: number
): number {
  const annualRate = (primeRate + spread) / 100;
  const dailyRate = annualRate / 365;
  return balance * dailyRate;
}

/**
 * Calculate monthly interest on HELOC balance
 * 
 * @param balance - Current HELOC balance
 * @param primeRate - Bank of Canada Prime Rate (as percentage)
 * @param spread - Interest rate spread (as percentage)
 * @param daysInMonth - Number of days in the month
 * @returns Monthly interest amount
 */
export function calculateMonthlyInterest(
  balance: number,
  primeRate: number,
  spread: number,
  daysInMonth: number
): number {
  const dailyInterest = calculateDailyInterest(balance, primeRate, spread);
  return dailyInterest * daysInMonth;
}

/**
 * Calculate accrued interest for a specific period
 * 
 * @param balance - HELOC balance during the period
 * @param primeRate - Prime rate during the period
 * @param spread - Interest rate spread
 * @param startDate - Start date of the period
 * @param endDate - End date of the period
 * @returns Accrued interest for the period
 */
export function calculateAccruedInterest(
  balance: number,
  primeRate: number,
  spread: number,
  startDate: Date,
  endDate: Date
): number {
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const dailyInterest = calculateDailyInterest(balance, primeRate, spread);
  return dailyInterest * daysDiff;
}

/**
 * Calculate interest-only payment (minimum payment)
 * 
 * @param balance - Current HELOC balance
 * @param primeRate - Current Prime Rate
 * @param spread - Interest rate spread
 * @param daysInPeriod - Number of days in the payment period
 * @returns Minimum interest-only payment amount
 */
export function calculateInterestOnlyPayment(
  balance: number,
  primeRate: number,
  spread: number,
  daysInPeriod: number
): number {
  return calculateMonthlyInterest(balance, primeRate, spread, daysInPeriod);
}

