import { eq, and } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  helocAccounts,
  type HelocAccount as HelocAccountRecord,
  type InsertHelocAccount,
  type UpdateHelocAccount,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class HelocAccountRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<HelocAccountRecord | undefined> {
    const result = await this.database.select().from(helocAccounts).where(eq(helocAccounts.id, id));
    return result[0];
  }

  async findByUserId(userId: string): Promise<HelocAccountRecord[]> {
    return this.database.select().from(helocAccounts).where(eq(helocAccounts.userId, userId));
  }

  async findByMortgageId(mortgageId: string): Promise<HelocAccountRecord[]> {
    return this.database
      .select()
      .from(helocAccounts)
      .where(eq(helocAccounts.mortgageId, mortgageId));
  }

  async findAll(): Promise<HelocAccountRecord[]> {
    return this.database.select().from(helocAccounts);
  }

  async create(payload: InsertHelocAccount): Promise<HelocAccountRecord> {
    const [created] = await this.database.insert(helocAccounts).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<UpdateHelocAccount>
  ): Promise<HelocAccountRecord | undefined> {
    const [updated] = await this.database
      .update(helocAccounts)
      .set(payload)
      .where(eq(helocAccounts.id, id))
      .returning();

    return updated;
  }

  async delete(id: string, tx?: Database): Promise<boolean> {
    const db = tx || this.database;
    const result = await db.delete(helocAccounts).where(eq(helocAccounts.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async findByUserIdAndMortgageId(
    userId: string,
    mortgageId: string | null
  ): Promise<HelocAccountRecord[]> {
    if (mortgageId) {
      return this.database
        .select()
        .from(helocAccounts)
        .where(and(eq(helocAccounts.userId, userId), eq(helocAccounts.mortgageId, mortgageId)));
    }
    return this.findByUserId(userId);
  }
}

