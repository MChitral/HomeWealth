import { eq, and, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import {
  investmentIncome,
  type InvestmentIncome as InvestmentIncomeRecord,
  type InsertInvestmentIncome,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class InvestmentIncomeRepository {
  constructor(private readonly database: Database = db) {}

  async findById(id: string): Promise<InvestmentIncomeRecord | undefined> {
    const result = await this.database
      .select()
      .from(investmentIncome)
      .where(eq(investmentIncome.id, id));
    return result[0];
  }

  async findByInvestmentId(investmentId: string): Promise<InvestmentIncomeRecord[]> {
    return this.database
      .select()
      .from(investmentIncome)
      .where(eq(investmentIncome.investmentId, investmentId))
      .orderBy(desc(investmentIncome.incomeDate));
  }

  async findByInvestmentIdAndTaxYear(
    investmentId: string,
    taxYear: number
  ): Promise<InvestmentIncomeRecord[]> {
    return this.database
      .select()
      .from(investmentIncome)
      .where(
        and(eq(investmentIncome.investmentId, investmentId), eq(investmentIncome.taxYear, taxYear))
      )
      .orderBy(desc(investmentIncome.incomeDate));
  }

  async findByUserIdAndTaxYear(userId: string, taxYear: number): Promise<InvestmentIncomeRecord[]> {
    // This requires a join with investments table
    const result = await this.database
      .select({
        id: investmentIncome.id,
        investmentId: investmentIncome.investmentId,
        incomeType: investmentIncome.incomeType,
        incomeDate: investmentIncome.incomeDate,
        amount: investmentIncome.amount,
        taxYear: investmentIncome.taxYear,
        taxTreatment: investmentIncome.taxTreatment,
        createdAt: investmentIncome.createdAt,
      })
      .from(investmentIncome)
      .innerJoin(schema.investments, eq(investmentIncome.investmentId, schema.investments.id))
      .where(and(eq(schema.investments.userId, userId), eq(investmentIncome.taxYear, taxYear)))
      .orderBy(desc(investmentIncome.incomeDate));

    return result as InvestmentIncomeRecord[];
  }

  async create(payload: InsertInvestmentIncome): Promise<InvestmentIncomeRecord> {
    const [created] = await this.database.insert(investmentIncome).values(payload).returning();
    return created;
  }

  async delete(id: string, tx?: Database): Promise<boolean> {
    const db = tx || this.database;
    const result = await db.delete(investmentIncome).where(eq(investmentIncome.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }
}
