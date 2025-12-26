import {
  calculateDailyInterest,
  calculateMonthlyInterest,
  calculateAccruedInterest,
} from "@server-shared/calculations/heloc/interest";

/**
 * HELOC Interest Service
 * Handles interest calculations for HELOC accounts
 */
export class HelocInterestService {
  /**
   * Calculate accrued interest for a period
   */
  calculateAccruedInterestForPeriod(
    balance: number,
    primeRate: number,
    spread: number,
    startDate: Date,
    endDate: Date
  ): number {
    return calculateAccruedInterest(balance, primeRate, spread, startDate, endDate);
  }

  /**
   * Calculate daily interest
   */
  calculateDailyInterest(balance: number, primeRate: number, spread: number): number {
    return calculateDailyInterest(balance, primeRate, spread);
  }

  /**
   * Calculate monthly interest
   */
  calculateMonthlyInterest(
    balance: number,
    primeRate: number,
    spread: number,
    daysInMonth: number
  ): number {
    return calculateMonthlyInterest(balance, primeRate, spread, daysInMonth);
  }

  /**
   * Calculate interest-only payment (minimum payment)
   */
  calculateInterestOnlyPayment(
    balance: number,
    primeRate: number,
    spread: number,
    daysInPeriod: number
  ): number {
    return calculateMonthlyInterest(balance, primeRate, spread, daysInPeriod);
  }

  /**
   * Get current interest rate (Prime + Spread)
   */
  getCurrentInterestRate(primeRate: number, spread: number): number {
    return primeRate + spread;
  }
}
