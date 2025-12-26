import { eq, and, desc } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  smithManeuverStrategies,
  smithManeuverTransactions,
  smithManeuverTaxCalculations,
  smithManeuverComparisons,
  type SmithManeuverStrategy as SmithManeuverStrategyRecord,
  type InsertSmithManeuverStrategy,
  type UpdateSmithManeuverStrategy,
  type SmithManeuverTransaction as SmithManeuverTransactionRecord,
  type InsertSmithManeuverTransaction,
  type SmithManeuverTaxCalculation as SmithManeuverTaxCalculationRecord,
  type InsertSmithManeuverTaxCalculation,
  type SmithManeuverComparison as SmithManeuverComparisonRecord,
  type InsertSmithManeuverComparison,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class SmithManeuverRepository {
  constructor(private readonly database: Database = db) {}

  // Strategy methods
  async findStrategyById(id: string): Promise<SmithManeuverStrategyRecord | undefined> {
    const result = await this.database
      .select()
      .from(smithManeuverStrategies)
      .where(eq(smithManeuverStrategies.id, id));
    return result[0];
  }

  async findStrategiesByUserId(userId: string): Promise<SmithManeuverStrategyRecord[]> {
    return this.database
      .select()
      .from(smithManeuverStrategies)
      .where(eq(smithManeuverStrategies.userId, userId))
      .orderBy(desc(smithManeuverStrategies.createdAt));
  }

  async createStrategy(payload: InsertSmithManeuverStrategy): Promise<SmithManeuverStrategyRecord> {
    const [created] = await this.database
      .insert(smithManeuverStrategies)
      .values(payload)
      .returning();
    return created;
  }

  async updateStrategy(
    id: string,
    payload: Partial<UpdateSmithManeuverStrategy>
  ): Promise<SmithManeuverStrategyRecord | undefined> {
    const [updated] = await this.database
      .update(smithManeuverStrategies)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(smithManeuverStrategies.id, id))
      .returning();

    return updated;
  }

  async deleteStrategy(id: string, tx?: Database): Promise<boolean> {
    const db = tx || this.database;
    const result = await db
      .delete(smithManeuverStrategies)
      .where(eq(smithManeuverStrategies.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  // Transaction methods
  async findTransactionById(id: string): Promise<SmithManeuverTransactionRecord | undefined> {
    const result = await this.database
      .select()
      .from(smithManeuverTransactions)
      .where(eq(smithManeuverTransactions.id, id));
    return result[0];
  }

  async findTransactionsByStrategyId(
    strategyId: string
  ): Promise<SmithManeuverTransactionRecord[]> {
    return this.database
      .select()
      .from(smithManeuverTransactions)
      .where(eq(smithManeuverTransactions.strategyId, strategyId))
      .orderBy(desc(smithManeuverTransactions.transactionDate));
  }

  async createTransaction(
    payload: InsertSmithManeuverTransaction
  ): Promise<SmithManeuverTransactionRecord> {
    const [created] = await this.database
      .insert(smithManeuverTransactions)
      .values(payload)
      .returning();
    return created;
  }

  // Tax calculation methods
  async findTaxCalculationById(id: string): Promise<SmithManeuverTaxCalculationRecord | undefined> {
    const result = await this.database
      .select()
      .from(smithManeuverTaxCalculations)
      .where(eq(smithManeuverTaxCalculations.id, id));
    return result[0];
  }

  async findTaxCalculationsByStrategyId(
    strategyId: string
  ): Promise<SmithManeuverTaxCalculationRecord[]> {
    return this.database
      .select()
      .from(smithManeuverTaxCalculations)
      .where(eq(smithManeuverTaxCalculations.strategyId, strategyId))
      .orderBy(desc(smithManeuverTaxCalculations.taxYear));
  }

  async findTaxCalculationByStrategyIdAndYear(
    strategyId: string,
    taxYear: number
  ): Promise<SmithManeuverTaxCalculationRecord | undefined> {
    const result = await this.database
      .select()
      .from(smithManeuverTaxCalculations)
      .where(
        and(
          eq(smithManeuverTaxCalculations.strategyId, strategyId),
          eq(smithManeuverTaxCalculations.taxYear, taxYear)
        )
      );
    return result[0];
  }

  async createTaxCalculation(
    payload: InsertSmithManeuverTaxCalculation
  ): Promise<SmithManeuverTaxCalculationRecord> {
    const [created] = await this.database
      .insert(smithManeuverTaxCalculations)
      .values(payload)
      .returning();
    return created;
  }

  // Comparison methods
  async findComparisonById(id: string): Promise<SmithManeuverComparisonRecord | undefined> {
    const result = await this.database
      .select()
      .from(smithManeuverComparisons)
      .where(eq(smithManeuverComparisons.id, id));
    return result[0];
  }

  async findComparisonsByUserId(userId: string): Promise<SmithManeuverComparisonRecord[]> {
    return this.database
      .select()
      .from(smithManeuverComparisons)
      .where(eq(smithManeuverComparisons.userId, userId))
      .orderBy(desc(smithManeuverComparisons.createdAt));
  }

  async createComparison(
    payload: InsertSmithManeuverComparison
  ): Promise<SmithManeuverComparisonRecord> {
    const [created] = await this.database
      .insert(smithManeuverComparisons)
      .values(payload)
      .returning();
    return created;
  }

  async updateComparison(
    id: string,
    payload: Partial<InsertSmithManeuverComparison>
  ): Promise<SmithManeuverComparisonRecord | undefined> {
    const [updated] = await this.database
      .update(smithManeuverComparisons)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(smithManeuverComparisons.id, id))
      .returning();

    return updated;
  }
}
