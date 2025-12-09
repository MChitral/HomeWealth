import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  refinancingEvents,
  type RefinancingEvent as RefinancingEventRecord,
  type InsertRefinancingEvent,
} from "@shared/schema";

export class RefinancingEventsRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<RefinancingEventRecord | undefined> {
    const result = await this.database
      .select()
      .from(refinancingEvents)
      .where(eq(refinancingEvents.id, id));
    return result[0];
  }

  async findByScenarioId(scenarioId: string): Promise<RefinancingEventRecord[]> {
    return this.database
      .select()
      .from(refinancingEvents)
      .where(eq(refinancingEvents.scenarioId, scenarioId));
  }

  async create(payload: InsertRefinancingEvent): Promise<RefinancingEventRecord> {
    const [created] = await this.database.insert(refinancingEvents).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertRefinancingEvent>,
  ): Promise<RefinancingEventRecord | undefined> {
    const [updated] = await this.database
      .update(refinancingEvents)
      .set(payload)
      .where(eq(refinancingEvents.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database.delete(refinancingEvents).where(eq(refinancingEvents.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async deleteByScenarioId(scenarioId: string): Promise<void> {
    await this.database.delete(refinancingEvents).where(eq(refinancingEvents.scenarioId, scenarioId));
  }
}

