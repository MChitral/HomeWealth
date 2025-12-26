import { apiRequest } from "@/shared/api/query-client";

export type MarginalTaxRateResponse = {
  income: number;
  province: string;
  taxYear: number;
  marginalTaxRate: number;
};

export type TaxDeductionPayload = {
  helocInterest: number;
  investmentUsePercent: number;
  marginalTaxRate: number;
};

export type TaxDeductionResult = {
  eligibleInterest: number;
  taxDeduction: number;
  taxSavings: number;
};

export type TaxSavingsPayload = {
  deduction: number;
  marginalTaxRate: number;
};

export type InvestmentIncomeTaxPayload = {
  income: number;
  incomeType: "eligible_dividend" | "non_eligible_dividend" | "interest" | "capital_gain";
  province: string;
  marginalTaxRate: number;
  taxYear?: number;
};

export type InvestmentIncomeTaxResult = {
  grossIncome: number;
  taxableIncome: number;
  taxAmount: number;
  afterTaxIncome: number;
};

export type TaxBracketsResponse = {
  federal: Array<{
    province: string;
    taxYear: number;
    bracketType: "federal";
    minIncome: number;
    maxIncome: number | null;
    taxRate: number;
  }>;
  provincial: Array<{
    province: string;
    taxYear: number;
    bracketType: "provincial";
    minIncome: number;
    maxIncome: number | null;
    taxRate: number;
  }>;
};

export const taxApi = {
  getMarginalTaxRate: (income: number, province: string, year?: number) => {
    const url = `/api/tax/marginal-rate?income=${income}&province=${province}${year ? `&year=${year}` : ""}`;
    return apiRequest<MarginalTaxRateResponse>("GET", url);
  },

  calculateTaxDeduction: (payload: TaxDeductionPayload) =>
    apiRequest<TaxDeductionResult>("POST", "/api/tax/calculate-deduction", payload),

  calculateTaxSavings: (payload: TaxSavingsPayload) =>
    apiRequest<{ taxSavings: number }>("POST", "/api/tax/calculate-savings", payload),

  calculateInvestmentIncomeTax: (payload: InvestmentIncomeTaxPayload) =>
    apiRequest<InvestmentIncomeTaxResult>(
      "POST",
      "/api/tax/calculate-investment-income-tax",
      payload
    ),

  getTaxBrackets: (province: string, year?: number) => {
    const url = `/api/tax/brackets?province=${province}${year ? `&year=${year}` : ""}`;
    return apiRequest<TaxBracketsResponse>("GET", url);
  },
};
