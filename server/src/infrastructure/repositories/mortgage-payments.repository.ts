import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  mortgagePayments,
  type MortgagePayment as MortgagePaymentRecord,
  type InsertMortgagePayment,
} from "@shared/schema";

export class MortgagePaymentsRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<MortgagePaymentRecord | undefined> {
    const result = await this.database
      .select()
      .from(mortgagePayments)
      .where(eq(mortgagePayments.id, id));
    return result[0];
  }

  async findByMortgageId(mortgageId: string): Promise<MortgagePaymentRecord[]> {
    return this.database
      .select()
      .from(mortgagePayments)
      .where(eq(mortgagePayments.mortgageId, mortgageId));
  }

  async findByTermId(termId: string): Promise<MortgagePaymentRecord[]> {
    return this.database
      .select()
      .from(mortgagePayments)
      .where(eq(mortgagePayments.termId, termId));
  }

  async create(payload: InsertMortgagePayment): Promise<MortgagePaymentRecord> {
    const [created] = await this.database.insert(mortgagePayments).values(payload).returning();
    return created;
  }

  async deleteByMortgageId(mortgageId: string): Promise<void> {
    await this.database.delete(mortgagePayments).where(eq(mortgagePayments.mortgageId, mortgageId));
  }

  async deleteByTermId(termId: string): Promise<void> {
    await this.database.delete(mortgagePayments).where(eq(mortgagePayments.termId, termId));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.database.delete(mortgagePayments).where(eq(mortgagePayments.id, id)).returning();
    return result.length > 0;
  }
}

