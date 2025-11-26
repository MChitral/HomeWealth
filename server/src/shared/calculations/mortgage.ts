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

/**
 * Payment schedule entry for amortization table
 */
export interface AmortizationPayment {
  paymentNumber: number;
  paymentDate: Date;
  paymentAmount: number;
  principalPayment: number;
  interestPayment: number;
  extraPrepayment: number;
  totalPrincipalPayment: number; // principal + prepayment
  remainingBalance: number;
  remainingAmortizationMonths: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
  cumulativePrepayments: number;
  triggerRateHit: boolean; // VRM-Fixed Payment only
  effectiveRate: number; // Current rate (may change for VRM)
}

/**
 * Amortization schedule summary
 */
export interface AmortizationSchedule {
  payments: AmortizationPayment[];
  summary: {
    totalPayments: number;
    totalPrincipal: number;
    totalInterest: number;
    totalPrepayments: number;
    totalCost: number;
    payoffDate: Date | null;
    payoffPaymentNumber: number | null;
    averageAmortizationMonths: number;
  };
}

/**
 * Prepayment event definition for schedule generation
 */
export interface PrepaymentEvent {
  type: 'annual' | 'one-time' | 'monthly-percent';
  amount: number;
  startPaymentNumber: number;
  recurrenceMonth?: number; // 1-12 for annual events
  monthlyPercent?: number; // For monthly-percent type
}

/**
 * Term renewal definition for variable rate mortgages
 */
export interface TermRenewal {
  startPaymentNumber: number;
  newRate: number;
  newPaymentAmount?: number; // For VRM-Fixed, this stays same; for VRM-Changing, recalculated
}

