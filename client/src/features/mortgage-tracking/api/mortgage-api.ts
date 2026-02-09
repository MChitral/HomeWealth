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
  deleteMortgage: (mortgageId: string) =>
    apiRequest<{ success: boolean }>("DELETE", `/api/mortgages/${mortgageId}`),

  // Skip Payment
  skipPayment: (
    mortgageId: string,
    termId: string,
    payload: {
      paymentDate: string;
      maxSkipsPerYear?: number;
    }
  ) =>
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
  fetchRefinanceAnalysis: (mortgageId: string, closingCosts?: RefinanceAnalysisRequest) =>
    closingCosts
      ? apiRequest<RefinanceAnalysisResponse | null>(
          "POST",
          `/api/mortgages/${mortgageId}/refinance-analysis`,
          closingCosts
        )
      : apiRequest<RefinanceAnalysisResponse | null>(
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

  // Recast
  calculateRecast: (mortgageId: string, payload: RecastCalculateRequest) =>
    apiRequest<RecastCalculationResult>(
      "POST",
      `/api/mortgages/${mortgageId}/recast/calculate`,
      payload
    ),
  applyRecast: (mortgageId: string, payload: RecastApplyRequest) =>
    apiRequest<RecastApplyResponse>("POST", `/api/mortgages/${mortgageId}/recast/apply`, payload),
  fetchRecastHistory: (mortgageId: string) =>
    apiRequest<RecastEvent[]>("GET", `/api/mortgages/${mortgageId}/recast/history`),

  // Payment Frequency Changes
  calculateFrequencyChange: (termId: string, payload: FrequencyChangeRequest) =>
    apiRequest<FrequencyChangeResult>(
      "POST",
      `/api/mortgage-terms/${termId}/frequency-change/calculate`,
      payload
    ),
  applyFrequencyChange: (termId: string, payload: FrequencyChangeApplyRequest) =>
    apiRequest<FrequencyChangeApplyResponse>(
      "POST",
      `/api/mortgage-terms/${termId}/frequency-change/apply`,
      payload
    ),
  fetchFrequencyChangeHistory: (mortgageId: string) =>
    apiRequest<FrequencyChangeEvent[]>("GET", `/api/mortgages/${mortgageId}/frequency-changes`),

  // Mortgage Portability
  calculatePortability: (mortgageId: string, payload: PortabilityCalculateRequest) =>
    apiRequest<PortabilityCalculationResult>(
      "POST",
      `/api/mortgages/${mortgageId}/portability/calculate`,
      payload
    ),
  applyPortability: (mortgageId: string, payload: PortabilityApplyRequest) =>
    apiRequest<PortabilityApplyResponse>(
      "POST",
      `/api/mortgages/${mortgageId}/portability/apply`,
      payload
    ),
  fetchPortabilityHistory: (mortgageId: string) =>
    apiRequest<PortabilityEvent[]>("GET", `/api/mortgages/${mortgageId}/portability/history`),

  // Property Value Tracking
  updatePropertyValue: (mortgageId: string, payload: PropertyValueUpdateRequest) =>
    apiRequest<PropertyValueUpdateResponse>(
      "POST",
      `/api/mortgages/${mortgageId}/property-value`,
      payload
    ),
  fetchPropertyValueHistory: (mortgageId: string) =>
    apiRequest<PropertyValueHistoryEntry[]>(
      "GET",
      `/api/mortgages/${mortgageId}/property-value/history`
    ),

  // Renewal Workflow
  startRenewalWorkflow: (mortgageId: string) =>
    apiRequest<RenewalWorkflowStartResponse>("POST", `/api/mortgages/${mortgageId}/renewal/start`),
  trackRenewalNegotiation: (mortgageId: string, payload: RenewalNegotiationRequest) =>
    apiRequest<RenewalNegotiationResponse>(
      "POST",
      `/api/mortgages/${mortgageId}/renewal/negotiations`,
      payload
    ),
  fetchRenewalOptions: (mortgageId: string) =>
    apiRequest<RenewalOptionsResponse>("GET", `/api/mortgages/${mortgageId}/renewal/options`),
  fetchRenewalNegotiations: (mortgageId: string) =>
    apiRequest<RenewalNegotiationEntry[]>(
      "GET",
      `/api/mortgages/${mortgageId}/renewal/negotiations`
    ),

  // Renewal History
  fetchRenewalHistory: (mortgageId: string) =>
    apiRequest<RenewalHistoryEntry[]>("GET", `/api/mortgages/${mortgageId}/renewal-history`),

  recordRenewalDecision: (mortgageId: string, request: RecordRenewalDecisionRequest) =>
    apiRequest<RenewalHistoryEntry>(
      "POST",
      `/api/mortgages/${mortgageId}/renewal-history`,
      request
    ),

  fetchRenewalAnalytics: (mortgageId: string) =>
    apiRequest<RenewalAnalyticsResponse>("GET", `/api/mortgages/${mortgageId}/renewal-analytics`),

  fetchRenewalRateComparison: (mortgageId: string) =>
    apiRequest<RenewalRateComparisonResponse>(
      "GET",
      `/api/mortgages/${mortgageId}/renewal-rate-comparison`
    ),

  fetchRenewalRecommendation: (mortgageId: string) =>
    apiRequest<RenewalRecommendationResponse>(
      "GET",
      `/api/mortgages/${mortgageId}/renewal-recommendation`
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
  closingCosts: number;
  monthlySavings: number;
  breakEvenMonths: number;
  isBeneficial: boolean;
  totalTermSavings: number;
};

export type RefinanceAnalysisRequest = {
  closingCosts?: {
    total?: number;
    legalFees?: number;
    appraisalFees?: number;
    dischargeFees?: number;
    otherFees?: number;
  };
};

export type CalculatePenaltyRequest = {
  balance: number;
  currentRate: number; // decimal
  marketRate: number; // decimal
  remainingMonths: number;
  termType?: "fixed" | "variable-changing" | "variable-fixed";
  penaltyCalculationMethod?: string;
  mortgageId?: string; // Optional: if provided, will check openClosedMortgageType
  openClosedMortgageType?: "open" | "closed" | null; // Optional: can be passed directly
};

export type CalculatePenaltyResponse = {
  threeMonthPenalty: number;
  irdPenalty: number;
  totalPenalty: number;
  method:
    | "IRD"
    | "IRD (Posted Rate)"
    | "IRD (Discounted Rate)"
    | "IRD (Origination Comparison)"
    | "3-Month Interest"
    | "3-Month Interest (Variable)"
    | "Open Mortgage";
  breakdown: {
    threeMonth: number;
    ird: number;
    applied:
      | "IRD"
      | "IRD (Posted Rate)"
      | "IRD (Discounted Rate)"
      | "IRD (Origination Comparison)"
      | "3-Month Interest"
      | "3-Month Interest (Variable)"
      | "Open Mortgage";
  };
  // Optional metadata
  isOpenMortgage?: boolean;
  mortgageType?: "open" | "closed" | null;
  note?: string; // e.g., "Penalty is $0 because this is an open mortgage"
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

export type RecastCalculateRequest = {
  prepaymentAmount: number;
  recastDate?: string;
};

export type RecastCalculationResult = {
  previousBalance: number;
  newBalance: number;
  previousPaymentAmount: number;
  newPaymentAmount: number;
  paymentReduction: number;
  remainingAmortizationMonths: number;
  canRecast: boolean;
  message?: string;
};

export type RecastApplyRequest = {
  prepaymentAmount: number;
  recastDate?: string;
};

export type RecastApplyResponse = {
  recastEvent: RecastEvent;
  updatedTerm: MortgageTerm | undefined;
};

export type RecastEvent = {
  id: string;
  mortgageId: string;
  termId: string;
  recastDate: string;
  prepaymentAmount: string;
  previousBalance: string;
  newBalance: string;
  previousPaymentAmount: string;
  newPaymentAmount: string;
  remainingAmortizationMonths: number;
  description: string | null;
  createdAt: string;
};

export type FrequencyChangeRequest = {
  newFrequency: string;
};

export type FrequencyChangeResult = {
  oldFrequency: string;
  newFrequency: string;
  oldPaymentAmount: number;
  newPaymentAmount: number;
  paymentDifference: number;
  remainingAmortizationMonths: number;
  canChange: boolean;
  message?: string;
};

export type FrequencyChangeApplyRequest = {
  newFrequency: string;
  changeDate?: string;
};

export type FrequencyChangeApplyResponse = {
  changeEvent: FrequencyChangeEvent;
  updatedTerm: MortgageTerm | undefined;
};

export type FrequencyChangeEvent = {
  id: string;
  mortgageId: string;
  termId: string;
  changeDate: string;
  oldFrequency: string;
  newFrequency: string;
  oldPaymentAmount: string;
  newPaymentAmount: string;
  remainingTermMonths: number;
  description: string | null;
  createdAt: string;
};

export type PortabilityCalculateRequest = {
  newPropertyPrice: number;
  portDate?: string;
};

export type PortabilityCalculationResult = {
  oldPropertyPrice: number;
  newPropertyPrice: number;
  portedAmount: number;
  topUpAmount: number;
  requiresTopUp: boolean;
  blendedRate?: number;
  canPort: boolean;
  message?: string;
};

export type PortabilityApplyRequest = {
  newPropertyPrice: number;
  portDate?: string;
};

export type PortabilityApplyResponse = {
  portabilityEvent: PortabilityEvent;
  newMortgage?: Mortgage;
};

export type PortabilityEvent = {
  id: string;
  mortgageId: string;
  portDate: string;
  oldPropertyPrice: string;
  newPropertyPrice: string;
  portedAmount: string;
  topUpAmount: string | null;
  newMortgageId: string | null;
  description: string | null;
  createdAt: string;
};

export type PropertyValueUpdateRequest = {
  propertyValue: number;
  valueDate?: string;
  source?: string;
  notes?: string;
};

export type PropertyValueUpdateResponse = {
  valueHistory: PropertyValueHistoryEntry;
  updatedMortgage: Mortgage | undefined;
};

export type PropertyValueHistoryEntry = {
  id: string;
  mortgageId: string;
  valueDate: string;
  propertyValue: string;
  source: string | null;
  notes: string | null;
  createdAt: string;
};

export type RenewalWorkflowStartResponse = {
  mortgage: Mortgage;
  currentTerm: MortgageTerm | undefined;
  renewalStatus: RenewalStatusResponse | null;
};

export type RenewalNegotiationRequest = {
  termId: string;
  negotiationDate?: string;
  offeredRate?: number;
  negotiatedRate?: number;
  status: "pending" | "accepted" | "rejected" | "counter_offered";
  notes?: string;
};

// Renewal History Types
export interface RenewalHistoryEntry {
  id: string;
  mortgageId: string;
  termId: string;
  renewalDate: string;
  previousRate: number; // Percentage (e.g., 5.5 for 5.5%)
  newRate: number; // Percentage
  decisionType: "stayed" | "switched" | "refinanced";
  lenderName?: string | null;
  estimatedSavings?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface RecordRenewalDecisionRequest {
  termId: string;
  renewalDate: string;
  previousRate: number; // Percentage
  newRate: number; // Percentage
  decisionType: "stayed" | "switched" | "refinanced";
  lenderName?: string;
  estimatedSavings?: number;
  notes?: string;
}

export interface RenewalPerformance {
  totalRenewals: number;
  averageRateChange: number;
  totalEstimatedSavings: number;
  lastRenewalDate?: string;
  lastRenewalRate?: number;
}

export interface RenewalRateComparison {
  currentRate: number;
  previousRate?: number;
  rateChange?: number;
  rateChangePercent?: number;
}

export interface RenewalAnalyticsResponse {
  performance: RenewalPerformance;
  rateComparison: RenewalRateComparison;
}

export type RenewalRateComparisonResponse = RenewalRateComparison;

// Renewal Recommendation Types
export interface RenewalRecommendationResponse {
  recommendation: "stay" | "switch" | "refinance" | "consider_switching";
  reasoning: string;
  confidence: "high" | "medium" | "low";
  stayWithCurrentLender?: {
    estimatedRate: number;
    estimatedPenalty: number;
    estimatedMonthlyPayment: number;
  };
  switchLender?: {
    estimatedRate: number;
    estimatedPenalty: number;
    estimatedClosingCosts: number;
    estimatedMonthlyPayment: number;
    breakEvenMonths: number;
  };
  refinance?: {
    estimatedRate: number;
    estimatedPenalty: number;
    estimatedClosingCosts: number;
    estimatedMonthlyPayment: number;
    monthlySavings: number;
    breakEvenMonths: number;
  };
}

export type RenewalNegotiationResponse = {
  id: string;
  mortgageId: string;
  termId: string;
  negotiationDate: string;
  offeredRate: string | null;
  negotiatedRate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

export type RenewalOptionsResponse = {
  stayWithCurrentLender: {
    estimatedRate: number;
    estimatedPenalty: number;
  };
  switchLender: {
    estimatedRate: number;
    estimatedPenalty: number;
    estimatedClosingCosts: number;
  };
};

export type RenewalNegotiationEntry = {
  id: string;
  mortgageId: string;
  termId: string;
  negotiationDate: string;
  offeredRate: string | null;
  negotiatedRate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

// Payment Corrections
export interface CorrectPaymentRequest {
  correctedAmount: number;
  reason: string;
}

export interface PaymentCorrection {
  id: string;
  paymentId: string;
  originalAmount: string;
  correctedAmount: string;
  reason: string;
  correctedBy: string | null;
  createdAt: string;
}

export async function correctPayment(
  paymentId: string,
  request: CorrectPaymentRequest
): Promise<{ correction: PaymentCorrection; payment: MortgagePayment }> {
  const response = await fetch(`/api/mortgage-payments/${paymentId}/correct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to correct payment");
  }

  return response.json();
}

export async function fetchPaymentCorrections(paymentId: string): Promise<PaymentCorrection[]> {
  const response = await fetch(`/api/mortgage-payments/${paymentId}/corrections`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch corrections");
  }

  return response.json();
}

// Stress Test Calculator
export interface StressTestRequest {
  mortgageAmount: number;
  contractRate: number; // Percentage (e.g., 5.5 for 5.5%)
  amortizationMonths: number;
  grossIncome: number;
  otherHousingCosts?: number;
  otherDebtPayments?: number;
  maxGDS?: number;
  maxTDS?: number;
}

export interface StressTestResult {
  passes: boolean;
  stressTestRate: number;
  qualifyingPayment: number;
  actualGDS: number;
  actualTDS: number;
  maxGDS: number;
  maxTDS: number;
  gdsPass: boolean;
  tdsPass: boolean;
  maxMortgageAmount: number;
  recommendations?: {
    message?: string;
    suggestions?: string[];
  };
}

export async function calculateStressTest(request: StressTestRequest): Promise<StressTestResult> {
  const response = await fetch("/api/mortgages/stress-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to calculate stress test");
  }

  return response.json();
}

// GDS/TDS Ratio Calculator
export interface DebtServiceRatiosRequest {
  mortgagePayment: number;
  grossIncome: number;
  propertyTax?: number;
  heatingCosts?: number;
  condoFees?: number;
  otherDebtPayments?: number;
  maxGDS?: number;
  maxTDS?: number;
}

export interface DebtServiceRatiosResult {
  gds: number;
  tds: number;
  housingCosts: number;
  monthlyIncome: number;
  gdsPass: boolean;
  tdsPass: boolean;
  overallPass: boolean;
  gdsWarning: boolean;
  tdsWarning: boolean;
  warnings: string[];
}

export async function calculateDebtServiceRatios(
  request: DebtServiceRatiosRequest
): Promise<DebtServiceRatiosResult> {
  const response = await fetch("/api/mortgages/debt-service-ratios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to calculate debt service ratios");
  }

  return response.json();
}

// Mortgage Payoff
export interface RecordPayoffRequest {
  payoffDate: string;
  finalPaymentAmount: number;
  remainingBalance: number;
  penaltyAmount?: number;
  notes?: string;
}

export interface MortgagePayoff {
  id: string;
  mortgageId: string;
  payoffDate: string;
  finalPaymentAmount: string;
  remainingBalance: string;
  penaltyAmount: string;
  totalCost: string;
  notes: string | null;
  createdAt: string;
}

export async function recordMortgagePayoff(
  mortgageId: string,
  request: RecordPayoffRequest
): Promise<{ payoff: MortgagePayoff; mortgageUpdated: boolean }> {
  const response = await fetch(`/api/mortgages/${mortgageId}/payoff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to record mortgage payoff");
  }

  return response.json();
}

export async function fetchMortgagePayoffHistory(mortgageId: string): Promise<MortgagePayoff[]> {
  const response = await fetch(`/api/mortgages/${mortgageId}/payoff/history`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch payoff history");
  }

  return response.json();
}

// Skip Payment Impact Calculator
export type SkipImpactRequest = {
  currentBalance: number;
  annualRate: number;
  paymentFrequency:
    | "monthly"
    | "semi-monthly"
    | "biweekly"
    | "accelerated-biweekly"
    | "weekly"
    | "accelerated-weekly";
  currentAmortizationMonths: number;
  numberOfSkips?: number;
};

export type SkipImpactResponse = {
  totalInterestAccrued: number;
  finalBalance: number;
  extendedAmortizationMonths: number;
  balanceIncrease: number;
};

export async function calculateSkipImpact(request: SkipImpactRequest): Promise<SkipImpactResponse> {
  const response = await fetch("/api/mortgages/calculate-skip-impact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to calculate skip impact");
  }

  return response.json();
}
