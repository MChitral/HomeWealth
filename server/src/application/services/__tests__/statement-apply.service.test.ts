import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type {
  FacilitySnapshot,
  LenderProjectionLock,
  Mortgage,
  MortgagePayment,
  MortgageTerm,
  PrivilegeEvent,
  StagedImport,
} from "@shared/schema";
import type { HomelineMonthlyFacts, CostOfBorrowingFacts } from "@shared/statement-facts";
import { StatementApplyService } from "../statement-apply.service";
import { IngestRequestError } from "../statement-ingest.service";

const julyFacts: HomelineMonthlyFacts = {
  documentType: "homeline_monthly",
  statementPeriod: "2026-07",
  statementAsOf: "2026-07-31",
  paymentDate: "2026-07-02",
  paymentsReceived: "2500.69",
  mortgageOutstanding: "282105.53",
  helocDrawn: "0.00",
  availableCredit: "9989.35",
  planTotalLimit: "292094.88",
};

const julyDisclosure: CostOfBorrowingFacts = {
  documentType: "cost_of_borrowing",
  statementPeriod: "2026-07",
  isDoubleUpChange: true,
  interestToEndOfTerm: "32348.86",
  triggeringAnnualRate: "6.300",
  nextDueDate: "2026-08-02",
};

function junePayment(): MortgagePayment {
  return {
    id: "pay-june",
    mortgageId: "mortgage-1",
    termId: "term-1",
    paymentDate: "2026-06-02",
    paymentPeriodLabel: "2026-06",
    regularPaymentAmount: "1500.69",
    prepaymentAmount: "1000.00",
    paymentAmount: "2500.69",
    principalPaid: "1640.13",
    interestPaid: "860.56",
    remainingBalance: "283778.21",
    primeRate: "4.450",
    effectiveRate: "3.550",
    remainingAmortizationMonths: 276,
    calculationSource: "statement",
    isSkipped: 0,
    isMissed: 0,
    statementPeriod: "2026-06",
    createdAt: new Date(),
  } as MortgagePayment;
}

