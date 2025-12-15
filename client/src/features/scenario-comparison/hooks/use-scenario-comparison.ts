import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type {
  ScenarioWithProjections,
  ScenarioForSelection,
  TimeHorizon,
  MetricName,
} from "../types";

const SCENARIO_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function useScenarioComparison() {
  const [location] = useLocation();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("10");

  // Fetch scenarios with calculated projections
  const { data: scenariosWithMetrics, isLoading } = useQuery<any[]>({
    queryKey: ["/api/scenarios/with-projections"],
  });

  // Read URL params on mount and select scenarios
  useEffect(() => {
    if (!scenariosWithMetrics || scenariosWithMetrics.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const scenariosParam = params.get("scenarios");

    if (scenariosParam) {
      // If coming from scenario card, add that scenario to selection
      const newScenarios = [...selectedScenarios];
      if (!newScenarios.includes(scenariosParam)) {
        newScenarios.push(scenariosParam);
      }
      setSelectedScenarios(newScenarios.slice(0, 4)); // Max 4 scenarios
    } else if (selectedScenarios.length === 0 && scenariosWithMetrics.length > 0) {
      // Default: select first 2-4 scenarios (up to 4)
      const defaultIds = scenariosWithMetrics.slice(0, 4).map((s) => s.id);
      setSelectedScenarios(defaultIds);
    }
  }, [location, scenariosWithMetrics]);

  // Map scenarios with colors
  const scenariosMap = useMemo(() => {
    return (scenariosWithMetrics || []).reduce(
      (acc: Record<string, ScenarioWithProjections>, scenario, index) => {
        acc[scenario.id] = {
          ...scenario,
          color: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
          metrics: scenario.metrics || {},
        };
        return acc;
      },
      {}
    );
  }, [scenariosWithMetrics]);

  // All available scenarios for selection
  const allScenarios: ScenarioForSelection[] = useMemo(() => {
    return (scenariosWithMetrics || []).map((s) => ({
      id: s.id,
      name: s.name,
    }));
  }, [scenariosWithMetrics]);

  // Selected scenario data with colors
  const selectedScenarioData = useMemo(() => {
    return selectedScenarios.map((id) => scenariosMap[id]).filter(Boolean);
  }, [selectedScenarios, scenariosMap]);

  // Toggle scenario selection
  const toggleScenario = (scenarioId: string) => {
    if (selectedScenarios.includes(scenarioId)) {
      // Remove if already selected (but keep at least 1)
      if (selectedScenarios.length > 1) {
        setSelectedScenarios(selectedScenarios.filter((id) => id !== scenarioId));
      }
    } else {
      // Add if not selected (max 4)
      if (selectedScenarios.length < 4) {
        setSelectedScenarios([...selectedScenarios, scenarioId]);
      }
    }
  };

  // Helper to get horizon-specific metrics
  const getMetricForHorizon = (metrics: any, metricName: MetricName) => {
    const suffix = timeHorizon === "10" ? "10yr" : timeHorizon === "20" ? "20yr" : "30yr";
    return metrics?.[`${metricName}${suffix}`] || 0;
  };

  // Calculate winner (best net worth at selected horizon)
  const winner = useMemo(() => {
    if (selectedScenarioData.length === 0) return null;
    return selectedScenarioData.reduce((prev, current) =>
      getMetricForHorizon(current.metrics, "netWorth") >
      getMetricForHorizon(prev.metrics, "netWorth")
        ? current
        : prev
    );
  }, [selectedScenarioData, timeHorizon]);

  // Generate chart data from real projections
  const generateChartData = (dataKey: "netWorth" | "mortgageBalance" | "investmentValue") => {
    if (!selectedScenarioData.length || !selectedScenarioData[0].projections) return [];

    const maxYears = parseInt(timeHorizon);
    const data: any[] = [];

    // Sample every 2 years for chart readability (year 0, 2, 4, ... maxYears)
    for (let displayYear = 0; displayYear <= maxYears; displayYear += 2) {
      const dataPoint: any = { year: displayYear };

      selectedScenarioData.forEach((scenario) => {
        if (scenario.projections && scenario.projections[displayYear]) {
          dataPoint[scenario.id] = scenario.projections[displayYear][dataKey];
        }
      });

      data.push(dataPoint);
    }

    return data;
  };

  const chartData = useMemo(
    () => ({
      netWorth: generateChartData("netWorth"),
      mortgage: generateChartData("mortgageBalance"),
      investment: generateChartData("investmentValue"),
    }),
    [selectedScenarioData, timeHorizon]
  );

  return {
    // Data
    scenariosMap,
    allScenarios,
    selectedScenarios,
    selectedScenarioData,
    winner,
    chartData,
    timeHorizon,
    isLoading,

    // Actions
    setTimeHorizon,
    toggleScenario,
    getMetricForHorizon,
  };
}
