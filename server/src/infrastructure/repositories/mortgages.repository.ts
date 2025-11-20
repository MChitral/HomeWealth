import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  mortgages,
  type Mortgage as MortgageRecord,
  type InsertMortgage,
  type UpdateMortgage,
} from "@shared/schema";

export class MortgagesRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<MortgageRecord | undefined> {
    const result = await this.database.select().from(mortgages).where(eq(mortgages.id, id));
    return result[0];
  }

  async findByUserId(userId: string): Promise<MortgageRecord[]> {
    return this.database.select().from(mortgages).where(eq(mortgages.userId, userId));
  }

  async create(payload: InsertMortgage): Promise<MortgageRecord> {
    const [created] = await this.database.insert(mortgages).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<UpdateMortgage>,
  ): Promise<MortgageRecord | undefined> {
    const [updated] = await this.database
      .update(mortgages)
      .set(payload)
      .where(eq(mortgages.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database.delete(mortgages).where(eq(mortgages.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }
}

