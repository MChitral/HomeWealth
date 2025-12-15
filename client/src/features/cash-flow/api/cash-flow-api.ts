import { apiRequest } from "@/shared/api/query-client";
import type { CashFlow, InsertCashFlow } from "@shared/schema";

export type CashFlowPayload = Omit<InsertCashFlow, "userId">;

export const cashFlowQueryKeys = {
  cashFlow: () => ["/api/cash-flow"] as const,
};

export const cashFlowApi = {
  fetch: () => apiRequest<CashFlow | null>("GET", "/api/cash-flow"),
  create: (payload: CashFlowPayload) => apiRequest<CashFlow>("POST", "/api/cash-flow", payload),
  update: (id: string, payload: CashFlowPayload) =>
    apiRequest<CashFlow>("PATCH", `/api/cash-flow/${id}`, payload),
};
