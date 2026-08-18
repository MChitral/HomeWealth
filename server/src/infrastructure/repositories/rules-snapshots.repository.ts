import { desc, eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  rulesSnapshots,
  type InsertRulesSnapshot,
  type RulesSnapshot as RulesSnapshotRecord,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class RulesSnapshotsRepository {
  constructor(private readonly database: Database = db) {}

  async findLatest(mortgageId: string): Promise<RulesSnapshotRecord | undefined> {
    const result = await this.database
      .select()
      .from(rulesSnapshots)
      .where(eq(rulesSnapshots.mortgageId, mortgageId))
      .orderBy(desc(rulesSnapshots.statementAsOf))
      .limit(1);
    return result[0];
  }

  async create(payload: InsertRulesSnapshot): Promise<RulesSnapshotRecord> {
    const [created] = await this.database.insert(rulesSnapshots).values(payload).returning();
    return created;
  }
}
