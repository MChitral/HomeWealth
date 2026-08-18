import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getTableColumns, getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import {
  DOCUMENT_TYPES,
  PRIVILEGE_TYPES,
  STAGED_IMPORT_STATUSES,
} from "@shared/mortgage-ledger";
import {
  facilitySnapshots,
  insertMortgagePaymentSchema,
  insertPrivilegeEventSchema,
  insertStagedImportSchema,
  lenderProjectionLocks,
  privilegeEvents,
  rulesSnapshots,
  stagedImports,
} from "@shared/schema";
import { StagedImportsRepository } from "../staged-imports.repository";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../../../");
const migrationPath = join(repoRoot, "migrations/0001_homeline_statement_ingest.sql");
const journalPath = join(repoRoot, "migrations/meta/_journal.json");

describe("statement ingest schema (U1)", () => {
  it("accepts a staged Homeline monthly with period 2026-07", () => {
    const parsed = insertStagedImportSchema.parse({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      documentType: "homeline_monthly",
      statementPeriod: "2026-07",
      status: "staged",
      contentHash: "a".repeat(64),
      templateId: "rbc-homeline-0619",
      extractorVersion: "1",
      facts: { documentType: "homeline_monthly" },
      expiresAt: new Date("2026-08-16T00:00:00.000Z"),
    });

    assert.equal(parsed.documentType, "homeline_monthly");
    assert.equal(parsed.statementPeriod, "2026-07");
    assert.equal(parsed.status, "staged");
  });

  it("accepts a double_up privilege event that does not consume lump-sum", () => {
    const parsed = insertPrivilegeEventSchema.parse({
      mortgageId: "mortgage-1",
      stagedImportId: "staged-1",
      privilegeType: "double_up",
      eventDate: "2026-07-02",
      amount: 1000,
      consumesLumpSumLimit: 0,
    });

    assert.equal(parsed.privilegeType, "double_up");
    assert.equal(parsed.consumesLumpSumLimit, 0);
    assert.equal(parsed.amount, "1000.00");
  });

  it("rejects isMissed=1 together with isSkipped=1", () => {
    assert.throws(
      () =>
        insertMortgagePaymentSchema.parse({
          mortgageId: "mortgage-1",
          termId: "term-1",
          paymentDate: "2025-12-02",
          regularPaymentAmount: 0,
          prepaymentAmount: 0,
          paymentAmount: 0,
          principalPaid: 0,
          interestPaid: 0,
          remainingBalance: 282105.53,
          effectiveRate: 3.55,
          remainingAmortizationMonths: 300,
          isMissed: 1,
          isSkipped: 1,
          statementPeriod: "2025-12",
        }),
      /missed and skipped/i
    );
  });

  it("defines a unique active confirmed import key", () => {
    const config = getTableConfig(stagedImports);
    const unique = config.indexes.find(
      (index) => index.config.name === "UQ_staged_imports_active_confirmed"
    );

    assert.ok(unique, "expected UQ_staged_imports_active_confirmed");
    assert.equal(unique?.config.unique, true);
  });

  it("stores no PDF byte column on ingest tables", () => {
    const tables = [
      stagedImports,
      privilegeEvents,
      facilitySnapshots,
      lenderProjectionLocks,
      rulesSnapshots,
    ];

    for (const table of tables) {
      const columns = Object.keys(getTableColumns(table));
      assert.equal(
        columns.some((name) => /blob|pdf|bytes|fileData|rawPdf/i.test(name)),
        false,
        `${getTableName(table)} must not store PDF bytes`
      );
    }
  });

  it("adds only new ingest objects in 0001 and journals them after 0000", () => {
    const sql = readFileSync(migrationPath, "utf8");
    const journal = JSON.parse(readFileSync(journalPath, "utf8")) as {
      entries: Array<{ tag: string }>;
    };

    assert.match(sql, /CREATE TABLE "staged_imports"/);
    assert.match(sql, /CREATE TABLE "privilege_events"/);
    assert.match(sql, /CREATE TABLE "facility_snapshots"/);
    assert.match(sql, /CREATE TABLE "lender_projection_locks"/);
    assert.match(sql, /CREATE TABLE "rules_snapshots"/);
    assert.match(sql, /ADD COLUMN "is_missed"/);
    assert.match(sql, /ADD COLUMN "statement_period"/);
    assert.doesNotMatch(sql, /bytea/i);
    assert.doesNotMatch(sql, /DROP TABLE "mortgages"/);
    assert.equal(journal.entries[0]?.tag, "0000_abandoned_norrin_radd");
    assert.equal(journal.entries[1]?.tag, "0001_homeline_statement_ingest");
  });

  it("inserts and reads a staged import through the repository", async () => {
    const rows: Array<Record<string, unknown>> = [];
    const database = {
      insert() {
        return {
          values(values: Record<string, unknown>) {
            return {
              async returning() {
                const created = { id: "staged-1", ...values };
                rows.push(created);
                return [created];
              },
            };
          },
        };
      },
      select() {
        return {
          from() {
            return {
              where() {
                return Promise.resolve(rows);
              },
            };
          },
        };
      },
    };

    const repo = new StagedImportsRepository(database as never);
    const created = await repo.create({
      userId: "dev-user-001",
      mortgageId: "mortgage-1",
      documentType: "homeline_monthly",
      statementPeriod: "2026-07",
      status: "staged",
      contentHash: "b".repeat(64),
      templateId: "rbc-homeline-0619",
      extractorVersion: "1",
      facts: { documentType: "homeline_monthly" },
      expiresAt: new Date("2026-08-16T00:00:00.000Z"),
    });
    const found = await repo.findById(created.id);

    assert.equal(created.statementPeriod, "2026-07");
    assert.equal(found?.id, "staged-1");
  });

  it("exports the document and privilege enums used by later units", () => {
    assert.deepEqual(DOCUMENT_TYPES, [
      "homeline_monthly",
      "cost_of_borrowing",
      "annual_statement",
    ]);
    assert.ok(PRIVILEGE_TYPES.includes("double_up"));
    assert.ok(STAGED_IMPORT_STATUSES.includes("staged"));
  });
});
