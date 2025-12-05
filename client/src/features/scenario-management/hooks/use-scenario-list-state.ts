import { useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { useDeleteScenario } from "./use-scenarios";

export function useScenarioListState() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);

  const deleteScenario = useDeleteScenario(
    () =>
      toast({
        title: "Scenario deleted",
        description: "The scenario has been removed.",
      }),
    () =>
      toast({
        title: "Error deleting scenario",
        description: "Please try again.",
        variant: "destructive",
      }),
  );

  const handleDelete = (scenarioId: string) => {
    setScenarioToDelete(scenarioId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (scenarioToDelete) {
      deleteScenario.mutate(scenarioToDelete);
    }
    setDeleteDialogOpen(false);
    setScenarioToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setScenarioToDelete(null);
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    scenarioToDelete,
    handleDelete,
    confirmDelete,
    cancelDelete,
    deleteScenario,
  };
}

