import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  prepaymentEvents,
  type PrepaymentEvent as PrepaymentEventRecord,
  type InsertPrepaymentEvent,
} from "@shared/schema";

export class PrepaymentEventsRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<PrepaymentEventRecord | undefined> {
    const result = await this.database
      .select()
      .from(prepaymentEvents)
      .where(eq(prepaymentEvents.id, id));
    return result[0];
  }

  async findByScenarioId(scenarioId: string): Promise<PrepaymentEventRecord[]> {
    return this.database
      .select()
      .from(prepaymentEvents)
      .where(eq(prepaymentEvents.scenarioId, scenarioId));
  }

  async create(payload: InsertPrepaymentEvent): Promise<PrepaymentEventRecord> {
    const [created] = await this.database.insert(prepaymentEvents).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertPrepaymentEvent>,
  ): Promise<PrepaymentEventRecord | undefined> {
    const [updated] = await this.database
      .update(prepaymentEvents)
      .set(payload)
      .where(eq(prepaymentEvents.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database.delete(prepaymentEvents).where(eq(prepaymentEvents.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async deleteByScenarioId(scenarioId: string): Promise<void> {
    await this.database.delete(prepaymentEvents).where(eq(prepaymentEvents.scenarioId, scenarioId));
  }
}