function createHarness() {
  const mortgage: Mortgage = {
    id: "mortgage-1",
    userId: "dev-user-001",
    currentBalance: "283778.21",
    originalAmount: "294399.00",
  } as Mortgage;
  const term: MortgageTerm = {
    id: "term-1",
    mortgageId: "mortgage-1",
    regularPaymentAmount: "1500.69",
    primeRate: "4.450",
    fixedRate: null,
    lockedSpread: "-0.900",
  } as MortgageTerm;
  const payments: MortgagePayment[] = [junePayment()];
  const staged: StagedImport[] = [];
  const facilities: FacilitySnapshot[] = [];
  const privileges: PrivilegeEvent[] = [];
  const locks: LenderProjectionLock[] = [];

  const apply = new StatementApplyService(
    {
      async getByIdForUser(id: string, userId: string) {
        return id === mortgage.id && userId === mortgage.userId ? mortgage : undefined;
      },
    } as never,
    {
      async listForMortgage() {
        return [term];
      },
    } as never,
    {
      async update(_id: string, payload: Partial<Mortgage>) {
        Object.assign(mortgage, payload);
        return mortgage;
      },
    } as never,
    {
      async findByMortgageId() {
        return [...payments].sort(
          (left, right) =>
            left.paymentDate.localeCompare(right.paymentDate) ||
            left.createdAt.getTime() - right.createdAt.getTime()
        );
      },
      async create(payload: MortgagePayment) {
        const created = { id: `pay-${payments.length + 1}`, createdAt: new Date(), ...payload };
        payments.push(created);
        return created;
      },
      async update(id: string, payload: Partial<MortgagePayment>) {
        const index = payments.findIndex((row) => row.id === id);
        payments[index] = { ...payments[index], ...payload };
        return payments[index];
      },
    } as never,
    {
      async findById(id: string) {
        return staged.find((row) => row.id === id);
      },
      async findActiveByKey(input: { status?: string; statementPeriod: string; documentType: string }) {
        return staged.find(
          (row) =>
            row.status === (input.status ?? "staged") &&
            row.statementPeriod === input.statementPeriod &&
            row.documentType === input.documentType
        );
      },
      async update(id: string, payload: Partial<StagedImport>) {
        const index = staged.findIndex((row) => row.id === id);
        staged[index] = { ...staged[index], ...payload };
        return staged[index];
      },
    } as never,
    {
      async findLatestActive() {
        return facilities.filter((row) => row.status === "active").at(-1);
      },
      async create(payload: FacilitySnapshot) {
        const created = { id: `fac-${facilities.length + 1}`, ...payload };
        facilities.push(created);
        return created;
      },
      async retractByStagedImportId(stagedImportId: string) {
        for (const row of facilities) {
          if (row.stagedImportId === stagedImportId) row.status = "retracted";
        }
      },
      async retractActiveByPeriod(mortgageId: string, statementPeriod: string) {
        for (const row of facilities) {
          if (
            row.mortgageId === mortgageId &&
            row.statementPeriod === statementPeriod &&
            row.status === "active"
          ) {
            row.status = "retracted";
          }
        }
      },
    } as never,
    {
      async findByMortgageId() {
        return privileges;
      },
      async create(payload: PrivilegeEvent) {
        const created = { id: `priv-${privileges.length + 1}`, ...payload };
        privileges.push(created);
        return created;
      },
      async deleteByStagedImportId(stagedImportId: string) {
        for (let i = privileges.length - 1; i >= 0; i -= 1) {
          if (privileges[i].stagedImportId === stagedImportId) privileges.splice(i, 1);
        }
      },
    } as never,
    {
      async findLatest() {
        return locks.at(-1);
      },
      async create(payload: LenderProjectionLock) {
        const created = { id: `lock-${locks.length + 1}`, ...payload };
        locks.push(created);
        return created;
      },
      async deleteByStagedImportId(stagedImportId: string) {
        for (let i = locks.length - 1; i >= 0; i -= 1) {
          if (locks[i].stagedImportId === stagedImportId) locks.splice(i, 1);
        }
      },
    } as never,
    async (_mortgageId, work) => work()
  );

  function addStaged(partial: Partial<StagedImport> & { facts: StagedImport["facts"] }) {
    const row = {
      id: partial.id ?? `staged-${staged.length + 1}`,
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      documentType: (partial.facts as { documentType: string }).documentType,
      statementPeriod: (partial.facts as { statementPeriod: string }).statementPeriod,
      status: "staged",
      contentHash: "a".repeat(64),
      templateId: "t",
      extractorVersion: "1",
      expiresAt: new Date("2027-08-16T00:00:00.000Z"),
      createdAt: new Date(),
      ...partial,
    } as StagedImport;
    staged.push(row);
    return row;
  }

  return { apply, mortgage, payments, staged, facilities, privileges, locks, addStaged };
}

