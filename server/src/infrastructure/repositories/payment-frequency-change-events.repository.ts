import { eq, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  paymentFrequencyChangeEvents,
  type PaymentFrequencyChangeEvent as PaymentFrequencyChangeEventRecord,
  type InsertPaymentFrequencyChangeEvent,
} from "@shared/schema";

export class PaymentFrequencyChangeEventsRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<PaymentFrequencyChangeEventRecord | undefined> {
    const result = await this.database
      .select()
      .from(paymentFrequencyChangeEvents)
      .where(eq(paymentFrequencyChangeEvents.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string): Promise<PaymentFrequencyChangeEventRecord[]> {
    return this.database
      .select()
      .from(paymentFrequencyChangeEvents)
      .where(eq(paymentFrequencyChangeEvents.mortgageId, mortgageId))
      .orderBy(desc(paymentFrequencyChangeEvents.changeDate));
  }

  async findByTermId(termId: string): Promise<PaymentFrequencyChangeEventRecord[]> {
    return this.database
      .select()
      .from(paymentFrequencyChangeEvents)
      .where(eq(paymentFrequencyChangeEvents.termId, termId))
      .orderBy(desc(paymentFrequencyChangeEvents.changeDate));
  }

  async create(
    payload: InsertPaymentFrequencyChangeEvent
  ): Promise<PaymentFrequencyChangeEventRecord> {
    const [created] = await this.database
      .insert(paymentFrequencyChangeEvents)
      .values(payload)
      .returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertPaymentFrequencyChangeEvent>
  ): Promise<PaymentFrequencyChangeEventRecord | undefined> {
    const [updated] = await this.database
      .update(paymentFrequencyChangeEvents)
      .set(payload)
      .where(eq(paymentFrequencyChangeEvents.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database
      .delete(paymentFrequencyChangeEvents)
      .where(eq(paymentFrequencyChangeEvents.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async deleteByMortgageId(mortgageId: string): Promise<void> {
    await this.database
      .delete(paymentFrequencyChangeEvents)
      .where(eq(paymentFrequencyChangeEvents.mortgageId, mortgageId));
  }
}

