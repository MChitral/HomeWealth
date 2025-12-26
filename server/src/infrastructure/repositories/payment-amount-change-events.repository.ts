import { eq, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  paymentAmountChangeEvents,
  type PaymentAmountChangeEvent as PaymentAmountChangeEventRecord,
  type InsertPaymentAmountChangeEvent,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class PaymentAmountChangeEventsRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<PaymentAmountChangeEventRecord | undefined> {
    const result = await this.database
      .select()
      .from(paymentAmountChangeEvents)
      .where(eq(paymentAmountChangeEvents.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string): Promise<PaymentAmountChangeEventRecord[]> {
    return this.database
      .select()
      .from(paymentAmountChangeEvents)
      .where(eq(paymentAmountChangeEvents.mortgageId, mortgageId))
      .orderBy(desc(paymentAmountChangeEvents.changeDate));
  }

  async findByTermId(termId: string): Promise<PaymentAmountChangeEventRecord[]> {
    return this.database
      .select()
      .from(paymentAmountChangeEvents)
      .where(eq(paymentAmountChangeEvents.termId, termId))
      .orderBy(desc(paymentAmountChangeEvents.changeDate));
  }

  async create(
    payload: InsertPaymentAmountChangeEvent,
    tx?: Database
  ): Promise<PaymentAmountChangeEventRecord> {
    const db = tx || this.database;
    const [created] = await db.insert(paymentAmountChangeEvents).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertPaymentAmountChangeEvent>
  ): Promise<PaymentAmountChangeEventRecord | undefined> {
    const [updated] = await this.database
      .update(paymentAmountChangeEvents)
      .set(payload)
      .where(eq(paymentAmountChangeEvents.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database
      .delete(paymentAmountChangeEvents)
      .where(eq(paymentAmountChangeEvents.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
