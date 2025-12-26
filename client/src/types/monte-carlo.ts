export interface RatePathStats {
  month: number;
  mean: number;
  p10: number;
  p50: number;
  p90: number;
  min: number;
  max: number;
}

export interface MonteCarloResult {
  iterations: number;
  balanceDistribution: {
    p10: number;
    p50: number;
    p90: number;
    mean: number;
    stdDev: number;
  };
  interestDistribution: {
    p10: number;
    p50: number;
    p90: number;
    mean: number;
    totalInterestPaid: number;
  };
  investmentDistribution?: {
    p10: number;
    p50: number;
    p90: number;
    mean: number;
  };
  ratePathStats: RatePathStats[];
  probabilityOfPayoff: number;
  probabilityPrepaymentWins?: number;
  samplePaths: {
    month: number;
    rate: number;
    balance: number;
  }[][];
}
