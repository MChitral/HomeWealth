/**
 * Net Worth Projection Engine
 * 
 * Combines mortgage paydown, investment growth, and emergency fund
 * to project net worth over 10-30 year horizons
 */

import type { Scenario, Mortgage, CashFlow, EmergencyFund } from "@shared/schema";
import {
  generateAmortizationSchedule,
  type PrepaymentEvent,
  type PaymentFrequency,
  getPaymentsPerYear,
  calculatePayment,
} from "./mortgage";

export interface ProjectionParams {
  scenario: Scenario;
  mortgage: Mortgage;
  cashFlow?: CashFlow;
  emergencyFund?: EmergencyFund;
}

export interface YearlyProjection {
  year: number;
  netWorth: number;
  mortgageBalance: number;
  investmentValue: number;
  emergencyFundValue: number;
  cumulativeInterestPaid: number;
  cumulativePrepayments: number;
  cumulativeInvestments: number;
}

export interface ScenarioMetrics {
  netWorth10yr: number;
  netWorth20yr: number;
  netWorth30yr: number;
  mortgageBalance10yr: number;
  mortgageBalance20yr: number;
  mortgageBalance30yr: number;
  mortgagePayoffYear: number;
  totalInterestPaid: number;
  investments10yr: number;
  investments20yr: number;
  investments30yr: number;
  investmentReturns10yr: number;
  investmentReturns20yr: number;
  investmentReturns30yr: number;
  emergencyFundStatus: string;
  avgMonthlySurplus: number;
}

/**
 * Calculate monthly surplus from cash flow
 */
function calculateMonthlySurplus(cashFlow?: CashFlow): number {
  if (!cashFlow) return 0;
  
  const monthlyIncome = parseFloat(cashFlow.monthlyIncome || "0");
  const extraPaycheques = cashFlow.extraPaycheques || 0;
  const annualBonus = parseFloat(cashFlow.annualBonus || "0");
  
  // Total annual income
  const totalIncome = (monthlyIncome * 12) + (monthlyIncome * extraPaycheques) + annualBonus;
  
  // Fixed expenses (annual)
  const propertyTax = parseFloat(cashFlow.propertyTax || "0");
  const homeInsurance = parseFloat(cashFlow.homeInsurance || "0");
  const condoFees = parseFloat(cashFlow.condoFees || "0") * 12;
  const utilities = parseFloat(cashFlow.utilities || "0") * 12;
  
  // Variable expenses (annual)
  const groceries = parseFloat(cashFlow.groceries || "0") * 12;
  const dining = parseFloat(cashFlow.dining || "0") * 12;
  const transportation = parseFloat(cashFlow.transportation || "0") * 12;
  const entertainment = parseFloat(cashFlow.entertainment || "0") * 12;
  
  // Debt (annual)
  const carLoan = parseFloat(cashFlow.carLoan || "0") * 12;
  const studentLoan = parseFloat(cashFlow.studentLoan || "0") * 12;
  const creditCard = parseFloat(cashFlow.creditCard || "0") * 12;
  
  const totalExpenses = propertyTax + homeInsurance + condoFees + utilities +
                        groceries + dining + transportation + entertainment +
                        carLoan + studentLoan + creditCard;
  
  const annualSurplus = totalIncome - totalExpenses;
  return annualSurplus / 12; // Monthly surplus
}

/**
 * Generate prepayment events based on scenario strategy
 */
function generatePrepayments(
  scenario: Scenario,
  monthlySurplus: number,
  basePaymentAmount: number,
  frequency: PaymentFrequency
): PrepaymentEvent[] {
  const prepayments: PrepaymentEvent[] = [];

  const prepaymentPercent = scenario.prepaymentMonthlyPercent || 0;
  if (prepaymentPercent > 0 && monthlySurplus > 0 && basePaymentAmount > 0) {
    const paymentsPerYear = getPaymentsPerYear(frequency);
    const paymentsPerMonth = paymentsPerYear / 12;
    const monthlyPrepayAmount = (monthlySurplus * prepaymentPercent) / 100;
    const perPaymentExtra = paymentsPerMonth > 0
      ? monthlyPrepayAmount / paymentsPerMonth
      : 0;
    const percentOfPayment = perPaymentExtra > 0
      ? (perPaymentExtra / basePaymentAmount) * 100
      : 0;
    if (percentOfPayment > 0) {
      prepayments.push({
        type: 'monthly-percent',
        amount: monthlySurplus,
        startPaymentNumber: 1,
        monthlyPercent: percentOfPayment,
      });
    }
  }

  return prepayments;
}

