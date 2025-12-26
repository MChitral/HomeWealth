import { describe, it, expect } from "vitest";
import { InsuranceCalculatorService } from "../insurance-calculator.service";

describe("InsuranceCalculatorService", () => {
  const service = new InsuranceCalculatorService();

  describe("calculate", () => {
    it("should calculate premium for high-ratio mortgage (90% LTV)", () => {
      const result = service.calculate({
        propertyPrice: 500000,
        downPayment: 50000, // 10% down
        provider: "CMHC",
        mliSelectDiscount: 0,
        premiumPaymentType: "upfront",
      });

      expect(result.isHighRatio).toBe(true);
      expect(result.ltvRatio).toBe(90);
      expect(result.premiumRate).toBe(3.1); // 90-95% bracket
      expect(result.premiumAmount).toBeGreaterThan(0);
      expect(result.premiumAfterDiscount).toBe(result.premiumAmount);
      expect(result.totalMortgageAmount).toBe(result.mortgageAmount);
    });

    it("should return no insurance for conventional mortgage (20%+ down)", () => {
      const result = service.calculate({
        propertyPrice: 500000,
        downPayment: 100000, // 20% down
        provider: "CMHC",
        mliSelectDiscount: 0,
        premiumPaymentType: "upfront",
      });

      expect(result.isHighRatio).toBe(false);
      expect(result.premiumRate).toBe(0);
      expect(result.premiumAmount).toBe(0);
      expect(result.premiumAfterDiscount).toBe(0);
    });

    it("should apply MLI Select discount correctly", () => {
      const result = service.calculate({
        propertyPrice: 500000,
        downPayment: 50000, // 10% down, 90% LTV
        provider: "CMHC",
        mliSelectDiscount: 20, // 20% discount
        premiumPaymentType: "upfront",
      });

      expect(result.isHighRatio).toBe(true);
      expect(result.breakdown.basePremium).toBeGreaterThan(0);
      expect(result.breakdown.discountAmount).toBeGreaterThan(0);
      expect(result.breakdown.finalPremium).toBeLessThan(result.breakdown.basePremium);
      expect(result.premiumAfterDiscount).toBe(result.breakdown.finalPremium);
    });

    it("should add premium to principal when requested", () => {
      const result = service.calculate({
        propertyPrice: 500000,
        downPayment: 50000, // 10% down
        provider: "CMHC",
        mliSelectDiscount: 0,
        premiumPaymentType: "added-to-principal",
      });

      expect(result.isHighRatio).toBe(true);
      expect(result.totalMortgageAmount).toBeGreaterThan(result.mortgageAmount);
      expect(result.totalMortgageAmount).toBe(result.mortgageAmount + result.premiumAfterDiscount);
    });

    it("should handle different LTV brackets correctly", () => {
      const testCases = [
        { downPayment: 162500, ltv: 67.5, expectedRate: 0.6 }, // 65-75% bracket
        { downPayment: 125000, ltv: 75, expectedRate: 0.6 }, // Exactly 75%
        { downPayment: 124999, ltv: 75.0002, expectedRate: 1.7 }, // Just over 75%
        { downPayment: 100000, ltv: 80, expectedRate: 1.7 }, // 75-80% bracket
        { downPayment: 75000, ltv: 85, expectedRate: 2.4 }, // 80-85% bracket
        { downPayment: 50000, ltv: 90, expectedRate: 2.8 }, // 85-90% bracket
        { downPayment: 25000, ltv: 95, expectedRate: 3.1 }, // 90-95% bracket
        { downPayment: 10000, ltv: 98, expectedRate: 4.0 }, // 95-100% bracket
      ];

      testCases.forEach(({ downPayment, ltv, expectedRate }) => {
        const result = service.calculate({
          propertyPrice: 500000,
          downPayment,
          provider: "CMHC",
          mliSelectDiscount: 0,
          premiumPaymentType: "upfront",
        });

        expect(result.ltvRatio).toBeCloseTo(ltv, 1);
        expect(result.premiumRate).toBe(expectedRate);
      });
    });

    it("should support all three providers", () => {
      const providers: Array<"CMHC" | "Sagen" | "Genworth"> = ["CMHC", "Sagen", "Genworth"];

      providers.forEach((provider) => {
        const result = service.calculate({
          propertyPrice: 500000,
          downPayment: 50000,
          provider,
          mliSelectDiscount: 0,
          premiumPaymentType: "upfront",
        });

        expect(result.provider).toBe(provider);
        expect(result.isHighRatio).toBe(true);
        expect(result.premiumRate).toBeGreaterThan(0);
      });
    });

    it("should throw error for invalid property price", () => {
      expect(() => {
        service.calculate({
          propertyPrice: 0,
          downPayment: 0,
          provider: "CMHC",
        });
      }).toThrow("Property price must be greater than zero");
    });

    it("should throw error for negative down payment", () => {
      expect(() => {
        service.calculate({
          propertyPrice: 500000,
          downPayment: -1000,
          provider: "CMHC",
        });
      }).toThrow("Down payment cannot be negative");
    });

    it("should throw error when down payment exceeds property price", () => {
      expect(() => {
        service.calculate({
          propertyPrice: 500000,
          downPayment: 600000,
          provider: "CMHC",
        });
      }).toThrow("Down payment cannot be greater than or equal to property price");
    });

    it("should throw error for LTV below 65%", () => {
      expect(() => {
        service.calculate({
          propertyPrice: 500000,
          downPayment: 200000, // 60% LTV
          provider: "CMHC",
        });
      }).toThrow("LTV ratio");
    });

    it("should handle edge case: exactly 20% down payment", () => {
      const result = service.calculate({
        propertyPrice: 500000,
        downPayment: 100000, // Exactly 20%
        provider: "CMHC",
      });

      expect(result.isHighRatio).toBe(false);
      expect(result.premiumRate).toBe(0);
    });

    it("should handle edge case: 19.99% down payment", () => {
      const result = service.calculate({
        propertyPrice: 500000,
        downPayment: 99950, // 19.99% down
        provider: "CMHC",
      });

      expect(result.isHighRatio).toBe(true);
      expect(result.premiumRate).toBeGreaterThan(0);
    });
  });

  describe("compareProviders", () => {
    it("should compare all three providers", () => {
      const results = service.compareProviders(500000, 50000, 0, "upfront");

      expect(results.CMHC).toBeDefined();
      expect(results.Sagen).toBeDefined();
      expect(results.Genworth).toBeDefined();

      expect(results.CMHC.isHighRatio).toBe(true);
      expect(results.Sagen.isHighRatio).toBe(true);
      expect(results.Genworth.isHighRatio).toBe(true);
    });

    it("should apply discount to all providers in comparison", () => {
      const results = service.compareProviders(500000, 50000, 20, "upfront");

      expect(results.CMHC.breakdown.discountAmount).toBeGreaterThan(0);
      expect(results.Sagen.breakdown.discountAmount).toBeGreaterThan(0);
      expect(results.Genworth.breakdown.discountAmount).toBeGreaterThan(0);
    });
  });

  describe("getPremiumRateTable", () => {
    it("should return rate table for CMHC", () => {
      const rateTable = service.getPremiumRateTable("CMHC");

      expect(rateTable).toBeDefined();
      expect(rateTable["65-75"]).toBe(0.6);
      expect(rateTable["95-100"]).toBe(4.0);
    });

    it("should return rate table for all providers", () => {
      const providers: Array<"CMHC" | "Sagen" | "Genworth"> = ["CMHC", "Sagen", "Genworth"];

      providers.forEach((provider) => {
        const rateTable = service.getPremiumRateTable(provider);
        expect(rateTable).toBeDefined();
        expect(Object.keys(rateTable).length).toBeGreaterThan(0);
      });
    });
  });
});
