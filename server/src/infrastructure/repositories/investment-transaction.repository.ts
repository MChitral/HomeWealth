import { eq, and, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  investmentTransactions,
  type InvestmentTransaction as InvestmentTransactionRecord,
  type InsertInvestmentTransaction,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class InvestmentTransactionRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<InvestmentTransactionRecord | undefined> {
    const result = await this.database
      .select()
      .from(investmentTransactions)
      .where(eq(investmentTransactions.id, id));
    return result[0];
  }

  async findByInvestmentId(investmentId: string): Promise<InvestmentTransactionRecord[]> {
    return this.database
      .select()
      .from(investmentTransactions)
      .where(eq(investmentTransactions.investmentId, investmentId))
      .orderBy(desc(investmentTransactions.transactionDate));
  }

  async findByHelocTransactionId(
    helocTransactionId: string
  ): Promise<InvestmentTransactionRecord[]> {
    return this.database
      .select()
      .from(investmentTransactions)
      .where(eq(investmentTransactions.linkedHelocTransactionId, helocTransactionId))
      .orderBy(desc(investmentTransactions.transactionDate));
  }

  async create(payload: InsertInvestmentTransaction): Promise<InvestmentTransactionRecord> {
    const [created] = await this.database
      .insert(investmentTransactions)
      .values(payload)
      .returning();
    return created;
  }

  async delete(id: string, tx?: Database): Promise<boolean> {
    const db = tx || this.database;
    const result = await db.delete(investmentTransactions).where(eq(investmentTransactions.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }
}
