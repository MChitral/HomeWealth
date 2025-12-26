import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { smithManeuverApi } from "../api";
import type { InsertSmithManeuverStrategy, UpdateSmithManeuverStrategy } from "@shared/schema";

export function useSmithManeuverStrategies() {
  return useQuery({
    queryKey: ["smith-maneuver", "strategies"],
    queryFn: () => smithManeuverApi.fetchStrategies(),
  });
}

export function useSmithManeuverStrategy(id: string | null) {
  return useQuery({
    queryKey: ["smith-maneuver", "strategies", id],
    queryFn: () => (id ? smithManeuverApi.fetchStrategy(id) : null),
    enabled: !!id,
  });
}

export function useCreateSmithManeuverStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<InsertSmithManeuverStrategy, "userId">) =>
      smithManeuverApi.createStrategy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smith-maneuver", "strategies"] });
    },
  });
}

export function useUpdateSmithManeuverStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UpdateSmithManeuverStrategy> }) =>
      smithManeuverApi.updateStrategy(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["smith-maneuver", "strategies"] });
      queryClient.invalidateQueries({ queryKey: ["smith-maneuver", "strategies", variables.id] });
    },
  });
}

export function useDeleteSmithManeuverStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: smithManeuverApi.deleteStrategy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smith-maneuver", "strategies"] });
    },
  });
}
