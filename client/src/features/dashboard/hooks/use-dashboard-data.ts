import { useQuery } from "@tanstack/react-query";
import type { DashboardData } from "../types";
import { dashboardApi, dashboardQueryKeys } from "../api/dashboard-api";

export * from "./use-dashboard-calculations";
export * from "./use-dashboard-charts";

export function useDashboardData(): DashboardData {
  const {
    data: scenarios,
    isLoading: scenariosLoading,
  } = useQuery({
    queryKey: dashboardQueryKeys.scenarios(),
    queryFn: dashboardApi.fetchScenarios,
  });

  const {
    data: emergencyFund,
    isLoading: efLoading,
  } = useQuery({
    queryKey: dashboardQueryKeys.emergencyFund(),
    queryFn: dashboardApi.fetchEmergencyFund,
  });

  const {
    data: mortgages,
    isLoading: mortgageLoading,
  } = useQuery({
    queryKey: dashboardQueryKeys.mortgages(),
    queryFn: dashboardApi.fetchMortgages,
  });

  const { data: cashFlow, isLoading: cashFlowLoading } = useQuery({
    queryKey: dashboardQueryKeys.cashFlow(),
    queryFn: dashboardApi.fetchCashFlow,
  });

  const mortgage = mortgages && mortgages.length > 0 ? mortgages[0] : null;

  return {
    scenarios,
    emergencyFund,
    mortgage,
    cashFlow,
    isLoading: scenariosLoading || efLoading || mortgageLoading || cashFlowLoading,
  };
}

