/**
 * Net Worth Projection Engine
 * 
 * Calculates 10-30 year projections integrating:
 * - Mortgage amortization
 * - Investment growth
 * - Emergency fund contributions
 * - Cash flow (income - expenses)
 */

import {
  calculatePayment,
  calculateInterestPayment,
  calculatePrincipalPayment,
  calculateRemainingBalance,
  PaymentFrequency,
  getPaymentsPerYear,
  type AmortizationSchedule,
  type PrepaymentEvent,
  type TermRenewal,
  generateAmortizationSchedule,
} from './mortgage-calculations';

/**
 * Monthly projection data point
 */
export interface MonthlyProjection {
  month: number; // 0 = today, 1 = 1 month from now
  date: Date;
  
  // Mortgage
  mortgageBalance: number;
  mortgagePayment: number;
  mortgagePrincipal: number;
  mortgageInterest: number;
  mortgagePrepayment: number;
  
  // Cash Flow
  monthlyIncome: number;
  monthlyExpenses: number;
  cashSurplus: number; // Residual cash after all allocations (can be negative)
  
  // Emergency Fund
  efBalance: number;
  efContribution: number;
  efTargetMet: boolean;
  
  // Investments
  investmentBalance: number;
  investmentContribution: number;
  investmentReturns: number;
  
  // Cash/Debt Bucket
  cashBalance: number; // Accumulated residual cash (positive = savings, negative = debt)
  
  // Net Worth
  totalAssets: number; // EF + Investments + Cash (if positive)
  totalLiabilities: number; // Mortgage + Debt (if cash negative)
  netWorth: number; // Assets - Liabilities
}

/**
 * Yearly summary projection
 */
export interface YearlyProjection {
  year: number; // 0 = current year, 1 = 1 year from now
  
  // End-of-year balances
  mortgageBalance: number;
  efBalance: number;
  investmentBalance: number;
  netWorth: number;
  
  // Year totals
  totalMortgagePayments: number;
  totalMortgagePrincipal: number;
  totalMortgageInterest: number;
  totalMortgagePrepayments: number;
  totalEfContributions: number;
  totalInvestmentContributions: number;
  totalInvestmentReturns: number;
  
  // Year averages
  avgMonthlyCashSurplus: number;
}

/**
 * Complete projection output
 */
export interface NetWorthProjection {
  monthlyProjections: MonthlyProjection[];
  yearlyProjections: YearlyProjection[];
  summary: {
    projectionYears: number;
    finalNetWorth: number;
    mortgagePaidOffMonth: number | null; // null if not paid off in projection period
    totalInterestPaid: number;
    totalInvestmentReturns: number;
    averageMonthlyNetWorthGrowth: number;
  };
}

/**
 * Scenario inputs for projection
 */
export interface ProjectionInputs {
  // Mortgage
  mortgagePrincipal: number;
  mortgageRate: number; // Annual nominal rate
  mortgageAmortizationMonths: number;
  mortgageFrequency: PaymentFrequency;
  mortgageStartDate: Date;
  prepaymentEvents?: PrepaymentEvent[];
  termRenewals?: TermRenewal[];
  
  // Cash Flow
  monthlyIncome: number;
  monthlyExpenses: number;
  
  // Emergency Fund
  efTarget: number;
  efStartingBalance: number;
  efMonthlyContribution: number;
  
  // Investments
  investmentStartingBalance: number;
  investmentMonthlyPercent: number; // % of surplus after EF is full
  investmentExpectedReturnRate: number; // Annual return rate
  investmentCompounding: 'monthly' | 'annual';
  
  // Projection settings
  projectionYears: number; // 10-30 years
}

/**
 * Calculate compound interest for investments
 */
function calculateInvestmentReturns(
  balance: number,
  annualRate: number,
  compounding: 'monthly' | 'annual',
  periodsInYear: number = 12
): number {
  if (compounding === 'monthly') {
    // Monthly compounding: (1 + r/12)^(1/periodsInYear) - 1
    const monthlyRate = annualRate / 12;
    const periodReturn = Math.pow(1 + monthlyRate, 1) - 1;
    return balance * periodReturn;
  } else {
    // Annual compounding: r/12 per month
    const monthlyRate = annualRate / 12;
    return balance * monthlyRate;
  }
}

/**
 * Generate complete net worth projection
 */
