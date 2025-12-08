import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { PrimeRateTrackingService } from "../prime-rate-tracking.service";
import type { MortgageTerm, Mortgage } from "@shared/schema";
import { fetchLatestPrimeRate } from "@server-shared/services/prime-rate";

// Mock repositories
class MockPrimeRateHistoryRepository {
  private history: any[] = [];

  async create(data: any) {
    const entry = {
      id: `history-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.history.push(entry);
    return entry;
  }

  async findLatest() {
    if (this.history.length === 0) return undefined;
    return this.history.sort((a, b) => 
      new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    )[0];
  }

  async existsForDate(date: string) {
    return this.history.some(h => h.effectiveDate === date);
  }

  async findByDateRange(startDate: string, endDate: string) {
    return this.history.filter(h => {
      const date = h.effectiveDate;
      return date >= startDate && date <= endDate;
    });
  }

  clear() {
    this.history = [];
  }
}

class MockMortgageTermsRepository {
  private terms: Map<string, MortgageTerm> = new Map();

  async findAll(): Promise<MortgageTerm[]> {
    return Array.from(this.terms.values());
  }

  async update(id: string, payload: any): Promise<MortgageTerm | undefined> {
    const term = this.terms.get(id);
    if (!term) return undefined;
    const updated = { ...term, ...payload };
    this.terms.set(id, updated);
    return updated;
  }

  setTerm(term: MortgageTerm): void {
    this.terms.set(term.id, term);
  }
}

class MockMortgagesRepository {
  private mortgages: Map<string, Mortgage> = new Map();

  async findById(id: string): Promise<Mortgage | undefined> {
    return this.mortgages.get(id);
  }

  setMortgage(mortgage: Mortgage): void {
    this.mortgages.set(mortgage.id, mortgage);
  }
}

// Mock fetchLatestPrimeRate
const originalFetchLatestPrimeRate = fetchLatestPrimeRate;
let mockPrimeRate: { primeRate: number; effectiveDate: string } | null = null;

describe("PrimeRateTrackingService", () => {
  let service: PrimeRateTrackingService;
  let historyRepo: MockPrimeRateHistoryRepository;
  let termsRepo: MockMortgageTermsRepository;
  let mortgagesRepo: MockMortgagesRepository;

  beforeEach(() => {
    historyRepo = new MockPrimeRateHistoryRepository();
    termsRepo = new MockMortgageTermsRepository();
    mortgagesRepo = new MockMortgagesRepository();

    service = new PrimeRateTrackingService(
      historyRepo as any,
      termsRepo as any,
      mortgagesRepo as any,
    );

    // Reset mock
    mockPrimeRate = null;
  });

  describe("checkAndUpdatePrimeRate", () => {
    it("detects prime rate change and updates VRM terms", async () => {
      // Setup: Existing prime rate in history
      await historyRepo.create({
        primeRate: "6.450",
        effectiveDate: "2024-01-15",
        source: "Bank of Canada",
      });

      // Setup: Active VRM term
      const mortgage: Mortgage = {
        id: "mortgage-1",
        userId: "user-1",
        propertyPrice: "750000.00",
        downPayment: "150000.00",
        originalAmount: "600000.00",
        currentBalance: "600000.00",
        startDate: "2020-01-01",
        amortizationYears: 25,
        amortizationMonths: 0,
        paymentFrequency: "monthly",
        annualPrepaymentLimitPercent: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mortgagesRepo.setMortgage(mortgage);

      const term: MortgageTerm = {
        id: "term-1",
        mortgageId: "mortgage-1",
        termType: "variable-changing",
        startDate: "2024-01-01",
        endDate: "2029-01-01",
        termYears: 5,
        fixedRate: null,
        lockedSpread: "-0.800",
        primeRate: "6.450", // Old rate
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
        createdAt: new Date().toISOString(),
      };
      termsRepo.setTerm(term);

      // Mock new prime rate
      mockPrimeRate = { primeRate: 6.750, effectiveDate: "2024-03-15" };

      // Mock fetchLatestPrimeRate
      const originalFetch = (global as any).fetch;
      (global as any).fetch = async () => ({
        ok: true,
        json: async () => ({
          observations: [{
            d: mockPrimeRate!.effectiveDate,
            V121796: { v: mockPrimeRate!.primeRate.toString() },
          }],
        }),
      });

      const result = await service.checkAndUpdatePrimeRate();

      // Restore fetch
      (global as any).fetch = originalFetch;

      assert.ok(result, "Should return result");
      assert.equal(result.changed, true, "Should detect change");
      assert.equal(result.previousRate, 6.450, "Should have previous rate");
      assert.equal(result.newRate, 6.750, "Should have new rate");
      assert.equal(result.termsUpdated, 1, "Should update 1 term");

      // Verify term was updated
      const updatedTerm = await termsRepo.update("term-1", {});
      assert.ok(updatedTerm, "Term should exist");
      assert.equal(updatedTerm.primeRate, "6.750", "Prime rate should be updated");
    });

    it("returns unchanged when prime rate is the same", async () => {
      // Setup: Existing prime rate in history
      await historyRepo.create({
        primeRate: "6.450",
        effectiveDate: "2024-01-15",
        source: "Bank of Canada",
      });

      // Mock same prime rate
      mockPrimeRate = { primeRate: 6.450, effectiveDate: "2024-01-15" };

      // Mock fetchLatestPrimeRate
      const originalFetch = (global as any).fetch;
      (global as any).fetch = async () => ({
        ok: true,
        json: async () => ({
          observations: [{
            d: mockPrimeRate!.effectiveDate,
            V121796: { v: mockPrimeRate!.primeRate.toString() },
          }],
        }),
      });

      const result = await service.checkAndUpdatePrimeRate();

      // Restore fetch
      (global as any).fetch = originalFetch;

      assert.ok(result, "Should return result");
      assert.equal(result.changed, false, "Should not detect change");
      assert.equal(result.newRate, 6.450, "Should have same rate");
      assert.equal(result.termsUpdated, 0, "Should not update any terms");
    });

    it("records new prime rate in history when changed", async () => {
      // No existing history
      mockPrimeRate = { primeRate: 6.750, effectiveDate: "2024-03-15" };

      // Mock fetchLatestPrimeRate
      const originalFetch = (global as any).fetch;
      (global as any).fetch = async () => ({
        ok: true,
        json: async () => ({
          observations: [{
            d: mockPrimeRate!.effectiveDate,
            V121796: { v: mockPrimeRate!.primeRate.toString() },
          }],
        }),
      });

      await service.checkAndUpdatePrimeRate();

      // Restore fetch
      (global as any).fetch = originalFetch;

      const latest = await historyRepo.findLatest();
      assert.ok(latest, "Should record in history");
      // Prime rate is stored as string in database
      const latestRate = typeof latest.primeRate === 'string' ? latest.primeRate : latest.primeRate.toString();
      assert.ok(latestRate === "6.750" || parseFloat(latestRate) === 6.750, `Prime rate should be 6.750, got ${latestRate}`);
      assert.equal(latest.effectiveDate, "2024-03-15");
    });

    it("only updates active VRM terms", async () => {
      // Setup: Multiple terms - some active, some not
      const activeTerm: MortgageTerm = {
        id: "term-active",
        mortgageId: "mortgage-1",
        termType: "variable-changing",
        startDate: "2024-01-01",
        endDate: "2029-01-01", // Future end date - active
        termYears: 5,
        fixedRate: null,
        lockedSpread: "-0.800",
        primeRate: "6.450",
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
        createdAt: new Date().toISOString(),
      };

      const expiredTerm: MortgageTerm = {
        id: "term-expired",
        mortgageId: "mortgage-1",
        termType: "variable-changing",
        startDate: "2020-01-01",
        endDate: "2023-01-01", // Past end date - not active
        termYears: 5,
        fixedRate: null,
        lockedSpread: "-0.800",
        primeRate: "6.450",
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
        createdAt: new Date().toISOString(),
      };

      const fixedTerm: MortgageTerm = {
        id: "term-fixed",
        mortgageId: "mortgage-1",
        termType: "fixed", // Not variable - should not update
        startDate: "2024-01-01",
        endDate: "2029-01-01",
        termYears: 5,
        fixedRate: "5.490",
        lockedSpread: null,
        primeRate: null,
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
        createdAt: new Date().toISOString(),
      };

      termsRepo.setTerm(activeTerm);
      termsRepo.setTerm(expiredTerm);
      termsRepo.setTerm(fixedTerm);

      await historyRepo.create({
        primeRate: "6.450",
        effectiveDate: "2024-01-15",
        source: "Bank of Canada",
      });

      mockPrimeRate = { primeRate: 6.750, effectiveDate: "2024-03-15" };

      // Mock fetchLatestPrimeRate
      const originalFetch = (global as any).fetch;
      (global as any).fetch = async () => ({
        ok: true,
        json: async () => ({
          observations: [{
            d: mockPrimeRate!.effectiveDate,
            V121796: { v: mockPrimeRate!.primeRate.toString() },
          }],
        }),
      });

      const result = await service.checkAndUpdatePrimeRate();

      // Restore fetch
      (global as any).fetch = originalFetch;

      assert.equal(result.termsUpdated, 1, "Should only update active VRM term");
      
      const updatedActive = await termsRepo.update("term-active", {});
      assert.equal(updatedActive?.primeRate, "6.750", "Active term should be updated");

      const updatedExpired = await termsRepo.update("term-expired", {});
      assert.equal(updatedExpired?.primeRate, "6.450", "Expired term should not be updated");

      const updatedFixed = await termsRepo.update("term-fixed", {});
      assert.equal(updatedFixed?.primeRate, null, "Fixed term should not be updated");
    });

    it("handles errors gracefully when updating terms", async () => {
      // Setup: Term that will cause error
      const term: MortgageTerm = {
        id: "term-error",
        mortgageId: "mortgage-1",
        termType: "variable-changing",
        startDate: "2024-01-01",
        endDate: "2029-01-01",
        termYears: 5,
        fixedRate: null,
        lockedSpread: "-0.800",
        primeRate: "6.450",
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
        createdAt: new Date().toISOString(),
      };
      termsRepo.setTerm(term);

      await historyRepo.create({
        primeRate: "6.450",
        effectiveDate: "2024-01-15",
        source: "Bank of Canada",
      });

      mockPrimeRate = { primeRate: 6.750, effectiveDate: "2024-03-15" };

      // Mock fetchLatestPrimeRate
      const originalFetch = (global as any).fetch;
      (global as any).fetch = async () => ({
        ok: true,
        json: async () => ({
          observations: [{
            d: mockPrimeRate!.effectiveDate,
            V121796: { v: mockPrimeRate!.primeRate.toString() },
          }],
        }),
      });

      // Make update fail
      const originalUpdate = termsRepo.update;
      termsRepo.update = async () => {
        throw new Error("Update failed");
      };

      const result = await service.checkAndUpdatePrimeRate();

      // Restore
      termsRepo.update = originalUpdate;
      (global as any).fetch = originalFetch;

      assert.ok(result, "Should return result even with errors");
      assert.equal(result.errors.length, 1, "Should track error");
      assert.equal(result.errors[0].termId, "term-error", "Should identify failed term");
    });
  });

  describe("getHistory", () => {
    it("returns prime rate history for date range", async () => {
      await historyRepo.create({
        primeRate: "6.450",
        effectiveDate: "2024-01-15",
        source: "Bank of Canada",
      });

      await historyRepo.create({
        primeRate: "6.750",
        effectiveDate: "2024-03-15",
        source: "Bank of Canada",
      });

      const history = await service.getHistory("2024-01-01", "2024-02-28");

      assert.ok(history, "Should return history");
      assert.ok(history.length >= 1, "Should include entries in range");
    });
  });

  describe("getLatest", () => {
    it("returns latest prime rate from history", async () => {
      await historyRepo.create({
        primeRate: "6.450",
        effectiveDate: "2024-01-15",
        source: "Bank of Canada",
      });

      await historyRepo.create({
        primeRate: "6.750",
        effectiveDate: "2024-03-15",
        source: "Bank of Canada",
      });

      const latest = await service.getLatest();

      assert.ok(latest, "Should return latest");
      assert.equal(latest.rate, 6.750, "Should return most recent rate");
      assert.equal(latest.effectiveDate, "2024-03-15");
    });

    it("returns undefined when no history exists", async () => {
      const latest = await service.getLatest();
      assert.equal(latest, undefined, "Should return undefined when no history");
    });
  });
});

