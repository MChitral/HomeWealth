import { desc, eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  lenderProjectionLocks,
  type InsertLenderProjectionLock,
  type LenderProjectionLock as LenderProjectionLockRecord,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class LenderProjectionLocksRepository {
  constructor(private readonly database: Database = db) {}

  async findLatest(mortgageId: string): Promise<LenderProjectionLockRecord | undefined> {
    const result = await this.database
      .select()
      .from(lenderProjectionLocks)
      .where(eq(lenderProjectionLocks.mortgageId, mortgageId))
      .orderBy(desc(lenderProjectionLocks.createdAt))
      .limit(1);
    return result[0];
  }

  async create(payload: InsertLenderProjectionLock): Promise<LenderProjectionLockRecord> {
    const [created] = await this.database.insert(lenderProjectionLocks).values(payload).returning();
    return created;
  }

  async deleteByStagedImportId(stagedImportId: string): Promise<void> {
    await this.database
      .delete(lenderProjectionLocks)
      .where(eq(lenderProjectionLocks.stagedImportId, stagedImportId));
  }
}
