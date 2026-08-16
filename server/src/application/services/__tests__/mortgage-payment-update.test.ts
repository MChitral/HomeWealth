/**
 * Unit tests for MortgagePaymentService.update
 *
 * Covers:
 *  - Adding a prepayment to an existing payment
 *  - Recalculating later payments from the new balance
 *  - Rejecting edits to skipped payments
 *  - Rejecting prepayments over the annual limit
 *  - Returning undefined when the payment is not found
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { MortgagePaymentService } from "../mortgage-payment.service";
import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";
import type {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";

function makeMortgage(overrides: Partial<Mortgage> = {}): Mortgage {
  return {
    id: "mortgage-1",
    userId: "user-1",
    propertyPrice: "750000.00",
    downPayment: "150000.00",
    originalAmount: "600000.00",
    currentBalance: "600000.00",
    startDate: "2024-01-01",
    amortizationYears: 25,
    amortizationMonths: 0,
    paymentFrequency: "monthly",
    annualPrepaymentLimitPercent: 20,
    prepaymentLimitResetDate: null,
    prepaymentCarryForward: "0.00",
    insuranceProvider: null,
    insurancePremium: null,
    insuranceAddedToPrincipal: null,
    isHighRatio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Mortgage;
}

function makeTerm(overrides: Partial<MortgageTerm> = {}): MortgageTerm {
  return {
    id: "term-1",
    mortgageId: "mortgage-1",
    termType: "fixed",
    startDate: "2024-01-01",
    endDate: "2029-01-01",
    termYears: 5,
    paymentFrequency: "monthly",
    regularPaymentAmount: "3500.00",
    fixedRate: "5.490",
    lockedSpread: null,
    primeRate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as MortgageTerm;
}

class StubMortgagesRepo {
  private store = new Map<string, Mortgage>();

  set(mortgage: Mortgage) {
    this.store.set(mortgage.id, mortgage);
  }

  async findById(id: string): Promise<Mortgage | undefined> {
    return this.store.get(id);
  }

  async update(id: string, payload: Partial<Mortgage>): Promise<Mortgage | undefined> {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...payload };
    this.store.set(id, updated);
    return updated;
  }
}

class StubTermsRepo {
  private store = new Map<string, MortgageTerm>();

  set(term: MortgageTerm) {
    this.store.set(term.id, term);
  }

  async findById(id: string): Promise<MortgageTerm | undefined> {
    return this.store.get(id);
  }
}

class StubPaymentsRepo {
  private byId = new Map<string, MortgagePayment>();
  private seq = 0;

  async findById(id: string): Promise<MortgagePayment | undefined> {
    return this.byId.get(id);
  }

  async findByMortgageId(mortgageId: string): Promise<MortgagePayment[]> {
    return [...this.byId.values()].filter((payment) => payment.mortgageId === mortgageId);
  }

  async findByTermId(termId: string): Promise<MortgagePayment[]> {
    return [...this.byId.values()].filter((payment) => payment.termId === termId);
  }

  async create(payload: Partial<MortgagePayment>): Promise<MortgagePayment> {
    const payment = {
      id: `payment-${++this.seq}`,
      isSkipped: 0,
      skippedInterestAccrued: "0.00",
      createdAt: new Date(),
      ...payload,
    } as MortgagePayment;
    this.byId.set(payment.id, payment);
    return payment;
  }

  async update(
    id: string,
    payload: Partial<MortgagePayment>
  ): Promise<MortgagePayment | undefined> {
    const existing = this.byId.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...payload };
    this.byId.set(id, updated);
    return updated;
  }

  seed(payment: MortgagePayment) {
    this.byId.set(payment.id, payment);
  }
}

function buildService(
  mortgagesRepo: StubMortgagesRepo,
  termsRepo: StubTermsRepo,
  paymentsRepo: StubPaymentsRepo
): MortgagePaymentService {
  return new MortgagePaymentService(
    mortgagesRepo as unknown as MortgagesRepository,
    termsRepo as unknown as MortgageTermsRepository,
    paymentsRepo as unknown as MortgagePaymentsRepository
  );
}

function paymentPayload(paymentDate: string) {
  return {
    termId: "term-1",
    paymentDate,
    paymentPeriodLabel: paymentDate.slice(0, 7),
    regularPaymentAmount: "3500.00",
    prepaymentAmount: "0",
    paymentAmount: "3500.00",
    principalPaid: "0",
    interestPaid: "0",
    remainingBalance: "0",
    effectiveRate: "5.490",
    triggerRateHit: 0,
    remainingAmortizationMonths: 300,
  };
}

describe("MortgagePaymentService.update", () => {
  let mortgagesRepo: StubMortgagesRepo;
  let termsRepo: StubTermsRepo;
  let paymentsRepo: StubPaymentsRepo;
  let service: MortgagePaymentService;

  beforeEach(() => {
    mortgagesRepo = new StubMortgagesRepo();
    termsRepo = new StubTermsRepo();
    paymentsRepo = new StubPaymentsRepo();
    mortgagesRepo.set(makeMortgage());
    termsRepo.set(makeTerm());
    service = buildService(mortgagesRepo, termsRepo, paymentsRepo);
  });

  it("adds a prepayment to a logged payment and lowers the balance", async () => {
    const created = await service.create("mortgage-1", "user-1", paymentPayload("2024-06-01"));
    assert.ok(created);
    const balanceBeforeEdit = Number(created.remainingBalance);

    const updated = await service.update(created.id, "user-1", {
      prepaymentAmount: "10000.00",
    });

    assert.ok(updated);
    assert.equal(Number(updated.prepaymentAmount), 10000);
    assert.equal(Number(updated.regularPaymentAmount), 3500);
    assert.equal(Number(updated.paymentAmount), 13500);
    assert.ok(Number(updated.remainingBalance) < balanceBeforeEdit);
    assert.ok(Number(updated.principalPaid) > Number(created.principalPaid));
  });

  it("recalculates later payments after an earlier prepayment is added", async () => {
    const first = await service.create("mortgage-1", "user-1", paymentPayload("2024-06-01"));
    const second = await service.create("mortgage-1", "user-1", paymentPayload("2024-07-01"));
    assert.ok(first);
    assert.ok(second);
    const secondBalanceBefore = Number(second.remainingBalance);

    await service.update(first.id, "user-1", { prepaymentAmount: "10000.00" });

    const firstAfter = await paymentsRepo.findById(first.id);
    const secondAfter = await paymentsRepo.findById(second.id);
    const mortgageAfter = await mortgagesRepo.findById("mortgage-1");

    assert.ok(firstAfter);
    assert.ok(secondAfter);
    assert.equal(Number(firstAfter.prepaymentAmount), 10000);
    assert.equal(Number(secondAfter.prepaymentAmount), 0);
    assert.ok(Number(secondAfter.remainingBalance) < secondBalanceBefore);
    assert.equal(mortgageAfter?.currentBalance, secondAfter.remainingBalance);
  });

  it("rejects editing a skipped payment", async () => {
    const created = await service.create("mortgage-1", "user-1", paymentPayload("2024-06-01"));
    assert.ok(created);
    await paymentsRepo.update(created.id, { isSkipped: 1 });

    await assert.rejects(
      () => service.update(created.id, "user-1", { prepaymentAmount: "500.00" }),
      /Skipped payments cannot be edited/
    );
  });

  it("rejects a prepayment that exceeds the annual limit", async () => {
    const created = await service.create("mortgage-1", "user-1", paymentPayload("2024-06-01"));
    assert.ok(created);

    await assert.rejects(
      () => service.update(created.id, "user-1", { prepaymentAmount: "200000.00" }),
      /Annual prepayment limit exceeded/
    );
  });

  it("returns undefined when the payment does not exist", async () => {
    const updated = await service.update("missing-payment", "user-1", {
      prepaymentAmount: "500.00",
    });
    assert.equal(updated, undefined);
  });

  it("returns undefined when the user does not own the mortgage", async () => {
    const created = await service.create("mortgage-1", "user-1", paymentPayload("2024-06-01"));
    assert.ok(created);

    const updated = await service.update(created.id, "other-user", {
      prepaymentAmount: "500.00",
    });
    assert.equal(updated, undefined);
  });
});
