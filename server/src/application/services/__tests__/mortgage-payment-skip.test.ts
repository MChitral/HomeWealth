/**
 * Unit tests for MortgagePaymentService.skipPayment
 *
 * Covers:
 *  - Returns undefined when mortgage is not found / not authorized
 *  - Returns undefined when term is not found
 *  - Throws when the skip limit for the year is already reached
 *  - Creates a skipped payment record with the correct fields
 */
import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { MortgagePaymentService } from "../mortgage-payment.service";
import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";
import type {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";

// ── Minimal mock helpers ───────────────────────────────────────────────────────

function makeMortgage(overrides: Partial<Mortgage> = {}): Mortgage {
  return {
    id: "mortgage-1",
    userId: "user-1",
    propertyPrice: "500000",
    downPayment: "100000",
    originalAmount: "400000",
    currentBalance: "400000",
    startDate: "2024-01-01",
    amortizationYears: 25,
    amortizationMonths: 0,
    paymentFrequency: "monthly",
    annualPrepaymentLimitPercent: "20",
    insuranceProvider: null,
    insurancePremium: null,
    insuranceAddedToPrincipal: null,
    isHighRatio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
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
    regularPaymentAmount: "2000.00",
    fixedRate: "5.490",
    lockedSpread: null,
    primeRate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makePayment(overrides: Partial<MortgagePayment> = {}): MortgagePayment {
  return {
    id: "payment-1",
    mortgageId: "mortgage-1",
    termId: "term-1",
    paymentDate: "2026-03-01",
    paymentPeriodLabel: "Mar-2026",
    regularPaymentAmount: "2000.00",
    prepaymentAmount: "0.00",
    paymentAmount: "2000.00",
    principalPaid: "300.00",
    interestPaid: "1700.00",
    remainingBalance: "399700.00",
    primeRate: null,
    effectiveRate: "5.490",
    triggerRateHit: 0,
    isSkipped: 0,
    skippedInterestAccrued: null,
    remainingAmortizationMonths: 299,
    createdAt: new Date(),
    ...overrides,
  };
}

// ── Repository stubs ───────────────────────────────────────────────────────────

class StubMortgagesRepo {
  private store = new Map<string, Mortgage>();
  /** Tracks calls to update() so tests can assert balance changes. */
  updates: { id: string; payload: Partial<Mortgage> }[] = [];

  set(m: Mortgage) {
    this.store.set(m.id, m);
  }

  async findById(id: string): Promise<Mortgage | undefined> {
    return this.store.get(id);
  }

  async update(id: string, payload: Partial<Mortgage>): Promise<Mortgage | undefined> {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...payload };
    this.store.set(id, updated);
    this.updates.push({ id, payload });
    return updated;
  }
}

class StubTermsRepo {
  private store = new Map<string, MortgageTerm>();

  set(t: MortgageTerm) {
    this.store.set(t.id, t);
  }

  async findById(id: string): Promise<MortgageTerm | undefined> {
    return this.store.get(id);
  }
}

class StubPaymentsRepo {
  payments: MortgagePayment[] = [];
  created: object[] = [];

  async findByTermId(_termId: string): Promise<MortgagePayment[]> {
    return this.payments;
  }

  async findByMortgageId(_mortgageId: string): Promise<MortgagePayment[]> {
    return this.payments;
  }

  async findById(_id: string): Promise<MortgagePayment | undefined> {
    return undefined;
  }

  async create(input: object): Promise<MortgagePayment> {
    const payment = { id: `payment-${Date.now()}`, createdAt: new Date(), ...input } as MortgagePayment;
    this.created.push(payment);
    return payment;
  }
}

// ── Service factory ────────────────────────────────────────────────────────────

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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MortgagePaymentService.skipPayment", () => {
  let mortgagesRepo: StubMortgagesRepo;
  let termsRepo: StubTermsRepo;
  let paymentsRepo: StubPaymentsRepo;
  let service: MortgagePaymentService;

  beforeEach(() => {
    mortgagesRepo = new StubMortgagesRepo();
    termsRepo = new StubTermsRepo();
    paymentsRepo = new StubPaymentsRepo();
    service = buildService(mortgagesRepo, termsRepo, paymentsRepo);
  });

  // ── Not found / authorization ──────────────────────────────────────────────

  it("returns undefined when the mortgage does not exist", async () => {
    // mortgage not seeded → findById returns undefined
    termsRepo.set(makeTerm());

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",
      "2026-08-01",
      2
    );

    assert.strictEqual(result, undefined);
  });

  it("returns undefined when the mortgage belongs to a different user", async () => {
    mortgagesRepo.set(makeMortgage({ userId: "other-user" }));
    termsRepo.set(makeTerm());

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",  // correct user, but mortgage is owned by "other-user"
      "2026-08-01",
      2
    );

    assert.strictEqual(result, undefined);
  });

  it("returns undefined when the term does not exist", async () => {
    mortgagesRepo.set(makeMortgage());
    // term not seeded

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",
      "2026-08-01",
      2
    );

    assert.strictEqual(result, undefined);
  });

  it("returns undefined when the term belongs to a different mortgage", async () => {
    mortgagesRepo.set(makeMortgage());
    termsRepo.set(makeTerm({ mortgageId: "other-mortgage" }));

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",
      "2026-08-01",
      2
    );

    assert.strictEqual(result, undefined);
  });

  // ── Skip limit enforcement ─────────────────────────────────────────────────

  it("throws when the yearly skip limit has already been reached", async () => {
    mortgagesRepo.set(makeMortgage());
    termsRepo.set(makeTerm());

    // Seed 2 skipped payments in the same year we are trying to skip
    paymentsRepo.payments = [
      makePayment({ id: "p1", paymentDate: "2026-03-01", isSkipped: 1 }),
      makePayment({ id: "p2", paymentDate: "2026-06-01", isSkipped: 1 }),
    ];

    await assert.rejects(
      () => service.skipPayment("mortgage-1", "term-1", "user-1", "2026-08-01", 2),
      (err: Error) => {
        assert.match(err.message, /maximum skipped payments/i);
        return true;
      }
    );
  });

  it("allows skipping when under the yearly limit", async () => {
    mortgagesRepo.set(makeMortgage());
    termsRepo.set(makeTerm());

    // Only 1 skip this year → limit is 2, so still allowed
    paymentsRepo.payments = [
      makePayment({ id: "p1", paymentDate: "2026-03-01", isSkipped: 1 }),
    ];

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",
      "2026-08-01",
      2
    );

    assert.ok(result !== undefined, "Expected a skipped payment record to be created");
  });

  // ── Created record fields ───────────────────────────────────────────────────

  it("creates a payment record with zero amounts and isSkipped=1", async () => {
    mortgagesRepo.set(makeMortgage());
    termsRepo.set(makeTerm());
    paymentsRepo.payments = [];

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",
      "2026-08-01",
      2
    );

    assert.ok(result, "Expected a result");
    assert.strictEqual(result.paymentAmount, "0.00");
    assert.strictEqual(result.principalPaid, "0.00");
    assert.strictEqual(result.interestPaid, "0.00");
    assert.strictEqual(result.isSkipped, 1);
  });

  it("creates a payment record with a positive skippedInterestAccrued", async () => {
    mortgagesRepo.set(makeMortgage({ currentBalance: "400000" }));
    termsRepo.set(makeTerm({ fixedRate: "5.490" }));
    paymentsRepo.payments = [];

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",
      "2026-08-01",
      2
    );

    assert.ok(result, "Expected a result");

    const interest = parseFloat(result.skippedInterestAccrued ?? "0");
    assert.ok(interest > 0, `Expected positive interest accrued, got ${interest}`);
  });

  it("sets remainingBalance higher than the current balance (negative amortization)", async () => {
    const currentBalance = 400000;
    mortgagesRepo.set(makeMortgage({ currentBalance: String(currentBalance) }));
    termsRepo.set(makeTerm({ fixedRate: "5.490" }));
    paymentsRepo.payments = [];

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",
      "2026-08-01",
      2
    );

    assert.ok(result, "Expected a result");

    const remaining = parseFloat(result.remainingBalance);
    assert.ok(
      remaining > currentBalance,
      `Expected balance to increase from ${currentBalance}, got ${remaining}`
    );
  });

  it("sets remainingAmortizationMonths higher than the starting months", async () => {
    const startingMonths = 300;
    mortgagesRepo.set(makeMortgage({ amortizationYears: 25, amortizationMonths: 0, currentBalance: "400000" }));
    termsRepo.set(makeTerm({ fixedRate: "5.490" }));
    paymentsRepo.payments = [];

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",
      "2026-08-01",
      2
    );

    assert.ok(result, "Expected a result");
    assert.ok(
      result.remainingAmortizationMonths > startingMonths,
      `Expected amortization to extend beyond ${startingMonths}, got ${result.remainingAmortizationMonths}`
    );
  });

  // ── mortgage.currentBalance is updated atomically ─────────────────────────

  it("updates mortgages.currentBalance to the post-skip balance so dashboards stay accurate", async () => {
    const initialBalance = 400000;
    mortgagesRepo.set(makeMortgage({ currentBalance: String(initialBalance) }));
    termsRepo.set(makeTerm({ fixedRate: "5.490" }));
    paymentsRepo.payments = [];

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",
      "2026-08-01",
      2
    );

    assert.ok(result, "Expected a payment result");

    // At least one update call must have targeted the mortgage's balance
    const balanceUpdate = mortgagesRepo.updates.find(
      (u) => u.id === "mortgage-1" && u.payload.currentBalance !== undefined
    );
    assert.ok(
      balanceUpdate,
      "Expected mortgages.update to be called with a currentBalance payload"
    );

    const updatedBalance = parseFloat(balanceUpdate!.payload.currentBalance as string);
    assert.ok(
      updatedBalance > initialBalance,
      `Expected updated balance (${updatedBalance}) to exceed initial balance (${initialBalance})`
    );

    // The payment's remainingBalance and the mortgage's new currentBalance must match
    assert.strictEqual(
      balanceUpdate!.payload.currentBalance,
      result.remainingBalance,
      "mortgages.currentBalance must equal the payment's remainingBalance"
    );
  });

  // ── paymentDate is stored ──────────────────────────────────────────────────

  it("stores the requested paymentDate on the created record", async () => {
    mortgagesRepo.set(makeMortgage());
    termsRepo.set(makeTerm());
    paymentsRepo.payments = [];

    // Use a date that is within the term range (2024-01-01 to 2029-01-01) and not in the future.
    // "today" from the perspective of Aug 14 2026 — pick a date well in the past.
    const paymentDate = "2025-06-15";

    const result = await service.skipPayment(
      "mortgage-1",
      "term-1",
      "user-1",
      paymentDate,
      2
    );

    assert.ok(result, "Expected a result");
    assert.strictEqual(result.paymentDate, paymentDate);
  });
});

