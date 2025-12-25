/**
 * Risk Metrics Calculations
 * Calculate leverage risk indicators for Smith Maneuver
 */

/**
 * Calculate leverage ratio
 * 
 * Leverage Ratio = HELOC Balance / Investment Portfolio Value
 * 
 * Higher ratio = higher risk
 * - Ratio > 2.0: High risk
 * - Ratio 1.0-2.0: Moderate risk
 * - Ratio < 1.0: Lower risk
 * 
 * @param helocBalance - Current HELOC balance
 * @param investmentValue - Current investment portfolio value
 * @returns Leverage ratio
 */
export function calculateLeverageRatio(helocBalance: number, investmentValue: number): number {
  if (investmentValue === 0) {
    return helocBalance > 0 ? Infinity : 0;
  }
  return helocBalance / investmentValue;
}

/**
 * Calculate interest coverage ratio
 * 
 * Interest Coverage = Investment Income / HELOC Interest
 * 
 * Measures ability to cover interest payments from investment income
 * - Coverage > 1.5: Strong coverage
 * - Coverage 1.0-1.5: Adequate coverage
 * - Coverage < 1.0: Insufficient coverage (risk)
 * 
 * @param investmentIncome - Annual investment income (dividends, interest)
 * @param helocInterest - Annual HELOC interest
 * @returns Interest coverage ratio
 */
export function calculateInterestCoverage(
  investmentIncome: number,
  helocInterest: number
): number {
  if (helocInterest === 0) {
    return investmentIncome > 0 ? Infinity : 0;
  }
  return investmentIncome / helocInterest;
}

/**
 * Calculate debt-to-equity ratio
 * 
 * Debt-to-Equity = HELOC Balance / (Investment Value - HELOC Balance)
 * 
 * @param helocBalance - Current HELOC balance
 * @param investmentValue - Current investment portfolio value
 * @returns Debt-to-equity ratio
 */
export function calculateDebtToEquityRatio(helocBalance: number, investmentValue: number): number {
  const equity = investmentValue - helocBalance;
  if (equity <= 0) {
    return helocBalance > 0 ? Infinity : 0;
  }
  return helocBalance / equity;
}

/**
 * Assess risk level based on leverage ratio
 * 
 * @param leverageRatio - Leverage ratio
 * @returns Risk level: 'low' | 'moderate' | 'high'
 */
export function assessLeverageRisk(leverageRatio: number): "low" | "moderate" | "high" {
  if (leverageRatio < 1.0) {
    return "low";
  } else if (leverageRatio <= 2.0) {
    return "moderate";
  } else {
    return "high";
  }
}

/**
 * Assess interest coverage risk
 * 
 * @param interestCoverage - Interest coverage ratio
 * @returns Risk level: 'low' | 'moderate' | 'high'
 */
export function assessInterestCoverageRisk(
  interestCoverage: number
): "low" | "moderate" | "high" {
  if (interestCoverage >= 1.5) {
    return "low";
  } else if (interestCoverage >= 1.0) {
    return "moderate";
  } else {
    return "high";
  }
}

