import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { MortgageTermService } from "../mortgage-term.service";
import type { Mortgage, MortgageTerm } from "@shared/schema";
import type { PaymentFrequency } from "@server-shared/calculations/mortgage";

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

  async update(id: string, payload: any): Promise<MortgageTerm | undefined> {
    const term = this.terms.get(id);
    if (!term) return undefined;
    const updated: MortgageTerm = { 
      ...term, 
      ...payload,
      id: term.id,
      mortgageId: term.mortgageId,
      createdAt: term.createdAt,
    };
    this.terms.set(id, updated);
    const existing = this.mortgageTerms.get(term.mortgageId) || [];
    const index = existing.findIndex(t => t.id === id);
    if (index >= 0) {
      existing[index] = updated;
      this.mortgageTerms.set(term.mortgageId, existing);
    } else {
      this.mortgageTerms.set(term.mortgageId, [...existing, updated]);
    }
    return updated;
  }

  setTerm(term: MortgageTerm): void {
    this.terms.set(term.id, term);
    const existing = this.mortgageTerms.get(term.mortgageId) || [];
    if (!existing.find(t => t.id === term.id)) {
      this.mortgageTerms.set(term.mortgageId, [...existing, term]);
    }
  }
}

class MockMortgagePaymentsRepository {
  private payments: Map<string, any[]> = new Map();

  async findByTermId(termId: string): Promise<any[]> {
    return this.payments.get(termId) || [];
  }

  setPayments(termId: string, payments: any[]): void {
    this.payments.set(termId, payments);
  }
}

