/**
 * Debt Service Ratio Calculations
 * 
 * GDS (Gross Debt Service) and TDS (Total Debt Service) ratios
 * Used for mortgage qualification under B-20 guidelines
 */

/**
 * Calculate GDS (Gross Debt Service) ratio
 * 
 * GDS = (Housing Costs / Gross Income) * 100
 * 
 * Housing Costs include:
 * - Mortgage payment
 * - Property tax
 * - Heating costs
 * - 50% of condo fees (if applicable)
 * 
 * B-20 Guideline: Maximum GDS = 39%
 * 
 * @param housingCosts - Monthly housing costs
 * @param grossIncome - Annual gross income
 * @returns GDS ratio as percentage
 */
export function calculateGDS(housingCosts: number, grossIncome: number): number {
  if (grossIncome <= 0) {
    return 0;
  }
  
  const monthlyIncome = grossIncome / 12;
  const gds = (housingCosts / monthlyIncome) * 100;
  
  return Math.round(gds * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate TDS (Total Debt Service) ratio
 * 
 * TDS = ((Housing Costs + Other Debt Payments) / Gross Income) * 100
 * 
 * Other Debt Payments include:
 * - Car loans
 * - Student loans
 * - Credit card payments
 * - Other personal loans
 * 
 * B-20 Guideline: Maximum TDS = 44%
 * 
 * @param housingCosts - Monthly housing costs
 * @param otherDebtPayments - Monthly other debt payments
 * @param grossIncome - Annual gross income
 * @returns TDS ratio as percentage
 */
export function calculateTDS(
  housingCosts: number,
  otherDebtPayments: number,
  grossIncome: number
): number {
  if (grossIncome <= 0) {
    return 0;
  }
  
  const monthlyIncome = grossIncome / 12;
  const totalDebtCosts = housingCosts + otherDebtPayments;
  const tds = (totalDebtCosts / monthlyIncome) * 100;
  
  return Math.round(tds * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate housing costs for GDS/TDS calculations
 * 
 * @param mortgagePayment - Monthly mortgage payment
 * @param propertyTax - Monthly property tax
 * @param heatingCosts - Monthly heating costs
 * @param condoFees - Monthly condo fees (50% is included)
 * @returns Total monthly housing costs
 */
export function calculateHousingCosts(
  mortgagePayment: number,
  propertyTax: number = 0,
  heatingCosts: number = 0,
  condoFees: number = 0
): number {
  // Include 50% of condo fees (B-20 guideline)
  const condoFeesContribution = condoFees * 0.5;
  
  return mortgagePayment + propertyTax + heatingCosts + condoFeesContribution;
}

/**
 * Get debt service ratio status
 * 
 * @param gds - GDS ratio
 * @param tds - TDS ratio
 * @param maxGDS - Maximum GDS (default: 39%)
 * @param maxTDS - Maximum TDS (default: 44%)
 * @returns Status object with pass/fail and warnings
 */
export function getDebtServiceRatioStatus(
  gds: number,
  tds: number,
  maxGDS: number = 39,
  maxTDS: number = 44
): {
  gdsPass: boolean;
  tdsPass: boolean;
  overallPass: boolean;
  gdsWarning: boolean;
  tdsWarning: boolean;
  warnings: string[];
} {
  const gdsPass = gds <= maxGDS;
  const tdsPass = tds <= maxTDS;
  const overallPass = gdsPass && tdsPass;
  
  // Warnings when approaching limits (90% of max)
  const gdsWarning = gds > maxGDS * 0.9 && gdsPass;
  const tdsWarning = tds > maxTDS * 0.9 && tdsPass;
  
  const warnings: string[] = [];
  if (gdsWarning) {
    warnings.push(`GDS ratio (${gds.toFixed(1)}%) is approaching the maximum of ${maxGDS}%`);
  }
  if (tdsWarning) {
    warnings.push(`TDS ratio (${tds.toFixed(1)}%) is approaching the maximum of ${maxTDS}%`);
  }
  if (!gdsPass) {
    warnings.push(`GDS ratio (${gds.toFixed(1)}%) exceeds maximum of ${maxGDS}%`);
  }
  if (!tdsPass) {
    warnings.push(`TDS ratio (${tds.toFixed(1)}%) exceeds maximum of ${maxTDS}%`);
  }
  
  return {
    gdsPass,
    tdsPass,
    overallPass,
    gdsWarning,
    tdsWarning,
    warnings,
  };
}

