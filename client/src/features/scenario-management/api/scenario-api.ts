import type {
  Scenario,
  PrepaymentEvent,
  InsertPrepaymentEvent,
} from "@shared/schema";
import type { ScenarioWithMetrics } from "@/entities";
import { apiRequest } from "@/shared/api/query-client";

export type ScenarioPayload = {
  name: string;
  description: string | null;
  prepaymentMonthlyPercent: number;
  investmentMonthlyPercent: number;
  expectedReturnRate: number;
  efPriorityPercent: number;
};

export type ProjectionRequest = {
  currentBalance: number;
  annualRate: number; // As decimal, e.g., 0.0549 for 5.49%
  amortizationMonths: number;
  paymentFrequency?: 'monthly' | 'semi-monthly' | 'biweekly' | 'accelerated-biweekly' | 'weekly' | 'accelerated-weekly';
  monthlyPrepayAmount?: number;
  prepaymentEvents?: Array<{
    type: 'annual' | 'one-time' | 'monthly-percent';
    amount: number;
    startPaymentNumber?: number;
    recurrenceMonth?: number;
    monthlyPercent?: number;
  }>;
  rateOverride?: number; // Optional rate override for scenario modeling (as decimal)
  mortgageId?: string; // Optional: include historical payments from this mortgage
};

export type HistoricalYearData = {
  year: number;
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  isHistorical: true;
};

export type ProjectedYearData = {
  year: number;
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  isHistorical?: false;
};

export type YearlyData = HistoricalYearData | ProjectedYearData;

export type ProjectionResponse = {
  yearlyData: YearlyData[];
  chartData: Array<{
    year: number;
    balance: number;
    principal: number;
    interest: number;
  }>;
  summary: {
    projectedPayoff: number;
    totalInterest: number;
    totalPrincipal: number;
    interestSaved: number;
    totalPayments: number;
    payoffDate: string | null;
  };
  effectiveRate: number; // The actual rate used (after any override)
};

export const scenarioQueryKeys = {
  all: () => ["/api/scenarios"] as const,
  scenariosWithMetrics: () => ["/api/scenarios/with-projections"] as const,
  scenario: (id: string | null) => ["/api/scenarios", id] as const,
  scenarioEvents: (id: string | null) => ["/api/scenarios", id, "prepayment-events"] as const,
};

export const scenarioApi = {
  fetchScenariosWithMetrics: () =>
    apiRequest<ScenarioWithMetrics[]>("GET", "/api/scenarios/with-projections"),
  fetchScenario: (id: string) => apiRequest<Scenario>("GET", `/api/scenarios/${id}`),
  fetchPrepaymentEvents: (scenarioId: string) =>
    apiRequest<PrepaymentEvent[]>("GET", `/api/scenarios/${scenarioId}/prepayment-events`),
  createScenario: (payload: ScenarioPayload) => apiRequest<Scenario>("POST", "/api/scenarios", payload),
  updateScenario: (id: string, payload: ScenarioPayload) =>
    apiRequest<Scenario>("PATCH", `/api/scenarios/${id}`, payload),
  deleteScenario: (id: string) => apiRequest("DELETE", `/api/scenarios/${id}`),
  createPrepaymentEvent: (scenarioId: string, payload: InsertPrepaymentEvent) =>
    apiRequest<PrepaymentEvent>("POST", `/api/scenarios/${scenarioId}/prepayment-events`, payload),
  updatePrepaymentEvent: (eventId: string, payload: Partial<InsertPrepaymentEvent>) =>
    apiRequest<PrepaymentEvent>("PATCH", `/api/prepayment-events/${eventId}`, payload),
  deletePrepaymentEvent: (eventId: string) =>
    apiRequest("DELETE", `/api/prepayment-events/${eventId}`, {}),
  fetchProjection: (params: ProjectionRequest) =>
    apiRequest<ProjectionResponse>("POST", "/api/mortgages/projection", params),
};

