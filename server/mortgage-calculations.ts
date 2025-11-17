/**
 * Canadian Mortgage Calculation Engine
 * 
 * Key Canadian Mortgage Specifics:
 * - Semi-annual compounding (not monthly like US)
 * - Payment frequency affects effective rate
 * - Term (3-5 years) vs Amortization (25-30 years)
 */

export type PaymentFrequency = 
  | 'monthly'           // 12 payments/year
  | 'semi-monthly'      // 24 payments/year
  | 'biweekly'          // 26 payments/year
  | 'accelerated-biweekly'  // 26 payments/year, pays off faster
  | 'weekly'            // 52 payments/year
  | 'accelerated-weekly';   // 52 payments/year, pays off faster

/**
 * Get number of payments per year for a given frequency
 */
export function getPaymentsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'monthly': return 12;
    case 'semi-monthly': return 24;
    case 'biweekly': return 26;
    case 'accelerated-biweekly': return 26;
    case 'weekly': return 52;
    case 'accelerated-weekly': return 52;
  }
}

/**
 * Convert annual nominal rate to effective periodic rate for Canadian mortgages
 * 
 * Canadian mortgages use semi-annual compounding:
 * 1. Convert annual rate to semi-annual effective rate
 * 2. Convert semi-annual rate to payment frequency rate
 * 
 * @param annualRate - Annual nominal interest rate (e.g., 0.0549 for 5.49%)
 * @param frequency - Payment frequency
 * @returns Effective rate per payment period
 */
export function getEffectivePeriodicRate(annualRate: number, frequency: PaymentFrequency): number {
  // Step 1: Convert annual rate to semi-annual effective rate
  const semiAnnualRate = annualRate / 2;
  
  // Step 2: Calculate effective annual rate from semi-annual compounding
  // EAR = (1 + r/2)^2 - 1
  const effectiveAnnualRate = Math.pow(1 + semiAnnualRate, 2) - 1;
  
  // Step 3: Convert to periodic rate based on payment frequency
  // Always use the correct rate for the payment frequency (26 or 52 periods)
  // The accelerated AMOUNT is handled separately in calculatePayment()
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const effectivePeriodicRate = Math.pow(1 + effectiveAnnualRate, 1/paymentsPerYear) - 1;
  
  return effectivePeriodicRate;
}

/**
 * Calculate mortgage payment amount using Canadian semi-annual compounding
 * 
 * @param principal - Loan amount
 * @param annualRate - Annual nominal interest rate (e.g., 0.0549 for 5.49%)
 * @param amortizationMonths - Total amortization period in months
 * @param frequency - Payment frequency
 * @returns Payment amount per period
 */
export function calculatePayment(
  principal: number,
  annualRate: number,
  amortizationMonths: number,
  frequency: PaymentFrequency
): number {
  const periodicRate = getEffectivePeriodicRate(annualRate, frequency);
  const paymentsPerYear = getPaymentsPerYear(frequency);
  
  // Calculate total number of payments
  const totalPayments = (amortizationMonths / 12) * paymentsPerYear;
  
  // Handle accelerated payments
  if (frequency === 'accelerated-biweekly') {
    // Accelerated bi-weekly: take monthly payment and divide by 2
    const monthlyPayment = calculateMonthlyPayment(principal, annualRate, amortizationMonths);
    return monthlyPayment / 2;
  }
  
  if (frequency === 'accelerated-weekly') {
    // Accelerated weekly: take monthly payment and divide by 4
    const monthlyPayment = calculateMonthlyPayment(principal, annualRate, amortizationMonths);
    return monthlyPayment / 4;
  }
  
  // Standard payment calculation: P = (r * PV) / (1 - (1 + r)^-n)
  if (periodicRate === 0) {
    return principal / totalPayments;
  }
  
  const payment = (periodicRate * principal) / (1 - Math.pow(1 + periodicRate, -totalPayments));
  
  return payment;
}

/**
 * Calculate monthly payment (used for accelerated calculations)
 */
function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  amortizationMonths: number
): number {
  const periodicRate = getEffectivePeriodicRate(annualRate, 'monthly');
  
  if (periodicRate === 0) {
    return principal / amortizationMonths;
  }
  
  const payment = (periodicRate * principal) / (1 - Math.pow(1 + periodicRate, -amortizationMonths));
  
  return payment;
}

/**
 * Calculate interest portion of a payment
 * 
 * @param remainingBalance - Current principal balance
 * @param annualRate - Annual nominal interest rate
 * @param frequency - Payment frequency
 * @returns Interest amount for this payment
 */
export function calculateInterestPayment(
  remainingBalance: number,
  annualRate: number,
  frequency: PaymentFrequency
): number {
  const periodicRate = getEffectivePeriodicRate(annualRate, frequency);
  return remainingBalance * periodicRate;
}

/**
 * Calculate principal portion of a payment
 * 
 * @param paymentAmount - Total payment amount
 * @param interestAmount - Interest portion of payment
 * @returns Principal amount for this payment
 */
