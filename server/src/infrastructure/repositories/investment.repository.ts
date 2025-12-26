import { eq, and, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  investments,
  type Investment as InvestmentRecord,
  type InsertInvestment,
  type UpdateInvestment,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class InvestmentRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<InvestmentRecord | undefined> {
    const result = await this.database.select().from(investments).where(eq(investments.id, id));
    return result[0];
  }

  async findByUserId(userId: string): Promise<InvestmentRecord[]> {
    return this.database
      .select()
      .from(investments)
      .where(eq(investments.userId, userId))
      .orderBy(desc(investments.createdAt));
  }

  async findByUserIdAndStatus(
    userId: string,
    status: "active" | "sold" | "closed"
  ): Promise<InvestmentRecord[]> {
    return this.database
      .select()
      .from(investments)
      .where(and(eq(investments.userId, userId), eq(investments.investmentStatus, status)))
      .orderBy(desc(investments.createdAt));
  }

  async findAll(): Promise<InvestmentRecord[]> {
    return this.database.select().from(investments);
  }

  async create(payload: InsertInvestment): Promise<InvestmentRecord> {
    const [created] = await this.database.insert(investments).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<UpdateInvestment>
  ): Promise<InvestmentRecord | undefined> {
    const [updated] = await this.database
      .update(investments)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(investments.id, id))
      .returning();

    return updated;
  }

  async delete(id: string, tx?: Database): Promise<boolean> {
    const db = tx || this.database;
    const result = await db.delete(investments).where(eq(investments.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }
}
