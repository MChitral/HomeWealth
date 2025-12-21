import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { MortgageTermService } from "../mortgage-term.service";
import type { Mortgage, MortgageTerm } from "@shared/schema";

// Mock repositories (same pattern as other tests)
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

describe("MortgageTermService - Term Date Validation", () => {
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

  it("allows valid 3-year term", async () => {
    const term = await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2023-01-01", // 3 years
      termYears: 3,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    assert.ok(term, "3-year term should be created");
  });

  it("allows valid 5-year term", async () => {
    const term = await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01", // 5 years
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    assert.ok(term, "5-year term should be created");
  });

  it("rejects term shorter than 2.5 years", async () => {
    try {
      await service.create("mortgage-1", "user-1", {
        termType: "fixed",
        startDate: "2020-01-01",
        endDate: "2022-06-01", // ~2.4 years
        termYears: 2,
        fixedRate: "5.490",
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
      });
      assert.fail("Should have thrown error for term shorter than 2.5 years");
    } catch (error: any) {
      assert.ok(
        error.message.includes("Term length must be between 3-5 years"),
        "Error message should mention term length requirement"
      );
    }
  });

  it("rejects term longer than 6 years", async () => {
    try {
      await service.create("mortgage-1", "user-1", {
        termType: "fixed",
        startDate: "2020-01-01",
        endDate: "2027-01-01", // 7 years
        termYears: 7,
        fixedRate: "5.490",
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
      });
      assert.fail("Should have thrown error for term longer than 6 years");
    } catch (error: any) {
      assert.ok(
        error.message.includes("Term length must be between 3-5 years"),
        "Error message should mention term length requirement"
      );
    }
  });

  it("rejects term where end date is before start date", async () => {
    try {
      await service.create("mortgage-1", "user-1", {
        termType: "fixed",
        startDate: "2020-01-01",
        endDate: "2019-12-31", // Before start
        termYears: 5,
        fixedRate: "5.490",
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
      });
      assert.fail("Should have thrown error for end date before start date");
    } catch (error: any) {
      assert.ok(
        error.message.includes("end date must be after start date"),
        "Error message should mention end date must be after start date"
      );
    }
  });

  it("rejects term where end date equals start date", async () => {
    try {
      await service.create("mortgage-1", "user-1", {
        termType: "fixed",
        startDate: "2020-01-01",
        endDate: "2020-01-01", // Same as start
        termYears: 5,
        fixedRate: "5.490",
        paymentFrequency: "monthly",
        regularPaymentAmount: "3500.00",
      });
      assert.fail("Should have thrown error for end date equal to start date");
    } catch (error: any) {
      assert.ok(
        error.message.includes("end date must be after start date"),
        "Error message should mention end date must be after start date"
      );
    }
  });

  it("validates term length on update", async () => {
    // Create a valid term first
    const term = await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    assert.ok(term, "Term should be created");

    // Try to update to invalid length
    try {
      await service.update(term!.id, "user-1", {
        endDate: "2028-01-01", // 8 years from start
      });
      assert.fail("Should have thrown error for term longer than 6 years");
    } catch (error: any) {
      assert.ok(
        error.message.includes("Term length must be between 3-5 years"),
        "Error message should mention term length requirement"
      );
    }
  });

  it("allows updating to valid term length", async () => {
    // Create a valid term first
    const term = await service.create("mortgage-1", "user-1", {
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
    });

    assert.ok(term, "Term should be created");

    // Update to another valid length
    const updated = await service.update(term!.id, "user-1", {
      endDate: "2023-01-01", // 3 years from start
    });

    assert.ok(updated, "Term should be updated to valid length");
  });
});
