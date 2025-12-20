export interface HealthScoreResult {
  totalScore: number;
  riskScore: number;
  efficiencyScore: number;
  flexibilityScore: number;
  breakdown: string[];
}

export const getHealthScore = async (mortgageId: string): Promise<HealthScoreResult> => {
  const response = await fetch(`/api/mortgages/${mortgageId}/health`);
  if (!response.ok) {
    throw new Error("Failed to fetch health score");
  }
  return response.json();
};
