import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { RenewalService } from "../renewal.service";
import {
  calculateIRDPenalty,
  calculateThreeMonthInterestPenalty,
} from "@domain/calculations/penalty";

describe("Renewal Feature", () => {
  describe("Penalty Calculations (Domain)", () => {
    it("should calculate 3-month interest correctly", () => {
      // $100,000 balance at 5% rate
      // Annual interest = 5,000
      // 3 months = 5,000 * (3/12) = 1,250
      const penalty = calculateThreeMonthInterestPenalty(100000, 0.05);
      // assert.closeTo is not standard in node:assert strict mode until very recent
      assert.ok(Math.abs(penalty - 1250) < 0.1);
    });

    it("should calculate IRD correctly when current rate > market rate", () => {
      // Balance: $100,000
      // Current Rate: 5%
      // Market Rate: 3%
      // Remaining: 2 years (24 months)
      // Difference: 2%
      // Loss per year = $100,000 * 0.02 = $2,000
      // Total IRD = $2,000 * 2 = $4,000
      const ird = calculateIRDPenalty(100000, 0.05, 0.03, 24);
      assert.ok(Math.abs(ird - 4000) < 0.1);
    });

    it("should return 0 IRD if market rate >= current rate", () => {
      // Market rate higher (6%) vs current (5%) -> No loss for lender
      const ird = calculateIRDPenalty(100000, 0.05, 0.06, 24);
      assert.strictEqual(ird, 0);
    });
  });

  describe("RenewalService", () => {
    let service: RenewalService;
    let mockMortgagesRepo: { findById: ReturnType<typeof mock.fn> };
    let mockTermsRepo: { findByMortgageId: ReturnType<typeof mock.fn> };
    let mockMarketRateService: { getMarketRate: ReturnType<typeof mock.fn> };

    beforeEach(() => {
      mockMortgagesRepo = {
        findById: mock.fn(),
      };
      mockTermsRepo = {
        findByMortgageId: mock.fn(),
      };
      mockMarketRateService = {
        getMarketRate: mock.fn(),
      };
      service = new RenewalService(mockMortgagesRepo, mockTermsRepo, mockMarketRateService);
    });

    it("should return 'urgent' status if renewal is within 90 days", async () => {
      const today = new Date();
      const in80Days = new Date(today.getTime() + 80 * 24 * 60 * 60 * 1000);

      const mortgage = { id: "m1", currentBalance: "100000" };
      const terms = [
        {
          startDate: "2020-01-01",
          endDate: in80Days.toISOString(),
          interestRate: "5.0",
        },
      ];

      mockMortgagesRepo.findById.mock.mockImplementation(() => Promise.resolve(mortgage));
      mockTermsRepo.findByMortgageId.mock.mockImplementation(() => Promise.resolve(terms));

      const result = await service.getRenewalStatus("m1");

      assert.ok(result);
      assert.strictEqual(result?.status, "urgent");
      assert.strictEqual(result?.daysUntilRenewal, 80);
    });

    it("should return 'safe' status if renewal is far away (> 1 year)", async () => {
      const today = new Date();
      const in2Years = new Date(today);
      in2Years.setFullYear(today.getFullYear() + 2);

      const mortgage = { id: "m1", currentBalance: "100000" };
      const terms = [
        {
          startDate: "2020-01-01",
          endDate: in2Years.toISOString(),
          interestRate: "5.0",
        },
      ];

      mockMortgagesRepo.findById.mock.mockImplementation(() => Promise.resolve(mortgage));
      mockTermsRepo.findByMortgageId.mock.mockImplementation(() => Promise.resolve(terms));

      const result = await service.getRenewalStatus("m1");

      assert.ok(result);
      assert.strictEqual(result?.status, "safe");
    });

    it("should use real market rate for IRD calculation when market rate < current rate", async () => {
      const today = new Date();
      const in6Months = new Date(today);
      in6Months.setMonth(today.getMonth() + 6);

      const mortgage = { id: "m1", currentBalance: "100000" };
      const terms = [
        {
          startDate: "2020-01-01",
          endDate: in6Months.toISOString(),
          interestRate: "5.0",
          fixedRate: "5.0",
          termType: "fixed",
          termYears: 5,
        },
      ];

      // Mock market rate service to return 3% (lower than current 5%)
      mockMarketRateService.getMarketRate.mock.mockImplementation(
        () => Promise.resolve(0.03) // 3% as decimal
      );

      mockMortgagesRepo.findById.mock.mockImplementation(() => Promise.resolve(mortgage));
      mockTermsRepo.findByMortgageId.mock.mockImplementation(() => Promise.resolve(terms));

      const result = await service.getRenewalStatus("m1");

      assert.ok(result);
      // IRD should be calculated (not 3-month interest) since market rate < current rate
      // Current: 5%, Market: 3%, Remaining: ~6 months
      // IRD = 100000 * (0.05 - 0.03) * (6/12) = 1000
      // But 3-month interest = 100000 * 0.05 * (3/12) = 1250
      // So penalty should be 1250 (3-month interest, since it's higher)
      assert.ok(result?.estimatedPenalty.amount > 0);
      assert.strictEqual(mockMarketRateService.getMarketRate.mock.calls.length, 1);
    });

    it("should fallback to current rate when market rate unavailable", async () => {
      const today = new Date();
      const in6Months = new Date(today);
      in6Months.setMonth(today.getMonth() + 6);

      const mortgage = { id: "m1", currentBalance: "100000" };
      const terms = [
        {
          startDate: "2020-01-01",
          endDate: in6Months.toISOString(),
          interestRate: "5.0",
          fixedRate: "5.0",
          termType: "fixed",
          termYears: 5,
        },
      ];

      // Mock market rate service to return null (unavailable)
      mockMarketRateService.getMarketRate.mock.mockImplementation(() => Promise.resolve(null));

      mockMortgagesRepo.findById.mock.mockImplementation(() => Promise.resolve(mortgage));
      mockTermsRepo.findByMortgageId.mock.mockImplementation(() => Promise.resolve(terms));

      const result = await service.getRenewalStatus("m1");

      assert.ok(result);
      // Should still calculate penalty using current rate as fallback
      // This means IRD will be 0 (market rate = current rate), so 3-month interest applies
      assert.ok(result?.estimatedPenalty.amount > 0);
      assert.strictEqual(result?.estimatedPenalty.method, "3-Month Interest");
    });

    it("should use market rate for variable rate mortgages", async () => {
      const today = new Date();
      const in6Months = new Date(today);
      in6Months.setMonth(today.getMonth() + 6);

      const mortgage = { id: "m1", currentBalance: "100000" };
      const terms = [
        {
          startDate: "2020-01-01",
          endDate: in6Months.toISOString(),
          interestRate: "5.0",
          primeRate: "7.0",
          lockedSpread: "-2.0",
          termType: "variable-changing",
          termYears: 5,
        },
      ];

      // Mock market rate service to return 4% for variable rate
      mockMarketRateService.getMarketRate.mock.mockImplementation(
        () => Promise.resolve(0.04) // 4% as decimal
      );

      mockMortgagesRepo.findById.mock.mockImplementation(() => Promise.resolve(mortgage));
      mockTermsRepo.findByMortgageId.mock.mockImplementation(() => Promise.resolve(terms));

      const result = await service.getRenewalStatus("m1");

      assert.ok(result);
      // Should call getMarketRate with "variable-changing" and termYears 5
      assert.strictEqual(mockMarketRateService.getMarketRate.mock.calls.length, 1);
      const [rateType, termYears] = mockMarketRateService.getMarketRate.mock.calls[0].arguments;
      assert.strictEqual(rateType, "variable-changing");
      assert.strictEqual(termYears, 5);
    });
  });
});
