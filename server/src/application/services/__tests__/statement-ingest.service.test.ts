import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Mortgage, MortgagePayment, StagedImport } from "@shared/schema";
import type { HomelineMonthlyFacts } from "@shared/statement-facts";
import {
  IngestRequestError,
  StatementIngestService,
  createIngestLogger,
  shouldMountStatementIngest,
} from "../statement-ingest.service";

const julyFacts: HomelineMonthlyFacts = {
  documentType: "homeline_monthly",
  statementPeriod: "2026-07",
  statementAsOf: "2026-07-31",
  paymentsReceived: "2500.69",
  mortgageOutstanding: "282105.53",
  helocDrawn: "0.00",
  availableCredit: "9989.35",
};

function mortgage(userId = "dev-user-001"): Mortgage {
  return {
    id: "mortgage-1",
    userId,
    currentBalance: "282105.53",
  } as Mortgage;
}

function createService(options?: {
  userId?: string;
  now?: Date;
  extract?: () => Promise<{
    documentType: "homeline_monthly";
    templateId: string;
    extractorVersion: string;
    facts: HomelineMonthlyFacts;
  }>;
}) {
  const rows: StagedImport[] = [];
  const payments: MortgagePayment[] = [{ id: "p1", mortgageId: "mortgage-1" } as MortgagePayment];
  const logs: string[] = [];
  const now = options?.now ?? new Date("2026-08-15T12:00:00.000Z");

  const mortgages = {
    async getByIdForUser(id: string, userId: string) {
      const row = mortgage(options?.userId ?? "dev-user-001");
      return id === row.id && userId === row.userId ? row : undefined;
    },
  };

  const stagedImports = {
    async findById(id: string) {
      return rows.find((row) => row.id === id);
    },
    async findActiveByKey(input: { statementPeriod: string; status?: string }) {
      return rows.find(
        (row) => row.statementPeriod === input.statementPeriod && row.status === (input.status ?? "staged")
      );
    },
    async create(payload: Omit<StagedImport, "id" | "createdAt">) {
      const created = {
        id: `staged-${rows.length + 1}`,
        createdAt: now,
        confirmedAt: null,
        proofResults: null,
        paymentId: null,
        supersededById: null,
        ...payload,
      } as StagedImport;
      rows.push(created);
      return created;
    },
    async update(id: string, payload: Partial<StagedImport>) {
      const index = rows.findIndex((row) => row.id === id);
      rows[index] = { ...rows[index], ...payload };
      return rows[index];
    },
  };

  const paymentRepo = {
    async findByMortgageId(mortgageId: string) {
      return payments.filter((payment) => payment.mortgageId === mortgageId);
    },
  };

  const extract =
    options?.extract ??
    (async () => ({
      documentType: "homeline_monthly" as const,
      templateId: "rbc-homeline-0619",
      extractorVersion: "1",
      facts: julyFacts,
    }));

  const service = new StatementIngestService(
    mortgages as never,
    stagedImports as never,
    paymentRepo as never,
    extract,
    () => now,
    createIngestLogger((message) => logs.push(message))
  );

  return { service, rows, payments, logs };
}

describe("StatementIngestService (U3)", () => {
  it("stages a Homeline preview without changing the payment ledger", async () => {
    const { service, rows, payments } = createService();
    const before = payments.length;
    const preview = await service.upload({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      bytes: new Uint8Array([1, 2, 3]),
    });

    assert.equal(preview.statementPeriod, "2026-07");
    assert.equal(preview.facts.documentType, "homeline_monthly");
    if (preview.facts.documentType === "homeline_monthly") {
      assert.equal(preview.facts.availableCredit, "9989.35");
    }
    assert.equal(preview.status, "staged");
    assert.equal(rows.length, 1);
    assert.equal(payments.length, before);
    assert.equal(await service.countPayments("mortgage-1"), before);
  });

  it("returns the existing staged row for a second upload of the same period", async () => {
    const { service } = createService();
    const first = await service.upload({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      bytes: new Uint8Array([1]),
    });
    const second = await service.upload({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      bytes: new Uint8Array([2]),
    });
    assert.equal(second.stagedId, first.stagedId);
  });

  it("returns 404 and writes no staged row when the caller does not own the mortgage", async () => {
    const { service, rows } = createService();
    await assert.rejects(
      () =>
        service.upload({
          userId: "other-user",
          mortgageId: "mortgage-1",
          bytes: new Uint8Array([1]),
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 404
    );
    assert.equal(rows.length, 0);
  });

  it("maps extractor failures to 422 without staging", async () => {
    const { service, rows } = createService({
      extract: async () => {
        const { PdfExtractError } = await import("../statement-ingest/pdf-items");
        throw new PdfExtractError("unknown fingerprint");
      },
    });
    await assert.rejects(
      () =>
        service.upload({
          userId: "dev-user-001",
          mortgageId: "mortgage-1",
          bytes: new Uint8Array([1]),
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 422
    );
    assert.equal(rows.length, 0);
  });

  it("returns 410 for GET, reject, and confirm after expiry", async () => {
    const now = new Date("2026-08-15T12:00:00.000Z");
    const { service, rows } = createService({ now });
    const preview = await service.upload({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      bytes: new Uint8Array([1]),
    });
    rows[0].expiresAt = new Date("2026-08-14T12:00:00.000Z");

    await assert.rejects(
      () =>
        service.getPreview({
          userId: "dev-user-001",
          mortgageId: "mortgage-1",
          stagedId: preview.stagedId,
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 410
    );
    await assert.rejects(
      () =>
        service.reject({
          userId: "dev-user-001",
          mortgageId: "mortgage-1",
          stagedId: preview.stagedId,
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 410
    );
    await assert.rejects(
      () =>
        service.confirm({
          userId: "dev-user-001",
          mortgageId: "mortgage-1",
          stagedId: preview.stagedId,
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 410
    );
  });

  it("returns 404 when the staged id belongs to another mortgage", async () => {
    const { service } = createService();
    const preview = await service.upload({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      bytes: new Uint8Array([1]),
    });
    await assert.rejects(
      () =>
        service.getPreview({
          userId: "dev-user-001",
          mortgageId: "other-mortgage",
          stagedId: preview.stagedId,
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 404
    );
  });

  it("does not mount ingest routes in production without the env gate", () => {
    assert.equal(shouldMountStatementIngest({ NODE_ENV: "production" }), false);
    assert.equal(
      shouldMountStatementIngest({ NODE_ENV: "production", ENABLE_STATEMENT_INGEST: "true" }),
      true
    );
    assert.equal(shouldMountStatementIngest({ NODE_ENV: "development" }), true);
  });

  it("logs ids and hash but never a filename or buffer", async () => {
    const { service, logs } = createService();
    await service.upload({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      bytes: new Uint8Array([1, 2, 3]),
    });
    assert.match(logs[0], /"hash":/);
    assert.doesNotMatch(logs[0], /"filename"|Homeline Plan|\.pdf|"buffer"/i);
  });

  it("keeps confirm at 409 until apply ships", async () => {
    const { service } = createService();
    const preview = await service.upload({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      bytes: new Uint8Array([1]),
    });
    await assert.rejects(
      () =>
        service.confirm({
          userId: "dev-user-001",
          mortgageId: "mortgage-1",
          stagedId: preview.stagedId,
        }),
      (error: unknown) => error instanceof IngestRequestError && error.status === 409
    );
  });
});
