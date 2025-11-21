export interface ScenarioWithProjections {
  id: string;
  name: string;
  description: string;
  color: string;
  metrics: {
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
    emergencyFundFilledByYear: number;
  };
  projections: Array<{
    netWorth: number;
    mortgageBalance: number;
    investmentValue: number;
  }>;
}

export interface ScenarioForSelection {
  id: string;
  name: string;
}

export type TimeHorizon = "10" | "20" | "30";

export type MetricName = 'netWorth' | 'mortgageBalance' | 'investments' | 'investmentReturns';
