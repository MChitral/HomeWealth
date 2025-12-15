import type { Scenario } from "@shared/schema";

export type ScenarioWithMetrics = Scenario & {
  metrics?: {
    netWorth10yr: number;
    netWorth20yr: number;
    netWorth30yr: number;
    mortgageBalance10yr: number;
    mortgageBalance20yr: number;
    mortgageBalance30yr: number;
    investments10yr: number;
    investments20yr: number;
    investments30yr: number;
    investmentReturns10yr: number;
    investmentReturns20yr: number;
    investmentReturns30yr: number;
    mortgagePayoffYear: number;
    totalInterestPaid: number;
    emergencyFundYears: number;
    avgMonthlySurplus: number;
    netWorthProjections: number[];
    mortgageBalanceProjections: number[];
    investmentProjections: number[];
  };
};
