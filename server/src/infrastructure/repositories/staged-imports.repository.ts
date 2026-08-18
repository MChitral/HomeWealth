import { and, eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  stagedImports,
  type InsertStagedImport,
  type StagedImport as StagedImportRecord,
} from "@shared/schema";
import type { DocumentType, StagedImportStatus } from "@shared/mortgage-ledger";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class StagedImportsRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string, tx?: Database): Promise<StagedImportRecord | undefined> {
    const database = tx ?? this.database;
    const result = await database.select().from(stagedImports).where(eq(stagedImports.id, id));
    return result[0];
  }

  async findActiveByKey(
    input: {
      userId: string;
      mortgageId: string;
      documentType: DocumentType;
      statementPeriod: string;
      status?: StagedImportStatus;
    },
    tx?: Database
  ): Promise<StagedImportRecord | undefined> {
    const database = tx ?? this.database;
    const result = await database
      .select()
      .from(stagedImports)
      .where(
        and(
          eq(stagedImports.userId, input.userId),
          eq(stagedImports.mortgageId, input.mortgageId),
          eq(stagedImports.documentType, input.documentType),
          eq(stagedImports.statementPeriod, input.statementPeriod),
          eq(stagedImports.status, input.status ?? "staged")
        )
      );
    return result[0];
  }

  async create(payload: InsertStagedImport): Promise<StagedImportRecord> {
    const [created] = await this.database.insert(stagedImports).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<Omit<StagedImportRecord, "id" | "createdAt">>,
    tx?: Database
  ): Promise<StagedImportRecord | undefined> {
    const database = tx ?? this.database;
    const [updated] = await database
      .update(stagedImports)
      .set(payload)
      .where(eq(stagedImports.id, id))
      .returning();
    return updated;
  }
}
