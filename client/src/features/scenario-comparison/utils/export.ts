import type { ScenarioWithProjections, TimeHorizon, MetricName } from "../types";

interface ExportData {
  scenarios: ScenarioWithProjections[];
  timeHorizon: TimeHorizon;
  getMetricForHorizon: (metrics: any, metricName: MetricName) => number;
  chartData: {
    netWorth: any[];
    mortgage: any[];
    investment: any[];
  };
}

/**
 * Export scenario comparison data to CSV
 */
export function exportToCSV(data: ExportData): void {
  const { scenarios, timeHorizon, getMetricForHorizon } = data;

  // Prepare CSV rows
  const rows: string[] = [];

  // Header row
  rows.push(`Metric,${scenarios.map((s) => s.name).join(",")}`);

  // Metric rows
  const metrics = [
    { label: `Net Worth (${timeHorizon} years)`, key: "netWorth" as MetricName },
    { label: `Mortgage Balance (${timeHorizon} years)`, key: "mortgageBalance" as MetricName },
    { label: "Years to Mortgage Freedom", key: "mortgagePayoffYear" as MetricName },
    { label: "Total Interest Paid", key: "totalInterestPaid" as MetricName },
    { label: `Investment Portfolio (${timeHorizon} years)`, key: "investments" as MetricName },
    { label: "Investment Returns Earned", key: "investmentReturns" as MetricName },
    { label: "Emergency Fund Filled By", key: "emergencyFundFilledByYear" as MetricName },
  ];

  metrics.forEach((metric) => {
    const values = scenarios.map((scenario) => {
      if (metric.key === "mortgagePayoffYear") {
        return scenario.metrics.mortgagePayoffYear;
      }
      if (metric.key === "emergencyFundFilledByYear") {
        return scenario.metrics.emergencyFundFilledByYear;
      }
      if (metric.key === "totalInterestPaid") {
        return scenario.metrics.totalInterestPaid;
      }
      return getMetricForHorizon(scenario.metrics, metric.key);
    });
    rows.push(`${metric.label},${values.join(",")}`);
  });

  // Create CSV content
  const csvContent = rows.join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `scenario-comparison-${timeHorizon}yr-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export scenario comparison data to JSON
 */
export function exportToJSON(data: ExportData): void {
  const { scenarios, timeHorizon, getMetricForHorizon, chartData } = data;

  const exportData = {
    exportDate: new Date().toISOString(),
    timeHorizon,
    scenarios: scenarios.map((scenario) => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      metrics: {
        netWorth: getMetricForHorizon(scenario.metrics, "netWorth"),
        mortgageBalance: getMetricForHorizon(scenario.metrics, "mortgageBalance"),
        mortgagePayoffYear: scenario.metrics.mortgagePayoffYear,
        totalInterestPaid: scenario.metrics.totalInterestPaid,
        investments: getMetricForHorizon(scenario.metrics, "investments"),
        investmentReturns: getMetricForHorizon(scenario.metrics, "investmentReturns"),
        emergencyFundFilledByYear: scenario.metrics.emergencyFundFilledByYear,
      },
      settings: {
        prepaymentMonthlyPercent: scenario.prepaymentMonthlyPercent,
        investmentMonthlyPercent: scenario.investmentMonthlyPercent,
        expectedReturnRate: parseFloat(scenario.expectedReturnRate),
        efPriorityPercent: scenario.efPriorityPercent,
      },
    })),
    chartData: {
      netWorth: chartData.netWorth,
      mortgage: chartData.mortgage,
      investment: chartData.investment,
    },
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `scenario-comparison-${timeHorizon}yr-${new Date().toISOString().split("T")[0]}.json`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