/**
 * Generate complete amortization schedule with prepayments
 * 
 * @param principal - Initial loan amount
 * @param annualRate - Annual nominal interest rate
 * @param amortizationMonths - Total amortization period in months
 * @param frequency - Payment frequency
 * @param startDate - Mortgage start date
 * @param prepayments - Array of prepayment events
 * @param termRenewals - Array of term renewals (for VRM rate changes)
 * @param maxPayments - Maximum number of payments to generate (default 600 = 50 years monthly)
 * @returns Complete amortization schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  amortizationMonths: number,
  frequency: PaymentFrequency,
  startDate: Date,
  prepayments: PrepaymentEvent[] = [],
  termRenewals: TermRenewal[] = [],
  maxPayments: number = 600
): AmortizationSchedule {
  const payments: AmortizationPayment[] = [];
  const paymentsPerYear = getPaymentsPerYear(frequency);
  
  let remainingBalance = principal;
  let currentRate = annualRate;
  let basePaymentAmount = calculatePayment(principal, annualRate, amortizationMonths, frequency);
  let currentPaymentAmount = basePaymentAmount;
  
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  let cumulativePrepayments = 0;
  
  let paymentNumber = 1;
  let currentDate = new Date(startDate);
  let totalRemainingAmortizationMonths = 0;
  let triggerRatePaymentCount = 0;
  
  // Advance payment date using calendar-aware math
  const advancePaymentDate = (date: Date): Date => {
    const newDate = new Date(date);
    switch (frequency) {
      case 'monthly': {
        // Add 1 month, clamping to last valid day of target month
        const originalDay = newDate.getDate();
        const originalMonth = newDate.getMonth();
        const originalYear = newDate.getFullYear();
        
        // Calculate target month/year (handle year rollover)
        const targetMonth = (originalMonth + 1) % 12;
        const targetYear = originalMonth === 11 ? originalYear + 1 : originalYear;
        
        // Get last day of target month BEFORE creating new date
        const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        
        // Clamp original day to valid range
        const clampedDay = Math.min(originalDay, lastDayOfTargetMonth);
        
        // Create new date with target month/year and clamped day
        return new Date(targetYear, targetMonth, clampedDay);
      }
      case 'semi-monthly':
        // Add 15 days (2 payments per month)
        newDate.setDate(newDate.getDate() + 15);
        return newDate;
      case 'biweekly':
      case 'accelerated-biweekly':
        // Add 14 days (every 2 weeks)
        newDate.setDate(newDate.getDate() + 14);
        return newDate;
      case 'weekly':
      case 'accelerated-weekly':
        // Add 7 days (every week)
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
    }
  };
  
  while (remainingBalance > 0.01 && paymentNumber <= maxPayments) {
    // Check for term renewal (rate change)
    const renewal = termRenewals.find(r => r.startPaymentNumber === paymentNumber);
    if (renewal) {
      currentRate = renewal.newRate;
      if (renewal.newPaymentAmount !== undefined) {
        // VRM-Fixed Payment: payment stays same
        currentPaymentAmount = renewal.newPaymentAmount;
      } else {
        // VRM-Changing Payment or Fixed renewal: recalculate payment
        const remainingAmortMonths = calculateRemainingAmortization(
          remainingBalance,
          basePaymentAmount,
          currentRate,
          frequency
        );
        if (remainingAmortMonths > 0) {
          currentPaymentAmount = calculatePayment(
            remainingBalance,
            currentRate,
            remainingAmortMonths,
            frequency
          );
          basePaymentAmount = currentPaymentAmount;
        }
      }
    }
    
    // Calculate interest for this payment
    const interestPayment = calculateInterestPayment(remainingBalance, currentRate, frequency);
    
    // Check if trigger rate hit (for VRM-Fixed Payment)
    const triggerRateHit = currentPaymentAmount <= interestPayment;
    
    // Calculate principal payment
    const principalPayment = Math.min(
      calculatePrincipalPayment(currentPaymentAmount, interestPayment),
      remainingBalance
    );
    
    // Calculate prepayments for this payment
    let extraPrepayment = 0;
    
    // Process monthly-percent prepayments
    const monthlyPercentPrepayments = prepayments.filter(
      p => p.type === 'monthly-percent' && paymentNumber >= p.startPaymentNumber
    );
    for (const prep of monthlyPercentPrepayments) {
      if (prep.monthlyPercent) {
        // Apply percentage of regular payment as extra prepayment
        extraPrepayment += (currentPaymentAmount * prep.monthlyPercent) / 100;
      }
    }
    
    // Process one-time prepayments
    const oneTimePrepayments = prepayments.filter(
      p => p.type === 'one-time' && p.startPaymentNumber === paymentNumber
    );
    for (const prep of oneTimePrepayments) {
      extraPrepayment += prep.amount;
    }
    
    // Process annual prepayments (check if this payment matches the recurrence month)
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const annualPrepayments = prepayments.filter(
      p => p.type === 'annual' && 
          paymentNumber >= p.startPaymentNumber && 
          p.recurrenceMonth === currentMonth
    );
    for (const prep of annualPrepayments) {
      // Check if this is the first occurrence this year
      const yearsSinceStart = Math.floor((paymentNumber - prep.startPaymentNumber) / paymentsPerYear);
      const expectedPaymentForThisYear = prep.startPaymentNumber + (yearsSinceStart * paymentsPerYear);
      
      // Apply only if this is roughly the right payment for this year
      if (Math.abs(paymentNumber - expectedPaymentForThisYear) < paymentsPerYear / 12) {
        extraPrepayment += prep.amount;
      }
    }
    
    // Cap prepayment to remaining balance
    extraPrepayment = Math.min(extraPrepayment, remainingBalance - principalPayment);
    
    const totalPrincipalPayment = principalPayment + extraPrepayment;
    
    // Update balance
    remainingBalance = calculateRemainingBalance(remainingBalance, principalPayment, extraPrepayment);
    
    // Update cumulative totals (include prepayments in principal total)
    cumulativePrincipal += totalPrincipalPayment; // Includes both scheduled + extra
    cumulativeInterest += interestPayment;
    cumulativePrepayments += extraPrepayment;
    
    // Calculate remaining amortization
    let remainingAmortMonths = 0;
    if (remainingBalance > 0.01) {
      remainingAmortMonths = calculateRemainingAmortization(
        remainingBalance,
        currentPaymentAmount,
        currentRate,
        frequency
      );
      if (remainingAmortMonths < 0) {
        // Trigger rate hit, amortization undefined
        triggerRatePaymentCount++;
        remainingAmortMonths = -1; // Keep as sentinel, don't include in average
      } else {
        totalRemainingAmortizationMonths += remainingAmortMonths;
      }
    }
    
    // Create payment entry
    payments.push({
      paymentNumber,
      paymentDate: new Date(currentDate),
      paymentAmount: currentPaymentAmount,
      principalPayment,
      interestPayment,
      extraPrepayment,
      totalPrincipalPayment,
      remainingBalance: Math.max(0, remainingBalance),
      remainingAmortizationMonths: remainingAmortMonths,
      cumulativePrincipal,
      cumulativeInterest,
      cumulativePrepayments,
      triggerRateHit,
      effectiveRate: currentRate,
    });
    
    // Move to next payment date
    currentDate = advancePaymentDate(currentDate);
    paymentNumber++;
  }
  
  // Calculate summary
  const lastPayment = payments[payments.length - 1];
  const payoffDate = lastPayment && lastPayment.remainingBalance < 0.01 
    ? lastPayment.paymentDate 
    : null;
  const payoffPaymentNumber = payoffDate ? lastPayment.paymentNumber : null;
  
  // Average amortization excluding trigger-rate payments
  const validPaymentCount = payments.length - triggerRatePaymentCount;
  const averageAmortizationMonths = validPaymentCount > 0 
    ? totalRemainingAmortizationMonths / validPaymentCount
    : 0;
  
  return {
    payments,
    summary: {
      totalPayments: payments.length,
      totalPrincipal: cumulativePrincipal,
      totalInterest: cumulativeInterest,
      totalPrepayments: cumulativePrepayments,
      totalCost: cumulativePrincipal + cumulativeInterest,
      payoffDate,
      payoffPaymentNumber,
      averageAmortizationMonths,
    },
  };
}

/**
 * Generate amortization schedule with a FIXED payment amount
 * 
 * This variant uses the user's actual payment amount instead of recalculating.
 * Useful for projections where the mortgage payment is already known.
 * 
 * @param principal - Current loan balance (not original amount)
 * @param annualRate - Annual nominal interest rate
 * @param amortizationMonths - Remaining amortization period in months (used for prepayment calculations)
 * @param frequency - Payment frequency
 * @param startDate - Projection start date
 * @param fixedPaymentAmount - The actual payment amount to use (not recalculated)
 * @param prepayments - Array of prepayment events
 * @param termRenewals - Array of term renewals (for VRM rate changes)
 * @param maxPayments - Maximum number of payments to generate
 * @returns Complete amortization schedule
 */
