import { useMutation } from "@tanstack/react-query";
import { smithManeuverApi, type YearlyProjection } from "../api";

export function useGenerateProjections() {
  return useMutation({
    mutationFn: ({ strategyId, years }: { strategyId: string; years?: number }) =>
      smithManeuverApi.generateProjections(strategyId, years),
  });
}

export type { YearlyProjection };

