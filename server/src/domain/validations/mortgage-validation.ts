/**
 * Mortgage Validation Rules
 *
 * Canadian mortgage regulations and best practices
 */

export interface MortgageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate maximum amortization period
 *
 * Canadian regulations:
 * - Maximum 30 years for uninsured mortgages
 * - Maximum 25 years for insured mortgages (high-ratio)
 *
 * @param amortizationYears - Amortization period in years
 * @param isHighRatio - Whether mortgage is high-ratio (insured)
 * @returns Validation result
 */
export function validateAmortizationPeriod(
  amortizationYears: number,
  amortizationMonths: number = 0,
  isHighRatio: boolean = false
): MortgageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const totalMonths = amortizationYears * 12 + amortizationMonths;
  const totalYears = totalMonths / 12;

  const maxYears = isHighRatio ? 25 : 30;
  const maxMonths = maxYears * 12;

  if (totalMonths > maxMonths) {
    errors.push(
      `Amortization period (${totalYears.toFixed(1)} years) exceeds maximum of ${maxYears} years for ${isHighRatio ? "insured" : "uninsured"} mortgages.`
    );
  }

  // Warning when approaching maximum
  if (totalMonths > maxMonths * 0.9) {
    warnings.push(`Amortization period is approaching the maximum of ${maxYears} years.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Loan-to-Value (LTV) ratio
 *
 * Canadian regulations:
 * - Maximum 95% LTV for insured mortgages (high-ratio)
 * - Maximum 80% LTV for uninsured mortgages
 *
 * @param mortgageAmount - Mortgage principal amount
 * @param propertyPrice - Property purchase price
 * @param isHighRatio - Whether mortgage is high-ratio (insured)
 * @returns Validation result
 */
export function validateLTV(
  mortgageAmount: number,
  propertyPrice: number,
  isHighRatio: boolean = false
): MortgageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (propertyPrice <= 0) {
    errors.push("Property price must be greater than 0");
    return { valid: false, errors, warnings };
  }

  const ltv = (mortgageAmount / propertyPrice) * 100;
  const maxLTV = isHighRatio ? 95 : 80;

  if (ltv > maxLTV) {
    errors.push(
      `LTV ratio (${ltv.toFixed(1)}%) exceeds maximum of ${maxLTV}% for ${isHighRatio ? "insured" : "uninsured"} mortgages.`
    );
  }

  // Warning when approaching maximum
  if (ltv > maxLTV * 0.9) {
    warnings.push(`LTV ratio (${ltv.toFixed(1)}%) is approaching the maximum of ${maxLTV}%.`);
  }

  // Warning for high LTV even if within limits
  if (ltv > 80 && !isHighRatio) {
    warnings.push(
      `LTV ratio (${ltv.toFixed(1)}%) is above 80%. Consider mortgage default insurance.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate GDS (Gross Debt Service) ratio
 *
 * B-20 Guidelines:
 * - Maximum GDS: 39%
 *
 * @param housingCosts - Monthly housing costs (mortgage payment + property tax + heating + 50% of condo fees)
 * @param grossIncome - Annual gross income
 * @param maxGDS - Maximum GDS ratio (default: 39%)
 * @returns Validation result
 */
export function validateGDS(
  housingCosts: number,
  grossIncome: number,
  maxGDS: number = 39
): MortgageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (grossIncome <= 0) {
    errors.push("Gross income must be greater than 0");
    return { valid: false, errors, warnings };
  }

  const monthlyIncome = grossIncome / 12;
  const gds = (housingCosts / monthlyIncome) * 100;

  if (gds > maxGDS) {
    errors.push(`GDS ratio (${gds.toFixed(1)}%) exceeds maximum of ${maxGDS}% (B-20 guidelines).`);
  }

  // Warning when approaching maximum
  if (gds > maxGDS * 0.9) {
    warnings.push(`GDS ratio (${gds.toFixed(1)}%) is approaching the maximum of ${maxGDS}%.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate TDS (Total Debt Service) ratio
 *
 * B-20 Guidelines:
 * - Maximum TDS: 44%
 *
 * @param housingCosts - Monthly housing costs
 * @param otherDebtPayments - Monthly other debt payments
 * @param grossIncome - Annual gross income
 * @param maxTDS - Maximum TDS ratio (default: 44%)
 * @returns Validation result
 */
export function validateTDS(
  housingCosts: number,
  otherDebtPayments: number,
  grossIncome: number,
  maxTDS: number = 44
): MortgageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (grossIncome <= 0) {
    errors.push("Gross income must be greater than 0");
    return { valid: false, errors, warnings };
  }

  const monthlyIncome = grossIncome / 12;
  const totalDebtCosts = housingCosts + otherDebtPayments;
  const tds = (totalDebtCosts / monthlyIncome) * 100;

  if (tds > maxTDS) {
    errors.push(`TDS ratio (${tds.toFixed(1)}%) exceeds maximum of ${maxTDS}% (B-20 guidelines).`);
  }

  // Warning when approaching maximum
  if (tds > maxTDS * 0.9) {
    warnings.push(`TDS ratio (${tds.toFixed(1)}%) is approaching the maximum of ${maxTDS}%.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Comprehensive mortgage validation
 *
 * Validates all mortgage rules at once
 */
export function validateMortgage(
  mortgageAmount: number,
  propertyPrice: number,
  amortizationYears: number,
  amortizationMonths: number,
  isHighRatio: boolean,
  monthlyPayment?: number,
  grossIncome?: number,
  otherHousingCosts?: number,
  otherDebtPayments?: number
): MortgageValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate amortization
  const amortizationValidation = validateAmortizationPeriod(
    amortizationYears,
    amortizationMonths,
    isHighRatio
  );
  allErrors.push(...amortizationValidation.errors);
  allWarnings.push(...amortizationValidation.warnings);

  // Validate LTV
  const ltvValidation = validateLTV(mortgageAmount, propertyPrice, isHighRatio);
  allErrors.push(...ltvValidation.errors);
  allWarnings.push(...ltvValidation.warnings);

  // Validate GDS/TDS if income provided
  if (grossIncome !== undefined && monthlyPayment !== undefined) {
    const housingCosts = monthlyPayment + (otherHousingCosts || 0);

    const gdsValidation = validateGDS(housingCosts, grossIncome);
    allErrors.push(...gdsValidation.errors);
    allWarnings.push(...gdsValidation.warnings);

    const tdsValidation = validateTDS(housingCosts, otherDebtPayments || 0, grossIncome);
    allErrors.push(...tdsValidation.errors);
    allWarnings.push(...tdsValidation.warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
