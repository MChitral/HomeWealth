import { useQuery } from "@tanstack/react-query";
import type { Scenario, PrepaymentEvent } from "@shared/schema";
import { scenarioApi, scenarioQueryKeys } from "../api";

export function useScenarioDetail(scenarioId: string | null) {
  const {
    data: scenario,
    isLoading: scenarioLoading,
  } = useQuery<Scenario>({
    queryKey: scenarioQueryKeys.scenario(scenarioId),
    queryFn: () => scenarioApi.fetchScenario(scenarioId as string),
    enabled: Boolean(scenarioId),
  });

  const {
    data: prepaymentEvents,
    isLoading: eventsLoading,
  } = useQuery<PrepaymentEvent[]>({
    queryKey: scenarioQueryKeys.scenarioEvents(scenarioId),
    queryFn: () => scenarioApi.fetchPrepaymentEvents(scenarioId as string),
    enabled: Boolean(scenarioId),
  });

  return {
    scenario,
    prepaymentEvents,
    isLoading: scenarioLoading || eventsLoading,
  };
}

