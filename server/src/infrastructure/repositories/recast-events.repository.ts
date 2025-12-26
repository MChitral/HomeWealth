import { eq, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  recastEvents,
  type RecastEvent as RecastEventRecord,
  type InsertRecastEvent,
} from "@shared/schema";

export class RecastEventsRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<RecastEventRecord | undefined> {
    const result = await this.database.select().from(recastEvents).where(eq(recastEvents.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string): Promise<RecastEventRecord[]> {
    return this.database
      .select()
      .from(recastEvents)
      .where(eq(recastEvents.mortgageId, mortgageId))
      .orderBy(desc(recastEvents.recastDate));
  }

  async findByTermId(termId: string): Promise<RecastEventRecord[]> {
    return this.database
      .select()
      .from(recastEvents)
      .where(eq(recastEvents.termId, termId))
      .orderBy(desc(recastEvents.recastDate));
  }

  async create(payload: InsertRecastEvent): Promise<RecastEventRecord> {
    const [created] = await this.database.insert(recastEvents).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertRecastEvent>
  ): Promise<RecastEventRecord | undefined> {
    const [updated] = await this.database
      .update(recastEvents)
      .set(payload)
      .where(eq(recastEvents.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database.delete(recastEvents).where(eq(recastEvents.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async deleteByMortgageId(mortgageId: string): Promise<void> {
    await this.database.delete(recastEvents).where(eq(recastEvents.mortgageId, mortgageId));
  }
}
