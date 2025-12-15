import { useQuery } from "@tanstack/react-query";
import { mortgageApi, mortgageQueryKeys, type TriggerRateAlert } from "../api";

export function useTriggerStatus(mortgageId: string | null) {
  const { data: triggerStatus, isLoading } = useQuery<TriggerRateAlert | null>({
    queryKey: mortgageQueryKeys.triggerStatus(mortgageId),
    queryFn: () => mortgageApi.fetchTriggerStatus(mortgageId!),
    enabled: Boolean(mortgageId),
    refetchInterval: 1000 * 60 * 60, // Check every hour
  });

  return {
    triggerStatus,
    isLoading,
  };
}
