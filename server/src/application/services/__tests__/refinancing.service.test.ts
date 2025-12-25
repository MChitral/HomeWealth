import { describe, it, mock } from "node:test";
import assert from "node:assert";
import { RefinancingService } from "../refinancing.service";

// Mock dependencies
const mockMortgagesRepo: any = {
  findById: mock.fn(),
};
const mockTermsRepo: any = {
  findByMortgageId: mock.fn(),
};
const mockMarketRateService: any = {
  getMarketRate: mock.fn(),
};

describe("RefinancingService", () => {
  it("should calculate refinance benefit correctly when beneficial", async () => {
    const service = new RefinancingService(
      mockMortgagesRepo as any,
      mockTermsRepo as any,
      mockMarketRateService as any
    );

    // Setup mocks
    mockMortgagesRepo.findById.mock.mockImplementation(
      () =>
        Promise.resolve({
          id: "m1",
          currentBalance: "500000",
          amortizationMonths: 300,
          amortizationYears: 25,
        }) as any
    );

    // Active term: 5% rate, 3 years left
    mockTermsRepo.findByMortgageId.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: "t1",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3).toISOString(), // 3 years from now
          interestRate: "5.00",
          fixedRate: "5.00",
        },
      ] as any)
    );

    // Market rate: 3.5% (as decimal: 0.035)
    mockMarketRateService.getMarketRate.mock.mockImplementation(
      () => Promise.resolve(0.035) as any
    );

    const result = await service.analyzeRefinanceOpportunity("m1");

    assert.ok(result);
    assert.strictEqual(result.currentRate, 5);
    assert.strictEqual(result.marketRate, 3.5);

    // Check Math Approx
    // Balance 500k.
    // Old Rate 5%. Monthly Pmt (25yr) ~ $2922
    // New Rate 3.5%. Monthly Pmt (25yr) ~ $2503
    // Savings ~ $419/mo
    // Penalty (3 months interest of 5% on 500k) ~ $6250 (approx)
    // IRD might be higher but MVP uses 3-month interest if currentRate used as comparison

    // Break even: 6250 / 419 ~ 15 months.

    assert.ok(result.monthlySavings > 400);
    assert.ok(result.breakEvenMonths > 10 && result.breakEvenMonths < 20);
    assert.strictEqual(result.isBeneficial, true);
  });

  it("should identify when refinancing is NOT beneficial", async () => {
    const service = new RefinancingService(
      mockMortgagesRepo as any,
      mockTermsRepo as any,
      mockMarketRateService as any
    );

    // Setup mocks
    mockMortgagesRepo.findById.mock.mockImplementation(
      () =>
        Promise.resolve({
          id: "m1",
          currentBalance: "500000",
          amortizationMonths: 300,
          amortizationYears: 25,
        }) as any
    );

    // Active term: 3.5% rate (already low)
    mockTermsRepo.findByMortgageId.mock.mockImplementation(() =>
      Promise.resolve([
        {
          id: "t1",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3).toISOString(),
          interestRate: "3.50",
          fixedRate: "3.50",
        },
      ] as any)
    );

    // Market rate: 3.5% (same, as decimal: 0.035)
    mockMarketRateService.getMarketRate.mock.mockImplementation(
      () => Promise.resolve(0.035) as any
    );

    const result = await service.analyzeRefinanceOpportunity("m1");

    assert.ok(result);
    // Savings should be ~0 or negative
    assert.strictEqual(result.isBeneficial, false);
    assert.ok(result.monthlySavings <= 0.01); // Handle floating point tiny diffs
  });
});
