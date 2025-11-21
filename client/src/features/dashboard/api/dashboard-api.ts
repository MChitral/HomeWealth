import type { EmergencyFund, Mortgage, CashFlow } from "@shared/schema";
import type { ScenarioWithMetrics } from "@/entities";
import { apiRequest } from "@/shared/api/query-client";

export const dashboardQueryKeys = {
  scenarios: () => ["/api/scenarios/with-projections"] as const,
  emergencyFund: () => ["/api/emergency-fund"] as const,
  mortgages: () => ["/api/mortgages"] as const,
  cashFlow: () => ["/api/cash-flow"] as const,
};

export const dashboardApi = {
  fetchScenarios: () => apiRequest<ScenarioWithMetrics[]>("GET", "/api/scenarios/with-projections"),
  fetchEmergencyFund: () => apiRequest<EmergencyFund | null>("GET", "/api/emergency-fund"),
  fetchMortgages: () => apiRequest<Mortgage[]>("GET", "/api/mortgages"),
  fetchCashFlow: () => apiRequest<CashFlow | null>("GET", "/api/cash-flow"),
};

