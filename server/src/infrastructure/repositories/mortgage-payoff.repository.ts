import { eq, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  mortgagePayoff,
  type MortgagePayoff as MortgagePayoffRecord,
  type InsertMortgagePayoff,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class MortgagePayoffRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<MortgagePayoffRecord | undefined> {
    const result = await this.database
      .select()
      .from(mortgagePayoff)
      .where(eq(mortgagePayoff.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string): Promise<MortgagePayoffRecord[]> {
    return this.database
      .select()
      .from(mortgagePayoff)
      .where(eq(mortgagePayoff.mortgageId, mortgageId))
      .orderBy(desc(mortgagePayoff.payoffDate));
  }

  async create(payload: InsertMortgagePayoff, tx?: Database): Promise<MortgagePayoffRecord> {
    const db = tx || this.database;
    const [created] = await db.insert(mortgagePayoff).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertMortgagePayoff>
  ): Promise<MortgagePayoffRecord | undefined> {
    const [updated] = await this.database
      .update(mortgagePayoff)
      .set(payload)
      .where(eq(mortgagePayoff.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database.delete(mortgagePayoff).where(eq(mortgagePayoff.id, id));
    return result.rowCount !== undefined ? result.rowCount > 0 : false;
  }
}
