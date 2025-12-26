import { eq, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  renewalNegotiations,
  type RenewalNegotiation as RenewalNegotiationRecord,
  type InsertRenewalNegotiation,
} from "@shared/schema";

export class RenewalNegotiationsRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<RenewalNegotiationRecord | undefined> {
    const result = await this.database
      .select()
      .from(renewalNegotiations)
      .where(eq(renewalNegotiations.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string): Promise<RenewalNegotiationRecord[]> {
    return this.database
      .select()
      .from(renewalNegotiations)
      .where(eq(renewalNegotiations.mortgageId, mortgageId))
      .orderBy(desc(renewalNegotiations.negotiationDate));
  }

  async findByTermId(termId: string): Promise<RenewalNegotiationRecord[]> {
    return this.database
      .select()
      .from(renewalNegotiations)
      .where(eq(renewalNegotiations.termId, termId))
      .orderBy(desc(renewalNegotiations.negotiationDate));
  }

  async create(payload: InsertRenewalNegotiation): Promise<RenewalNegotiationRecord> {
    const [created] = await this.database.insert(renewalNegotiations).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertRenewalNegotiation>
  ): Promise<RenewalNegotiationRecord | undefined> {
    const [updated] = await this.database
      .update(renewalNegotiations)
      .set(payload)
      .where(eq(renewalNegotiations.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database
      .delete(renewalNegotiations)
      .where(eq(renewalNegotiations.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async deleteByMortgageId(mortgageId: string): Promise<void> {
    await this.database
      .delete(renewalNegotiations)
      .where(eq(renewalNegotiations.mortgageId, mortgageId));
  }
}
