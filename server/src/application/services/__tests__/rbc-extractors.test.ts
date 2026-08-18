import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractRbcDocument } from "../statement-ingest/extract-rbc-document";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../../../");
const homelineJuly = join(
  repoRoot,
  "raw/mortage-docs/home-line/Homeline Plan Statement-4001 2026-07-31.pdf"
);
const disclosureAug = join(repoRoot, "raw/mortage-docs/Mortgage Disclosure-5001 2026-08-14.pdf");
const annual2025 = join(repoRoot, "raw/mortage-docs/Mortgage Statement-5001 2025-12-31.pdf");

function load(path: string): Uint8Array {
  return new Uint8Array(readFileSync(path));
}

describe("RBC extractors (U2)", () => {
  it("extracts July 2026 Homeline facility and payment totals", async (t) => {
    if (!existsSync(homelineJuly)) {
      t.skip("golden PDF is not in this checkout");
      return;
    }

    const result = await extractRbcDocument(load(homelineJuly));
    assert.equal(result.documentType, "homeline_monthly");
    assert.equal(result.facts.documentType, "homeline_monthly");
    if (result.facts.documentType !== "homeline_monthly") return;
    assert.equal(result.facts.availableCredit, "9989.35");
    assert.equal(result.facts.mortgageOutstanding, "282105.53");
    assert.equal(result.facts.paymentsReceived, "2500.69");
    assert.equal(result.facts.helocDrawn, "0.00");
    assert.equal(result.facts.statementPeriod, "2026-07");
  });

  it("extracts Aug 14 2026 disclosure Double-Up and COB lock fields", async (t) => {
    if (!existsSync(disclosureAug)) {
      t.skip("golden PDF is not in this checkout");
      return;
    }

    const result = await extractRbcDocument(load(disclosureAug));
    assert.equal(result.documentType, "cost_of_borrowing");
    if (result.facts.documentType !== "cost_of_borrowing") return;
    assert.equal(result.facts.isDoubleUpChange, true);
    assert.equal(result.facts.interestToEndOfTerm, "32348.86");
    assert.equal(result.facts.triggeringAnnualRate, "6.300");
    assert.equal(result.facts.nextDueDate, "2026-09-02");
    assert.equal(result.facts.statementPeriod, "2026-08");
  });

  it("extracts 2025 annual privilege and arrears fields", async (t) => {
    if (!existsSync(annual2025)) {
      t.skip("golden PDF is not in this checkout");
      return;
    }

    const result = await extractRbcDocument(load(annual2025));
    assert.equal(result.documentType, "annual_statement");
    if (result.facts.documentType !== "annual_statement") return;
    assert.equal(result.facts.interestAdjustmentDate, "2025-01-02");
    assert.equal(result.facts.lumpSumRoom, "29439.90");
    assert.equal(result.facts.skipAPaymentYtd, "0.00");
    assert.equal(result.facts.interestInArrears, "844.27");
    assert.equal(result.facts.statementPeriod, "2025-12");
  });

  it("fails closed on an empty text layer", async () => {
    await assert.rejects(
      () => extractRbcDocument(new Uint8Array(Buffer.from("%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"))),
      /text layer|fingerprint|empty/i
    );
  });

  it("fails closed on an unknown fingerprint", async () => {
    const unknown = Buffer.concat([
      Buffer.from("%PDF-1.4\n"),
      Buffer.from("1 0 obj<</Type/Catalog>>endobj\n"),
      Buffer.from("This is not an RBC mortgage form.\n"),
      Buffer.from("%%EOF\n"),
    ]);
    await assert.rejects(() => extractRbcDocument(new Uint8Array(unknown)), /fingerprint|unknown/i);
  });

  it("rejects a non-PDF buffer before parse", async () => {
    await assert.rejects(() => extractRbcDocument(new Uint8Array(Buffer.from("not a pdf"))), /%PDF/i);
  });

  it("rejects an oversized buffer before parse", async () => {
    const oversized = new Uint8Array(10 * 1024 * 1024 + 8);
    oversized.set(Buffer.from("%PDF-1.4"));
    await assert.rejects(() => extractRbcDocument(oversized), /10 MB|too large|oversize/i);
  });
});
