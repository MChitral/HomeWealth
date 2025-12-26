import { eq, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  renewalHistory,
  type RenewalHistory as RenewalHistoryRecord,
  type InsertRenewalHistory,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class RenewalHistoryRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<RenewalHistoryRecord | undefined> {
    const result = await this.database
      .select()
      .from(renewalHistory)
      .where(eq(renewalHistory.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string): Promise<RenewalHistoryRecord[]> {
    return this.database
      .select()
      .from(renewalHistory)
      .where(eq(renewalHistory.mortgageId, mortgageId))
      .orderBy(desc(renewalHistory.renewalDate));
  }

  async findByTermId(termId: string): Promise<RenewalHistoryRecord[]> {
    return this.database
      .select()
      .from(renewalHistory)
      .where(eq(renewalHistory.termId, termId))
      .orderBy(desc(renewalHistory.renewalDate));
  }

  async create(payload: InsertRenewalHistory): Promise<RenewalHistoryRecord> {
    const [created] = await this.database
      .insert(renewalHistory)
      .values(payload)
      .returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertRenewalHistory>
  ): Promise<RenewalHistoryRecord | undefined> {
    const [updated] = await this.database
      .update(renewalHistory)
      .set(payload)
      .where(eq(renewalHistory.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database
      .delete(renewalHistory)
      .where(eq(renewalHistory.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async deleteByMortgageId(mortgageId: string): Promise<void> {
    await this.database
      .delete(renewalHistory)
      .where(eq(renewalHistory.mortgageId, mortgageId));
  }
}