// ── Pure utility tests: canSkipPayment & countSkippedPaymentsInYear ───────────

describe("payment-skipping utilities (server)", async () => {
  const { canSkipPayment, countSkippedPaymentsInYear } = await import(
    "@server-shared/calculations/payment-skipping"
  );

  describe("canSkipPayment", () => {
    it("returns true when skipped < limit", () => {
      assert.strictEqual(canSkipPayment(0, 2), true);
      assert.strictEqual(canSkipPayment(1, 2), true);
    });

    it("returns false when skipped >= limit", () => {
      assert.strictEqual(canSkipPayment(2, 2), false);
      assert.strictEqual(canSkipPayment(3, 2), false);
    });

    it("defaults limit to 2", () => {
      assert.strictEqual(canSkipPayment(1), true);
      assert.strictEqual(canSkipPayment(2), false);
    });
  });

  describe("countSkippedPaymentsInYear", () => {
    const year = 2026;

    it("counts only payments in the target year that are skipped", () => {
      const payments = [
        { paymentDate: "2026-01-15", isSkipped: 1 },
        { paymentDate: "2026-06-15", isSkipped: 1 },
        { paymentDate: "2025-12-15", isSkipped: 1 }, // different year
        { paymentDate: "2026-09-15", isSkipped: 0 }, // not skipped
      ];

      assert.strictEqual(countSkippedPaymentsInYear(payments, year), 2);
    });

    it("returns 0 when no payments are skipped in the target year", () => {
      const payments = [
        { paymentDate: "2026-01-15", isSkipped: 0 },
        { paymentDate: "2025-06-15", isSkipped: 1 },
      ];

      assert.strictEqual(countSkippedPaymentsInYear(payments, year), 0);
    });

    it("handles boolean isSkipped values", () => {
      const payments = [
        { paymentDate: "2026-03-01", isSkipped: true as unknown as number },
        { paymentDate: "2026-07-01", isSkipped: false as unknown as number },
      ];

      assert.strictEqual(countSkippedPaymentsInYear(payments, year), 1);
    });

    it("returns 0 for an empty array", () => {
      assert.strictEqual(countSkippedPaymentsInYear([], year), 0);
    });
  });
});