export function generateNetWorthProjection(
  inputs: ProjectionInputs
): NetWorthProjection {
  const monthlyProjections: MonthlyProjection[] = [];
  const yearlyProjections: YearlyProjection[] = [];
  
  // Generate amortization schedule
  const amortization = generateAmortizationSchedule(
    inputs.mortgagePrincipal,
    inputs.mortgageRate,
    inputs.mortgageAmortizationMonths,
    inputs.mortgageFrequency,
    inputs.mortgageStartDate,
    inputs.prepaymentEvents || [],
    inputs.termRenewals || [],
    inputs.projectionYears * 12 // Max payments = projection years in months
  );
  
  // Initialize balances
  let efBalance = inputs.efStartingBalance;
  let investmentBalance = inputs.investmentStartingBalance;
  let cashBalance = 0; // Accumulated residual cash (can be positive or negative)
  let efTargetMet = efBalance >= inputs.efTarget;
  
  // Payment frequency conversion (all payments converted to monthly equivalent)
  const paymentsPerYear = getPaymentsPerYear(inputs.mortgageFrequency);
  const paymentsPerMonth = paymentsPerYear / 12;
  
  // Track yearly totals
  let yearStartMonth = 0;
  let yearTotalMortgagePayments = 0;
  let yearTotalMortgagePrincipal = 0;
  let yearTotalMortgageInterest = 0;
  let yearTotalMortgagePrepayments = 0;
  let yearTotalEfContributions = 0;
  let yearTotalInvestmentContributions = 0;
  let yearTotalInvestmentReturns = 0;
  let yearTotalCashSurplus = 0;
  
  // Generate monthly projections
  const totalMonths = inputs.projectionYears * 12;
  let mortgagePaidOffMonth: number | null = null;
  
  for (let month = 0; month < totalMonths; month++) {
    const currentDate = new Date(inputs.mortgageStartDate);
    currentDate.setMonth(currentDate.getMonth() + month);
    
    // Get mortgage payment(s) for this month
    // Group payments by actual calendar month from paymentDate (handles all frequencies + lump sums)
    const paymentsThisMonth: typeof amortization.payments = [];
    
    // Find all payments that fall within this calendar month
    for (const payment of amortization.payments) {
      const paymentDate = new Date(payment.paymentDate);
      const paymentYear = paymentDate.getFullYear();
      const paymentCalendarMonth = paymentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const currentCalendarMonth = currentDate.getMonth();
      
      if (paymentYear === currentYear && paymentCalendarMonth === currentCalendarMonth) {
        paymentsThisMonth.push(payment);
      }
    }
    
    // Aggregate mortgage metrics for this month
    let monthlyMortgageOutflow = 0; // Total cash paid (payments + prepayments)
    let monthlyMortgagePayment = 0;
    let monthlyMortgagePrincipal = 0;
    let monthlyMortgageInterest = 0;
    let monthlyMortgagePrepayment = 0;
    let mortgageBalance = inputs.mortgagePrincipal; // Default if no payments yet
    
    if (paymentsThisMonth.length > 0) {
      for (const payment of paymentsThisMonth) {
        // Cash outflow includes both regular payment AND extra prepayment
        monthlyMortgageOutflow += payment.paymentAmount + payment.extraPrepayment;
        monthlyMortgagePayment += payment.paymentAmount;
        monthlyMortgagePrincipal += payment.principalPayment;
        monthlyMortgageInterest += payment.interestPayment;
        monthlyMortgagePrepayment += payment.extraPrepayment;
      }
      // Use balance from last payment this month
      mortgageBalance = paymentsThisMonth[paymentsThisMonth.length - 1].remainingBalance;
      
      // Check if mortgage paid off
      if (mortgageBalance < 0.01 && mortgagePaidOffMonth === null) {
        mortgagePaidOffMonth = month;
      }
    } else if (month > 0) {
      // No payments this month, use previous balance
      const prevProjection = monthlyProjections[month - 1];
      mortgageBalance = prevProjection.mortgageBalance;
    }
    
    // Calculate raw cash surplus (income - expenses - mortgage outflow)
    const rawSurplus = inputs.monthlyIncome - inputs.monthlyExpenses - monthlyMortgageOutflow;
    
    // Only allow contributions when surplus is positive
    const availableForContributions = Math.max(0, rawSurplus);
    
    // Calculate EF contribution (only if surplus is positive)
    let efContribution = 0;
    if (availableForContributions > 0 && !efTargetMet && efBalance < inputs.efTarget) {
      const plannedEfContribution = Math.min(
        inputs.efMonthlyContribution,
        inputs.efTarget - efBalance
      );
      efContribution = Math.min(availableForContributions, plannedEfContribution);
      efBalance += efContribution;
      
      if (efBalance >= inputs.efTarget) {
        efTargetMet = true;
      }
    }
    
    // Calculate investment contribution (only if surplus is positive and EF target met)
    let investmentContribution = 0;
    const cashAfterEf = availableForContributions - efContribution;
    if (cashAfterEf > 0 && efTargetMet) {
      investmentContribution = cashAfterEf * (inputs.investmentMonthlyPercent / 100);
      investmentBalance += investmentContribution;
    }
    
    // Track actual residual cash (can be negative to show deficits)
    const residualCash = rawSurplus - efContribution - investmentContribution;
    const cashSurplus = residualCash; // Alias for clarity in monthly projection
    
    // Accumulate residual cash in cash/debt bucket
    cashBalance += residualCash;
    
    // Calculate investment returns (compound interest)
    const investmentReturns = calculateInvestmentReturns(
      investmentBalance,
      inputs.investmentExpectedReturnRate,
      inputs.investmentCompounding
    );
    investmentBalance += investmentReturns;
    
    // Calculate net worth (include cash balance in assets if positive, liabilities if negative)
    const cashAsset = Math.max(0, cashBalance);
    const cashDebt = Math.max(0, -cashBalance);
    const totalAssets = efBalance + investmentBalance + cashAsset;
    const totalLiabilities = mortgageBalance + cashDebt;
    const netWorth = totalAssets - totalLiabilities;
    
    // Create monthly projection
    monthlyProjections.push({
      month,
      date: currentDate,
      mortgageBalance,
      mortgagePayment: monthlyMortgagePayment,
      mortgagePrincipal: monthlyMortgagePrincipal,
      mortgageInterest: monthlyMortgageInterest,
      mortgagePrepayment: monthlyMortgagePrepayment,
      monthlyIncome: inputs.monthlyIncome,
      monthlyExpenses: inputs.monthlyExpenses,
      cashSurplus,
      efBalance,
      efContribution,
      efTargetMet,
      investmentBalance,
      investmentContribution,
      investmentReturns,
      cashBalance,
      totalAssets,
      totalLiabilities,
      netWorth,
    });
    
    // Accumulate yearly totals
    yearTotalMortgagePayments += monthlyMortgagePayment;
    yearTotalMortgagePrincipal += monthlyMortgagePrincipal;
    yearTotalMortgageInterest += monthlyMortgageInterest;
    yearTotalMortgagePrepayments += monthlyMortgagePrepayment;
    yearTotalEfContributions += efContribution;
    yearTotalInvestmentContributions += investmentContribution;
    yearTotalInvestmentReturns += investmentReturns;
    yearTotalCashSurplus += residualCash; // Use residual cash (after all allocations)
    
    // Check if end of year
    if ((month + 1) % 12 === 0 || month === totalMonths - 1) {
      const year = Math.floor(month / 12);
      const monthsInYear = month - yearStartMonth + 1;
      
      yearlyProjections.push({
        year,
        mortgageBalance,
        efBalance,
        investmentBalance,
        netWorth,
        totalMortgagePayments: yearTotalMortgagePayments,
        totalMortgagePrincipal: yearTotalMortgagePrincipal,
        totalMortgageInterest: yearTotalMortgageInterest,
        totalMortgagePrepayments: yearTotalMortgagePrepayments,
        totalEfContributions: yearTotalEfContributions,
        totalInvestmentContributions: yearTotalInvestmentContributions,
        totalInvestmentReturns: yearTotalInvestmentReturns,
        avgMonthlyCashSurplus: yearTotalCashSurplus / monthsInYear,
      });
      
      // Reset yearly totals
      yearStartMonth = month + 1;
      yearTotalMortgagePayments = 0;
      yearTotalMortgagePrincipal = 0;
      yearTotalMortgageInterest = 0;
      yearTotalMortgagePrepayments = 0;
      yearTotalEfContributions = 0;
      yearTotalInvestmentContributions = 0;
      yearTotalInvestmentReturns = 0;
      yearTotalCashSurplus = 0;
    }
  }
  
  // Calculate summary
  const lastProjection = monthlyProjections[monthlyProjections.length - 1];
  const firstProjection = monthlyProjections[0];
  const totalInterestPaid = amortization.summary.totalInterest;
  const totalInvestmentReturns = yearlyProjections.reduce((sum, y) => sum + y.totalInvestmentReturns, 0);
  const avgMonthlyNetWorthGrowth = monthlyProjections.length > 1
    ? (lastProjection.netWorth - firstProjection.netWorth) / monthlyProjections.length
    : 0;
  
  return {
    monthlyProjections,
    yearlyProjections,
    summary: {
      projectionYears: inputs.projectionYears,
      finalNetWorth: lastProjection.netWorth,
      mortgagePaidOffMonth,
      totalInterestPaid,
      totalInvestmentReturns,
      averageMonthlyNetWorthGrowth: avgMonthlyNetWorthGrowth,
    },
  };
}

