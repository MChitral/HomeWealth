import { eq, and, desc, gte, lte } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import { marketRates, type MarketRate, type InsertMarketRate } from "@shared/schema";

export class MarketRatesRepository {
  private db = db;

  /**
   * Create a new market rate entry
   */
  async create(data: InsertMarketRate): Promise<MarketRate> {
    const [created] = await this.db.insert(marketRates).values(data).returning();
    return created;
  }

  /**
   * Get the latest market rate for a given rate type and term length
   */
  async findLatest(
    rateType: string,
    termYears: number
  ): Promise<MarketRate | undefined> {
    const [result] = await this.db
      .select()
      .from(marketRates)
      .where(
        and(
          eq(marketRates.rateType, rateType),
          eq(marketRates.termYears, termYears)
        )
      )
      .orderBy(desc(marketRates.effectiveDate), desc(marketRates.createdAt))
      .limit(1);
    return result;
  }

  /**
   * Get market rates within a date range
   */
  async findByDateRange(
    rateType: string,
    termYears: number,
    startDate: Date,
    endDate: Date
  ): Promise<MarketRate[]> {
    return await this.db
      .select()
      .from(marketRates)
      .where(
        and(
          eq(marketRates.rateType, rateType),
          eq(marketRates.termYears, termYears),
          gte(marketRates.effectiveDate, startDate.toISOString().split("T")[0]),
          lte(marketRates.effectiveDate, endDate.toISOString().split("T")[0])
        )
      )
      .orderBy(desc(marketRates.effectiveDate));
  }

  /**
   * Check if a market rate for a specific date already exists
   */
  async existsForDate(
    rateType: string,
    termYears: number,
    effectiveDate: string
  ): Promise<boolean> {
    const [existing] = await this.db
      .select()
      .from(marketRates)
      .where(
        and(
          eq(marketRates.rateType, rateType),
          eq(marketRates.termYears, termYears),
          eq(marketRates.effectiveDate, effectiveDate)
        )
      )
      .limit(1);
    return existing !== undefined;
  }
}

