import { Router } from "express";
import type { ApplicationServices } from "@application/services";
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

export function registerPrimeRateRoutes(router: Router, services: ApplicationServices) {
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
      
      // Log the API response for debugging
      console.log(
        `[Prime Rate API] Fetched rate: ${primeRate}% (date: ${effectiveDate}), Series: V121796`
      );
      
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
      
      // Map observations to rate entries
      // Bank of Canada API returns observations in reverse chronological order (newest first)
      const rates = data.observations.map(obs => ({
        date: obs.d,
        primeRate: parseFloat(obs.V121796.v),
      }));
      
      // Sort rates by date ascending (oldest first) for easier lookup
      // Frontend will sort descending when needed
      rates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log(
        `[Prime Rate History] Fetched ${rates.length} rates from ${start_date} to ${end_date}`,
        rates.map((r) => `${r.date}: ${r.primeRate}%`).join(", ")
      );
      
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

  // Check for prime rate changes and update VRM terms
  router.post("/prime-rate/check-and-update", async (_req, res) => {
    try {
      const result = await services.primeRateTracking.checkAndUpdatePrimeRate();
      res.json({
        success: true,
        ...result,
        message: result.changed
          ? `Prime rate changed from ${result.previousRate}% to ${result.newRate}%. Updated ${result.termsUpdated} VRM terms.`
          : `Prime rate unchanged at ${result.newRate}%.`,
      });
    } catch (error: any) {
      console.error("Error checking prime rate:", error);
      sendError(res, 500, "Failed to check and update prime rate", error);
    }
  });

  // Get prime rate history from database
  router.get("/prime-rate/history/db", async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        sendError(res, 400, "start_date and end_date query parameters are required");
        return;
      }

      const history = await services.primeRateTracking.getHistory(
        start_date as string,
        end_date as string
      );

      res.json({
        history,
        startDate: start_date,
        endDate: end_date,
      });
    } catch (error: any) {
      console.error("Error fetching prime rate history:", error);
      sendError(res, 500, "Failed to fetch prime rate history", error);
    }
  });

  // Get latest prime rate from database
  router.get("/prime-rate/latest", async (_req, res) => {
    try {
      const latest = await services.primeRateTracking.getLatest();
      if (!latest) {
        return res.json({
          message: "No prime rate history found. Run /prime-rate/check-and-update first.",
        });
      }
      res.json(latest);
    } catch (error: any) {
      console.error("Error fetching latest prime rate:", error);
      sendError(res, 500, "Failed to fetch latest prime rate", error);
    }
  });
}
