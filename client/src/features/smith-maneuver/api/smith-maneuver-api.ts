import { apiRequest } from "@/shared/api/query-client";
import type {
  SmithManeuverStrategy,
  SmithManeuverTransaction,
  SmithManeuverTaxCalculation,
  InsertSmithManeuverStrategy,
  UpdateSmithManeuverStrategy,
} from "@shared/schema";

export type YearlyProjection = {
  year: number;
  mortgageBalance: number;
  helocBalance: number;
  investmentValue: number;
  totalPrepayments: number;
  totalBorrowings: number;
  helocInterestPaid: number;
  investmentReturns: number;
  taxSavings: number;
  netBenefit: number;
  leverageRatio: number;
  interestCoverage: number;
};

export const smithManeuverApi = {
  fetchStrategies: () => apiRequest<SmithManeuverStrategy[]>("GET", "/api/smith-maneuver/strategies"),

  fetchStrategy: (id: string) =>
    apiRequest<SmithManeuverStrategy>("GET", `/api/smith-maneuver/strategies/${id}`),

  createStrategy: (payload: Omit<InsertSmithManeuverStrategy, "userId">) =>
    apiRequest<SmithManeuverStrategy>("POST", "/api/smith-maneuver/strategies", payload),

  updateStrategy: (id: string, payload: Partial<UpdateSmithManeuverStrategy>) =>
    apiRequest<SmithManeuverStrategy>("PUT", `/api/smith-maneuver/strategies/${id}`, payload),

  deleteStrategy: (id: string) =>
    apiRequest<{ success: boolean }>("DELETE", `/api/smith-maneuver/strategies/${id}`),

  generateProjections: (strategyId: string, years?: number) => {
    const url = years
      ? `/api/smith-maneuver/strategies/${strategyId}/project?years=${years}`
      : `/api/smith-maneuver/strategies/${strategyId}/project`;
    return apiRequest<YearlyProjection[]>("POST", url);
  },

  fetchTransactions: (strategyId: string) =>
    apiRequest<SmithManeuverTransaction[]>("GET", `/api/smith-maneuver/strategies/${strategyId}/transactions`),

  fetchTaxCalculations: (strategyId: string) =>
    apiRequest<SmithManeuverTaxCalculation[]>(
      "GET",
      `/api/smith-maneuver/strategies/${strategyId}/tax-calculations`
    ),
};

