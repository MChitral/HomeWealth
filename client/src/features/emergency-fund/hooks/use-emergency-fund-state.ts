import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/query-client";
import { useToast } from "@/shared/hooks/use-toast";
import type { EmergencyFund } from "@shared/schema";
import { emergencyFundApi, emergencyFundQueryKeys, type EmergencyFundPayload } from "../api";

interface UseEmergencyFundStateProps {
  emergencyFund: EmergencyFund | null;
}

export function useEmergencyFundState({ emergencyFund }: UseEmergencyFundStateProps) {
  const { toast } = useToast();

  const [targetMonths, setTargetMonths] = useState("6");
  const [currentBalance, setCurrentBalance] = useState("0");
  const [monthlyContribution, setMonthlyContribution] = useState("0");

  useEffect(() => {
    if (!emergencyFund) return;

    // Derived updates to local state
    const newTarget = emergencyFund.targetMonths.toString();
    if (newTarget !== targetMonths) setTargetMonths(newTarget);

    if (emergencyFund.currentBalance !== currentBalance)
      setCurrentBalance(emergencyFund.currentBalance);
    if (emergencyFund.monthlyContribution !== monthlyContribution)
      setMonthlyContribution(emergencyFund.monthlyContribution);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [emergencyFund, targetMonths, currentBalance, monthlyContribution]);

  const saveMutation = useMutation({
    mutationFn: (payload: EmergencyFundPayload) => {
      if (emergencyFund?.id) {
        return emergencyFundApi.update(emergencyFund.id, payload);
      }
      return emergencyFundApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyFundQueryKeys.emergencyFund() });
      toast({
        title: "Emergency fund saved",
        description: "Your emergency fund settings have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving emergency fund",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const targetMonthsNumber = parseFloat(targetMonths || "6");
    const normalizedTargetMonths = Math.max(1, Math.min(12, Math.round(targetMonthsNumber)));
    const payload: EmergencyFundPayload = {
      targetMonths: normalizedTargetMonths,
      currentBalance: currentBalance || "0",
      monthlyContribution: monthlyContribution || "0",
    };
    saveMutation.mutate(payload);
  };

  return {
    targetMonths,
    setTargetMonths,
    currentBalance,
    setCurrentBalance,
    monthlyContribution,
    setMonthlyContribution,
    handleSave,
    saveMutation,
  };
}
