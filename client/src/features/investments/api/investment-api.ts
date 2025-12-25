import { apiRequest } from "@/shared/api/query-client";
import type {
  Investment,
  InvestmentTransaction,
  InvestmentIncome,
  InsertInvestment,
  UpdateInvestment,
} from "@shared/schema";

export type InvestmentTransactionPayload = {
  transactionDate: string;
  transactionType: "purchase" | "sale" | "dividend" | "interest" | "capital_gain";
  amount: number;
  quantity?: number;
  pricePerUnit?: number;
  description?: string;
  linkedHelocTransactionId?: string;
};

export type InvestmentIncomePayload = {
  incomeType: "dividend" | "interest" | "capital_gain";
  incomeDate: string;
  amount: number;
  taxYear: number;
  taxTreatment: "eligible_dividend" | "non_eligible_dividend" | "interest" | "capital_gain";
};

export const investmentApi = {
  fetchInvestments: () => apiRequest<Investment[]>("GET", "/api/investments"),

  fetchInvestment: (id: string) => apiRequest<Investment>("GET", `/api/investments/${id}`),

  createInvestment: (payload: Omit<InsertInvestment, "userId">) =>
    apiRequest<Investment>("POST", "/api/investments", payload),

  updateInvestment: (id: string, payload: Partial<UpdateInvestment>) =>
    apiRequest<Investment>("PUT", `/api/investments/${id}`, payload),

  deleteInvestment: (id: string) =>
    apiRequest<{ success: boolean }>("DELETE", `/api/investments/${id}`),

  fetchTransactions: (investmentId: string) =>
    apiRequest<InvestmentTransaction[]>("GET", `/api/investments/${investmentId}/transactions`),

  recordTransaction: (investmentId: string, payload: InvestmentTransactionPayload) =>
    apiRequest<InvestmentTransaction>("POST", `/api/investments/${investmentId}/transactions`, payload),

  fetchIncome: (investmentId: string, taxYear?: number) => {
    const url = taxYear
      ? `/api/investments/${investmentId}/income?taxYear=${taxYear}`
      : `/api/investments/${investmentId}/income`;
    return apiRequest<InvestmentIncome[]>("GET", url);
  },

  recordIncome: (investmentId: string, payload: InvestmentIncomePayload) =>
    apiRequest<InvestmentIncome>("POST", `/api/investments/${investmentId}/income`, payload),

  fetchIncomeByTaxYear: (taxYear: number) =>
    apiRequest<InvestmentIncome[]>("GET", `/api/investments/income/tax-year/${taxYear}`),
};

