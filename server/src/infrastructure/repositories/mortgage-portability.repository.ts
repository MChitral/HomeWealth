import { eq, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  mortgagePortability,
  type MortgagePortability as MortgagePortabilityRecord,
  type InsertMortgagePortability,
} from "@shared/schema";

export class MortgagePortabilityRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<MortgagePortabilityRecord | undefined> {
    const result = await this.database
      .select()
      .from(mortgagePortability)
      .where(eq(mortgagePortability.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string): Promise<MortgagePortabilityRecord[]> {
    return this.database
      .select()
      .from(mortgagePortability)
      .where(eq(mortgagePortability.mortgageId, mortgageId))
      .orderBy(desc(mortgagePortability.portDate));
  }

  async findByNewMortgageId(newMortgageId: string): Promise<MortgagePortabilityRecord | undefined> {
    const result = await this.database
      .select()
      .from(mortgagePortability)
      .where(eq(mortgagePortability.newMortgageId, newMortgageId));
    return result[0];
  }

  async create(payload: InsertMortgagePortability): Promise<MortgagePortabilityRecord> {
    const [created] = await this.database.insert(mortgagePortability).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertMortgagePortability>
  ): Promise<MortgagePortabilityRecord | undefined> {
    const [updated] = await this.database
      .update(mortgagePortability)
      .set(payload)
      .where(eq(mortgagePortability.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database
      .delete(mortgagePortability)
      .where(eq(mortgagePortability.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async deleteByMortgageId(mortgageId: string): Promise<void> {
    await this.database
      .delete(mortgagePortability)
      .where(eq(mortgagePortability.mortgageId, mortgageId));
  }
}

