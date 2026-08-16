import { createHash } from "node:crypto";
import type { MortgageService } from "./mortgage.service";
import type { StagedImportsRepository } from "@infrastructure/repositories/staged-imports.repository";
import type { MortgagePaymentsRepository } from "@infrastructure/repositories/mortgage-payments.repository";
import { extractRbcDocument } from "./statement-ingest/extract-rbc-document";
import { PdfExtractError } from "./statement-ingest/pdf-items";
import type { StatementFacts } from "@shared/statement-facts";
import type { StagedImport } from "@shared/schema";

export const STAGED_IMPORT_TTL_MS = 24 * 60 * 60 * 1000;

export class IngestRequestError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "IngestRequestError";
  }
}

export type StatementPreview = {
  stagedId: string;
  mortgageId: string;
  documentType: StagedImport["documentType"];
  statementPeriod: string;
  status: StagedImport["status"];
  facts: StatementFacts;
  suggestedPrivilege: { type: "double_up"; pending: true } | null;
  proofs: { canConfirm: boolean; reasons: string[] };
  confirmEnabled: boolean;
  expiresAt: string;
};

export function shouldMountStatementIngest(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (env.ENABLE_STATEMENT_INGEST === "true") return true;
  return env.NODE_ENV !== "production";
}

export function createIngestLogger(write: (message: string) => void = console.info) {
  return {
    event(fields: {
      stagedId?: string;
      mortgageId: string;
      userId: string;
      hash?: string;
      type?: string;
      status: string;
    }) {
      write(
        JSON.stringify({
          ingest: true,
          stagedId: fields.stagedId,
          mortgageId: fields.mortgageId,
          userId: fields.userId,
          hash: fields.hash,
          type: fields.type,
          status: fields.status,
        })
      );
    },
  };
}

function suggestedPrivilege(facts: StatementFacts): StatementPreview["suggestedPrivilege"] {
  if (facts.documentType === "cost_of_borrowing" && facts.isDoubleUpChange) {
    return { type: "double_up", pending: true };
  }
  if (facts.documentType === "homeline_monthly" && Number(facts.paymentsReceived) > 1500.69) {
    return { type: "double_up", pending: true };
  }
  return null;
}

function toPreview(row: StagedImport, facts: StatementFacts): StatementPreview {
  return {
    stagedId: row.id,
    mortgageId: row.mortgageId,
    documentType: row.documentType,
    statementPeriod: row.statementPeriod,
    status: row.status,
    facts,
    suggestedPrivilege: suggestedPrivilege(facts),
    proofs: { canConfirm: true, reasons: [] },
    confirmEnabled: row.status === "staged",
    expiresAt: row.expiresAt.toISOString(),
  };
}

function parseFacts(row: StagedImport): StatementFacts {
  return row.facts as StatementFacts;
}

export class StatementIngestService {
  constructor(
    private readonly mortgages: MortgageService,
    private readonly stagedImports: StagedImportsRepository,
    private readonly payments: MortgagePaymentsRepository,
    private readonly extract: typeof extractRbcDocument = extractRbcDocument,
    private readonly now: () => Date = () => new Date(),
    private readonly logger = createIngestLogger()
  ) {}

  async upload(input: {
    userId: string;
    mortgageId: string;
    bytes: Uint8Array;
  }): Promise<StatementPreview> {
    const mortgage = await this.mortgages.getByIdForUser(input.mortgageId, input.userId);
    if (!mortgage) {
      throw new IngestRequestError(404, "Mortgage not found");
    }

    const contentHash = createHash("sha256").update(input.bytes).digest("hex");
    let extracted;
    try {
      extracted = await this.extract(input.bytes);
    } catch (error) {
      this.logger.event({
        mortgageId: input.mortgageId,
        userId: input.userId,
        hash: contentHash,
        status: "failed",
      });
      if (error instanceof PdfExtractError) {
        throw new IngestRequestError(422, error.message);
      }
      throw error;
    }

    const existing = await this.stagedImports.findActiveByKey({
      userId: input.userId,
      mortgageId: input.mortgageId,
      documentType: extracted.documentType,
      statementPeriod: extracted.facts.statementPeriod,
      status: "staged",
    });
    if (existing && existing.expiresAt > this.now()) {
      this.logger.event({
        stagedId: existing.id,
        mortgageId: input.mortgageId,
        userId: input.userId,
        hash: contentHash,
        type: extracted.documentType,
        status: "staged",
      });
      return toPreview(existing, parseFacts(existing));
    }

    const created = await this.stagedImports.create({
      userId: input.userId,
      mortgageId: input.mortgageId,
      documentType: extracted.documentType,
      statementPeriod: extracted.facts.statementPeriod,
      status: "staged",
      contentHash,
      templateId: extracted.templateId,
      extractorVersion: extracted.extractorVersion,
      facts: extracted.facts,
      expiresAt: new Date(this.now().getTime() + STAGED_IMPORT_TTL_MS),
    });

    this.logger.event({
      stagedId: created.id,
      mortgageId: input.mortgageId,
      userId: input.userId,
      hash: contentHash,
      type: extracted.documentType,
      status: "staged",
    });

    return toPreview(created, extracted.facts);
  }

  async getPreview(input: {
    userId: string;
    mortgageId: string;
    stagedId: string;
  }): Promise<StatementPreview> {
    const row = await this.requireOwnedStaged(input);
    this.assertFresh(row);
    return toPreview(row, parseFacts(row));
  }

  async reject(input: {
    userId: string;
    mortgageId: string;
    stagedId: string;
  }): Promise<{ status: "rejected" }> {
    const row = await this.requireOwnedStaged(input);
    this.assertFresh(row);
    if (row.status !== "staged") {
      throw new IngestRequestError(409, "Staged import is no longer pending");
    }
    await this.stagedImports.update(row.id, { status: "rejected" });
    this.logger.event({
      stagedId: row.id,
      mortgageId: row.mortgageId,
      userId: input.userId,
      hash: row.contentHash,
      type: row.documentType,
      status: "rejected",
    });
    return { status: "rejected" };
  }

  async confirm(input: {
    userId: string;
    mortgageId: string;
    stagedId: string;
  }): Promise<never> {
    const row = await this.requireOwnedStaged(input);
    this.assertFresh(row);
    throw new IngestRequestError(409, "Confirm apply is not available until statement apply ships");
  }

  async countPayments(mortgageId: string): Promise<number> {
    return (await this.payments.findByMortgageId(mortgageId)).length;
  }

  private async requireOwnedStaged(input: {
    userId: string;
    mortgageId: string;
    stagedId: string;
  }): Promise<StagedImport> {
    const mortgage = await this.mortgages.getByIdForUser(input.mortgageId, input.userId);
    if (!mortgage) {
      throw new IngestRequestError(404, "Mortgage not found");
    }
    const row = await this.stagedImports.findById(input.stagedId);
    if (!row || row.mortgageId !== input.mortgageId || row.userId !== input.userId) {
      throw new IngestRequestError(404, "Staged import not found");
    }
    return row;
  }

  private assertFresh(row: StagedImport): void {
    if (row.expiresAt <= this.now()) {
      throw new IngestRequestError(410, "Staged import has expired");
    }
  }
}
