import { apiRequest } from "@/shared/api/query-client";
import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";

export type CreateMortgagePayload = {
  propertyPrice: string;
  downPayment: string;
  originalAmount: string;
  currentBalance: string;
  startDate: string;
  amortizationYears: number;
  amortizationMonths?: number;
  paymentFrequency: string;
  annualPrepaymentLimitPercent?: number;
  // Insurance fields (optional)
  insuranceProvider?: string;
  insurancePremium?: string;
  insuranceAddedToPrincipal?: string;
  isHighRatio?: string;
};

export type UpdateMortgagePayload = Partial<CreateMortgagePayload>;

export type CreateTermPayload = {
  termType: string;
  startDate: string;
  endDate: string;
  termYears: number;
  paymentFrequency: string;
  regularPaymentAmount: string;
  fixedRate?: string;
  lockedSpread?: string;
  primeRate?: string;
};

export type UpdateTermPayload = Partial<CreateTermPayload>;

export type CreatePaymentPayload = {
  termId: string;
  paymentDate: string;
  paymentPeriodLabel?: string;
  regularPaymentAmount: string;
  prepaymentAmount: string;
  paymentAmount: string;
  principalPaid: string;
  interestPaid: string;
  remainingBalance: string;
  primeRate?: string;
  effectiveRate: string;
  triggerRateHit: number;
  remainingAmortizationMonths: number;
};

export type PrimeRateResponse = {
  primeRate: number;
  effectiveDate: string;
  source: string;
  lastUpdated: string;
};

export type HistoricalRateEntry = {
  date: string;
  primeRate: number;
};

export type HistoricalPrimeRatesResponse = {
  rates: HistoricalRateEntry[];
  source: string;
  startDate: string;
  endDate: string;
};

/**
 * Query keys for mortgage-related queries
 * Uses hierarchical structure for proper cache invalidation
 */
export const mortgageQueryKeys = {
  // Base key for all mortgage queries
  all: ["/api/mortgages"] as const,

  // Prime rate key (separate from mortgage hierarchy)
  primeRate: () => ["prime-rate"] as const,

  // List of all mortgages
  mortgages: () => ["/api/mortgages"] as const,

  // Terms for a specific mortgage
  mortgageTerms: (mortgageId: string | null) => ["/api/mortgages", mortgageId, "terms"] as const,

  // Payments for a specific mortgage
  mortgagePayments: (mortgageId: string | null) =>
    ["/api/mortgages", mortgageId, "payments"] as const,

  // Trigger rate status
  triggerStatus: (mortgageId: string | null) =>
    ["/api/mortgages", mortgageId, "trigger-status"] as const,
};

export type BulkCreatePaymentsResponse = {
  created: number;
  payments: MortgagePayment[];
};

export type TriggerRateAlert = {
  mortgageId: string;
  mortgageName: string;
  userId: string;
  currentRate: number;
  triggerRate: number;
  isHit: boolean;
  isRisk: boolean; // Within 0.5%
  balance: number;
  paymentAmount: number;
};

