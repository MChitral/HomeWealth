import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  mortgages,
  type Mortgage as MortgageRecord,
  type InsertMortgage,
  type UpdateMortgage,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class MortgagesRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<MortgageRecord | undefined> {
    const result = await this.database.select().from(mortgages).where(eq(mortgages.id, id));
    return result[0];
  }

  async findByUserId(userId: string): Promise<MortgageRecord[]> {
    return this.database.select().from(mortgages).where(eq(mortgages.userId, userId));
  }

  async findAll(): Promise<MortgageRecord[]> {
    return this.database.select().from(mortgages);
  }

  async create(payload: InsertMortgage): Promise<MortgageRecord> {
    const [created] = await this.database.insert(mortgages).values(payload).returning();
    return created;
  }

  async update(id: string, payload: Partial<UpdateMortgage>): Promise<MortgageRecord | undefined> {
    const [updated] = await this.database
      .update(mortgages)
      .set(payload)
      .where(eq(mortgages.id, id))
      .returning();

    return updated;
  }

  async delete(id: string, tx?: Database): Promise<boolean> {
    const db = tx || this.database;
    const result = await db.delete(mortgages).where(eq(mortgages.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }
}
