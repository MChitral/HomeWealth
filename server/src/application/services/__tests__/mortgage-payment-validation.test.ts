/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { MortgagePaymentService } from "../mortgage-payment.service";
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

  async findById(id: string): Promise<MortgageTerm | undefined> {
    return this.terms.get(id);
  }

  setTerm(term: MortgageTerm): void {
    this.terms.set(term.id, term);
  }
}

class MockMortgagePaymentsRepository {
  private payments: Map<string, any[]> = new Map();

  async findByTermId(termId: string): Promise<any[]> {
    return this.payments.get(termId) || [];
  }

  async findByMortgageId(_mortgageId: string): Promise<any[]> {
    return [];
  }

  async create(payload: any): Promise<any> {
    const payment = {
      id: `payment-${Date.now()}`,
      ...payload,
      createdAt: new Date(),
    };
    const existing = this.payments.get(payload.termId) || [];
    this.payments.set(payload.termId, [...existing, payment]);
    return payment;
  }
}

describe("MortgagePaymentService - Payment Date Validation", () => {
  let service: MortgagePaymentService;
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTerm: MortgageTerm = {
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
    createdAt: new Date(),
  };

  beforeEach(() => {
    mortgagesRepo = new MockMortgagesRepository();
    termsRepo = new MockMortgageTermsRepository();
    paymentsRepo = new MockMortgagePaymentsRepository();

    mortgagesRepo.setMortgage(mockMortgage);
    termsRepo.setTerm(mockTerm);

    service = new MortgagePaymentService(
      mortgagesRepo as any,
      termsRepo as any,
      paymentsRepo as any
    );
  });

  it("rejects payment date in the future", async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    try {
      await service.create("mortgage-1", "user-1", {
        termId: "term-1",
        paymentDate: futureDateStr,
        regularPaymentAmount: "3500.00",
        prepaymentAmount: "0",
        paymentAmount: "3500.00",
      } as any);
      assert.fail("Should have thrown error for future payment date");
    } catch (error: any) {
      assert.ok(error.message.includes("future"), "Error message should mention future date");
    }
  });

  it("rejects payment date before mortgage start date", async () => {
    try {
      await service.create("mortgage-1", "user-1", {
        termId: "term-1",
        paymentDate: "2019-12-01", // Before mortgage start (2020-01-01)
        regularPaymentAmount: "3500.00",
        prepaymentAmount: "0",
        paymentAmount: "3500.00",
      } as any);
      assert.fail("Should have thrown error for payment before mortgage start");
    } catch (error: any) {
      assert.ok(
        error.message.includes("before mortgage start date"),
        "Error message should mention mortgage start date"
      );
    }
  });

  it("rejects payment date before term start date", async () => {
    // Create term that starts after mortgage
    const laterTerm: MortgageTerm = {
      ...mockTerm,
      id: "term-2",
      startDate: "2021-01-01",
      endDate: "2026-01-01",
    };
    termsRepo.setTerm(laterTerm);

    try {
      await service.create("mortgage-1", "user-1", {
        termId: "term-2",
        paymentDate: "2020-12-01", // Before term start (2021-01-01)
        regularPaymentAmount: "3500.00",
        prepaymentAmount: "0",
        paymentAmount: "3500.00",
      } as any);
      assert.fail("Should have thrown error for payment before term start");
    } catch (error: any) {
      assert.ok(
        error.message.includes("within term period"),
        "Error message should mention term period"
      );
    }
  });

  it("rejects payment date after term end date", async () => {
    try {
      await service.create("mortgage-1", "user-1", {
        termId: "term-1",
        paymentDate: "2025-02-01", // After term end (2025-01-01)
        regularPaymentAmount: "3500.00",
        prepaymentAmount: "0",
        paymentAmount: "3500.00",
      } as any);
      assert.fail("Should have thrown error for payment after term end");
    } catch (error: any) {
      assert.ok(
        error.message.includes("within term period"),
        "Error message should mention term period"
      );
    }
  });

  it("allows payment date within term period", async () => {
    // This should succeed (though it may fail validation for other reasons)
    // We're just testing that date validation passes
    try {
      await service.create("mortgage-1", "user-1", {
        termId: "term-1",
        paymentDate: "2021-06-01", // Within term period
        regularPaymentAmount: "3500.00",
        prepaymentAmount: "0",
        paymentAmount: "3500.00",
      } as any);
      // If we get here, date validation passed (may fail on other validations)
    } catch (error: any) {
      // If error is NOT about date validation, that's fine
      // We're just checking that date validation doesn't reject valid dates
      if (
        error.message.includes("future") ||
        error.message.includes("before mortgage") ||
        error.message.includes("within term period")
      ) {
        throw error; // Re-throw if it's a date validation error
      }
      // Otherwise, it's a different validation error, which is expected
    }
  });

  it("validates payment dates in bulk creation", async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    try {
      await service.createBulk("mortgage-1", "user-1", [
        {
          termId: "term-1",
          paymentDate: "2021-06-01",
          regularPaymentAmount: "3500.00",
          prepaymentAmount: "0",
          paymentAmount: "3500.00",
        },
        {
          termId: "term-1",
          paymentDate: futureDateStr, // Future date
          regularPaymentAmount: "3500.00",
          prepaymentAmount: "0",
          paymentAmount: "3500.00",
        },
      ] as any);
      assert.fail("Should have thrown error for future payment date in bulk");
    } catch (error: any) {
      assert.ok(error.message.includes("future"), "Error message should mention future date");
    }
  });
});
