import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  cashFlow,
  type CashFlow as CashFlowRecord,
  type InsertCashFlow,
  type UpdateCashFlow,
} from "@shared/schema";

export class CashFlowRepository {
  constructor(private readonly database = db) {}

  async findByUserId(userId: string): Promise<CashFlowRecord | undefined> {
    const result = await this.database.select().from(cashFlow).where(eq(cashFlow.userId, userId));
    return result[0];
  }

  async create(payload: InsertCashFlow): Promise<CashFlowRecord> {
    const [created] = await this.database.insert(cashFlow).values(payload).returning();
    return created;
  }

  async update(id: string, payload: Partial<UpdateCashFlow>): Promise<CashFlowRecord | undefined> {
    const [updated] = await this.database
      .update(cashFlow)
      .set(payload)
      .where(eq(cashFlow.id, id))
      .returning();

    return updated;
  }
}
