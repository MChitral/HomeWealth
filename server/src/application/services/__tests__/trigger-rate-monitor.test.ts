import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { TriggerRateMonitor } from "../trigger-rate-monitor";
import type { MortgageTerm, Mortgage } from "@shared/schema";

// Mock repositories
class MockMortgagesRepository {
  private mortgages: Map<string, Mortgage> = new Map();

  async findById(id: string): Promise<Mortgage | undefined> {
    return this.mortgages.get(id);
  }

  async findAll(): Promise<Mortgage[]> {
    return Array.from(this.mortgages.values());
  }

  setMortgage(mortgage: Mortgage): void {
    this.mortgages.set(mortgage.id, mortgage);
  }
}

class MockMortgageTermsRepository {
  private terms: Map<string, MortgageTerm> = new Map();

  async findByMortgageId(mortgageId: string): Promise<MortgageTerm[]> {
    return Array.from(this.terms.values()).filter((t) => t.mortgageId === mortgageId);
  }

  setTerm(term: MortgageTerm): void {
    this.terms.set(term.id, term);
  }
}

import type { MortgagePayment } from "@shared/schema";

class MockMortgagePaymentsRepository {
  async findByTermId(_termId: string): Promise<MortgagePayment[]> {
    return []; // Return empty payments
  }
}

describe("TriggerRateMonitor", () => {
  let service: TriggerRateMonitor;
  let mortgagesRepo: MockMortgagesRepository;
  let termsRepo: MockMortgageTermsRepository;
  let paymentRepo: MockMortgagePaymentsRepository;

  beforeEach(() => {
    mortgagesRepo = new MockMortgagesRepository();
    termsRepo = new MockMortgageTermsRepository();
    paymentRepo = new MockMortgagePaymentsRepository();

    service = new TriggerRateMonitor(
      mortgagesRepo as unknown as Parameters<typeof TriggerRateMonitor.prototype.constructor>[0],
      termsRepo as unknown as Parameters<typeof TriggerRateMonitor.prototype.constructor>[1],
      paymentRepo as unknown as Parameters<typeof TriggerRateMonitor.prototype.constructor>[2]
    );
  });

  const createMortgage = (id: string): Mortgage => ({
    id,
    userId: "user-1",
    propertyPrice: "1000000",
    downPayment: "200000",
    originalAmount: "800000",
    currentBalance: "800000", // Full balance
    startDate: "2024-01-01",
    amortizationYears: 30,
    amortizationMonths: 0,
    paymentFrequency: "monthly",
    annualPrepaymentLimitPercent: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createTerm = (
    id: string,
    mortgageId: string,
    type: string,
    rate: string,
    payment: string
  ): MortgageTerm => ({
    id,
    mortgageId,
    termType: type,
    startDate: "2024-01-01",
    endDate: "2029-01-01",
    termYears: 5,
    fixedRate: null,
    lockedSpread: type === "variable-fixed" ? "-1.00" : null, // Fixed spread
    primeRate: String(Number(rate) + 1.0), // Back-calculate prime from rate (Rate = Prime + Spread -> Prime = Rate - Spread = Rate + 1.00)
    paymentFrequency: "monthly",
    regularPaymentAmount: payment,
    createdAt: new Date(),
  });

  describe("checkOne", () => {
    it("returns null if mortgage not found", async () => {
      const result = await service.checkOne("non-existent");
      assert.equal(result, null);
    });

    it("returns null if no active term", async () => {
      const mortgage = createMortgage("m1");
      mortgagesRepo.setMortgage(mortgage);
      // No terms
      const result = await service.checkOne("m1");
      assert.equal(result, null);
    });

    it("returns null if active term is not VRM (variable-fixed)", async () => {
      const mortgage = createMortgage("m1");
      const term = createTerm("t1", "m1", "fixed", "5.0", "4294.57");
      mortgagesRepo.setMortgage(mortgage);
      termsRepo.setTerm(term);

      const result = await service.checkOne("m1");
      assert.equal(result, null);
    });

    it("identifies when trigger rate is hit", async () => {
      const mortgage = createMortgage("m1");
      const term = createTerm("t1", "m1", "variable-fixed", "6.50", "4000.00");
      mortgagesRepo.setMortgage(mortgage);
      termsRepo.setTerm(term);

      const result = await service.checkOne("m1");

      assert.ok(result);
      assert.equal(result?.isHit, true);
      assert.ok(Math.abs((result?.currentRate || 0) - 0.065) < 0.0001);
    });

    it("identifies when approaching trigger rate (risk)", async () => {
      const mortgage = createMortgage("m1");
      // Gap 0.2% -> Risk
      const term = createTerm("t1", "m1", "variable-fixed", "5.80", "4000.00");
      mortgagesRepo.setMortgage(mortgage);
      termsRepo.setTerm(term);

      const result = await service.checkOne("m1");

      assert.ok(result);
      assert.equal(result?.isHit, false);
      assert.equal(result?.isRisk, true);
      assert.ok(Math.abs((result?.currentRate || 0) - 0.058) < 0.0001);
    });
  });

  describe("checkAll", () => {
    it("checks all mortgages and returns alerts", async () => {
      const m1 = createMortgage("m1"); // Hit
      const t1 = createTerm("t1", "m1", "variable-fixed", "6.50", "4000.00");

      const m2 = createMortgage("m2"); // Safe
      const t2 = createTerm("t2", "m2", "variable-fixed", "5.00", "4000.00");

      const m3 = createMortgage("m3"); // Risk
      const t3 = createTerm("t3", "m3", "variable-fixed", "5.80", "4000.00");

      mortgagesRepo.setMortgage(m1);
      mortgagesRepo.setMortgage(m2);
      mortgagesRepo.setMortgage(m3);

      termsRepo.setTerm(t1);
      termsRepo.setTerm(t2);
      termsRepo.setTerm(t3);

      const alerts = await service.checkAll();

      assert.equal(alerts.length, 2); // m1 and m3
      assert.ok(alerts.find((a) => a.mortgageId === "m1")?.isHit);
      assert.ok(alerts.find((a) => a.mortgageId === "m3")?.isRisk);
    });
  });
});
