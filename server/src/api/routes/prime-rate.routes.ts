import { Router } from "express";
import { sendError } from "@server-shared/utils/api-response";

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
      sendError(res, 500, "Failed to fetch prime rate", error);
    }
  });

  router.get("/prime-rate/history", async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        sendError(res, 400, "start_date and end_date query parameters are required");
        return;
      }
      
      const url = `https://www.bankofcanada.ca/valet/observations/V121796/json?start_date=${start_date}&end_date=${end_date}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Bank of Canada API returned ${response.status}`);
      }
      
      const data: BoCPrimeRateResponse = await response.json();
      
      if (!data.observations || data.observations.length === 0) {
        return res.json({ rates: [], message: "No historical data available for this period" });
      }
      
      const rates = data.observations.map(obs => ({
        date: obs.d,
        primeRate: parseFloat(obs.V121796.v),
      }));
      
      res.json({
        rates,
        source: "Bank of Canada",
        startDate: start_date,
        endDate: end_date,
      });
    } catch (error: any) {
      console.error("Error fetching historical prime rates:", error);
      sendError(res, 500, "Failed to fetch historical prime rates", error);
    }
  });
}
