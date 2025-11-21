import { useQuery } from "@tanstack/react-query";
import type { EmergencyFund } from "@shared/schema";
import { emergencyFundApi, emergencyFundQueryKeys } from "../api";

export function useEmergencyFundData() {
  const { data, isLoading } = useQuery<EmergencyFund | null>({
    queryKey: emergencyFundQueryKeys.emergencyFund(),
    queryFn: emergencyFundApi.fetch,
  });

  return {
    emergencyFund: data ?? null,
    isLoading,
  };
}

