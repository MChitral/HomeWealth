import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import { primeRateHistory, type InsertPrimeRateHistory, type PrimeRateHistory } from "@shared/schema";

export class PrimeRateHistoryRepository {
  /**
   * Create a new prime rate history entry
   */
  async create(data: InsertPrimeRateHistory): Promise<PrimeRateHistory> {
    const [created] = await db.insert(primeRateHistory).values(data).returning();
    return created;
  }

  /**
   * Get the latest prime rate from history
   */
  async findLatest(): Promise<PrimeRateHistory | undefined> {
    const [latest] = await db
      .select()
      .from(primeRateHistory)
      .orderBy(desc(primeRateHistory.effectiveDate), desc(primeRateHistory.createdAt))
      .limit(1);
    return latest;
  }

  /**
   * Get prime rate history within a date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<PrimeRateHistory[]> {
    return await db
      .select()
      .from(primeRateHistory)
      .where(
        and(
          gte(primeRateHistory.effectiveDate, startDate),
          lte(primeRateHistory.effectiveDate, endDate)
        )
      )
      .orderBy(desc(primeRateHistory.effectiveDate));
  }

  /**
   * Get all prime rate history entries
   */
  async findAll(): Promise<PrimeRateHistory[]> {
    return await db
      .select()
      .from(primeRateHistory)
      .orderBy(desc(primeRateHistory.effectiveDate), desc(primeRateHistory.createdAt));
  }

  /**
   * Check if a prime rate for a specific effective date already exists
   */
  async existsForDate(effectiveDate: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(primeRateHistory)
      .where(eq(primeRateHistory.effectiveDate, effectiveDate))
      .limit(1);
    return existing !== undefined;
  }
}

