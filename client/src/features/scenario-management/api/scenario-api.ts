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
};

