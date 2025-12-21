import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { MortgageTermService } from "../mortgage-term.service";
import type { Mortgage, MortgageTerm } from "@shared/schema";

// Mock repositories
class MockMortgagesRepository {
  private mortgages: Map<string, Mortgage> = new Map();

  async findById(id: string): Promise<Mortgage | undefined> {
    return this.mortgages.get(id);
  }

  setMortgage(mortgage: Mortgage): void {
    this.mortgages.set(mortgage.id, mortgage);
  }
}

class MockMortgageTermsRepository {
  private terms: Map<string, MortgageTerm> = new Map();
  private mortgageTerms: Map<string, MortgageTerm[]> = new Map();

  async findById(id: string): Promise<MortgageTerm | undefined> {
    return this.terms.get(id);
  }

  async findByMortgageId(mortgageId: string): Promise<MortgageTerm[]> {
    return this.mortgageTerms.get(mortgageId) || [];
  }

  async create(payload: any): Promise<MortgageTerm> {
    const term: MortgageTerm = {
      id: `term-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    this.terms.set(term.id, term);
    const existing = this.mortgageTerms.get(payload.mortgageId) || [];
    this.mortgageTerms.set(payload.mortgageId, [...existing, term]);
    return term;
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
    const existing = this.mortgageTerms.get(term.mortgageId) || [];
    if (!existing.find((t) => t.id === term.id)) {
      this.mortgageTerms.set(term.mortgageId, [...existing, term]);
    }
  }
}

class MockMortgagePaymentsRepository {
  async findByTermId(termId: string): Promise<any[]> {
    return [];
  }

  async deleteByTermId(termId: string): Promise<void> {
    // Mock implementation
  }
}

describe("MortgageTermService - Term Overlap Validation", () => {
  let service: MortgageTermService;
  let mortgagesRepo: MockMortgagesRepository;
  let termsRepo: MockMortgageTermsRepository;
  let paymentsRepo: MockMortgagePaymentsRepository;

  const mockMortgage: Mortgage = {
    id: "mortgage-1",
    userId: "user-1",
    propertyPrice: "750000.00",
    downPayment: "150000.00",
    originalAmount: "600000.00",
    currentBalance: "580000.00",
    startDate: "2020-01-01",
    amortizationYears: 25,
    amortizationMonths: 0,
    paymentFrequency: "monthly",
    annualPrepaymentLimitPercent: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    mortgagesRepo = new MockMortgagesRepository();
    termsRepo = new MockMortgageTermsRepository();
    paymentsRepo = new MockMortgagePaymentsRepository();

    mortgagesRepo.setMortgage(mockMortgage);

    service = new MortgageTermService(mortgagesRepo as any, termsRepo as any, paymentsRepo as any);
  });

  it("allows non-overlapping terms", async () => {
    // First term: 2020-01-01 to 2025-01-01
    const term1 = await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    assert.ok(term1, "First term should be created");

    // Second term: 2025-01-01 to 2030-01-01 (starts when first ends)
    const term2 = await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2025-01-01",
      endDate: "2030-01-01",
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    assert.ok(term2, "Second term should be created when dates don't overlap");
  });

  it("rejects overlapping terms", async () => {
    // First term: 2020-01-01 to 2025-01-01
    await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    // Second term: 2024-06-01 to 2029-06-01 (overlaps with first)
    try {
      await service.create("mortgage-1", "user-1", {
        termType: "fixed",
        startDate: "2024-06-01",
        endDate: "2029-06-01",
        termYears: 5,
        fixedRate: "5.490",
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
      });
      assert.fail("Should have thrown error for overlapping terms");
    } catch (error: any) {
      assert.ok(error.message.includes("overlap"), "Error message should mention overlap");
    }
  });

  it("rejects terms that start before previous term ends", async () => {
    // First term: 2020-01-01 to 2025-01-01
    await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    // Second term: 2024-12-01 to 2029-12-01 (starts before first ends)
    try {
      await service.create("mortgage-1", "user-1", {
        termType: "fixed",
        startDate: "2024-12-01",
        endDate: "2029-12-01",
        termYears: 5,
        fixedRate: "5.490",
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
      });
      assert.fail("Should have thrown error for overlapping terms");
    } catch (error: any) {
      assert.ok(error.message.includes("overlap"), "Error message should mention overlap");
    }
  });

  it("allows updating term to non-overlapping dates", async () => {
    // Create two non-overlapping terms
    const term1 = await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    const term2 = await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2025-01-01",
      endDate: "2030-01-01",
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    // Update term2 to extend it (still non-overlapping)
    const updated = await service.update(term2!.id, "user-1", {
      endDate: "2031-01-01",
    });

    assert.ok(updated, "Term should be updated when dates don't overlap");
  });

  it("rejects updating term to overlapping dates", async () => {
    // Create two non-overlapping terms
    const term1 = await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    const term2 = await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2025-01-01",
      endDate: "2030-01-01",
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    // Try to update term2 to overlap with term1
    try {
      await service.update(term2!.id, "user-1", {
        startDate: "2024-06-01", // Overlaps with term1
      });
      assert.fail("Should have thrown error for overlapping terms");
    } catch (error: any) {
      assert.ok(error.message.includes("overlap"), "Error message should mention overlap");
    }
  });
});
