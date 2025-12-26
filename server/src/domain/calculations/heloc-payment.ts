/**
 * Calculate HELOC minimum payment based on payment type
 *
 * @param balance - Current HELOC balance
 * @param annualRate - Annual interest rate (decimal, e.g., 0.05 for 5%)
 * @param paymentType - Payment type: "interest_only" or "principal_plus_interest"
 * @param amortizationMonths - Amortization period in months (for principal+interest, default: 300 months / 25 years)
 * @returns Minimum payment amount
 */
export function calculateHelocMinimumPayment(
  balance: number,
  annualRate: number,
  paymentType: "interest_only" | "principal_plus_interest",
  amortizationMonths: number = 300 // 25 years default for HELOC repayment period
): number {
  if (balance <= 0 || annualRate < 0) {
    return 0;
  }

  if (paymentType === "interest_only") {
    // Interest-only payment: balance * (rate / 12)
    return balance * (annualRate / 12);
  }

  // Principal + Interest payment: Use standard amortization formula
  // P = (r * PV) / (1 - (1 + r)^(-n))
  // where:
  // P = payment
  // r = monthly rate
  // PV = present value (balance)
  // n = number of payments (months)

  const monthlyRate = annualRate / 12;

  if (monthlyRate === 0) {
    // If rate is 0, just divide balance by months
    return balance / amortizationMonths;
  }

  const payment = (monthlyRate * balance) / (1 - Math.pow(1 + monthlyRate, -amortizationMonths));

  // Round to nearest cent
  return Math.round(payment * 100) / 100;
}

/**
 * Calculate HELOC payment breakdown (principal and interest)
 *
 * @param balance - Current HELOC balance
 * @param paymentAmount - Payment amount made
 * @param annualRate - Annual interest rate (decimal)
 * @returns Object with interest portion and principal portion
 */
export function calculateHelocPaymentBreakdown(
  balance: number,
  paymentAmount: number,
  annualRate: number
): { interestPortion: number; principalPortion: number } {
  if (balance <= 0 || annualRate < 0) {
    return { interestPortion: 0, principalPortion: 0 };
  }

  const monthlyRate = annualRate / 12;
  const interestPortion = balance * monthlyRate;
  const principalPortion = Math.max(0, paymentAmount - interestPortion);

  return {
    interestPortion: Math.round(interestPortion * 100) / 100,
    principalPortion: Math.round(principalPortion * 100) / 100,
  };
}
