/**
 * Rate model types for Monte Carlo simulation
 */
export type RateModel = "gbm" | "vasicek";

/**
 * Configuration parameters for a Monte Carlo simulation
 */
export interface SimulationParams {
  numIterations: number; // e.g., 1000 - 10000
  timeHorizonMonths: number; // e.g., 60 (5 years)

  // Starting values
  startBalance: number;
  startRate: number; // Annual rate (decimal, e.g., 0.05)
  monthlyPayment?: number; // Actual monthly payment amount (if not provided, calculated)
  remainingAmortizationMonths?: number; // Remaining amortization (default: 300 for 25 years)

  // Rate model configuration
  rateModel?: RateModel; // "gbm" or "vasicek" (default: "gbm")
  interestRateVolatility: number; // Annualized volatility of interest rates (e.g., 0.20)
  interestRateDrift?: number; // Expected annual drift (e.g., 0.0 for neutral, default: 0.0)
  
  // Mean-reverting model parameters (Vasicek)
  meanReversionSpeed?: number; // Speed of mean reversion (default: 0.1)
  longTermMeanRate?: number; // Long-term mean rate (default: startRate)

  // Rate constraints
  rateCap?: number; // Maximum rate (e.g., 0.15 for 15%)
  rateFloor?: number; // Minimum rate (e.g., 0.01 for 1%)

  // Volatility source
  useHistoricalVolatility?: boolean; // If true, calculate from historical data
  historicalRates?: number[]; // Historical rate data for volatility calculation

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
 * Rate path statistics for a given month
 */
export interface RatePathStats {
  month: number;
  mean: number;
  p10: number;
  p50: number;
  p90: number;
  min: number;
  max: number;
}

/**
 * Aggregated results from all iterations
 */
export interface MonteCarloResult {
  iterations: number;

  // Probability Distributions
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

  // Rate path statistics over time
  ratePathStats: RatePathStats[];

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
   * Calculates historical volatility from a series of rates
   * Returns annualized volatility
   */
  static calculateHistoricalVolatility(historicalRates: number[]): number {
    if (historicalRates.length < 2) {
      return 0.15; // Default volatility
    }

    const returns: number[] = [];
    for (let i = 1; i < historicalRates.length; i++) {
      const prevRate = historicalRates[i - 1];
      const currRate = historicalRates[i];
      if (prevRate > 0) {
        returns.push(Math.log(currRate / prevRate));
      }
    }

    if (returns.length === 0) {
      return 0.15;
    }

    // Calculate mean return
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Calculate variance
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);

    // Annualize (assuming monthly data)
    return Math.sqrt(variance * 12);
  }

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
   * Applies rate constraints (cap and floor)
   */
  private static applyRateConstraints(
    rate: number,
    cap?: number,
    floor?: number
  ): number {
    let constrainedRate = rate;
    if (cap !== undefined) {
      constrainedRate = Math.min(constrainedRate, cap);
    }
    if (floor !== undefined) {
      constrainedRate = Math.max(constrainedRate, floor);
    }
    // Always ensure non-negative
    return Math.max(0.01, constrainedRate);
  }

  /**
   * Simulates a single path of Interest Rates using Geometric Brownian Motion (GBM)
   * dS = S * (mu * dt + sigma * dW)
   * S(t+dt) = S(t) * exp( (mu - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z )
   */
  private static simulateRatePathGBM(
    startRate: number,
    months: number,
    drift: number,
    volatility: number,
    cap?: number,
    floor?: number
  ): number[] {
    const dt = 1 / 12; // Time step is 1 month
    const rates: number[] = [startRate];

    // Pre-calculate constants
    const driftTerm = (drift - 0.5 * Math.pow(volatility, 2)) * dt;
    const volTerm = volatility * Math.sqrt(dt);

    for (let i = 1; i <= months; i++) {
      const z = this.generateGaussian();
      const prevRate = rates[i - 1];

      const nextRate = prevRate * Math.exp(driftTerm + volTerm * z);
      rates.push(this.applyRateConstraints(nextRate, cap, floor));
    }

    return rates;
  }

  /**
   * Simulates a single path of Interest Rates using Vasicek mean-reverting model
   * dr = k(theta - r)dt + sigma * dW
   * where k = mean reversion speed, theta = long-term mean, sigma = volatility
   */
  private static simulateRatePathVasicek(
    startRate: number,
    months: number,
    volatility: number,
    meanReversionSpeed: number,
    longTermMean: number,
    cap?: number,
    floor?: number
  ): number[] {
    const dt = 1 / 12; // Time step is 1 month
    const rates: number[] = [startRate];

    for (let i = 1; i <= months; i++) {
      const z = this.generateGaussian();
      const prevRate = rates[i - 1];

      // Vasicek model: dr = k(theta - r)dt + sigma * dW
      const meanReversionTerm = meanReversionSpeed * (longTermMean - prevRate) * dt;
      const randomTerm = volatility * Math.sqrt(dt) * z;

      const nextRate = prevRate + meanReversionTerm + randomTerm;
      rates.push(this.applyRateConstraints(nextRate, cap, floor));
    }

    return rates;
  }

