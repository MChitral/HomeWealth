import {
  calculateMarginalTaxRate,
  getTaxBrackets,
  type TaxBracketData,
} from "@infrastructure/data/tax-brackets";

export interface TaxDeductionResult {
  eligibleInterest: number;
  taxDeduction: number;
  taxSavings: number;
}

export interface InvestmentIncomeTaxResult {
  grossIncome: number;
  taxableIncome: number;
  taxAmount: number;
  afterTaxIncome: number;
}

/**
 * Tax Calculation Service
 * Handles Canadian tax calculations for Smith Maneuver and investment income
 */
export class TaxCalculationService {
  /**
   * Calculate marginal tax rate for a given income, province, and year
   */
  async calculateMarginalTaxRate(
    income: number,
    province: string,
    taxYear: number = 2025
  ): Promise<number> {
    return calculateMarginalTaxRate(income, province, taxYear);
  }

  /**
   * Get tax brackets for a province and year
   */
  async getTaxBrackets(
    province: string,
    taxYear: number = 2025
  ): Promise<{ federal: TaxBracketData[]; provincial: TaxBracketData[] }> {
    return getTaxBrackets(province, taxYear);
  }

  /**
   * Calculate tax deduction for HELOC interest
   *
   * @param helocInterest - Total HELOC interest paid
   * @param investmentUsePercent - Percentage of HELOC funds used for investment (0-100)
   * @param marginalTaxRate - User's marginal tax rate (as percentage, e.g., 45.0 for 45%)
   * @returns Tax deduction result
   */
  async calculateTaxDeduction(
    helocInterest: number,
    investmentUsePercent: number,
    marginalTaxRate: number
  ): Promise<TaxDeductionResult> {
    // Eligible interest is pro-rated by investment use percentage
    const eligibleInterest = helocInterest * (investmentUsePercent / 100);

    // Tax deduction equals eligible interest
    const taxDeduction = eligibleInterest;

    // Tax savings = deduction × marginal tax rate
    const taxSavings = taxDeduction * (marginalTaxRate / 100);

    return {
      eligibleInterest,
      taxDeduction,
      taxSavings,
    };
  }

  /**
   * Calculate tax savings from a tax deduction
   */
  async calculateTaxSavings(deduction: number, marginalTaxRate: number): Promise<number> {
    return deduction * (marginalTaxRate / 100);
  }

  /**
   * Calculate tax on investment income
   *
   * Handles different types of investment income:
   * - Eligible dividends: Gross-up and dividend tax credit
   * - Non-eligible dividends: Gross-up and dividend tax credit (lower rate)
   * - Interest: Fully taxable at marginal rate
   * - Capital gains: 50% inclusion rate
   */
  async calculateInvestmentIncomeTax(
    income: number,
    incomeType: "eligible_dividend" | "non_eligible_dividend" | "interest" | "capital_gain",
    province: string,
    marginalTaxRate: number,
    _taxYear: number = 2025
  ): Promise<InvestmentIncomeTaxResult> {
    let taxableIncome: number;
    let taxAmount: number;

    switch (incomeType) {
      case "eligible_dividend": {
        // Eligible dividends: 38% gross-up, then dividend tax credit
        const grossUp = 1.38;
        const grossedUpAmount = income * grossUp;
        taxableIncome = grossedUpAmount;

        // Dividend tax credit: 15.0198% of grossed-up amount (federal) + provincial credit
        // Simplified calculation - actual credit varies by province
        const federalCredit = grossedUpAmount * 0.150198;
        const provincialCreditRate = this.getProvincialDividendCreditRate(province);
        const provincialCredit = grossedUpAmount * provincialCreditRate;

        const taxOnGrossedUp = grossedUpAmount * (marginalTaxRate / 100);
        taxAmount = Math.max(0, taxOnGrossedUp - federalCredit - provincialCredit);
        break;
      }

      case "non_eligible_dividend": {
        // Non-eligible dividends: 15% gross-up, then dividend tax credit
        const grossUp = 1.15;
        const grossedUpAmount = income * grossUp;
        taxableIncome = grossedUpAmount;

        // Dividend tax credit: 9.0301% of grossed-up amount (federal) + provincial credit
        const federalCredit = grossedUpAmount * 0.090301;
        const provincialCreditRate = this.getProvincialDividendCreditRate(province, false);
        const provincialCredit = grossedUpAmount * provincialCreditRate;

        const taxOnGrossedUp = grossedUpAmount * (marginalTaxRate / 100);
        taxAmount = Math.max(0, taxOnGrossedUp - federalCredit - provincialCredit);
        break;
      }

      case "interest": {
        // Interest income: Fully taxable at marginal rate
        taxableIncome = income;
        taxAmount = income * (marginalTaxRate / 100);
        break;
      }

      case "capital_gain": {
        // Capital gains: 50% inclusion rate
        taxableIncome = income * 0.5;
        taxAmount = taxableIncome * (marginalTaxRate / 100);
        break;
      }

      default:
        taxableIncome = income;
        taxAmount = income * (marginalTaxRate / 100);
    }

    const afterTaxIncome = income - taxAmount;

    return {
      grossIncome: income,
      taxableIncome,
      taxAmount,
      afterTaxIncome,
    };
  }

  /**
   * Get provincial dividend tax credit rate
   * Simplified - actual rates vary by province and year
   */
  private getProvincialDividendCreditRate(province: string, eligible: boolean = true): number {
    // Simplified provincial dividend tax credit rates
    // Actual rates should be sourced from official tax authorities
    const rates: Record<string, { eligible: number; nonEligible: number }> = {
      ON: { eligible: 0.1, nonEligible: 0.0338 },
      BC: { eligible: 0.12, nonEligible: 0.04 },
      AB: { eligible: 0.0, nonEligible: 0.0 }, // Alberta has no provincial dividend tax credit
      QC: { eligible: 0.115, nonEligible: 0.038 },
      // Add other provinces as needed
    };

    const provinceRates = rates[province] || { eligible: 0.1, nonEligible: 0.0338 };
    return eligible ? provinceRates.eligible : provinceRates.nonEligible;
  }

  /**
   * Calculate net tax benefit from Smith Maneuver
   *
   * Net benefit = Investment returns (after tax) - HELOC cost (after tax savings) + Tax savings
   */
  async calculateNetTaxBenefit(
    investmentReturns: number,
    investmentTax: number,
    helocInterest: number,
    taxSavings: number
  ): Promise<number> {
    const afterTaxInvestmentReturns = investmentReturns - investmentTax;
    const netHelocCost = helocInterest - taxSavings;
    const netBenefit = afterTaxInvestmentReturns - netHelocCost;

    return netBenefit;
  }
}
