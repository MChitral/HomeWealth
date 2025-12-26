/**
 * Dividend Tax Credit Calculations
 * 
 * Calculates tax credits for eligible and non-eligible dividends in Canada.
 * 
 * Eligible dividends:
 * - 38% gross-up
 * - Federal dividend tax credit: 15.0198% of grossed-up amount
 * - Provincial dividend tax credit varies by province
 * 
 * Non-eligible dividends:
 * - 15% gross-up
 * - Federal dividend tax credit: 9.0301% of grossed-up amount
 * - Provincial dividend tax credit varies by province
 */

export interface DividendTaxCreditResult {
  grossedUpAmount: number;
  federalTaxCredit: number;
  provincialTaxCredit: number;
  totalTaxCredit: number;
  taxableIncome: number;
  taxBeforeCredit: number;
  taxAfterCredit: number;
  effectiveTaxRate: number;
}

/**
 * Get provincial dividend tax credit rate
 * @param province Province code (e.g., "ON", "BC", "AB")
 * @param isEligible Whether the dividend is eligible
 * @returns Provincial dividend tax credit rate (as decimal)
 */
function getProvincialDividendTaxCreditRate(
  province: string,
  isEligible: boolean
): number {
  // Provincial dividend tax credit rates (as percentage of grossed-up amount)
  // These are simplified rates - actual rates vary by province and tax bracket
  const rates: Record<string, { eligible: number; nonEligible: number }> = {
    ON: { eligible: 10.0, nonEligible: 3.2863 }, // Ontario
    BC: { eligible: 12.0, nonEligible: 2.0179 }, // British Columbia
    AB: { eligible: 0.0, nonEligible: 0.0 }, // Alberta has no provincial dividend tax credit
    QC: { eligible: 11.9, nonEligible: 8.0 }, // Quebec
    SK: { eligible: 11.0, nonEligible: 4.0 }, // Saskatchewan
    MB: { eligible: 11.5, nonEligible: 4.0 }, // Manitoba
    NS: { eligible: 8.85, nonEligible: 2.85 }, // Nova Scotia
    NB: { eligible: 10.0, nonEligible: 3.5 }, // New Brunswick
    NL: { eligible: 8.7, nonEligible: 2.7 }, // Newfoundland and Labrador
    PE: { eligible: 10.0, nonEligible: 3.5 }, // Prince Edward Island
    NT: { eligible: 11.5, nonEligible: 4.0 }, // Northwest Territories
    YT: { eligible: 12.0, nonEligible: 4.0 }, // Yukon
    NU: { eligible: 11.5, nonEligible: 4.0 }, // Nunavut
  };

  const provinceRates = rates[province.toUpperCase()] || rates.ON;
  return (isEligible ? provinceRates.eligible : provinceRates.nonEligible) / 100;
}

/**
 * Calculate dividend tax credit for eligible dividends
 * @param dividendAmount Original dividend amount received
 * @param province Province code
 * @param marginalTaxRate Marginal tax rate (as decimal, e.g., 0.45 for 45%)
 * @returns Dividend tax credit calculation result
 */
export function calculateEligibleDividendTaxCredit(
  dividendAmount: number,
  province: string,
  marginalTaxRate: number
): DividendTaxCreditResult {
  // Eligible dividends: 38% gross-up
  const grossUpRate = 1.38;
  const grossedUpAmount = dividendAmount * grossUpRate;

  // Federal dividend tax credit: 15.0198% of grossed-up amount
  const federalTaxCreditRate = 0.150198;
  const federalTaxCredit = grossedUpAmount * federalTaxCreditRate;

  // Provincial dividend tax credit
  const provincialTaxCreditRate = getProvincialDividendTaxCreditRate(province, true);
  const provincialTaxCredit = grossedUpAmount * provincialTaxCreditRate;

  const totalTaxCredit = federalTaxCredit + provincialTaxCredit;

  // Taxable income is the grossed-up amount
  const taxableIncome = grossedUpAmount;

  // Tax before credit
  const taxBeforeCredit = taxableIncome * marginalTaxRate;

  // Tax after credit
  const taxAfterCredit = Math.max(0, taxBeforeCredit - totalTaxCredit);

  // Effective tax rate on original dividend
  const effectiveTaxRate = taxAfterCredit / dividendAmount;

  return {
    grossedUpAmount,
    federalTaxCredit,
    provincialTaxCredit,
    totalTaxCredit,
    taxableIncome,
    taxBeforeCredit,
    taxAfterCredit,
    effectiveTaxRate,
  };
}

/**
 * Calculate dividend tax credit for non-eligible dividends
 * @param dividendAmount Original dividend amount received
 * @param province Province code
 * @param marginalTaxRate Marginal tax rate (as decimal, e.g., 0.45 for 45%)
 * @returns Dividend tax credit calculation result
 */
export function calculateNonEligibleDividendTaxCredit(
  dividendAmount: number,
  province: string,
  marginalTaxRate: number
): DividendTaxCreditResult {
  // Non-eligible dividends: 15% gross-up
  const grossUpRate = 1.15;
  const grossedUpAmount = dividendAmount * grossUpRate;

  // Federal dividend tax credit: 9.0301% of grossed-up amount
  const federalTaxCreditRate = 0.090301;
  const federalTaxCredit = grossedUpAmount * federalTaxCreditRate;

  // Provincial dividend tax credit
  const provincialTaxCreditRate = getProvincialDividendTaxCreditRate(province, false);
  const provincialTaxCredit = grossedUpAmount * provincialTaxCreditRate;

  const totalTaxCredit = federalTaxCredit + provincialTaxCredit;

  // Taxable income is the grossed-up amount
  const taxableIncome = grossedUpAmount;

  // Tax before credit
  const taxBeforeCredit = taxableIncome * marginalTaxRate;

  // Tax after credit
  const taxAfterCredit = Math.max(0, taxBeforeCredit - totalTaxCredit);

  // Effective tax rate on original dividend
  const effectiveTaxRate = taxAfterCredit / dividendAmount;

  return {
    grossedUpAmount,
    federalTaxCredit,
    provincialTaxCredit,
    totalTaxCredit,
    taxableIncome,
    taxBeforeCredit,
    taxAfterCredit,
    effectiveTaxRate,
  };
}

