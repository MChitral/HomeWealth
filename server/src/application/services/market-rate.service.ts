export interface MarketRates {
  fixed5Yr: number;
  variable5Yr: number;
  lastUpdated: Date;
}

export class MarketRateService {
  /**
   * Returns current benchmark market rates.
   * In a real app, this would scrape/fetch from an API.
   * For MVP, we return static "good" market rates proper for late 2025 context.
   */
  async getMarketRates(): Promise<MarketRates> {
    return {
      fixed5Yr: 3.99, // Optimistic 2025 rate
      variable5Yr: 4.5,
      lastUpdated: new Date(),
    };
  }

  async getBestRate(termType: "5-year-fixed" | "5-year-variable"): Promise<number> {
    const rates = await this.getMarketRates();
    if (termType === "5-year-variable") {
      return rates.variable5Yr;
    }
    return rates.fixed5Yr;
  }
}
