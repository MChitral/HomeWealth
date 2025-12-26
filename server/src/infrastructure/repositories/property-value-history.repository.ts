import { eq, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  propertyValueHistory,
  type PropertyValueHistory as PropertyValueHistoryRecord,
  type InsertPropertyValueHistory,
} from "@shared/schema";

export class PropertyValueHistoryRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<PropertyValueHistoryRecord | undefined> {
    const result = await this.database
      .select()
      .from(propertyValueHistory)
      .where(eq(propertyValueHistory.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string): Promise<PropertyValueHistoryRecord[]> {
    return this.database
      .select()
      .from(propertyValueHistory)
      .where(eq(propertyValueHistory.mortgageId, mortgageId))
      .orderBy(desc(propertyValueHistory.valueDate));
  }

  async getLatestByMortgageId(
    mortgageId: string
  ): Promise<PropertyValueHistoryRecord | undefined> {
    const history = await this.findByMortgageId(mortgageId);
    return history[0]; // Already sorted by date descending
  }

  async create(payload: InsertPropertyValueHistory): Promise<PropertyValueHistoryRecord> {
    const [created] = await this.database
      .insert(propertyValueHistory)
      .values(payload)
      .returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertPropertyValueHistory>
  ): Promise<PropertyValueHistoryRecord | undefined> {
    const [updated] = await this.database
      .update(propertyValueHistory)
      .set(payload)
      .where(eq(propertyValueHistory.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database
      .delete(propertyValueHistory)
      .where(eq(propertyValueHistory.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async deleteByMortgageId(mortgageId: string): Promise<void> {
    await this.database
      .delete(propertyValueHistory)
      .where(eq(propertyValueHistory.mortgageId, mortgageId));
  }
}

