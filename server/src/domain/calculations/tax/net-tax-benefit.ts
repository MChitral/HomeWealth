/**
 * Net Tax Benefit Calculations
 *
 * Calculates the net tax benefit from Smith Maneuver strategy.
 *
 * Net tax benefit = Tax savings from interest deduction - Tax on investment income
 */

import type { InterestDeductionResult } from "./interest-deduction";

export interface InvestmentIncomeTax {
  grossIncome: number;
  taxAmount: number;
  afterTaxIncome: number;
}

export interface NetTaxBenefitResult {
  interestDeduction: InterestDeductionResult;
  investmentIncomeTax: InvestmentIncomeTax;
  netTaxBenefit: number;
  netBenefitPercent: number; // Net benefit as percentage of interest paid
}

/**
 * Calculate net tax benefit from Smith Maneuver
 * @param interestDeduction Interest deduction calculation result
 * @param investmentIncomeTax Investment income tax calculation result
 * @returns Net tax benefit calculation result
 */
export function calculateNetTaxBenefit(
  interestDeduction: InterestDeductionResult,
  investmentIncomeTax: InvestmentIncomeTax
): NetTaxBenefitResult {
  // Net tax benefit = Tax savings from deduction - Tax on investment income
  const netTaxBenefit = interestDeduction.taxSavings - investmentIncomeTax.taxAmount;

  // Net benefit as percentage of interest paid
  const netBenefitPercent =
    interestDeduction.totalInterest > 0
      ? (netTaxBenefit / interestDeduction.totalInterest) * 100
      : 0;

  return {
    interestDeduction,
    investmentIncomeTax,
    netTaxBenefit,
    netBenefitPercent,
  };
}

/**
 * Calculate net tax benefit with detailed breakdown
 * @param helocInterest Total HELOC interest paid
 * @param investmentUsePercent Percentage of HELOC used for investment
 * @param investmentIncome Gross investment income
 * @param incomeType Type of investment income
 * @param marginalTaxRate Marginal tax rate (as decimal)
 * @param province Province code
 * @returns Net tax benefit calculation result
 */
export function calculateNetTaxBenefitDetailed(
  helocInterest: number,
  investmentUsePercent: number,
  investmentIncome: number,
  incomeType: "eligible_dividend" | "non_eligible_dividend" | "interest" | "capital_gain",
  marginalTaxRate: number,
  province: string
): NetTaxBenefitResult {
  // Import here to avoid circular dependencies
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { calculateInterestDeduction } = require("./interest-deduction");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {
    calculateEligibleDividendTaxCredit,
    calculateNonEligibleDividendTaxCredit,
  } = require("./dividend-tax-credit");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { calculateCapitalGainsTax } = require("./capital-gains-tax");

  // Calculate interest deduction
  const interestDeduction = calculateInterestDeduction(
    helocInterest,
    investmentUsePercent,
    marginalTaxRate
  );

  // Calculate investment income tax based on type
  let investmentIncomeTax: InvestmentIncomeTax;

  switch (incomeType) {
    case "eligible_dividend": {
      const dividendResult = calculateEligibleDividendTaxCredit(
        investmentIncome,
        province,
        marginalTaxRate
      );
      investmentIncomeTax = {
        grossIncome: investmentIncome,
        taxAmount: dividendResult.taxAfterCredit,
        afterTaxIncome: investmentIncome - dividendResult.taxAfterCredit,
      };
      break;
    }
    case "non_eligible_dividend": {
      const dividendResult = calculateNonEligibleDividendTaxCredit(
        investmentIncome,
        province,
        marginalTaxRate
      );
      investmentIncomeTax = {
        grossIncome: investmentIncome,
        taxAmount: dividendResult.taxAfterCredit,
        afterTaxIncome: investmentIncome - dividendResult.taxAfterCredit,
      };
      break;
    }
    case "interest": {
      // Interest is fully taxable at marginal rate
      const taxAmount = investmentIncome * marginalTaxRate;
      investmentIncomeTax = {
        grossIncome: investmentIncome,
        taxAmount,
        afterTaxIncome: investmentIncome - taxAmount,
      };
      break;
    }
    case "capital_gain": {
      // Capital gains: 50% inclusion rate
      // For this calculation, we assume cost basis is 0 (simplified)
      const capitalGainResult = calculateCapitalGainsTax(investmentIncome, 0, marginalTaxRate);
      investmentIncomeTax = {
        grossIncome: investmentIncome,
        taxAmount: capitalGainResult.taxAmount,
        afterTaxIncome: capitalGainResult.afterTaxGain,
      };
      break;
    }
  }

  return calculateNetTaxBenefit(interestDeduction, investmentIncomeTax);
}
