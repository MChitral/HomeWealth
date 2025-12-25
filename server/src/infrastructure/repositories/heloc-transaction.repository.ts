import { eq, and, desc, gte, lte } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  helocTransactions,
  type HelocTransaction as HelocTransactionRecord,
  type InsertHelocTransaction,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class HelocTransactionRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<HelocTransactionRecord | undefined> {
    const result = await this.database
      .select()
      .from(helocTransactions)
      .where(eq(helocTransactions.id, id));
    return result[0];
  }

  async findByAccountId(accountId: string): Promise<HelocTransactionRecord[]> {
    return this.database
      .select()
      .from(helocTransactions)
      .where(eq(helocTransactions.helocAccountId, accountId))
      .orderBy(desc(helocTransactions.transactionDate), desc(helocTransactions.createdAt));
  }

  async findByAccountIdAndDateRange(
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HelocTransactionRecord[]> {
    return this.database
      .select()
      .from(helocTransactions)
      .where(
        and(
          eq(helocTransactions.helocAccountId, accountId),
          gte(helocTransactions.transactionDate, startDate.toISOString().split("T")[0]),
          lte(helocTransactions.transactionDate, endDate.toISOString().split("T")[0])
        )
      )
      .orderBy(desc(helocTransactions.transactionDate), desc(helocTransactions.createdAt));
  }

  async getLatestTransaction(accountId: string): Promise<HelocTransactionRecord | undefined> {
    const result = await this.database
      .select()
      .from(helocTransactions)
      .where(eq(helocTransactions.helocAccountId, accountId))
      .orderBy(desc(helocTransactions.transactionDate), desc(helocTransactions.createdAt))
      .limit(1);
    return result[0];
  }

  async create(payload: InsertHelocTransaction): Promise<HelocTransactionRecord> {
    const [created] = await this.database.insert(helocTransactions).values(payload).returning();
    return created;
  }

  async delete(id: string, tx?: Database): Promise<boolean> {
    const db = tx || this.database;
    const result = await db.delete(helocTransactions).where(eq(helocTransactions.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }
}

