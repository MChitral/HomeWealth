import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Mortgage, MortgagePayment, MortgageTerm, PrimeRateHistory } from "@shared/schema";
import type {
  MortgagePaymentsRepository,
  MortgagesRepository,
  MortgageTermsRepository,
  PrimeRateHistoryRepository,
} from "@infrastructure/repositories";
import { MortgagePaymentService } from "../mortgage-payment.service";

class StubMortgagesRepository {
  mortgage: Mortgage = {
    id: "mortgage-rbc",
    userId: "user-1",
    propertyPrice: "400000.00",
    downPayment: "105601.00",
    originalAmount: "294399.00",
    currentBalance: "294399.00",
    startDate: "2025-01-02",
    amortizationYears: 30,
    amortizationMonths: 0,
    paymentFrequency: "monthly",
    annualPrepaymentLimitPercent: 10,
    prepaymentLimitResetDate: "2025-01-02",
    prepaymentCarryForward: "0.00",
    lenderName: "RBC",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Mortgage;

  async findById(id: string) {
    return id === this.mortgage.id ? this.mortgage : undefined;
  }

  async update(_id: string, values: Partial<Mortgage>) {
    this.mortgage = { ...this.mortgage, ...values };
    return this.mortgage;
  }
}

class StubMortgageTermsRepository {
  term: MortgageTerm = {
    id: "term-rbc",
    mortgageId: "mortgage-rbc",
    termType: "variable-fixed",
    startDate: "2025-01-02",
    endDate: "2030-01-02",
    termYears: 5,
    fixedRate: null,
    lockedSpread: "-0.900",
    primeRate: "5.200",
    paymentFrequency: "monthly",
    regularPaymentAmount: "1500.69",
    interestAccrualBasis: "actual-365",
    createdAt: new Date(),
  } as MortgageTerm;

  async findById(id: string) {
    return id === this.term.id ? this.term : undefined;
  }
}

class StubMortgagePaymentsRepository {
  payments: MortgagePayment[] = [];

  async findById(id: string) {
    return this.payments.find((payment) => payment.id === id);
  }

  async findByMortgageId(mortgageId: string) {
    return this.payments.filter((payment) => payment.mortgageId === mortgageId);
  }

  async findByTermId(termId: string) {
    return this.payments.filter((payment) => payment.termId === termId);
  }

  async create(values: Partial<MortgagePayment>) {
    const payment = {
      id: `payment-${this.payments.length + 1}`,
      isSkipped: 0,
      skippedInterestAccrued: "0.00",
      calculationSource: "calculated",
      createdAt: new Date(),
      ...values,
    } as MortgagePayment;
    this.payments.push(payment);
    return payment;
  }

  async update(id: string, values: Partial<MortgagePayment>) {
    const index = this.payments.findIndex((payment) => payment.id === id);
    if (index < 0) return undefined;
    this.payments[index] = { ...this.payments[index], ...values };
    return this.payments[index];
  }

  async delete(id: string) {
    const originalLength = this.payments.length;
    this.payments = this.payments.filter((payment) => payment.id !== id);
    return this.payments.length !== originalLength;
  }
}

class StubPrimeRateHistoryRepository {
  history: PrimeRateHistory[] = [
    {
      id: "prime-1",
      primeRate: "5.450",
      effectiveDate: "2025-01-02",
      source: "RBC",
      createdAt: new Date(),
    },
    {
      id: "prime-2",
      primeRate: "5.200",
      effectiveDate: "2025-01-30",
      source: "RBC",
      createdAt: new Date(),
    },
  ];

  async findEffectiveAtOrBefore(date: string) {
    return [...this.history]
      .filter((entry) => entry.effectiveDate <= date)
      .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];
  }

  async findByDateRange(startDate: string, endDate: string) {
    return this.history.filter(
      (entry) => entry.effectiveDate >= startDate && entry.effectiveDate <= endDate
    );
  }
}

function payload(paymentDate: string) {
  return {
    termId: "term-rbc",
    paymentDate,
    paymentPeriodLabel: paymentDate.slice(0, 7),
    regularPaymentAmount: "1500.69",
    prepaymentAmount: "0.00",
    paymentAmount: "1500.69",
    principalPaid: "0.00",
    interestPaid: "0.00",
    remainingBalance: "0.00",
    primeRate: "5.200",
    effectiveRate: "4.300",
    triggerRateHit: 0,
    skippedInterestAccrued: "0.00",
    remainingAmortizationMonths: 360,
  };
}

describe("MortgagePaymentService RBC ledger behavior", () => {
  let mortgages: StubMortgagesRepository;
  let terms: StubMortgageTermsRepository;
  let payments: StubMortgagePaymentsRepository;
  let service: MortgagePaymentService;

  beforeEach(() => {
    mortgages = new StubMortgagesRepository();
    terms = new StubMortgageTermsRepository();
    payments = new StubMortgagePaymentsRepository();
    service = new MortgagePaymentService(
      mortgages as unknown as MortgagesRepository,
      terms as unknown as MortgageTermsRepository,
      payments as unknown as MortgagePaymentsRepository,
      undefined,
      new StubPrimeRateHistoryRepository() as unknown as PrimeRateHistoryRepository
    );
  });

  it("creates an Actual/365 payment using rate changes and contractual dates", async () => {
    const created = await service.create("mortgage-rbc", "user-1", payload("2025-02-02"));

    assert.ok(created);
    assert.equal(created.paymentDate, "2025-02-02");
    assert.equal(created.interestPaid, "1131.62");
    assert.equal(created.principalPaid, "369.07");
    assert.equal(created.remainingBalance, "294029.93");
    assert.equal(mortgages.mortgage.currentBalance, "294029.93");
  });

  it("refuses to delete a statement-sourced payment", async () => {
    const created = await payments.create({
      ...payload("2025-02-02"),
      id: "statement-payment",
      mortgageId: "mortgage-rbc",
      calculationSource: "statement",
      remainingBalance: "294029.93",
    });

    await assert.rejects(
      () => service.delete(created.id, "user-1"),
      /Bank-statement payments cannot be deleted/
    );
  });

  it("only deletes the latest calculated payment and restores the prior balance", async () => {
    const first = await service.create("mortgage-rbc", "user-1", payload("2025-02-02"));
    const second = await service.create("mortgage-rbc", "user-1", payload("2025-03-02"));
    assert.ok(first);
    assert.ok(second);

    await assert.rejects(
      () => service.delete(first.id, "user-1"),
      /Only the latest payment can be deleted/
    );

    assert.equal(await service.delete(second.id, "user-1"), true);
    assert.equal(mortgages.mortgage.currentBalance, first.remainingBalance);
  });
});
