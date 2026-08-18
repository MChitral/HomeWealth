import { asc, eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  mortgagePayments,
  type MortgagePayment as MortgagePaymentRecord,
  type InsertMortgagePayment,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class MortgagePaymentsRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<MortgagePaymentRecord | undefined> {
    const result = await this.database
      .select()
      .from(mortgagePayments)
      .where(eq(mortgagePayments.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string, tx?: Database): Promise<MortgagePaymentRecord[]> {
    const database = tx ?? this.database;
    return database
      .select()
      .from(mortgagePayments)
      .where(eq(mortgagePayments.mortgageId, mortgageId))
      .orderBy(asc(mortgagePayments.paymentDate), asc(mortgagePayments.createdAt));
  }

  async findByTermId(termId: string): Promise<MortgagePaymentRecord[]> {
    return this.database
      .select()
      .from(mortgagePayments)
      .where(eq(mortgagePayments.termId, termId))
      .orderBy(asc(mortgagePayments.paymentDate), asc(mortgagePayments.createdAt));
  }

  async create(payload: InsertMortgagePayment, tx?: Database): Promise<MortgagePaymentRecord> {
    const db = tx || this.database;
    const [created] = await db.insert(mortgagePayments).values(payload).returning();
    return created;
  }

  async deleteByMortgageId(mortgageId: string, tx?: Database): Promise<void> {
    const db = tx || this.database;
    await db.delete(mortgagePayments).where(eq(mortgagePayments.mortgageId, mortgageId));
  }

  async deleteByTermId(termId: string): Promise<void> {
    await this.database.delete(mortgagePayments).where(eq(mortgagePayments.termId, termId));
  }

  async update(
    id: string,
    payload: Partial<InsertMortgagePayment>,
    tx?: Database
  ): Promise<MortgagePaymentRecord | undefined> {
    const db = tx || this.database;
    const [updated] = await db
      .update(mortgagePayments)
      .set(payload)
      .where(eq(mortgagePayments.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database
      .delete(mortgagePayments)
      .where(eq(mortgagePayments.id, id))
      .returning();
    return result.length > 0;
  }
}
