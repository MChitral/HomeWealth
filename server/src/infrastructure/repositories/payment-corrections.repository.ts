import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  paymentCorrections,
  type PaymentCorrection as PaymentCorrectionRecord,
  type InsertPaymentCorrection,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class PaymentCorrectionsRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<PaymentCorrectionRecord | undefined> {
    const result = await this.database
      .select()
      .from(paymentCorrections)
      .where(eq(paymentCorrections.id, id));
    return result[0];
  }

  async findByPaymentId(paymentId: string): Promise<PaymentCorrectionRecord[]> {
    return this.database
      .select()
      .from(paymentCorrections)
      .where(eq(paymentCorrections.paymentId, paymentId))
      .orderBy(paymentCorrections.createdAt);
  }

  async create(
    payload: InsertPaymentCorrection,
    tx?: Database
  ): Promise<PaymentCorrectionRecord> {
    const db = tx || this.database;
    const [created] = await db.insert(paymentCorrections).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<InsertPaymentCorrection>
  ): Promise<PaymentCorrectionRecord | undefined> {
    const [updated] = await this.database
      .update(paymentCorrections)
      .set(payload)
      .where(eq(paymentCorrections.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database
      .delete(paymentCorrections)
      .where(eq(paymentCorrections.id, id));
    return result.rowCount !== undefined ? result.rowCount > 0 : false;
  }
}

