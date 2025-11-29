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

export const mortgageQueryKeys = {
  mortgages: () => ["/api/mortgages"] as const,
  mortgageTerms: (mortgageId: string | null) => ["/api/mortgages", mortgageId, "terms"] as const,
  mortgagePayments: (mortgageId: string | null) => ["/api/mortgages", mortgageId, "payments"] as const,
  primeRate: () => ["/api/prime-rate"] as const,
};

export type BulkCreatePaymentsResponse = {
  created: number;
  payments: MortgagePayment[];
};

export const mortgageApi = {
  fetchMortgages: () => apiRequest<Mortgage[]>("GET", "/api/mortgages"),
  fetchMortgageTerms: (mortgageId: string) =>
    apiRequest<MortgageTerm[]>("GET", `/api/mortgages/${mortgageId}/terms`),
  fetchMortgagePayments: (mortgageId: string) =>
    apiRequest<MortgagePayment[]>("GET", `/api/mortgages/${mortgageId}/payments`),
  fetchPrimeRate: () => apiRequest<PrimeRateResponse>("GET", "/api/prime-rate"),
  fetchHistoricalPrimeRates: (startDate: string, endDate: string) =>
    apiRequest<HistoricalPrimeRatesResponse>("GET", `/api/prime-rate/history?start_date=${startDate}&end_date=${endDate}`),
  createMortgage: (payload: CreateMortgagePayload) => apiRequest<Mortgage>("POST", "/api/mortgages", payload),
  updateMortgage: (mortgageId: string, payload: UpdateMortgagePayload) =>
    apiRequest<Mortgage>("PATCH", `/api/mortgages/${mortgageId}`, payload),
  createTerm: (mortgageId: string, payload: CreateTermPayload) =>
    apiRequest<MortgageTerm>("POST", `/api/mortgages/${mortgageId}/terms`, payload),
  updateTerm: (termId: string, payload: UpdateTermPayload) =>
    apiRequest<MortgageTerm>("PATCH", `/api/mortgage-terms/${termId}`, payload),
  createPayment: (mortgageId: string, payload: CreatePaymentPayload) =>
    apiRequest<MortgagePayment>("POST", `/api/mortgages/${mortgageId}/payments`, payload),
  createBulkPayments: (mortgageId: string, payments: CreatePaymentPayload[]) =>
    apiRequest<BulkCreatePaymentsResponse>("POST", `/api/mortgages/${mortgageId}/payments/bulk`, { payments }),
  deletePayment: (paymentId: string) =>
    apiRequest<{ success: boolean }>("DELETE", `/api/mortgage-payments/${paymentId}`),
};

