import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  mortgageTerms,
  type MortgageTerm as MortgageTermRecord,
  type InsertMortgageTerm,
  type UpdateMortgageTerm,
} from "@shared/schema";

export class MortgageTermsRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<MortgageTermRecord | undefined> {
    const result = await this.database.select().from(mortgageTerms).where(eq(mortgageTerms.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string): Promise<MortgageTermRecord[]> {
    return this.database
      .select()
      .from(mortgageTerms)
      .where(eq(mortgageTerms.mortgageId, mortgageId));
  }

  async create(payload: InsertMortgageTerm): Promise<MortgageTermRecord> {
    const [created] = await this.database.insert(mortgageTerms).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<UpdateMortgageTerm>,
  ): Promise<MortgageTermRecord | undefined> {
    const [updated] = await this.database
      .update(mortgageTerms)
      .set(payload)
      .where(eq(mortgageTerms.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database.delete(mortgageTerms).where(eq(mortgageTerms.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async deleteByMortgageId(mortgageId: string): Promise<void> {
    await this.database.delete(mortgageTerms).where(eq(mortgageTerms.mortgageId, mortgageId));
  }
}

