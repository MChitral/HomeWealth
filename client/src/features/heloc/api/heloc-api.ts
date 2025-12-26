import { apiRequest } from "@/shared/api/query-client";
import type {
  HelocAccount,
  HelocTransaction,
  InsertHelocAccount,
  UpdateHelocAccount,
} from "@shared/schema";

export type BorrowPayload = {
  amount: number;
  transactionDate: string;
  description?: string;
};

export type PaymentPayload = {
  amount: number;
  transactionDate: string;
  paymentType: "interest_only" | "interest_principal" | "full";
  description?: string;
};

export type CreditLimitResponse = {
  creditLimit: string;
  currentBalance: string;
  availableCredit: number;
};

export const helocApi = {
  fetchAccounts: () => apiRequest<HelocAccount[]>("GET", "/api/heloc/accounts"),

  fetchAccount: (id: string) => apiRequest<HelocAccount>("GET", `/api/heloc/accounts/${id}`),

  createAccount: (payload: Omit<InsertHelocAccount, "userId">) =>
    apiRequest<HelocAccount>("POST", "/api/heloc/accounts", payload),

  updateAccount: (id: string, payload: Partial<UpdateHelocAccount>) =>
    apiRequest<HelocAccount>("PUT", `/api/heloc/accounts/${id}`, payload),

  deleteAccount: (id: string) =>
    apiRequest<{ success: boolean }>("DELETE", `/api/heloc/accounts/${id}`),

  recordBorrowing: (accountId: string, payload: BorrowPayload) =>
    apiRequest<HelocTransaction>("POST", `/api/heloc/accounts/${accountId}/borrow`, payload),

  recordPayment: (accountId: string, payload: PaymentPayload) =>
    apiRequest<HelocTransaction>("POST", `/api/heloc/accounts/${accountId}/payments`, payload),

  fetchTransactions: (accountId: string) =>
    apiRequest<HelocTransaction[]>("GET", `/api/heloc/accounts/${accountId}/transactions`),

  getCreditLimit: (accountId: string) =>
    apiRequest<CreditLimitResponse>("GET", `/api/heloc/accounts/${accountId}/credit-limit`),

  recalculateCreditLimit: (accountId: string) =>
    apiRequest<HelocAccount>("POST", `/api/heloc/accounts/${accountId}/recalculate-credit-limit`),

  calculateCreditLimitImpact: (payload: {
    homeValue: number;
    maxLTV: number;
    currentMortgageBalance: number;
    projectedMortgageBalance: number;
    helocBalance: number;
  }) =>
    apiRequest<CreditLimitImpactResponse>(
      "POST",
      "/api/heloc/calculate-credit-limit-impact",
      payload
    ),
};

export type CreditRoomResponse = {
  creditRoom: number;
  availableCredit: number;
  mortgageBalance: number;
  helocBalance: number;
  utilization: number;
};

export type CreditLimitImpactResponse = {
  currentCreditLimit: number;
  projectedCreditLimit: number;
  creditRoomIncrease: number;
  currentAvailableCredit: number;
  projectedAvailableCredit: number;
  availableCreditIncrease: number;
};

export type SkipImpactResponse = {
  totalInterestAccrued: number;
  finalBalance: number;
  extendedAmortizationMonths: number;
  balanceIncrease: number;
};

export type CreditRoomHistoryItem = {
  date: string;
  mortgageBalance: number;
  creditRoom: number;
  availableCredit: number;
};

export const reAdvanceableMortgageApi = {
  markMortgageAsReAdvanceable: (mortgageId: string, helocAccountId: string) =>
    apiRequest<{ mortgage: any; helocAccount: HelocAccount }>(
      "POST",
      `/api/mortgages/${mortgageId}/mark-re-advanceable`,
      { helocAccountId }
    ),

  getCreditRoom: (mortgageId: string) =>
    apiRequest<CreditRoomResponse>("GET", `/api/mortgages/${mortgageId}/credit-room`),

  getCreditRoomHistory: (mortgageId: string) =>
    apiRequest<CreditRoomHistoryItem[]>("GET", `/api/mortgages/${mortgageId}/credit-room-history`),
};