describe("MortgageTermService - Payment Frequency Change", () => {
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
    
    service = new MortgageTermService(
      mortgagesRepo as any,
      termsRepo as any,
      paymentsRepo as any,
    );
  });

  it("changes frequency from monthly to biweekly and recalculates payment", async () => {
    const monthlyTerm: MortgageTerm = {
      id: "term-1",
      mortgageId: "mortgage-1",
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      lockedSpread: null,
      primeRate: null,
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
      createdAt: new Date().toISOString(),
    };
    termsRepo.setTerm(monthlyTerm);

    // Set a payment to establish current balance
    paymentsRepo.setPayments("term-1", [{
      id: "payment-1",
      remainingBalance: "550000.00",
      remainingAmortizationMonths: 280,
      paymentDate: "2023-06-01",
    }]);

    const result = await service.changePaymentFrequency("term-1", "user-1", "biweekly");

    assert.ok(result, "Frequency change should succeed");
    assert.ok(result.term, "Result should include updated term");
    assert.equal(
      result.term.paymentFrequency,
      "biweekly",
      "Payment frequency should be updated to biweekly"
    );
    assert.ok(
      result.newPaymentAmount > 0,
      "New payment amount should be calculated"
    );
    assert.ok(
      result.newPaymentAmount !== 3500,
      "Payment amount should change when frequency changes"
    );
  });

  it("changes frequency from monthly to accelerated-biweekly", async () => {
    const monthlyTerm: MortgageTerm = {
      id: "term-1",
      mortgageId: "mortgage-1",
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      lockedSpread: null,
      primeRate: null,
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
      createdAt: new Date().toISOString(),
    };
    termsRepo.setTerm(monthlyTerm);

    paymentsRepo.setPayments("term-1", [{
      id: "payment-1",
      remainingBalance: "550000.00",
      remainingAmortizationMonths: 280,
      paymentDate: "2023-06-01",
    }]);

    const result = await service.changePaymentFrequency("term-1", "user-1", "accelerated-biweekly");

    assert.ok(result, "Frequency change should succeed");
    assert.equal(
      result.term.paymentFrequency,
      "accelerated-biweekly",
      "Payment frequency should be updated to accelerated-biweekly"
    );
    
    // Accelerated biweekly is calculated from current balance and remaining amortization
    // It should be approximately half of what the monthly payment would be for the same balance
    // But since we're recalculating based on current state, it may differ slightly
    assert.ok(
      result.newPaymentAmount > 0 && result.newPaymentAmount < 2000,
      `Accelerated biweekly payment should be reasonable. Got ${result.newPaymentAmount}`
    );
    
    // Verify it's approximately half of monthly (allowing for recalculation differences)
    const monthlyPaymentForBalance = 3500; // Original monthly payment
    const expectedRange = monthlyPaymentForBalance / 2; // ~$1,750
    assert.ok(
      Math.abs(result.newPaymentAmount - expectedRange) < 100, // Allow variance due to recalculation
      `Accelerated biweekly should be approximately half of monthly. Expected ~${expectedRange}, got ${result.newPaymentAmount}`
    );
  });

  it("changes frequency from biweekly to monthly", async () => {
    const biweeklyTerm: MortgageTerm = {
      id: "term-1",
      mortgageId: "mortgage-1",
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      lockedSpread: null,
      primeRate: null,
      paymentFrequency: "biweekly",
      regularPaymentAmount: "1750.00",
      createdAt: new Date().toISOString(),
    };
    termsRepo.setTerm(biweeklyTerm);

    paymentsRepo.setPayments("term-1", [{
      id: "payment-1",
      remainingBalance: "550000.00",
      remainingAmortizationMonths: 280,
      paymentDate: "2023-06-01",
    }]);

    const result = await service.changePaymentFrequency("term-1", "user-1", "monthly");

    assert.ok(result, "Frequency change should succeed");
    assert.equal(
      result.term.paymentFrequency,
      "monthly",
      "Payment frequency should be updated to monthly"
    );
    assert.ok(
      result.newPaymentAmount > 0,
      "New payment amount should be calculated"
    );
  });

  it("uses remaining amortization from latest payment if available", async () => {
    const term: MortgageTerm = {
      id: "term-1",
      mortgageId: "mortgage-1",
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      lockedSpread: null,
      primeRate: null,
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
      createdAt: new Date().toISOString(),
    };
    termsRepo.setTerm(term);

    // Set payment with specific remaining amortization
    paymentsRepo.setPayments("term-1", [{
      id: "payment-1",
      remainingBalance: "500000.00",
      remainingAmortizationMonths: 250, // 20.8 years remaining
      paymentDate: "2023-06-01",
    }]);

    const result = await service.changePaymentFrequency("term-1", "user-1", "biweekly");

    assert.ok(result, "Frequency change should succeed");
    // Payment should be calculated using the 250 months remaining amortization
    assert.ok(
      result.newPaymentAmount > 0,
      "Payment should be calculated using remaining amortization"
    );
  });

  it("uses mortgage current balance when no payments exist", async () => {
    const term: MortgageTerm = {
      id: "term-1",
      mortgageId: "mortgage-1",
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      lockedSpread: null,
      primeRate: null,
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
      createdAt: new Date().toISOString(),
    };
    termsRepo.setTerm(term);

    // No payments exist, should use mortgage.currentBalance
    paymentsRepo.setPayments("term-1", []);

    const result = await service.changePaymentFrequency("term-1", "user-1", "biweekly");

    assert.ok(result, "Frequency change should succeed");
    assert.ok(
      result.newPaymentAmount > 0,
      "Payment should be calculated using mortgage current balance"
    );
  });

  it("handles variable rate mortgages", async () => {
    const vrmTerm: MortgageTerm = {
      id: "term-1",
      mortgageId: "mortgage-1",
      termType: "variable-changing",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: null,
      lockedSpread: "-0.800",
      primeRate: "6.450",
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
      createdAt: new Date().toISOString(),
    };
    termsRepo.setTerm(vrmTerm);

    paymentsRepo.setPayments("term-1", [{
      id: "payment-1",
      remainingBalance: "550000.00",
      remainingAmortizationMonths: 280,
      paymentDate: "2023-06-01",
    }]);

    const result = await service.changePaymentFrequency("term-1", "user-1", "biweekly");

    assert.ok(result, "Frequency change should succeed for variable rate mortgages");
    assert.equal(
      result.term.paymentFrequency,
      "biweekly",
      "Payment frequency should be updated"
    );
  });

  it("returns undefined for non-existent term", async () => {
    const result = await service.changePaymentFrequency("non-existent", "user-1", "biweekly");
    assert.equal(result, undefined, "Should return undefined for non-existent term");
  });

  it("returns undefined for unauthorized user", async () => {
    const term: MortgageTerm = {
      id: "term-1",
      mortgageId: "mortgage-1",
      termType: "fixed",
      startDate: "2020-01-01",
      endDate: "2025-01-01",
      termYears: 5,
      fixedRate: "5.490",
      lockedSpread: null,
      primeRate: null,
      paymentFrequency: "monthly",
      regularPaymentAmount: "3500.00",
      createdAt: new Date().toISOString(),
    };
    termsRepo.setTerm(term);

    const result = await service.changePaymentFrequency("term-1", "unauthorized-user", "biweekly");
    assert.equal(result, undefined, "Should return undefined for unauthorized user");
  });
});

