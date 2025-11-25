import { Router } from "express";

const BOC_PRIME_RATE_API = "https://www.bankofcanada.ca/valet/observations/V121796/json?recent=1";

interface BoCPrimeRateResponse {
  terms: { url: string };
  seriesDetail: {
    V121796: {
      label: string;
      description: string;
      dimension: { key: string; name: string };
    };
  };
  observations: Array<{
    d: string;
    V121796: { v: string };
  }>;
}

export function registerPrimeRateRoutes(router: Router) {
  router.get("/prime-rate", async (_req, res) => {
    try {
      const response = await fetch(BOC_PRIME_RATE_API);
      
      if (!response.ok) {
        throw new Error(`Bank of Canada API returned ${response.status}`);
      }
      
      const data: BoCPrimeRateResponse = await response.json();
      
      if (!data.observations || data.observations.length === 0) {
        throw new Error("No prime rate data available");
      }
      
      const latestObservation = data.observations[0];
      const primeRate = parseFloat(latestObservation.V121796.v);
      const effectiveDate = latestObservation.d;
      
      res.json({
        primeRate,
        effectiveDate,
        source: "Bank of Canada",
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching prime rate:", error);
      res.status(500).json({
        error: "Failed to fetch prime rate",
        message: error.message,
        fallbackRate: 6.45,
      });
    }
  });
}
