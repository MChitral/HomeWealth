import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { scenarioApi, scenarioQueryKeys, type ScenarioPayload } from "../api";
import {
  useScenarioBasicInfoForm,
  type ScenarioBasicInfoFormData,
} from "./use-scenario-basic-info-form";
import type { Scenario } from "@shared/schema";

interface UseScenarioBasicInfoFormStateProps {
  scenario: Scenario | null | undefined;
  isNewScenario: boolean;
  scenarioId: string | null;
  onSuccess?: () => void;
}

/**
 * Complete hook for scenario basic info form state management
 * Integrates React Hook Form with mutation logic
 */
export function useScenarioBasicInfoFormState({
  scenario,
  isNewScenario,
  scenarioId,
  onSuccess,
}: UseScenarioBasicInfoFormStateProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useScenarioBasicInfoForm({
    initialName: scenario?.name,
    initialDescription: scenario?.description,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ScenarioBasicInfoFormData) => {
      // Build minimal payload for basic info only
      // Other fields (prepaymentSplit, expectedReturnRate, etc.) come from parent state
      const payload: ScenarioPayload = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        // These will need to come from parent component or be preserved from existing scenario
        prepaymentMonthlyPercent: scenario?.prepaymentMonthlyPercent ?? 50,
        investmentMonthlyPercent: scenario?.investmentMonthlyPercent ?? 50,
        expectedReturnRate: scenario?.expectedReturnRate ?? 6.0,
        efPriorityPercent: scenario?.efPriorityPercent ?? 0,
      };

      if (isNewScenario) {
        return scenarioApi.createScenario(payload);
      }
      return scenarioApi.updateScenario(scenarioId!, payload);
    },
    onSuccess: (savedScenario: Scenario) => {
      queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenariosWithMetrics() });
      queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all() });
      const id = savedScenario?.id ?? scenarioId;
      if (id) {
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenario(id) });
      }
      toast({
        title: isNewScenario ? "Scenario created" : "Scenario saved",
        description: isNewScenario
          ? "Your new scenario has been created."
          : "Your scenario has been updated.",
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: () => {
      toast({
        title: "Error saving scenario",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    saveMutation.mutate(data);
  });

  return {
    form,
    onSubmit,
    saveMutation,
  };
}