export function generateAmortizationScheduleWithPayment(
  principal: number,
  annualRate: number,
  amortizationMonths: number,
  frequency: PaymentFrequency,
  startDate: Date,
  fixedPaymentAmount: number,
  prepayments: PrepaymentEvent[] = [],
  termRenewals: TermRenewal[] = [],
  maxPayments: number = 600
): AmortizationSchedule {
  const payments: AmortizationPayment[] = [];
  const paymentsPerYear = getPaymentsPerYear(frequency);
  
  let remainingBalance = principal;
  let currentRate = annualRate;
  let currentPaymentAmount = fixedPaymentAmount;
  
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  let cumulativePrepayments = 0;
  
  let paymentNumber = 1;
  let currentDate = new Date(startDate);
  let totalRemainingAmortizationMonths = 0;
  let triggerRatePaymentCount = 0;
  
  // Advance payment date using calendar-aware math
  const advancePaymentDate = (date: Date): Date => {
    const newDate = new Date(date);
    switch (frequency) {
      case 'monthly': {
        const originalDay = newDate.getDate();
        const originalMonth = newDate.getMonth();
        const originalYear = newDate.getFullYear();
        const targetMonth = (originalMonth + 1) % 12;
        const targetYear = originalMonth === 11 ? originalYear + 1 : originalYear;
        const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const clampedDay = Math.min(originalDay, lastDayOfTargetMonth);
        return new Date(targetYear, targetMonth, clampedDay);
      }
      case 'semi-monthly':
        newDate.setDate(newDate.getDate() + 15);
        return newDate;
      case 'biweekly':
      case 'accelerated-biweekly':
        newDate.setDate(newDate.getDate() + 14);
        return newDate;
      case 'weekly':
      case 'accelerated-weekly':
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
    }
  };
  
  while (remainingBalance > 0.01 && paymentNumber <= maxPayments) {
    // Check for term renewal (rate change) - payment amount stays fixed
    const renewal = termRenewals.find(r => r.startPaymentNumber === paymentNumber);
    if (renewal) {
      currentRate = renewal.newRate;
      // For fixed payment projections, keep the payment amount the same unless explicitly changed
      if (renewal.newPaymentAmount !== undefined) {
        currentPaymentAmount = renewal.newPaymentAmount;
      }
    }
    
    // Calculate interest for this payment
    const interestPayment = calculateInterestPayment(remainingBalance, currentRate, frequency);
    
    // Check if trigger rate hit (payment doesn't cover interest)
    const triggerRateHit = currentPaymentAmount <= interestPayment;
    
    // Calculate principal payment
    const principalPayment = Math.min(
      calculatePrincipalPayment(currentPaymentAmount, interestPayment),
      remainingBalance
    );
    
    // Calculate prepayments for this payment
    let extraPrepayment = 0;
    
    // Process monthly-percent prepayments
    const monthlyPercentPrepayments = prepayments.filter(
      p => p.type === 'monthly-percent' && paymentNumber >= p.startPaymentNumber
    );
    for (const prep of monthlyPercentPrepayments) {
      if (prep.monthlyPercent) {
        extraPrepayment += (currentPaymentAmount * prep.monthlyPercent) / 100;
      }
    }
    
    // Process one-time prepayments
    const oneTimePrepayments = prepayments.filter(
      p => p.type === 'one-time' && p.startPaymentNumber === paymentNumber
    );
    for (const prep of oneTimePrepayments) {
      extraPrepayment += prep.amount;
    }
    
    // Process annual prepayments
    const currentMonth = currentDate.getMonth() + 1;
    const annualPrepayments = prepayments.filter(
      p => p.type === 'annual' && 
          paymentNumber >= p.startPaymentNumber && 
          p.recurrenceMonth === currentMonth
    );
    for (const prep of annualPrepayments) {
      const yearsSinceStart = Math.floor((paymentNumber - prep.startPaymentNumber) / paymentsPerYear);
      const expectedPaymentForThisYear = prep.startPaymentNumber + (yearsSinceStart * paymentsPerYear);
      if (Math.abs(paymentNumber - expectedPaymentForThisYear) < paymentsPerYear / 12) {
        extraPrepayment += prep.amount;
      }
    }
    
    // Cap prepayment to remaining balance
    extraPrepayment = Math.min(extraPrepayment, remainingBalance - principalPayment);
    
    const totalPrincipalPayment = principalPayment + extraPrepayment;
    
    // Update balance
    remainingBalance = calculateRemainingBalance(remainingBalance, principalPayment, extraPrepayment);
    
    // Update cumulative totals
    cumulativePrincipal += totalPrincipalPayment;
    cumulativeInterest += interestPayment;
    cumulativePrepayments += extraPrepayment;
    
    // Calculate remaining amortization
    let remainingAmortMonths = 0;
    if (remainingBalance > 0.01) {
      remainingAmortMonths = calculateRemainingAmortization(
        remainingBalance,
        currentPaymentAmount,
        currentRate,
        frequency
      );
      if (remainingAmortMonths < 0) {
        triggerRatePaymentCount++;
        remainingAmortMonths = -1;
      } else {
        totalRemainingAmortizationMonths += remainingAmortMonths;
      }
    }
    
    // Create payment entry
    payments.push({
      paymentNumber,
      paymentDate: new Date(currentDate),
      paymentAmount: currentPaymentAmount,
      principalPayment,
      interestPayment,
      extraPrepayment,
      totalPrincipalPayment,
      remainingBalance: Math.max(0, remainingBalance),
      remainingAmortizationMonths: remainingAmortMonths,
      cumulativePrincipal,
      cumulativeInterest,
      cumulativePrepayments,
      triggerRateHit,
      effectiveRate: currentRate,
    });
    
    // Move to next payment date
    currentDate = advancePaymentDate(currentDate);
    paymentNumber++;
  }
  
  // Calculate summary
  const lastPayment = payments[payments.length - 1];
  const payoffDate = lastPayment && lastPayment.remainingBalance < 0.01 
    ? lastPayment.paymentDate 
    : null;
  const payoffPaymentNumber = payoffDate ? lastPayment.paymentNumber : null;
  
  const validPaymentCount = payments.length - triggerRatePaymentCount;
  const averageAmortizationMonths = validPaymentCount > 0 
    ? totalRemainingAmortizationMonths / validPaymentCount
    : 0;
  
  return {
    payments,
    summary: {
      totalPayments: payments.length,
      totalPrincipal: cumulativePrincipal,
      totalInterest: cumulativeInterest,
      totalPrepayments: cumulativePrepayments,
      totalCost: cumulativePrincipal + cumulativeInterest,
      payoffDate,
      payoffPaymentNumber,
      averageAmortizationMonths,
    },
  };
}