describe("StatementApplyService (U4)", () => {
  it("confirms July 2026 Homeline without consuming lump-sum room", async () => {
    const { apply, mortgage, payments, facilities, addStaged } = createHarness();
    const staged = addStaged({ facts: julyFacts });

    const result = await apply.confirm({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      stagedId: staged.id,
    });

    const written = payments.find((row) => row.statementPeriod === "2026-07");
    assert.equal(result.status, "confirmed");
    assert.equal(written?.paymentAmount, "2500.69");
    assert.equal(written?.remainingBalance, "282105.53");
    assert.equal(written?.calculationSource, "statement");
    assert.equal(facilities[0]?.availableCredit, "9989.35");
    assert.equal(mortgage.currentBalance, "282105.53");
    const facts = await apply.getStatementFacts("mortgage-1", "dev-user-001");
    assert.equal(facts.privilege.lumpSumUsed, "0.00");
    assert.equal(facts.facility?.availableCredit, "9989.35");
  });

  it("tags a Double-Up from the July disclosure and keeps lump-sum used at 0", async () => {
    const { apply, addStaged } = createHarness();
    const homeline = addStaged({ facts: julyFacts });
    await apply.confirm({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      stagedId: homeline.id,
    });
    const disclosure = addStaged({ facts: julyDisclosure });
    await apply.confirm({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      stagedId: disclosure.id,
    });
    const facts = await apply.getStatementFacts("mortgage-1", "dev-user-001");
    assert.equal(facts.privilege.doubleUpCount, 1);
    assert.equal(facts.privilege.lumpSumUsed, "0.00");
  });

  it("blocks disclosure confirm when no Homeline payment exists for the period", async () => {
    const { apply, addStaged } = createHarness();
    const disclosure = addStaged({ facts: julyDisclosure });
    await assert.rejects(
      () =>
        apply.confirm({
          userId: "dev-user-001",
          mortgageId: "mortgage-1",
          stagedId: disclosure.id,
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 422
    );
  });

  it("blocks confirm when opening balance does not match the last confirmed closing", async () => {
    const { apply, addStaged } = createHarness();
    const staged = addStaged({
      facts: { ...julyFacts, openingBalance: "100.00" },
    });
    await assert.rejects(
      () =>
        apply.confirm({
          userId: "dev-user-001",
          mortgageId: "mortgage-1",
          stagedId: staged.id,
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 422
    );
  });

  it("supersedes the same period onto the same payment id", async () => {
    const { apply, payments, addStaged } = createHarness();
    const first = addStaged({ facts: julyFacts });
    await apply.confirm({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      stagedId: first.id,
    });
    const paymentId = payments.find((row) => row.statementPeriod === "2026-07")?.id;
    const second = addStaged({ facts: julyFacts });
    await assert.rejects(
      () =>
        apply.confirm({
          userId: "dev-user-001",
          mortgageId: "mortgage-1",
          stagedId: second.id,
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 409
    );
    await apply.confirm({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      stagedId: second.id,
      supersede: true,
    });
    assert.equal(payments.filter((row) => row.statementPeriod === "2026-07").length, 1);
    assert.equal(payments.find((row) => row.statementPeriod === "2026-07")?.id, paymentId);
  });

  it("returns 409 on a second confirm of the same staged id", async () => {
    const { apply, addStaged } = createHarness();
    const staged = addStaged({ facts: julyFacts });
    await apply.confirm({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      stagedId: staged.id,
    });
    await assert.rejects(
      () =>
        apply.confirm({
          userId: "dev-user-001",
          mortgageId: "mortgage-1",
          stagedId: staged.id,
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 409
    );
  });

  it("replaces an orphan July snapshot without requiring supersede", async () => {
    const { apply, facilities, addStaged } = createHarness();
    facilities.push({
      id: "fac-orphan",
      mortgageId: "mortgage-1",
      stagedImportId: "missing-staged",
      statementPeriod: "2026-07",
      statementAsOf: "2026-07-31",
      mortgageOutstanding: "282105.53",
      helocDrawn: "0.00",
      availableCredit: "9989.35",
      status: "active",
    } as FacilitySnapshot);
    const staged = addStaged({ facts: julyFacts });
    const result = await apply.confirm({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      stagedId: staged.id,
    });
    assert.equal(result.status, "confirmed");
    assert.equal(facilities.filter((row) => row.status === "active").length, 1);
    assert.equal(facilities.find((row) => row.status === "active")?.stagedImportId, staged.id);
  });

  it("does not rewind currentBalance when a later payment already exists", async () => {
    const { apply, mortgage, payments, addStaged } = createHarness();
    payments.push({
      ...junePayment(),
      id: "pay-aug",
      paymentDate: "2026-08-02",
      paymentPeriodLabel: "2026-08",
      remainingBalance: "280455.41",
      statementPeriod: "2026-08",
    });
    const staged = addStaged({ facts: julyFacts });
    await apply.confirm({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      stagedId: staged.id,
    });
    assert.equal(mortgage.currentBalance, "280455.41");
  });

  it("returns 410 for an expired staged row and writes nothing", async () => {
    const { apply, payments, addStaged } = createHarness();
    const staged = addStaged({
      facts: julyFacts,
      expiresAt: new Date("2026-08-01T00:00:00.000Z"),
    });
    await assert.rejects(
      () =>
        apply.confirm({
          userId: "dev-user-001",
          mortgageId: "mortgage-1",
          stagedId: staged.id,
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 410
    );
    assert.equal(payments.some((row) => row.statementPeriod === "2026-07"), false);
  });

});
