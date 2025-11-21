import {
  apiRequest,
} from "@/shared/api/query-client";
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
};

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

export const mortgageQueryKeys = {
  mortgages: () => ["/api/mortgages"] as const,
  mortgageTerms: (mortgageId: string | null) => ["/api/mortgages", mortgageId, "terms"] as const,
  mortgagePayments: (mortgageId: string | null) => ["/api/mortgages", mortgageId, "payments"] as const,
};

export const mortgageApi = {
  fetchMortgages: () => apiRequest<Mortgage[]>("GET", "/api/mortgages"),
  fetchMortgageTerms: (mortgageId: string) =>
    apiRequest<MortgageTerm[]>("GET", `/api/mortgages/${mortgageId}/terms`),
  fetchMortgagePayments: (mortgageId: string) =>
    apiRequest<MortgagePayment[]>("GET", `/api/mortgages/${mortgageId}/payments`),
  createMortgage: (payload: CreateMortgagePayload) => apiRequest<Mortgage>("POST", "/api/mortgages", payload),
  updateMortgage: (mortgageId: string, payload: UpdateMortgagePayload) =>
    apiRequest<Mortgage>("PATCH", `/api/mortgages/${mortgageId}`, payload),
  createTerm: (mortgageId: string, payload: CreateTermPayload) =>
    apiRequest<MortgageTerm>("POST", `/api/mortgages/${mortgageId}/terms`, payload),
  createPayment: (mortgageId: string, payload: CreatePaymentPayload) =>
    apiRequest<MortgagePayment>("POST", `/api/mortgages/${mortgageId}/payments`, payload),
};

