import { useMutation, useQuery } from "@tanstack/react-query";
import { scenarioApi, scenarioQueryKeys } from "../api";
import type { ScenarioWithMetrics } from "@/entities";
import { queryClient } from "@/shared/api/query-client";

export function useScenarios() {
  return useQuery<ScenarioWithMetrics[]>({
    queryKey: scenarioQueryKeys.scenariosWithMetrics(),
    queryFn: scenarioApi.fetchScenariosWithMetrics,
  });
}

export function useDeleteScenario(onSuccess?: () => void, onError?: () => void) {
  return useMutation({
    mutationFn: scenarioApi.deleteScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenariosWithMetrics() });
      queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all() });
      if (onSuccess) onSuccess();
    },
    onError,
  });
}