/**
 * Compare multiple scenarios and calculate savings metrics
 */
export interface ScenarioComparison {
  baselineScenario: string;
  comparisons: Array<{
    scenarioName: string;
    
    // Financial metrics
    finalNetWorth: number;
    finalNetWorthDiff: number; // vs baseline
    finalNetWorthDiffPercent: number;
    
    // Mortgage metrics
    totalInterestPaid: number;
    interestSavings: number; // vs baseline
    interestSavingsPercent: number;
    mortgagePaidOffMonth: number | null;
    timeSavedMonths: number; // vs baseline (negative if slower)
    timeSavedYears: number;
    
    // Investment metrics
    finalInvestmentBalance: number;
    investmentGainVsBaseline: number;
    
    // Trade-off analysis
    avgMonthlyPaymentDiff: number; // vs baseline
    totalCashOutlayDiff: number; // total paid vs baseline
  }>;
}

/**
 * Compare multiple projection scenarios
 */
export function compareScenarios(
  baselineProjection: NetWorthProjection,
  baselineName: string,
  alternativeProjections: Array<{ name: string; projection: NetWorthProjection }>
): ScenarioComparison {
  const comparisons = alternativeProjections.map(alt => {
    const finalNetWorthDiff = alt.projection.summary.finalNetWorth - baselineProjection.summary.finalNetWorth;
    const finalNetWorthDiffPercent = baselineProjection.summary.finalNetWorth !== 0
      ? (finalNetWorthDiff / baselineProjection.summary.finalNetWorth) * 100
      : 0;
    
    const interestSavings = baselineProjection.summary.totalInterestPaid - alt.projection.summary.totalInterestPaid;
    const interestSavingsPercent = baselineProjection.summary.totalInterestPaid !== 0
      ? (interestSavings / baselineProjection.summary.totalInterestPaid) * 100
      : 0;
    
    const baselinePayoffMonth = baselineProjection.summary.mortgagePaidOffMonth || (baselineProjection.summary.projectionYears * 12);
    const altPayoffMonth = alt.projection.summary.mortgagePaidOffMonth || (alt.projection.summary.projectionYears * 12);
    const timeSavedMonths = baselinePayoffMonth - altPayoffMonth;
    const timeSavedYears = timeSavedMonths / 12;
    
    const finalInvestmentBalance = alt.projection.monthlyProjections[alt.projection.monthlyProjections.length - 1].investmentBalance;
    const baselineFinalInvestment = baselineProjection.monthlyProjections[baselineProjection.monthlyProjections.length - 1].investmentBalance;
    const investmentGainVsBaseline = finalInvestmentBalance - baselineFinalInvestment;
    
    // Calculate average monthly payment difference
    const avgMonthlyPaymentDiff = alt.projection.monthlyProjections.reduce((sum, p, i) => {
      const baselinePayment = baselineProjection.monthlyProjections[i]?.mortgagePayment || 0;
      return sum + (p.mortgagePayment - baselinePayment);
    }, 0) / alt.projection.monthlyProjections.length;
    
    // Total cash outlay difference (mortgage + prepayments)
    const altTotalOutlay = alt.projection.summary.totalInterestPaid + 
      alt.projection.monthlyProjections[alt.projection.monthlyProjections.length - 1].mortgageBalance;
    const baselineTotalOutlay = baselineProjection.summary.totalInterestPaid +
      baselineProjection.monthlyProjections[baselineProjection.monthlyProjections.length - 1].mortgageBalance;
    const totalCashOutlayDiff = altTotalOutlay - baselineTotalOutlay;
    
    return {
      scenarioName: alt.name,
      finalNetWorth: alt.projection.summary.finalNetWorth,
      finalNetWorthDiff,
      finalNetWorthDiffPercent,
      totalInterestPaid: alt.projection.summary.totalInterestPaid,
      interestSavings,
      interestSavingsPercent,
      mortgagePaidOffMonth: alt.projection.summary.mortgagePaidOffMonth,
      timeSavedMonths,
      timeSavedYears,
      finalInvestmentBalance,
      investmentGainVsBaseline,
      avgMonthlyPaymentDiff,
      totalCashOutlayDiff,
    };
  });
  
  return {
    baselineScenario: baselineName,
    comparisons,
  };
}
