import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  scenarios,
  type Scenario as ScenarioRecord,
  type InsertScenario,
} from "@shared/schema";

export class ScenariosRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<ScenarioRecord | undefined> {
    const result = await this.database.select().from(scenarios).where(eq(scenarios.id, id));
    return result[0];
  }

  async findByUserId(userId: string): Promise<ScenarioRecord[]> {
    return this.database.select().from(scenarios).where(eq(scenarios.userId, userId));
  }

  async create(payload: InsertScenario): Promise<ScenarioRecord> {
    const [created] = await this.database.insert(scenarios).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertScenario>,
  ): Promise<ScenarioRecord | undefined> {
    const [updated] = await this.database
      .update(scenarios)
      .set(payload)
      .where(eq(scenarios.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database.delete(scenarios).where(eq(scenarios.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }
}

