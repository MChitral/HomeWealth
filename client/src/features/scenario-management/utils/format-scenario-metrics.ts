import type { ScenarioWithMetrics } from "@/entities";

export function formatScenarioMetrics(scenario: ScenarioWithMetrics) {
  const metrics = scenario.metrics;
  
  if (!metrics) {
    return {
      netWorth: "Calculating...",
      mortgageBalance: "Calculating...",
    };
  }

  return {
    netWorth: `$${(metrics.netWorth10yr / 1000).toFixed(0)}k`,
    mortgageBalance: `$${(metrics.mortgageBalance10yr / 1000).toFixed(0)}k`,
  };
}

