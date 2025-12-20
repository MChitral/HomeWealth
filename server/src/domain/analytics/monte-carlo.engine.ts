/**
 * Configuration parameters for a Monte Carlo simulation
 */
export interface SimulationParams {
  numIterations: number; // e.g., 1000 - 10000
  timeHorizonMonths: number; // e.g., 60 (5 years)

  // Starting values
  startBalance: number;
  startRate: number; // Annual rate (decimal, e.g., 0.05)

  // Volatility parameters (Geometric Brownian Motion)
  interestRateVolatility: number; // Annualized volatility of interest rates (e.g., 0.20)
  interestRateDrift: number; // Expected annual drift (e.g., 0.0 for neutral)

  // Market Parameters
  startInvestmentValue?: number; // Optional: if comparing vs investing
  investmentMeanReturn?: number; // e.g., 0.07 (7%)
  investmentVolatility?: number; // e.g., 0.15 (15%)
}

/**
 * Result of a single simulation run (one path)
 */
export interface SimulationPathResult {
  finalBalance: number; // Mortgage balance at end of horizon (or 0 if paid off)
  totalInterestPaid: number;
  finalInvestmentValue?: number; // If applicable
  isPaidOff: boolean;
  monthsToPayoff?: number;
}

/**
 * Aggregated results from all iterations
 */
export interface MonteCarloResult {
  iterations: number;

  // Probability Distributions
  // Key: Metric Name, Value: Percentiles (10th, 50th, 90th)
  balanceDistribution: {
    p10: number;
    p50: number;
    p90: number;
  };

  investmentDistribution?: {
    p10: number;
    p50: number;
    p90: number;
  };

  // Probabilities
  probabilityOfPayoff: number; // % of paths that reached 0 balance
  probabilityPrepaymentWins?: number; // If comparing, % where Net Worth (Inv - Mtg) > Baseline

  // Raw Paths (Optional: Sampling of ~50 paths for visualization)
  samplePaths: {
    month: number;
    rate: number;
    balance: number;
  }[][];
}

export class MonteCarloEngine {
  /**
   * Generates a random variable from a normal distribution (Box-Muller transform)
   */
  private static generateGaussian(mean = 0, stdDev = 1): number {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
  }

  /**
   * Simulates a single path of Interest Rates using Geometric Brownian Motion (GBM)
   * dS = S * (mu * dt + sigma * dW)
   * S(t+dt) = S(t) * exp( (mu - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z )
   */
  private static simulateRatePath(
    startRate: number,
    months: number,
    drift: number,
    volatility: number
  ): number[] {
    const dt = 1 / 12; // Time step is 1 month
    const rates: number[] = [startRate];

    // Pre-calculate constants
    const driftTerm = (drift - 0.5 * Math.pow(volatility, 2)) * dt;
    const volTerm = volatility * Math.sqrt(dt);

    for (let i = 1; i <= months; i++) {
      const z = this.generateGaussian();
      const prevRate = rates[i - 1];

      // Basic GBM model
      // Note: Interest rates usually follow mean-reversion (Vasicek/Cox-Ingersoll-Ross),
      // but GBM is acceptable for MVP "stock-like" volatility simulation or simple shock scenarios.
      // We clamp rate to realistic non-negative values for mortgages (e.g. min 1%)
      const nextRate = prevRate * Math.exp(driftTerm + volTerm * z);

      // Safety clamp: Rates rarely go below 1% or above 20% in modern context,
      // but purely mathematical GBM creates a log-normal distribution (always positive).
      rates.push(Math.max(0.01, nextRate));
    }

    return rates;
  }

  /**
   * Run the Monte Carlo Simulation
   */
  public run(params: SimulationParams): MonteCarloResult {
    const {
      numIterations,
      timeHorizonMonths,
      startBalance,
      startRate,
      interestRateVolatility,
      interestRateDrift,
    } = params;

    const finalBalances: number[] = [];
    let payoffCount = 0;

    // Store only a subset of paths for visualization (e.g., first 50)
    const samplePaths: { month: number; rate: number; balance: number }[][] = [];

    for (let i = 0; i < numIterations; i++) {
      // 1. Generate Rate Path
      const ratePath = MonteCarloEngine.simulateRatePath(
        startRate,
        timeHorizonMonths,
        interestRateDrift,
        interestRateVolatility
      );

      let currentBalance = startBalance;
      const currentPath: { month: number; rate: number; balance: number }[] = [];

      // Simple Amortization Simulation Step
      // Assuming fixed payment based on INITIAL rate (Variable Rate Mortgage - fluctuating interest portion)
      // OR assuming payment adjusts.
      // For "Trigger Rate Risk", usually payment is FIXED.

      // Calculating initial fixed payment for a standard 25yr (300mo) amortization to set the "Fixed Payment"
      // This is a simplification. Ideally, we pass in the actual payment amount.
      // TODO: Pass actual payment as a param. For now, calculating it.
      const monthlyRate = startRate / 12;
      const totalMonths = 300; // Standard 25 years
      const fixedPayment =
        (startBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

      for (let m = 0; m <= timeHorizonMonths; m++) {
        if (m > 0) {
          const stepRate = ratePath[m] / 12;
          const interest = currentBalance * stepRate;
          const principal = fixedPayment - interest; // VRM Fixed Payment behavior

          // If principal is negative, balance GROWS (Negative Amortization)
          currentBalance -= principal;

          if (currentBalance <= 0) {
            currentBalance = 0;
          }
        }

        if (i < 50) {
          // Keep first 50 paths
          currentPath.push({ month: m, rate: ratePath[m], balance: currentBalance });
        }
      }

      finalBalances.push(currentBalance);
      if (currentBalance <= 0) payoffCount++;

      if (i < 50) samplePaths.push(currentPath);
    }

    // Sort for percentiles
    finalBalances.sort((a, b) => a - b);

    const p10Index = Math.floor(numIterations * 0.1);
    const p50Index = Math.floor(numIterations * 0.5);
    const p90Index = Math.floor(numIterations * 0.9);

    return {
      iterations: numIterations,
      balanceDistribution: {
        p10: finalBalances[p10Index],
        p50: finalBalances[p50Index],
        p90: finalBalances[p90Index],
      },
      probabilityOfPayoff: payoffCount / numIterations,
      samplePaths,
    };
  }
}
