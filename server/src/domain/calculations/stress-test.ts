/**
 * B-20 Stress Test Rate Calculator
 *
 * Canadian mortgage qualification rules (B-20 Guidelines):
 * - Qualifying rate = max(contractRate + 2%, 5.25%)
 * - This ensures borrowers can afford payments even if rates rise
 *
 * @param contractRate - Contract interest rate (decimal, e.g., 0.05 for 5%)
 * @returns Qualifying stress test rate (decimal)
 */
export function calculateStressTestRate(contractRate: number): number {
  const contractRatePercent = contractRate * 100; // Convert to percentage
  const ratePlusTwo = contractRatePercent + 2;
  const stressTestRatePercent = Math.max(ratePlusTwo, 5.25);
  return stressTestRatePercent / 100; // Convert back to decimal
}

/**
 * Calculate qualifying payment using stress test rate
 *
 * @param principal - Mortgage principal amount
 * @param contractRate - Contract interest rate (decimal)
 * @param amortizationMonths - Amortization period in months
 * @param frequency - Payment frequency
 * @returns Qualifying payment amount
 */
export function calculateQualifyingPayment(
  principal: number,
  contractRate: number,
  amortizationMonths: number,
  frequency: "monthly" | "biweekly" | "semi-monthly" | "weekly"
): number {
  const stressTestRate = calculateStressTestRate(contractRate);

  // Use monthly frequency for stress test (standard practice)
  const monthlyRate = stressTestRate / 12;
  const totalPayments = amortizationMonths;

  if (monthlyRate === 0) {
    return principal / totalPayments;
  }

  const payment = (monthlyRate * principal) / (1 - Math.pow(1 + monthlyRate, -totalPayments));

  // Round to nearest cent
  return Math.round(payment * 100) / 100;
}

/**
 * Calculate maximum mortgage amount based on GDS/TDS ratios and stress test
 *
 * @param grossIncome - Annual gross income
 * @param contractRate - Contract interest rate (decimal)
 * @param amortizationMonths - Amortization period in months
 * @param otherHousingCosts - Property tax + heating + 50% of condo fees (monthly)
 * @param otherDebtPayments - Other debt payments (monthly)
 * @param maxGDS - Maximum GDS ratio (default: 39%)
 * @param maxTDS - Maximum TDS ratio (default: 44%)
 * @returns Maximum mortgage amount based on stress test
 */
export function calculateMaximumMortgageAmount(
  grossIncome: number,
  contractRate: number,
  amortizationMonths: number,
  otherHousingCosts: number = 0,
  otherDebtPayments: number = 0,
  maxGDS: number = 39,
  maxTDS: number = 44
): {
  maxMortgageAmount: number;
  qualifyingPayment: number;
  stressTestRate: number;
  gdsLimit: number;
  tdsLimit: number;
} {
  const monthlyIncome = grossIncome / 12;
  const stressTestRate = calculateStressTestRate(contractRate);

  // Calculate maximum housing costs based on GDS
  const maxHousingCostsGDS = (monthlyIncome * maxGDS) / 100;

  // Calculate maximum total debt costs based on TDS
  const maxTotalDebtTDS = (monthlyIncome * maxTDS) / 100;
  const maxHousingCostsTDS = maxTotalDebtTDS - otherDebtPayments;

  // Use the lower of the two limits
  const maxHousingCosts = Math.min(maxHousingCostsGDS, maxHousingCostsTDS);
  const maxMortgagePayment = maxHousingCosts - otherHousingCosts;

  // Calculate maximum mortgage amount from payment
  const monthlyRate = stressTestRate / 12;
  const totalPayments = amortizationMonths;

  let maxMortgageAmount = 0;
  if (monthlyRate > 0 && maxMortgagePayment > 0) {
    maxMortgageAmount =
      (maxMortgagePayment * (1 - Math.pow(1 + monthlyRate, -totalPayments))) / monthlyRate;
  }

  // Calculate qualifying payment for reference
  const qualifyingPayment = maxMortgagePayment;

  return {
    maxMortgageAmount: Math.round(maxMortgageAmount),
    qualifyingPayment: Math.round(qualifyingPayment * 100) / 100,
    stressTestRate,
    gdsLimit: maxGDS,
    tdsLimit: maxTDS,
  };
}

/**
 * Check if mortgage passes stress test
 *
 * @param mortgageAmount - Mortgage amount
 * @param contractRate - Contract interest rate (decimal)
 * @param amortizationMonths - Amortization period in months
 * @param grossIncome - Annual gross income
 * @param otherHousingCosts - Property tax + heating + 50% of condo fees (monthly)
 * @param otherDebtPayments - Other debt payments (monthly)
 * @param maxGDS - Maximum GDS ratio (default: 39%)
 * @param maxTDS - Maximum TDS ratio (default: 44%)
 * @returns Object with pass/fail status and details
 */
export function checkStressTest(
  mortgageAmount: number,
  contractRate: number,
  amortizationMonths: number,
  grossIncome: number,
  otherHousingCosts: number = 0,
  otherDebtPayments: number = 0,
  maxGDS: number = 39,
  maxTDS: number = 44
): {
  passes: boolean;
  stressTestRate: number;
  qualifyingPayment: number;
  actualGDS: number;
  actualTDS: number;
  maxGDS: number;
  maxTDS: number;
  gdsPass: boolean;
  tdsPass: boolean;
} {
  const stressTestRate = calculateStressTestRate(contractRate);
  const qualifyingPayment = calculateQualifyingPayment(
    mortgageAmount,
    contractRate,
    amortizationMonths,
    "monthly"
  );

  const monthlyIncome = grossIncome / 12;
  const totalHousingCosts = qualifyingPayment + otherHousingCosts;
  const totalDebtCosts = totalHousingCosts + otherDebtPayments;

  const actualGDS = (totalHousingCosts / monthlyIncome) * 100;
  const actualTDS = (totalDebtCosts / monthlyIncome) * 100;

  const gdsPass = actualGDS <= maxGDS;
  const tdsPass = actualTDS <= maxTDS;
  const passes = gdsPass && tdsPass;

  return {
    passes,
    stressTestRate,
    qualifyingPayment,
    actualGDS: Math.round(actualGDS * 100) / 100,
    actualTDS: Math.round(actualTDS * 100) / 100,
    maxGDS,
    maxTDS,
    gdsPass,
    tdsPass,
  };
}