/**
 * Calculate investment growth over time
 */
function calculateInvestments(
  scenario: Scenario,
  monthlySurplus: number,
  years: number
): { value: number; contributions: number; returns: number } {
  const investmentPercent = scenario.investmentMonthlyPercent || 0;
  const monthlyInvestment = (monthlySurplus * investmentPercent) / 100;
  const annualReturn = parseFloat(scenario.expectedReturnRate || "7") / 100;
  
  let value = 0;
  let totalContributions = 0;
  
  // Compound monthly
  for (let month = 0; month < years * 12; month++) {
    value += monthlyInvestment;
    totalContributions += monthlyInvestment;
    
    // Apply monthly return (annual return / 12)
    value *= (1 + annualReturn / 12);
  }
  
  return {
    value: Math.round(value * 100) / 100,
    contributions: Math.round(totalContributions * 100) / 100,
    returns: Math.round((value - totalContributions) * 100) / 100
  };
}

/**
 * Calculate emergency fund status
 */
function calculateEmergencyFund(
  emergencyFund: EmergencyFund | undefined,
  monthlySurplus: number,
  years: number
): number {
  if (!emergencyFund) return 0;
  
  const currentBalance = parseFloat(emergencyFund.currentBalance || "0");
  const monthlyContribution = parseFloat(emergencyFund.monthlyContribution || "0");
  
  // Simple calculation: current balance + contributions over time
  return currentBalance + (monthlyContribution * years * 12);
}

/**
 * Generate yearly projections for a scenario
 */
export function generateProjections(
  params: ProjectionParams,
  maxYears: number = 30,
  currentRate: number = 0.0549 // Default fallback rate
): YearlyProjection[] {
  const { scenario, mortgage, cashFlow, emergencyFund } = params;
  
  // Ensure non-negative surplus (avoid negative prepayments/investments)
  const monthlySurplus = Math.max(0, calculateMonthlySurplus(cashFlow));
  const amortizationMonths = (mortgage.amortizationYears * 12) + mortgage.amortizationMonths;
  const basePaymentAmount = calculatePayment(
    parseFloat(mortgage.currentBalance),
    currentRate,
    amortizationMonths,
    mortgage.paymentFrequency as PaymentFrequency,
  );
  const prepayments = generatePrepayments(
    scenario,
    monthlySurplus,
    basePaymentAmount,
    mortgage.paymentFrequency as PaymentFrequency,
  );
  
  // Generate mortgage schedule with actual rate
  const schedule = generateAmortizationSchedule(
    parseFloat(mortgage.currentBalance),
    currentRate, // Use actual mortgage rate from term
    amortizationMonths,
    mortgage.paymentFrequency as PaymentFrequency,
    new Date(mortgage.startDate),
    prepayments
  );
  
  const projections: YearlyProjection[] = [];
  const paymentsPerYear = getPaymentsPerYear(mortgage.paymentFrequency as PaymentFrequency);
  const propertyValue = parseFloat(mortgage.propertyPrice);
  const initialBalance = parseFloat(mortgage.currentBalance);
  const initialEF = parseFloat(emergencyFund?.currentBalance || "0");
  
  // Add year 0 baseline (current state)
  projections.push({
    year: 0,
    netWorth: propertyValue - initialBalance + initialEF,
    mortgageBalance: initialBalance,
    investmentValue: 0,
    emergencyFundValue: initialEF,
    cumulativeInterestPaid: 0,
    cumulativePrepayments: 0,
    cumulativeInvestments: 0
  });
  
  for (let year = 1; year <= maxYears; year++) {
    const paymentIndex = Math.min((year * paymentsPerYear) - 1, schedule.payments.length - 1);
    const mortgageData = schedule.payments[paymentIndex] || schedule.payments[schedule.payments.length - 1];
    
    // Calculate investments
    const investments = calculateInvestments(scenario, monthlySurplus, year);
    
    // Calculate emergency fund
    const efValue = calculateEmergencyFund(emergencyFund, monthlySurplus, year);
    
    // Net worth = property value - mortgage balance + investments + EF
    const netWorth = propertyValue - mortgageData.remainingBalance + investments.value + efValue;
    
    projections.push({
      year,
      netWorth: Math.round(netWorth),
      mortgageBalance: Math.round(mortgageData.remainingBalance),
      investmentValue: Math.round(investments.value),
      emergencyFundValue: Math.round(efValue),
      cumulativeInterestPaid: Math.round(mortgageData.cumulativeInterest),
      cumulativePrepayments: Math.round(mortgageData.cumulativePrepayments),
      cumulativeInvestments: Math.round(investments.contributions)
    });
  }
  
  return projections;
}

