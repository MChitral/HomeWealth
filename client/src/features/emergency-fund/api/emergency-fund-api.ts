import { apiRequest } from "@/shared/api/query-client";
import type { EmergencyFund } from "@shared/schema";

export type EmergencyFundPayload = {
  targetMonths: number;
  currentBalance: string;
  monthlyContribution: string;
};

export const emergencyFundQueryKeys = {
  emergencyFund: () => ["/api/emergency-fund"] as const,
};

export const emergencyFundApi = {
  fetch: () => apiRequest<EmergencyFund | null>("GET", "/api/emergency-fund"),
  create: (payload: EmergencyFundPayload) => apiRequest<EmergencyFund>("POST", "/api/emergency-fund", payload),
  update: (id: string, payload: EmergencyFundPayload) =>
    apiRequest<EmergencyFund>("PATCH", `/api/emergency-fund/${id}`, payload),
};

