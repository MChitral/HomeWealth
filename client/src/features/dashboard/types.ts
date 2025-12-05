import type { ScenarioWithMetrics } from "@/entities";
import type { EmergencyFund, Mortgage, CashFlow } from "@shared/schema";

export type { ScenarioWithMetrics } from "@/entities";

export type DashboardData = {
  scenarios: ScenarioWithMetrics[] | undefined;
  emergencyFund: EmergencyFund | null | undefined;
  cashFlow: CashFlow | null | undefined;
  isLoading: boolean;
};