/**
 * Calculate all metrics for a scenario
 */
export function calculateScenarioMetrics(
  params: ProjectionParams,
  currentRate: number = 0.0549 // Default fallback rate
): ScenarioMetrics {
  const projections = generateProjections(params, 30, currentRate);
  const { scenario, mortgage, cashFlow, emergencyFund } = params;
  
  // Ensure non-negative surplus
  const monthlySurplus = Math.max(0, calculateMonthlySurplus(cashFlow));
  const amortizationMonths = (mortgage.amortizationYears * 12) + mortgage.amortizationMonths;
  const basePaymentAmount = calculatePayment(
    parseFloat(mortgage.currentBalance),
    currentRate,
    amortizationMonths,
    mortgage.paymentFrequency as PaymentFrequency,
  );
  const prepayments = generatePrepayments(
    scenario,
    monthlySurplus,
    basePaymentAmount,
    mortgage.paymentFrequency as PaymentFrequency,
  );
  
  // Generate schedule for summary metrics with actual rate
  const schedule = generateAmortizationSchedule(
    parseFloat(mortgage.currentBalance),
    currentRate, // Use actual mortgage rate
    amortizationMonths,
    mortgage.paymentFrequency as PaymentFrequency,
    new Date(mortgage.startDate),
    prepayments
  );
  
  const paymentsPerYear = getPaymentsPerYear(mortgage.paymentFrequency as PaymentFrequency);
  const payoffYear = schedule.summary.payoffPaymentNumber 
    ? schedule.summary.payoffPaymentNumber / paymentsPerYear 
    : 30;
  const totalInterest = schedule.summary.totalInterest;
  
  // Projections array now includes year 0, so year 10 is at index 10, etc.
  const proj10 = projections[10]; // Year 10
  const proj20 = projections[20]; // Year 20
  const proj30 = projections[30]; // Year 30
  
  const investments10 = calculateInvestments(scenario, monthlySurplus, 10);
  const investments20 = calculateInvestments(scenario, monthlySurplus, 20);
  const investments30 = calculateInvestments(scenario, monthlySurplus, 30);
  
  // Emergency fund status
  const targetMonths = emergencyFund?.targetMonths || 6;
  const monthlyExpenses = monthlySurplus > 0 ? 3000 : 0; // Estimate
  const efTarget = targetMonths * monthlyExpenses;
  const efCurrent = parseFloat(emergencyFund?.currentBalance || "0");
  const efStatus = efCurrent >= efTarget ? "Funded" : `${Math.round((efCurrent / efTarget) * 100)}% funded`;
  
  return {
    netWorth10yr: proj10?.netWorth || 0,
    netWorth20yr: proj20?.netWorth || 0,
    netWorth30yr: proj30?.netWorth || 0,
    mortgageBalance10yr: proj10?.mortgageBalance || 0,
    mortgageBalance20yr: proj20?.mortgageBalance || 0,
    mortgageBalance30yr: proj30?.mortgageBalance || 0,
    mortgagePayoffYear: Math.round(payoffYear * 10) / 10,
    totalInterestPaid: Math.round(totalInterest),
    investments10yr: Math.round(investments10.value),
    investments20yr: Math.round(investments20.value),
    investments30yr: Math.round(investments30.value),
    investmentReturns10yr: Math.round(investments10.returns),
    investmentReturns20yr: Math.round(investments20.returns),
    investmentReturns30yr: Math.round(investments30.returns),
    emergencyFundStatus: efStatus,
    avgMonthlySurplus: Math.round(monthlySurplus)
  };
}
