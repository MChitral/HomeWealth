export interface SimulationParams {
  mortgageId: string;
  numIterations?: number;
}

export interface SimulationResult {
  iterations: number;
  balanceDistribution: {
    p10: number;
    p50: number;
    p90: number;
  };
  probabilityOfPayoff: number;
  samplePaths: {
    month: number;
    rate: number;
    balance: number;
  }[][];
}

export const runTriggerRateSimulation = async (
  params: SimulationParams
): Promise<SimulationResult> => {
  const response = await fetch("/api/simulations/trigger-rate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to run simulation");
  }

  return response.json();
};