export function calculatePrincipalPayment(
  paymentAmount: number,
  interestAmount: number
): number {
  return paymentAmount - interestAmount;
}

/**
 * Calculate remaining balance after a payment
 * 
 * @param currentBalance - Current principal balance
 * @param principalPayment - Principal portion of payment
 * @param extraPrepayment - Additional prepayment amount
 * @returns New remaining balance
 */
export function calculateRemainingBalance(
  currentBalance: number,
  principalPayment: number,
  extraPrepayment: number = 0
): number {
  return Math.max(0, currentBalance - principalPayment - extraPrepayment);
}

/**
 * Calculate remaining amortization in months
 * 
 * @param remainingBalance - Current principal balance
 * @param paymentAmount - Regular payment amount
 * @param annualRate - Annual nominal interest rate
 * @param frequency - Payment frequency
 * @returns Remaining amortization in months, or -1 if trigger rate hit (payment <= interest)
 */
export function calculateRemainingAmortization(
  remainingBalance: number,
  paymentAmount: number,
  annualRate: number,
  frequency: PaymentFrequency
): number {
  const periodicRate = getEffectivePeriodicRate(annualRate, frequency);
  
  if (periodicRate === 0) {
    const paymentsPerYear = getPaymentsPerYear(frequency);
    const remainingPayments = remainingBalance / paymentAmount;
    return (remainingPayments / paymentsPerYear) * 12;
  }
  
  // Check for trigger rate condition: payment <= interest only
  const interestOnlyPayment = remainingBalance * periodicRate;
  if (paymentAmount <= interestOnlyPayment) {
    // Trigger rate hit - payment doesn't cover interest, amortization is undefined
    return -1;
  }
  
  // Calculate number of payments: n = -log(1 - (r * PV / P)) / log(1 + r)
  const remainingPayments = -Math.log(1 - (periodicRate * remainingBalance / paymentAmount)) / Math.log(1 + periodicRate);
  
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const remainingMonths = (remainingPayments / paymentsPerYear) * 12;
  
  return Math.round(remainingMonths);
}

/**
 * Calculate trigger rate for VRM-Fixed Payment
 * 
 * Trigger rate is the rate at which the payment no longer covers interest
 * 
 * @param paymentAmount - Fixed payment amount
 * @param remainingBalance - Current principal balance
 * @param frequency - Payment frequency
 * @returns Trigger rate (as decimal, e.g., 0.065 for 6.5%)
 */
export function calculateTriggerRate(
  paymentAmount: number,
  remainingBalance: number,
  frequency: PaymentFrequency
): number {
  const paymentsPerYear = getPaymentsPerYear(frequency);
  
  // At trigger rate: payment = interest
  // payment = balance * periodicRate
  // periodicRate = payment / balance
  const periodicRate = paymentAmount / remainingBalance;
  
  // Convert periodic rate back to annual nominal rate
  // This is the reverse of getEffectivePeriodicRate
  const effectiveAnnualRate = Math.pow(1 + periodicRate, paymentsPerYear) - 1;
  
  // Convert effective annual to nominal semi-annual
  const semiAnnualRate = Math.pow(1 + effectiveAnnualRate, 1/2) - 1;
  const nominalAnnualRate = semiAnnualRate * 2;
  
  return nominalAnnualRate;
}

/**
 * Check if trigger rate has been hit for VRM-Fixed Payment
 * 
 * @param currentRate - Current effective rate
 * @param paymentAmount - Fixed payment amount
 * @param remainingBalance - Current principal balance
 * @param frequency - Payment frequency
 * @returns true if trigger rate has been hit
 */
export function isTriggerRateHit(
  currentRate: number,
  paymentAmount: number,
  remainingBalance: number,
  frequency: PaymentFrequency
): boolean {
  const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
  return currentRate >= triggerRate;
}

/**
 * Validate prepayment against annual limit
 * 
 * @param prepaymentAmount - Proposed prepayment amount
 * @param yearToDatePrepayments - Total prepayments made this year so far
 * @param originalMortgageAmount - Original mortgage amount
 * @param annualLimitPercent - Lender's annual prepayment limit (e.g., 20 for 20%)
 * @returns true if prepayment is within limits
 */
export function isWithinPrepaymentLimit(
  prepaymentAmount: number,
  yearToDatePrepayments: number,
  originalMortgageAmount: number,
  annualLimitPercent: number
): boolean {
  const maxAnnualPrepayment = (originalMortgageAmount * annualLimitPercent) / 100;
  const totalWithProposed = yearToDatePrepayments + prepaymentAmount;
  return totalWithProposed <= maxAnnualPrepayment;
}

/**
 * Convert months to years and months display
 * 
 * @param months - Total months
 * @returns Object with years and months
 */
export function monthsToYearsAndMonths(months: number): { years: number; months: number } {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return { years, months: remainingMonths };
}
