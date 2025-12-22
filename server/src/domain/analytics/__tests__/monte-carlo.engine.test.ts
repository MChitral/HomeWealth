import { describe, it } from "node:test";
import assert from "node:assert";
import { MonteCarloEngine, SimulationParams } from "../monte-carlo.engine";

describe("MonteCarloEngine", () => {
  const engine = new MonteCarloEngine();

  it("should run a simulation and return results", () => {
    const params: SimulationParams = {
      numIterations: 100,
      timeHorizonMonths: 12,
      startBalance: 100000,
      startRate: 0.05,
      interestRateVolatility: 0.1,
      interestRateDrift: 0.0,
    };

    const result = engine.run(params);

    assert.strictEqual(result.iterations, 100);
    assert.strictEqual(result.samplePaths.length, 50, "Should limit sample paths to 50");
    assert.ok(result.balanceDistribution.p50 > 0, "Median balance should be positive");
  });

  it("should reflect higher volatility with wider distribution", () => {
    const baseParams: SimulationParams = {
      numIterations: 1000,
      timeHorizonMonths: 12,
      startBalance: 100000,
      startRate: 0.05,
      interestRateVolatility: 0.01, // Low volatility
      interestRateDrift: 0.0,
    };

    const lowVolResult = engine.run(baseParams);

    const highVolResult = engine.run({
      ...baseParams,
      interestRateVolatility: 0.5, // High volatility
    });

    const lowVolSpread =
      lowVolResult.balanceDistribution.p90 - lowVolResult.balanceDistribution.p10;
    const highVolSpread =
      highVolResult.balanceDistribution.p90 - highVolResult.balanceDistribution.p10;

    // This assertion can be tricky with small N or balances that don't change much due to fixed payment,
    // but with 50% volatility on interest rate, the amortization/interest portion should vary significantly.
    // Actually, if payment is fixed at start, huge rate spike = less principal paid = higher balance.
    // Rate drop = more principal paid = lower balance.
    // So distinct outcomes should be visible.

    assert.ok(
      highVolSpread > lowVolSpread,
      `High Vol Spread (${highVolSpread}) should be > Low Vol Spread (${lowVolSpread})`
    );
  });

  it("should complete 10,000 iterations within reasonable time (Performance Limit)", () => {
    const params: SimulationParams = {
      numIterations: 10000,
      timeHorizonMonths: 60, // 5 years
      startBalance: 500000,
      startRate: 0.05,
      interestRateVolatility: 0.2,
      interestRateDrift: 0.0,
    };

    const start = performance.now();
    engine.run(params);
    const end = performance.now();
    const duration = end - start;

    assert.ok(duration < 2000, `Simulation took too long: ${duration}ms`);
  });
});
