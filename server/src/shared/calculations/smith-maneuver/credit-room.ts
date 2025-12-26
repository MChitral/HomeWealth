/**
 * Credit Room Calculations
 * Calculate HELOC credit room increases from mortgage prepayments
 */

/**
 * Calculate credit room increase from a prepayment
 *
 * @param prepaymentAmount - Amount of prepayment made
 * @param mortgageBalance - Current mortgage balance before prepayment
 * @param homeValue - Current home value
 * @param maxLtvPercent - Maximum LTV percentage for HELOC (e.g., 65.0 for 65%)
 * @returns Credit room increase amount
 */
export function calculateCreditRoomIncrease(
  prepaymentAmount: number,
  mortgageBalance: number,
  homeValue: number,
  maxLtvPercent: number
): number {
  // Credit limit = (Home Value × Max LTV) - Mortgage Balance
  // Credit room increase = prepayment amount (since it directly reduces mortgage balance)

  // However, we need to ensure we don't exceed the maximum LTV
  const maxCreditLimit = (homeValue * maxLtvPercent) / 100;
  const currentCreditLimit = Math.max(0, maxCreditLimit - mortgageBalance);
  const newCreditLimit = Math.max(0, maxCreditLimit - (mortgageBalance - prepaymentAmount));

  // Credit room increase is the difference
  const creditRoomIncrease = newCreditLimit - currentCreditLimit;

  // Credit room increase cannot exceed prepayment amount
  return Math.min(creditRoomIncrease, prepaymentAmount);
}

/**
 * Calculate available credit after a prepayment
 *
 * @param currentAvailableCredit - Current available credit
 * @param creditRoomIncrease - Credit room increase from prepayment
 * @param helocBalance - Current HELOC balance
 * @param creditLimit - HELOC credit limit
 * @returns New available credit
 */
export function calculateAvailableCreditAfterPrepayment(
  currentAvailableCredit: number,
  creditRoomIncrease: number,
  helocBalance: number,
  creditLimit: number
): number {
  const newCreditLimit = creditLimit + creditRoomIncrease;
  const newAvailableCredit = newCreditLimit - helocBalance;

  return Math.max(0, newAvailableCredit);
}