export const mortgageApi = {
  fetchMortgages: () => apiRequest<Mortgage[]>("GET", "/api/mortgages"),
  fetchMortgageTerms: (mortgageId: string) =>
    apiRequest<MortgageTerm[]>("GET", `/api/mortgages/${mortgageId}/terms`),
  fetchMortgagePayments: (mortgageId: string) =>
    apiRequest<MortgagePayment[]>("GET", `/api/mortgages/${mortgageId}/payments`),
  fetchTriggerStatus: (mortgageId: string) =>
    apiRequest<TriggerRateAlert | null>("GET", `/api/mortgages/${mortgageId}/trigger-status`),
  fetchPrimeRate: () => apiRequest<PrimeRateResponse>("GET", "/api/prime-rate"),
  fetchHistoricalPrimeRates: (startDate: string, endDate: string) =>
    apiRequest<HistoricalPrimeRatesResponse>(
      "GET",
      `/api/prime-rate/history?start_date=${startDate}&end_date=${endDate}`
    ),
  createMortgage: (payload: CreateMortgagePayload) =>
    apiRequest<Mortgage>("POST", "/api/mortgages", payload),
  updateMortgage: (mortgageId: string, payload: UpdateMortgagePayload) =>
    apiRequest<Mortgage>("PATCH", `/api/mortgages/${mortgageId}`, payload),
  createTerm: (mortgageId: string, payload: CreateTermPayload) =>
    apiRequest<MortgageTerm>("POST", `/api/mortgages/${mortgageId}/terms`, payload),
  updateTerm: (termId: string, payload: UpdateTermPayload) =>
    apiRequest<MortgageTerm>("PATCH", `/api/mortgage-terms/${termId}`, payload),
  createPayment: (mortgageId: string, payload: CreatePaymentPayload) =>
    apiRequest<MortgagePayment>("POST", `/api/mortgages/${mortgageId}/payments`, payload),
  createBulkPayments: (mortgageId: string, payments: CreatePaymentPayload[]) =>
    apiRequest<BulkCreatePaymentsResponse>("POST", `/api/mortgages/${mortgageId}/payments/bulk`, {
      payments,
    }),
  deletePayment: (paymentId: string) =>
    apiRequest<{ success: boolean }>("DELETE", `/api/mortgage-payments/${paymentId}`),

  // Skip Payment
  skipPayment: (mortgageId: string, termId: string, payload: {
    paymentDate: string;
    maxSkipsPerYear?: number;
  }) =>
    apiRequest<MortgagePayment>(
      "POST",
      `/api/mortgages/${mortgageId}/terms/${termId}/skip-payment`,
      payload
    ),

  // Impact Analysis
  fetchLatestImpact: (mortgageId: string) =>
    apiRequest<ImpactResult | null>("GET", `/api/impact/${mortgageId}`),
  calculateImpacts: (payload: { oldRate: number; newRate: number }) =>
    apiRequest<{ message: string; impacts: ImpactResult[] }>(
      "POST",
      "/api/impact/calculate",
      payload
    ),

  // Renewal Planning
  fetchRenewalStatus: (mortgageId: string) =>
    apiRequest<RenewalStatusResponse | null>("GET", `/api/mortgages/${mortgageId}/renewal-status`),

  // Refinancing Analysis
  fetchRefinanceAnalysis: (mortgageId: string) =>
    apiRequest<RefinanceAnalysisResponse | null>(
      "GET",
      `/api/mortgages/${mortgageId}/refinance-analysis`
    ),

  // Penalty Calculator
  calculatePenalty: (payload: CalculatePenaltyRequest) =>
    apiRequest<CalculatePenaltyResponse>("POST", "/api/mortgages/calculate-penalty", payload),

  // Market Rate (for penalty calculator and blend-and-extend)
  fetchMarketRate: (rateType: string, termYears: number) =>
    apiRequest<{ rate: number; rateType: string; termYears: number }>(
      "GET",
      `/api/market-rates?rateType=${rateType}&termYears=${termYears}`
    ),

  // Blend-and-Extend
  calculateBlendAndExtend: (termId: string, payload: BlendAndExtendRequest) =>
    apiRequest<BlendAndExtendResponse>(
      "POST",
      `/api/mortgage-terms/${termId}/blend-and-extend`,
      payload
    ),
};

export type RenewalStatusResponse = {
  mortgageId: string;
  daysUntilRenewal: number;
  renewalDate: string;
  status: "urgent" | "soon" | "upcoming" | "safe";
  currentRate: number;
  estimatedPenalty: {
    amount: number;
    method: "IRD" | "3-Month Interest";
  };
};

export type ImpactResult = {
  termId: string;
  mortgageId: string;
  impactType: "payment_increase" | "trigger_risk";
  oldValue: number;
  newValue: number;
  delta: number;
  message: string;
};

export type RefinanceAnalysisResponse = {
  currentRate: number;
  marketRate: number;
  marketRateType: "fixed" | "variable";
  penalty: number;
  monthlySavings: number;
  breakEvenMonths: number;
  isBeneficial: boolean;
  totalTermSavings: number;
};

export type CalculatePenaltyRequest = {
  balance: number;
  currentRate: number; // decimal
  marketRate: number; // decimal
  remainingMonths: number;
  termType?: "fixed" | "variable-changing" | "variable-fixed";
};

export type CalculatePenaltyResponse = {
  threeMonthPenalty: number;
  irdPenalty: number;
  totalPenalty: number;
  method: "IRD" | "3-Month Interest";
  breakdown: {
    threeMonth: number;
    ird: number;
    applied: "IRD" | "3-Month Interest";
  };
};

export type BlendAndExtendRequest = {
  newMarketRate: number; // percentage (e.g., 5.49)
  extendedAmortizationMonths?: number;
};

export type BlendAndExtendResponse = {
  blendedRate: number; // decimal
  blendedRatePercent: string; // formatted percentage
  newPaymentAmount: number;
  marketRatePaymentAmount: number;
  oldRatePaymentAmount: number;
  interestSavingsPerPayment: number;
  extendedAmortizationMonths: number;
  message: string;
};