  /**
   * Simulates a single path of Interest Rates based on the selected model
   */
  private static simulateRatePath(
    startRate: number,
    months: number,
    model: RateModel,
    volatility: number,
    drift: number,
    meanReversionSpeed: number,
    longTermMean: number,
    cap?: number,
    floor?: number
  ): number[] {
    if (model === "vasicek") {
      return this.simulateRatePathVasicek(
        startRate,
        months,
        volatility,
        meanReversionSpeed,
        longTermMean,
        cap,
        floor
      );
    } else {
      return this.simulateRatePathGBM(startRate, months, drift, volatility, cap, floor);
    }
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
      monthlyPayment,
      remainingAmortizationMonths = 300,
      rateModel = "gbm",
      interestRateVolatility,
      interestRateDrift = 0.0,
      meanReversionSpeed = 0.1,
      longTermMeanRate,
      rateCap,
      rateFloor,
      useHistoricalVolatility = false,
      historicalRates,
    } = params;

    // Calculate volatility from historical data if requested
    let effectiveVolatility = interestRateVolatility;
    if (useHistoricalVolatility && historicalRates && historicalRates.length > 1) {
      effectiveVolatility = MonteCarloEngine.calculateHistoricalVolatility(historicalRates);
    }

    // Set long-term mean for Vasicek model
    const effectiveLongTermMean = longTermMeanRate ?? startRate;

    // Calculate or use provided monthly payment
    let fixedPayment = monthlyPayment;
    if (!fixedPayment) {
      const monthlyRate = startRate / 12;
      fixedPayment =
        (startBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -remainingAmortizationMonths));
    }

    const finalBalances: number[] = [];
    const totalInterestPaid: number[] = [];
    let payoffCount = 0;

    // Store all rate paths for statistics
    const allRatePaths: number[][] = [];
    // Store only a subset of paths for visualization (e.g., first 50)
    const samplePaths: { month: number; rate: number; balance: number }[][] = [];

    for (let i = 0; i < numIterations; i++) {
      // 1. Generate Rate Path
      const ratePath = MonteCarloEngine.simulateRatePath(
        startRate,
        timeHorizonMonths,
        rateModel,
        effectiveVolatility,
        interestRateDrift,
        meanReversionSpeed,
        effectiveLongTermMean,
        rateCap,
        rateFloor
      );

      allRatePaths.push(ratePath);

      let currentBalance = startBalance;
      let totalInterest = 0;
      const currentPath: { month: number; rate: number; balance: number }[] = [];

      for (let m = 0; m <= timeHorizonMonths; m++) {
        if (m > 0) {
          const stepRate = ratePath[m] / 12;
          const interest = currentBalance * stepRate;
          const principal = fixedPayment - interest; // VRM Fixed Payment behavior

          totalInterest += interest;

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
      totalInterestPaid.push(totalInterest);
      if (currentBalance <= 0) payoffCount++;

      if (i < 50) samplePaths.push(currentPath);
    }

    // Calculate balance distribution statistics
    finalBalances.sort((a, b) => a - b);
    const p10Index = Math.floor(numIterations * 0.1);
    const p50Index = Math.floor(numIterations * 0.5);
    const p90Index = Math.floor(numIterations * 0.9);

    const balanceMean = finalBalances.reduce((sum, b) => sum + b, 0) / numIterations;
    const balanceVariance =
      finalBalances.reduce((sum, b) => sum + Math.pow(b - balanceMean, 2), 0) / numIterations;
    const balanceStdDev = Math.sqrt(balanceVariance);

    // Calculate interest distribution statistics
    totalInterestPaid.sort((a, b) => a - b);
    const interestMean = totalInterestPaid.reduce((sum, i) => sum + i, 0) / numIterations;

    // Calculate rate path statistics over time
    const ratePathStats: RatePathStats[] = [];
    for (let m = 0; m <= timeHorizonMonths; m++) {
      const ratesAtMonth = allRatePaths.map((path) => path[m]);
      ratesAtMonth.sort((a, b) => a - b);

      const mean = ratesAtMonth.reduce((sum, r) => sum + r, 0) / numIterations;
      const p10Index = Math.floor(numIterations * 0.1);
      const p50Index = Math.floor(numIterations * 0.5);
      const p90Index = Math.floor(numIterations * 0.9);

      ratePathStats.push({
        month: m,
        mean,
        p10: ratesAtMonth[p10Index],
        p50: ratesAtMonth[p50Index],
        p90: ratesAtMonth[p90Index],
        min: ratesAtMonth[0],
        max: ratesAtMonth[numIterations - 1],
      });
    }

    return {
      iterations: numIterations,
      balanceDistribution: {
        p10: finalBalances[p10Index],
        p50: finalBalances[p50Index],
        p90: finalBalances[p90Index],
        mean: balanceMean,
        stdDev: balanceStdDev,
      },
      interestDistribution: {
        p10: totalInterestPaid[p10Index],
        p50: totalInterestPaid[p50Index],
        p90: totalInterestPaid[p90Index],
        mean: interestMean,
        totalInterestPaid: totalInterestPaid.reduce((sum, i) => sum + i, 0),
      },
      ratePathStats,
      probabilityOfPayoff: payoffCount / numIterations,
      samplePaths,
    };
  }
}
