import { apiRequest } from "@/shared/api/query-client";

export type InsuranceProvider = "CMHC" | "Sagen" | "Genworth";

export type PremiumPaymentType = "upfront" | "added-to-principal";

export interface InsuranceCalculationInput {
  propertyPrice: number;
  downPayment: number;
  provider: InsuranceProvider;
  mliSelectDiscount?: 0 | 10 | 20 | 30;
  premiumPaymentType?: PremiumPaymentType;
}

export interface InsuranceCalculationResult {
  mortgageAmount: number;
  ltvRatio: number;
  premiumRate: number;
  premiumAmount: number;
  premiumAfterDiscount: number;
  totalMortgageAmount: number;
  isHighRatio: boolean;
  provider: InsuranceProvider;
  breakdown: {
    basePremium: number;
    discountAmount: number;
    finalPremium: number;
  };
}

export interface InsuranceProviderComparison {
  CMHC: InsuranceCalculationResult;
  Sagen: InsuranceCalculationResult;
  Genworth: InsuranceCalculationResult;
}

export const insuranceApi = {
  calculateInsurance: (input: InsuranceCalculationInput) =>
    apiRequest<InsuranceCalculationResult>("POST", "/api/insurance/calculate", input),

  compareProviders: (input: Omit<InsuranceCalculationInput, "provider">) =>
    apiRequest<InsuranceProviderComparison>("POST", "/api/insurance/compare", input),

  getPremiumRateTable: (provider: InsuranceProvider) =>
    apiRequest<{ provider: string; rateTable: Record<string, number>; note: string }>(
      "GET",
      `/api/insurance/rates/${provider}`
    ),
};
