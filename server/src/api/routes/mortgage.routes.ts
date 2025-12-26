import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import {
  mortgageCreateSchema,
  mortgageUpdateSchema,
  mortgageTermCreateSchema,
  mortgageTermUpdateSchema,
  mortgagePaymentCreateSchema,
} from "@domain/models";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import {
  generateAmortizationSchedule,
  generateAmortizationScheduleWithPayment,
  calculatePayment,
  getPaymentsPerYear,
  type PaymentFrequency,
  type PrepaymentEvent as CalcPrepaymentEvent,
  type TermRenewal,
} from "../../shared/calculations/mortgage";
import type { MortgageTerm } from "@shared/schema";
import {
  getTermEffectiveRate,
  shouldUpdatePaymentAmount,
} from "@server-shared/calculations/term-helpers";
import { fetchLatestPrimeRate } from "@server-shared/services/prime-rate";
import { z } from "zod";
async function ensurePrimeRate<
  T extends { termType?: string; primeRate?: string | number; startDate?: string },
>(payload: T): Promise<T> {
  if (
    payload.termType &&
    payload.termType.startsWith("variable") &&
    (payload.primeRate == null || payload.primeRate === "")
  ) {
    try {
      // If startDate is provided, fetch historical rate for that date
      // Otherwise, use current rate
      if (payload.startDate) {
        const startDate = new Date(payload.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1); // Add 1 day to ensure we get the rate

        const url = `https://www.bankofcanada.ca/valet/observations/V121796/json?start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.observations && data.observations.length > 0) {
            // Get the most recent rate on or before startDate
            const payloadStartDate = payload.startDate;
            const rates = data.observations
              .map((obs: { d: string; V121796: { v: string } }) => ({
                date: obs.d,
                rate: parseFloat(obs.V121796.v),
              }))
              .filter((r: { date: string; rate: number }) => r.date <= payloadStartDate)
              .sort(
                (a: { date: string }, b: { date: string }) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );

            if (rates.length > 0) {
              return { ...payload, primeRate: rates[0].rate.toFixed(3) };
            }
          }
        }

        // If historical fetch failed, try fetching a wider range (3 months before)
        const queryStartDate = new Date(startDate);
        queryStartDate.setMonth(queryStartDate.getMonth() - 3);
        const wideUrl = `https://www.bankofcanada.ca/valet/observations/V121796/json?start_date=${queryStartDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`;
        const wideResponse = await fetch(wideUrl);

        if (wideResponse.ok) {
          const wideData = await wideResponse.json();
          if (wideData.observations && wideData.observations.length > 0) {
            const payloadStartDate = payload.startDate;
            const rates = wideData.observations
              .map((obs: { d: string; V121796: { v: string } }) => ({
                date: obs.d,
                rate: parseFloat(obs.V121796.v),
              }))
              .filter((r: { date: string; rate: number }) => r.date <= payloadStartDate)
              .sort(
                (a: { date: string }, b: { date: string }) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );

            if (rates.length > 0) {
              return { ...payload, primeRate: rates[0].rate.toFixed(3) };
            }
          }
        }
      }

      // Fallback to current rate if no startDate or historical fetch failed
      const { primeRate } = await fetchLatestPrimeRate();
      return { ...payload, primeRate: primeRate.toFixed(3) };
    } catch (error) {
      console.error(`[ensurePrimeRate] Error fetching prime rate:`, error);
      // Fallback to a reasonable default based on startDate if available
      if (payload.startDate) {
        const startDate = new Date(payload.startDate);
        // If startDate is in 2025, use 5.45% (Jan 2025 rate)
        // If startDate is in 2024, use 6.45% (Sep 2024 rate)
        const year = startDate.getFullYear();
        const fallbackRate = year >= 2025 ? "5.450" : "6.450";
        return { ...payload, primeRate: fallbackRate };
      }
      return { ...payload, primeRate: "6.450" };
    }
  }
  return payload;
}

function advanceDateByFrequency(date: Date, frequency: PaymentFrequency): Date {
  const next = new Date(date);
  switch (frequency) {
    case "monthly": {
      const day = next.getDate();
      next.setMonth(next.getMonth() + 1);
      const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(day, lastDay));
      return next;
    }
    case "semi-monthly":
      next.setDate(next.getDate() + 15);
      return next;
    case "biweekly":
    case "accelerated-biweekly":
      next.setDate(next.getDate() + 14);
      return next;
    case "weekly":
    case "accelerated-weekly":
      next.setDate(next.getDate() + 7);
      return next;
    default:
      return next;
  }
}

function getActiveTermForDate(terms: MortgageTerm[], targetDate: Date): MortgageTerm | undefined {
  return [...terms]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .find((term) => new Date(term.startDate) <= targetDate);
}

function calculatePaymentNumberFromDates(
  startDate: Date,
  targetDate: Date,
  frequency: PaymentFrequency
): number {
  if (targetDate <= startDate) {
    return 1;
  }
  let paymentNumber = 1;
  let cursor = new Date(startDate);
  while (cursor < targetDate && paymentNumber < 10000) {
    cursor = advanceDateByFrequency(cursor, frequency);
    paymentNumber += 1;
  }
  return paymentNumber;
}

function buildTermRenewalsRelativeToProjection(
  terms: MortgageTerm[],
  projectionStartDate: Date,
  frequency: PaymentFrequency
): TermRenewal[] {
  return terms
    .filter((term) => new Date(term.startDate) > projectionStartDate)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .map((term) => ({
      startPaymentNumber: calculatePaymentNumberFromDates(
        projectionStartDate,
        new Date(term.startDate),
        frequency
      ),
      newRate: getTermEffectiveRate(term),
      newPaymentAmount: shouldUpdatePaymentAmount(term)
        ? Number(term.regularPaymentAmount)
        : undefined,
    }));
}

export function registerMortgageRoutes(router: Router, services: ApplicationServices) {
  router.get("/mortgages", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const mortgages = await services.mortgages.listByUserId(user.id);
    res.json(mortgages);
  });

  router.get("/mortgages/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const mortgage = await services.mortgages.getByIdForUser(req.params.id, user.id);
    if (!mortgage) {
      sendError(res, 404, "Mortgage not found");
      return;
    }
    res.json(mortgage);
  });

  router.get("/mortgages/:id/trigger-status", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const status = await services.triggerRateMonitor.checkOne(req.params.id);
    res.json(status); // Returns TriggerRateAlert or null
  });

  // GET /api/market-rates - Get current market rate
  router.get("/market-rates", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { rateType, termYears } = req.query;

      if (!rateType || !termYears) {
        sendError(res, 400, "rateType and termYears are required");
        return;
      }

      const rate = await services.marketRateService.getMarketRate(
        rateType as "fixed" | "variable-changing" | "variable-fixed",
        parseInt(termYears as string, 10)
      );

      if (rate === null) {
        sendError(res, 404, "Market rate not found");
        return;
      }

      res.json({
        rate: rate * 100, // Return as percentage
        rateType,
        termYears: parseInt(termYears as string, 10),
      });
    } catch (error) {
      sendError(res, 500, "Failed to get market rate", error);
    }
  });

  // GET /api/market-rates/history - Get historical market rates
  router.get("/market-rates/history", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { rateType, termYears, startDate, endDate } = req.query;

      if (!rateType || !termYears || !startDate || !endDate) {
        sendError(res, 400, "rateType, termYears, startDate, and endDate are required");
        return;
      }

      const rates = await services.marketRateService.getHistoricalRates(
        rateType as string,
        parseInt(termYears as string, 10),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(rates);
    } catch (error) {
      sendError(res, 500, "Failed to get historical market rates", error);
    }
  });

  router.get("/mortgages/:id/renewal-status", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const status = await services.renewalService.getRenewalStatus(req.params.id);
      if (!status) {
        // Not finding status (e.g., no active term) isn't necessarily a 404 on the whole mortgage/endpoint,
        // but let's return null or 404. Let's return 200 with null for "no active renewal info".
        res.json(null);
        return;
      }
      res.json(status);
    } catch (error) {
      sendError(res, 400, "Failed to fetch renewal status", error);
    }
  });

  // POST /api/mortgages/calculate-penalty - Calculate mortgage penalty
  router.post("/mortgages/calculate-penalty", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const {
        balance,
        currentRate,
        marketRate,
        remainingMonths,
        termType,
        penaltyCalculationMethod,
        mortgageId, // Optional: if provided, will check openClosedMortgageType
        openClosedMortgageType, // Optional: can be passed directly instead of fetching
      } = req.body;

      // Validate inputs
      if (!balance || typeof balance !== "number" || balance <= 0) {
        sendError(res, 400, "Balance must be greater than 0");
        return;
      }
      if (!currentRate || typeof currentRate !== "number" || currentRate < 0 || currentRate > 1) {
        sendError(res, 400, "Current rate must be between 0 and 1 (decimal)");
        return;
      }
      if (marketRate === undefined || typeof marketRate !== "number" || marketRate < 0) {
        sendError(res, 400, "Market rate is required and must be >= 0");
        return;
      }
      if (!remainingMonths || typeof remainingMonths !== "number" || remainingMonths <= 0) {
        sendError(res, 400, "Remaining months must be greater than 0");
        return;
      }

      // Check if mortgage is open (either from direct parameter or by fetching mortgage)
      let isOpenMortgage = false;
      let detectedMortgageType: string | null = null;

      if (openClosedMortgageType === "open") {
        isOpenMortgage = true;
        detectedMortgageType = "open";
      } else if (mortgageId && !openClosedMortgageType) {
        // Fetch mortgage to check openClosedMortgageType
        const mortgage = await services.mortgages.getByIdForUser(mortgageId, user.id);
        if (mortgage) {
          // Verify ownership
          if (mortgage.openClosedMortgageType === "open") {
            isOpenMortgage = true;
            detectedMortgageType = "open";
          } else {
            detectedMortgageType = mortgage.openClosedMortgageType || "closed";
          }
        }
      }

      // Calculate penalties
      const {
        calculateStandardPenalty,
        calculateThreeMonthInterestPenalty,
        calculateIRDPenalty,
        calculatePenaltyByMethod,
      } = await import("@domain/calculations/penalty");
      type PenaltyCalculationMethod =
        | "ird_posted_rate"
        | "ird_discounted_rate"
        | "ird_origination_comparison"
        | "three_month_interest"
        | "open_mortgage"
        | "variable_rate";

      const threeMonthPenalty = calculateThreeMonthInterestPenalty(balance, currentRate);
      const irdPenalty = calculateIRDPenalty(balance, currentRate, marketRate, remainingMonths);

      // Use specific method if provided, otherwise use standard calculation
      // BUT: If mortgage is open, automatically use open_mortgage method (overrides user selection)
      let penaltyResult;
      let autoDetectedOpen = false;

      if (isOpenMortgage) {
        // Open mortgage: penalty is always 0
        penaltyResult = calculatePenaltyByMethod(
          "open_mortgage" as PenaltyCalculationMethod,
          balance,
          currentRate,
          marketRate,
          remainingMonths,
          termType
        );
        autoDetectedOpen = true;
      } else if (penaltyCalculationMethod) {
        penaltyResult = calculatePenaltyByMethod(
          penaltyCalculationMethod as PenaltyCalculationMethod,
          balance,
          currentRate,
          marketRate,
          remainingMonths,
          termType
        );
      } else {
        const standardPenalty = calculateStandardPenalty(
          balance,
          currentRate,
          marketRate,
          remainingMonths
        );
        penaltyResult = {
          penalty: standardPenalty.penalty,
          method: standardPenalty.method,
        };
      }

      res.json({
        threeMonthPenalty,
        irdPenalty,
        totalPenalty: penaltyResult.penalty,
        method: penaltyResult.method,
        breakdown: {
          threeMonth: threeMonthPenalty,
          ird: irdPenalty,
          applied: penaltyResult.method,
        },
        // Add metadata about open mortgage detection
        ...(autoDetectedOpen
          ? {
              isOpenMortgage: true,
              mortgageType: detectedMortgageType,
              note: "Penalty is $0 because this is an open mortgage",
            }
          : detectedMortgageType
            ? { mortgageType: detectedMortgageType }
            : {}),
      });
    } catch (error) {
      sendError(res, 500, "Failed to calculate penalty", error);
    }
  });

  // Legacy endpoint - keeping for backward compatibility but redirecting to new implementation
  router.get("/market-rates/legacy", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      // Old stub implementation - kept for backward compatibility
      const fixed5Yr = await services.marketRateService.getMarketRate("fixed", 5);
      const variable5Yr = await services.marketRateService.getMarketRate("variable-changing", 5);

      res.json({
        fixed5Yr: fixed5Yr ? fixed5Yr * 100 : null,
        variable5Yr: variable5Yr ? variable5Yr * 100 : null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      sendError(res, 500, "Failed to fetch market rates", error);
    }
  });

  router.get("/mortgages/:id/refinance-analysis", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      // Parse closing costs from query params if provided
      const closingCosts = req.query.closingCosts
        ? {
            total: req.query.closingCostsTotal
              ? parseFloat(req.query.closingCostsTotal as string)
              : undefined,
            legalFees: req.query.legalFees ? parseFloat(req.query.legalFees as string) : undefined,
            appraisalFees: req.query.appraisalFees
              ? parseFloat(req.query.appraisalFees as string)
              : undefined,
            dischargeFees: req.query.dischargeFees
              ? parseFloat(req.query.dischargeFees as string)
              : undefined,
            otherFees: req.query.otherFees ? parseFloat(req.query.otherFees as string) : undefined,
          }
        : undefined;

      const analysis = await services.refinancingService.analyzeRefinanceOpportunity(
        req.params.id,
        closingCosts
      );
      if (!analysis) {
        // Return null or 404. Let's return null to signify no analysis possible (e.g. no active term)
        res.json(null);
        return;
      }
      res.json(analysis);
    } catch (error) {
      sendError(res, 400, "Failed to analyze refinance opportunity", error);
    }
  });

  // POST endpoint for refinance analysis with closing costs in body
  router.post("/mortgages/:id/refinance-analysis", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const closingCosts = req.body.closingCosts
        ? {
            total: req.body.closingCosts.total,
            legalFees: req.body.closingCosts.legalFees,
            appraisalFees: req.body.closingCosts.appraisalFees,
            dischargeFees: req.body.closingCosts.dischargeFees,
            otherFees: req.body.closingCosts.otherFees,
          }
        : undefined;

      const analysis = await services.refinancingService.analyzeRefinanceOpportunity(
        req.params.id,
        closingCosts
      );
      if (!analysis) {
        res.json(null);
        return;
      }
      res.json(analysis);
    } catch (error) {
      sendError(res, 400, "Failed to analyze refinance opportunity", error);
    }
  });

  router.post("/mortgages", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = mortgageCreateSchema.parse({ ...req.body, userId: user.id });
      const { userId: _userId, ...payload } = data;
      const created = await services.mortgages.create(user.id, payload);
      res.json(created);
    } catch (error) {
      sendError(res, 400, "Invalid mortgage data", error);
    }
  });

  router.patch("/mortgages/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = mortgageUpdateSchema.parse(req.body);
      const updated = await services.mortgages.update(req.params.id, user.id, data);
      if (!updated) {
        sendError(res, 404, "Mortgage not found");
        return;
      }
      res.json(updated);
    } catch (error) {
      sendError(res, 400, "Invalid update data", error);
    }
  });

  router.delete("/mortgages/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.mortgages.delete(req.params.id, user.id);
    if (!deleted) {
      sendError(res, 404, "Mortgage not found");
      return;
    }
    res.json({ success: true });
  });

  router.get("/mortgages/:mortgageId/terms", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const terms = await services.mortgageTerms.listForMortgage(req.params.mortgageId, user.id);
    if (!terms) {
      sendError(res, 404, "Mortgage not found");
      return;
    }
    res.json(terms);
  });

  router.post("/mortgages/:mortgageId/terms", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const requestWithPrime = await ensurePrimeRate({
        ...req.body,
        mortgageId: req.params.mortgageId,
      });
      const data = mortgageTermCreateSchema.parse(requestWithPrime);
      const { mortgageId: _mortgageId, ...payload } = data;
      const term = await services.mortgageTerms.create(req.params.mortgageId, user.id, payload);
      if (!term) {
        sendError(res, 404, "Mortgage not found");
        return;
      }
      res.json(term);
    } catch (error) {
      sendError(res, 400, "Invalid term data", error);
    }
  });

  router.patch("/mortgage-terms/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const requestWithPrime = await ensurePrimeRate(req.body);
      const data = mortgageTermUpdateSchema.parse(requestWithPrime);
      const updated = await services.mortgageTerms.update(req.params.id, user.id, data);
      if (!updated) {
        sendError(res, 404, "Term not found");
        return;
      }
      res.json(updated);
    } catch (error) {
      sendError(res, 400, "Invalid update data", error);
    }
  });

  router.delete("/mortgage-terms/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.mortgageTerms.delete(req.params.id, user.id);
    if (!deleted) {
      sendError(res, 404, "Term not found");
      return;
    }
    res.json({ success: true });
  });

  router.post("/mortgage-terms/:id/blend-and-extend", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { newMarketRate, extendedAmortizationMonths } = req.body as {
        newMarketRate: number;
        extendedAmortizationMonths?: number;
      };

      if (!newMarketRate || typeof newMarketRate !== "number") {
        sendError(res, 400, "newMarketRate is required and must be a number");
        return;
      }

      // Get the term and mortgage with authorization
      const termData = await services.mortgageTerms.getByIdForUser(req.params.id, user.id);
      if (!termData) {
        sendError(res, 404, "Term not found or unauthorized");
        return;
      }
      const { term, mortgage } = termData;

      // Get latest payment to find remaining balance
      const payments = (await services.mortgagePayments.listByTerm(term.id, user.id)) || [];
      const latestPayment =
        payments.length > 0
          ? payments.sort(
              (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
            )[0]
          : null;

      const remainingBalance = latestPayment
        ? Number(latestPayment.remainingBalance)
        : Number(mortgage.currentBalance);

      // Calculate remaining term months
      const termEndDate = new Date(term.endDate);
      const today = new Date();
      const remainingTermMonths = Math.max(
        0,
        Math.ceil((termEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
      );

      // Get original and remaining amortization
      const originalAmortizationMonths =
        mortgage.amortizationYears * 12 + (mortgage.amortizationMonths ?? 0);
      const remainingAmortizationMonths = latestPayment
        ? Number(latestPayment.remainingAmortizationMonths)
        : originalAmortizationMonths;

      // Calculate extended amortization (default to original if not specified)
      const extendedAmort = extendedAmortizationMonths ?? originalAmortizationMonths;

      // Get old rate
      const oldRate = getTermEffectiveRate(term);

      // Calculate blend-and-extend
      const { calculateBlendAndExtend } =
        await import("@server-shared/calculations/blend-and-extend");
      const result = calculateBlendAndExtend({
        oldRate,
        newMarketRate: newMarketRate / 100, // Convert percentage to decimal
        remainingBalance,
        remainingTermMonths,
        originalAmortizationMonths,
        remainingAmortizationMonths,
        extendedAmortizationMonths: extendedAmort,
        frequency: term.paymentFrequency as PaymentFrequency,
      });

      res.json({
        blendedRate: result.blendedRate,
        blendedRatePercent: (result.blendedRate * 100).toFixed(3),
        newPaymentAmount: result.newPaymentAmount,
        marketRatePaymentAmount: result.marketRatePaymentAmount,
        oldRatePaymentAmount: result.oldRatePaymentAmount,
        interestSavingsPerPayment: result.interestSavingsPerPayment,
        extendedAmortizationMonths: extendedAmort,
        message: `Blend-and-extend calculated: ${(result.blendedRate * 100).toFixed(3)}% rate, $${result.newPaymentAmount.toFixed(2)} payment`,
      });
    } catch (error) {
      sendError(res, 400, "Failed to calculate blend-and-extend", error);
    }
  });

  router.get("/mortgages/:mortgageId/payments", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const payments = await services.mortgagePayments.listByMortgage(req.params.mortgageId, user.id);
    if (!payments) {
      sendError(res, 404, "Mortgage not found");
      return;
    }
    res.json(payments);
  });

  router.get("/mortgage-terms/:termId/payments", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const payments = await services.mortgagePayments.listByTerm(req.params.termId, user.id);
    if (!payments) {
      sendError(res, 404, "Term not found");
      return;
    }
    res.json(payments);
  });

  router.post("/mortgages/:mortgageId/payments", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = mortgagePaymentCreateSchema.parse({
        ...req.body,
        mortgageId: req.params.mortgageId,
      });
      const { mortgageId: _mortgageId, ...payload } = data;
      const payment = await services.mortgagePayments.create(
        req.params.mortgageId,
        user.id,
        payload
      );
      if (!payment) {
        sendError(res, 403, "Forbidden");
        return;
      }
      res.json(payment);
    } catch (error) {
      sendError(res, 400, "Invalid payment data", error);
    }
  });

  // Recast endpoints
  router.post("/mortgages/:id/recast/calculate", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;
      const { prepaymentAmount, recastDate } = req.body;

      if (!prepaymentAmount || prepaymentAmount <= 0) {
        return sendError(res, 400, "Prepayment amount is required and must be greater than zero");
      }

      const result = await services.recast.calculateRecast(id, userId, {
        mortgageId: id,
        prepaymentAmount: parseFloat(prepaymentAmount),
        recastDate,
      });

      if (!result) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(result);
    } catch (error) {
      sendError(res, 500, "Failed to calculate recast", error);
    }
  });

  router.post("/mortgages/:id/recast/apply", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;
      const { prepaymentAmount, recastDate } = req.body;

      if (!prepaymentAmount || prepaymentAmount <= 0) {
        return sendError(res, 400, "Prepayment amount is required and must be greater than zero");
      }

      const result = await services.recast.applyRecast(id, userId, {
        mortgageId: id,
        prepaymentAmount: parseFloat(prepaymentAmount),
        recastDate,
      });

      if (!result) {
        return sendError(res, 404, "Mortgage not found or recast cannot be applied");
      }

      res.json(result);
    } catch (error) {
      sendError(res, 500, "Failed to apply recast", error);
    }
  });

  router.get("/mortgages/:id/recast/history", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;

      const history = await services.recast.getRecastHistory(id, userId);

      if (history === undefined) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(history);
    } catch (error) {
      sendError(res, 500, "Failed to get recast history", error);
    }
  });

  // Payment Frequency Change endpoints
  router.post("/mortgage-terms/:id/frequency-change/calculate", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;
      const { newFrequency } = req.body;

      if (!newFrequency) {
        return sendError(res, 400, "New frequency is required");
      }

      const term = await services.mortgageTerms.getByIdForUser(id, userId);
      if (!term) {
        return sendError(res, 404, "Term not found");
      }

      const result = await services.paymentFrequency.calculateFrequencyChangeImpact(
        term.mortgage.id,
        id,
        userId,
        newFrequency
      );

      if (!result) {
        return sendError(res, 404, "Mortgage or term not found");
      }

      res.json(result);
    } catch (error) {
      sendError(res, 500, "Failed to calculate frequency change", error);
    }
  });

  router.post("/mortgage-terms/:id/frequency-change/apply", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;
      const { newFrequency, changeDate } = req.body;

      if (!newFrequency) {
        return sendError(res, 400, "New frequency is required");
      }

      const term = await services.mortgageTerms.getByIdForUser(id, userId);
      if (!term) {
        return sendError(res, 404, "Term not found");
      }

      const result = await services.paymentFrequency.applyFrequencyChange(
        term.mortgage.id,
        id,
        userId,
        {
          mortgageId: term.mortgage.id,
          termId: id,
          newFrequency,
          changeDate,
        }
      );

      if (!result) {
        return sendError(res, 404, "Mortgage or term not found, or change cannot be applied");
      }

      res.json(result);
    } catch (error) {
      sendError(res, 500, "Failed to apply frequency change", error);
    }
  });

  router.get("/mortgages/:id/frequency-changes", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;

      const history = await services.paymentFrequency.getFrequencyChangeHistory(id, userId);

      if (history === undefined) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(history);
    } catch (error) {
      sendError(res, 500, "Failed to get frequency change history", error);
    }
  });

  // Mortgage Portability endpoints
  router.post("/mortgages/:id/portability/calculate", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;
      const { newPropertyPrice, portDate } = req.body;

      if (!newPropertyPrice || newPropertyPrice <= 0) {
        return sendError(res, 400, "New property price is required and must be greater than zero");
      }

      const result = await services.portability.calculatePortability(id, userId, {
        mortgageId: id,
        newPropertyPrice: parseFloat(newPropertyPrice),
        portDate,
      });

      if (!result) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(result);
    } catch (error) {
      sendError(res, 500, "Failed to calculate portability", error);
    }
  });

  router.post("/mortgages/:id/portability/apply", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;
      const { newPropertyPrice, portDate } = req.body;

      if (!newPropertyPrice || newPropertyPrice <= 0) {
        return sendError(res, 400, "New property price is required and must be greater than zero");
      }

      const result = await services.portability.applyPortability(id, userId, {
        mortgageId: id,
        newPropertyPrice: parseFloat(newPropertyPrice),
        portDate,
      });

      if (!result) {
        return sendError(res, 404, "Mortgage not found or portability cannot be applied");
      }

      res.json(result);
    } catch (error) {
      sendError(res, 500, "Failed to apply portability", error);
    }
  });

  router.get("/mortgages/:id/portability/history", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;

      const history = await services.portability.getPortabilityHistory(id, userId);

      if (history === undefined) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(history);
    } catch (error) {
      sendError(res, 500, "Failed to get portability history", error);
    }
  });

  // Property Value Tracking endpoints
  router.post("/mortgages/:id/property-value", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;
      const { propertyValue, valueDate, source, notes } = req.body;

      if (!propertyValue || propertyValue <= 0) {
        return sendError(res, 400, "Property value is required and must be greater than zero");
      }

      const result = await services.propertyValue.updatePropertyValue(id, userId, {
        mortgageId: id,
        propertyValue: parseFloat(propertyValue),
        valueDate,
        source,
        notes,
      });

      if (!result) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(result);
    } catch (error) {
      sendError(res, 500, "Failed to update property value", error);
    }
  });

  router.get("/mortgages/:id/property-value/history", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;

      const history = await services.propertyValue.getPropertyValueHistory(id, userId);

      if (history === undefined) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(history);
    } catch (error) {
      sendError(res, 500, "Failed to get property value history", error);
    }
  });

  // Renewal Workflow endpoints
  router.post("/mortgages/:id/renewal/start", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;

      const result = await services.renewalWorkflow.startRenewalWorkflow(id, userId);

      if (!result) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(result);
    } catch (error) {
      sendError(res, 500, "Failed to start renewal workflow", error);
    }
  });

  router.post("/mortgages/:id/renewal/negotiations", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;
      const { termId, negotiationDate, offeredRate, negotiatedRate, status, notes } = req.body;

      if (!termId || !status) {
        return sendError(res, 400, "Term ID and status are required");
      }

      const result = await services.renewalWorkflow.trackNegotiation(id, userId, {
        mortgageId: id,
        termId,
        negotiationDate,
        offeredRate: offeredRate ? parseFloat(offeredRate) : undefined,
        negotiatedRate: negotiatedRate ? parseFloat(negotiatedRate) : undefined,
        status,
        notes,
      });

      if (!result) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(result);
    } catch (error) {
      sendError(res, 500, "Failed to track negotiation", error);
    }
  });

  router.get("/mortgages/:id/renewal/options", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;

      const options = await services.renewalWorkflow.compareRenewalOptions(id, userId);

      if (!options) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(options);
    } catch (error) {
      sendError(res, 500, "Failed to get renewal options", error);
    }
  });

  router.get("/mortgages/:id/renewal/negotiations", async (req, res) => {
    try {
      const user = requireUser(req, res);
      if (!user) {
        return sendError(res, 401, "Unauthorized");
      }
      const userId = user.id;
      const { id } = req.params;

      const history = await services.renewalWorkflow.getNegotiationHistory(id, userId);

      if (history === undefined) {
        return sendError(res, 404, "Mortgage not found");
      }

      res.json(history);
    } catch (error) {
      sendError(res, 500, "Failed to get negotiation history", error);
    }
  });

  router.post("/mortgages/:mortgageId/payments/bulk", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { payments } = req.body as { payments: Array<Record<string, unknown>> };

      if (!Array.isArray(payments) || payments.length === 0) {
        sendError(res, 400, "Payments array is required");
        return;
      }

      if (payments.length > 60) {
        sendError(res, 400, "Maximum 60 payments can be created at once");
        return;
      }

      // Validate all payments first (before creating any)
      const validatedPayments = [];
      for (const paymentData of payments) {
        const data = mortgagePaymentCreateSchema.parse({
          ...paymentData,
          mortgageId: req.params.mortgageId,
        });
        const { mortgageId: _mortgageId, ...payload } = data;
        validatedPayments.push(payload);
      }

      // Create all payments in a transaction (all-or-nothing)
      const result = await services.mortgagePayments.createBulk(
        req.params.mortgageId,
        user.id,
        validatedPayments
      );

      res.json(result);
    } catch (error) {
      sendError(res, 400, "Invalid payment data", error);
    }
  });

  // Payment Corrections
  router.post("/mortgage-payments/:paymentId/correct", requireUser, async (req, res) => {
    try {
      const { paymentId } = req.params;
      const userId = req.user!.id;
      const { correctedAmount, reason } = req.body;

      if (!correctedAmount || !reason) {
        return sendError(res, 400, "Missing required fields: correctedAmount, reason");
      }

      const correction = await services.paymentCorrections.correctPayment({
        paymentId,
        correctedAmount: parseFloat(correctedAmount),
        reason,
        correctedBy: userId,
      });

      res.json(correction);
    } catch (error) {
      sendError(res, 400, "Failed to correct payment", error);
    }
  });

  router.get("/mortgage-payments/:paymentId/corrections", requireUser, async (req, res) => {
    try {
      const { paymentId } = req.params;
      const corrections = await services.paymentCorrections.getCorrectionsByPaymentId(paymentId);
      res.json(corrections);
    } catch (error) {
      sendError(res, 400, "Failed to fetch corrections", error);
    }
  });

  // GDS/TDS Ratio Calculator
  router.post("/mortgages/debt-service-ratios", requireUser, async (req, res) => {
    try {
      const {
        mortgagePayment,
        grossIncome,
        propertyTax = 0,
        heatingCosts = 0,
        condoFees = 0,
        otherDebtPayments = 0,
        maxGDS = 39,
        maxTDS = 44,
      } = req.body;

      if (!mortgagePayment || !grossIncome) {
        return sendError(res, 400, "Missing required fields: mortgagePayment, grossIncome");
      }

      const { calculateGDS, calculateTDS, calculateHousingCosts, getDebtServiceRatioStatus } =
        await import("@domain/calculations/debt-service-ratios");

      const housingCosts = calculateHousingCosts(
        parseFloat(mortgagePayment),
        parseFloat(propertyTax || 0),
        parseFloat(heatingCosts || 0),
        parseFloat(condoFees || 0)
      );

      const gds = calculateGDS(housingCosts, parseFloat(grossIncome));
      const tds = calculateTDS(
        housingCosts,
        parseFloat(otherDebtPayments || 0),
        parseFloat(grossIncome)
      );

      const status = getDebtServiceRatioStatus(gds, tds, maxGDS, maxTDS);

      res.json({
        gds,
        tds,
        housingCosts,
        monthlyIncome: parseFloat(grossIncome) / 12,
        ...status,
      });
    } catch (error) {
      sendError(res, 400, "Failed to calculate debt service ratios", error);
    }
  });

  // Stress Test Calculator (B-20 Guidelines)
  router.post("/mortgages/stress-test", requireUser, async (req, res) => {
    try {
      const {
        mortgageAmount,
        contractRate,
        amortizationMonths,
        grossIncome,
        otherHousingCosts = 0,
        otherDebtPayments = 0,
        maxGDS = 39,
        maxTDS = 44,
      } = req.body;

      if (!mortgageAmount || !contractRate || !amortizationMonths || !grossIncome) {
        return sendError(
          res,
          400,
          "Missing required fields: mortgageAmount, contractRate, amortizationMonths, grossIncome"
        );
      }

      const { checkStressTest, calculateMaximumMortgageAmount } =
        await import("@domain/calculations/stress-test");

      const stressTestResult = checkStressTest(
        parseFloat(mortgageAmount),
        parseFloat(contractRate) / 100, // Convert percentage to decimal
        parseInt(amortizationMonths),
        parseFloat(grossIncome),
        parseFloat(otherHousingCosts || 0),
        parseFloat(otherDebtPayments || 0),
        parseFloat(maxGDS || 39),
        parseFloat(maxTDS || 44)
      );

      const maxMortgage = calculateMaximumMortgageAmount(
        parseFloat(grossIncome),
        parseFloat(contractRate) / 100,
        parseInt(amortizationMonths),
        parseFloat(otherHousingCosts || 0),
        parseFloat(otherDebtPayments || 0),
        parseFloat(maxGDS || 39),
        parseFloat(maxTDS || 44)
      );

      res.json({
        ...stressTestResult,
        maxMortgageAmount: maxMortgage.maxMortgageAmount,
        recommendations: {
          ...(stressTestResult.passes
            ? {}
            : {
                message:
                  "Mortgage does not pass stress test. Consider reducing mortgage amount or increasing income.",
                suggestions: [
                  stressTestResult.gdsPass
                    ? null
                    : "Reduce mortgage amount or increase income to meet GDS requirements",
                  stressTestResult.tdsPass
                    ? null
                    : "Reduce total debt or increase income to meet TDS requirements",
                ].filter(Boolean),
              }),
        },
      });
    } catch (error) {
      sendError(res, 400, "Failed to calculate stress test", error);
    }
  });

  // Mortgage Payoff
  router.post("/mortgages/:mortgageId/payoff", requireUser, async (req, res) => {
    try {
      const { mortgageId } = req.params;
      const userId = req.user!.id;
      const { payoffDate, finalPaymentAmount, remainingBalance, penaltyAmount, notes } = req.body;

      // Verify mortgage belongs to user
      const mortgage = await services.mortgages.getByIdForUser(mortgageId, userId);
      if (!mortgage) {
        return sendError(res, 404, "Mortgage not found");
      }

      if (!payoffDate || !finalPaymentAmount || remainingBalance === undefined) {
        return sendError(
          res,
          400,
          "Missing required fields: payoffDate, finalPaymentAmount, remainingBalance"
        );
      }

      const result = await services.mortgagePayoff.recordPayoff({
        mortgageId,
        payoffDate,
        finalPaymentAmount: parseFloat(finalPaymentAmount),
        remainingBalance: parseFloat(remainingBalance),
        penaltyAmount: penaltyAmount ? parseFloat(penaltyAmount) : 0,
        notes: notes || undefined,
      });

      res.json(result);
    } catch (error) {
      sendError(res, 400, "Failed to record mortgage payoff", error);
    }
  });

  router.get("/mortgages/:mortgageId/payoff/history", requireUser, async (req, res) => {
    try {
      const { mortgageId } = req.params;
      const userId = req.user!.id;

      // Verify mortgage belongs to user
      const mortgage = await services.mortgages.getByIdForUser(mortgageId, userId);
      if (!mortgage) {
        return sendError(res, 404, "Mortgage not found");
      }

      const history = await services.mortgagePayoff.getPayoffHistory(mortgageId);
      res.json(history);
    } catch (error) {
      sendError(res, 400, "Failed to fetch payoff history", error);
    }
  });

  // Payment Amount Change Events
  router.get("/mortgages/:mortgageId/payment-amount-changes", requireUser, async (req, res) => {
    try {
      const { mortgageId } = req.params;
      const changes = await services.paymentAmountChange.getPaymentAmountChangeHistory(mortgageId);
      res.json(changes);
    } catch (error) {
      sendError(res, 400, "Failed to fetch payment amount changes", error);
    }
  });

  router.get("/mortgage-terms/:termId/payment-amount-changes", requireUser, async (req, res) => {
    try {
      const { termId } = req.params;
      const changes =
        await services.paymentAmountChange.getPaymentAmountChangeHistoryByTerm(termId);
      res.json(changes);
    } catch (error) {
      sendError(res, 400, "Failed to fetch payment amount changes", error);
    }
  });

  router.delete("/mortgage-payments/:paymentId", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.mortgagePayments.delete(req.params.paymentId, user.id);
    if (!deleted) {
      sendError(res, 404, "Payment not found or not authorized");
      return;
    }
    res.json({ success: true });
  });

  router.post("/mortgages/:mortgageId/terms/:termId/skip-payment", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { paymentDate, maxSkipsPerYear = 2 } = req.body as {
        paymentDate: string;
        maxSkipsPerYear?: number;
      };

      if (!paymentDate) {
        sendError(res, 400, "paymentDate is required");
        return;
      }

      const skippedPayment = await services.mortgagePayments.skipPayment(
        req.params.mortgageId,
        req.params.termId,
        user.id,
        paymentDate,
        maxSkipsPerYear
      );

      if (!skippedPayment) {
        sendError(res, 404, "Mortgage or term not found");
        return;
      }

      res.json({
        payment: skippedPayment,
        message: `Payment skipped. Interest accrued: $${Number(skippedPayment.skippedInterestAccrued).toFixed(2)}. New balance: $${Number(skippedPayment.remainingBalance).toFixed(2)}`,
      });
    } catch (error) {
      sendError(res, 400, "Failed to skip payment", error);
    }
  });

  // Amortization projection endpoint - uses the authoritative Canadian mortgage calculation engine
  const projectionSchema = z.object({
    currentBalance: z.number().positive(),
    annualRate: z.number().min(0).max(1), // As decimal, e.g., 0.0549 for 5.49%
    amortizationMonths: z.number().int().positive(),
    paymentFrequency: z
      .enum([
        "monthly",
        "semi-monthly",
        "biweekly",
        "accelerated-biweekly",
        "weekly",
        "accelerated-weekly",
      ])
      .default("monthly"),
    actualPaymentAmount: z.number().positive().optional(), // User's actual payment amount (use instead of recalculating)
    monthlyPrepayAmount: z.number().min(0).default(0),
    prepaymentEvents: z
      .array(
        z.object({
          type: z.enum(["annual", "one-time", "monthly-percent"]),
          amount: z.number().min(0),
          startPaymentNumber: z.number().int().min(1).default(1),
          recurrenceMonth: z.number().int().min(1).max(12).optional(),
          monthlyPercent: z.number().min(0).max(100).optional(),
        })
      )
      .default([]),
    refinancingEvents: z
      .array(
        z.object({
          refinancingYear: z.number().int().min(1).optional(),
          atTermEnd: z.boolean().optional(),
          newRate: z.number().min(0).max(1), // As decimal, e.g., 0.0549 for 5.49%
          termType: z.enum(["fixed", "variable-changing", "variable-fixed"]),
          newAmortizationMonths: z.number().int().min(1).optional(),
          paymentFrequency: z
            .enum([
              "monthly",
              "semi-monthly",
              "biweekly",
              "accelerated-biweekly",
              "weekly",
              "accelerated-weekly",
            ])
            .optional(),
        })
      )
      .default([]),
    rateOverride: z.number().min(0).max(1).optional(), // Optional rate override for scenario modeling
    mortgageId: z.string().optional(), // Optional: include historical payments
    scenarioId: z.string().optional(), // Optional: fetch refinancing events from scenario
  });

  router.post("/mortgages/projection", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = projectionSchema.parse(req.body);

      // Use rate override if provided, otherwise use the passed annualRate
      let effectiveRate = data.rateOverride ?? data.annualRate;
      let projectionFrequency = data.paymentFrequency as PaymentFrequency;
      let basePaymentOverride = data.actualPaymentAmount;
      let termRenewals: TermRenewal[] = [];
      let mortgageTerms: MortgageTerm[] = [];

      // Fetch historical payments first to determine projection start date
      let historicalPayments: any[] = [];
      let lastPaymentDate: Date | null = null;
      let lastPaymentBalance: number = data.currentBalance;

      if (data.mortgageId) {
        const mortgageRecord = await services.mortgages.getByIdForUser(data.mortgageId, user.id);
        if (!mortgageRecord) {
          sendError(res, 404, "Mortgage not found");
          return;
        }

        mortgageTerms =
          (await services.mortgageTerms.listForMortgage(data.mortgageId, user.id)) ?? [];

        historicalPayments =
          (await services.mortgagePayments.listByMortgage(data.mortgageId, user.id)) || [];

        if (historicalPayments.length > 0) {
          // Sort by date to find the last payment
          historicalPayments.sort(
            (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
          );
          const lastPayment = historicalPayments[historicalPayments.length - 1];
          lastPaymentDate = new Date(lastPayment.paymentDate);
          lastPaymentBalance = Number(lastPayment.remainingBalance || data.currentBalance);
        }

        if (mortgageTerms.length > 0) {
          const sortedTerms = [...mortgageTerms].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
          const referenceDate = lastPaymentDate ?? new Date();
          const frequencyTerm =
            getActiveTermForDate(sortedTerms, referenceDate) ?? sortedTerms[sortedTerms.length - 1];
          if (frequencyTerm) {
            projectionFrequency = frequencyTerm.paymentFrequency as PaymentFrequency;
          }
        }
      }

      // Calculate projection start date: day after last payment, or today if no payments
      const projectionStartDate = lastPaymentDate
        ? advanceDateByFrequency(lastPaymentDate, projectionFrequency)
        : new Date();

      if (mortgageTerms.length > 0) {
        const sortedTerms = [...mortgageTerms].sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        const activeTerm =
          getActiveTermForDate(sortedTerms, projectionStartDate) ??
          sortedTerms[sortedTerms.length - 1];
        if (activeTerm) {
          if (!data.rateOverride) {
            effectiveRate = getTermEffectiveRate(activeTerm);
          }
          if (!data.actualPaymentAmount) {
            basePaymentOverride = Number(activeTerm.regularPaymentAmount);
          }
          termRenewals = buildTermRenewalsRelativeToProjection(
            sortedTerms,
            projectionStartDate,
            projectionFrequency
          );
        }
      }

      // Fetch and process refinancing events from scenario if provided
      let refinancingEventsFromScenario: any[] = [];
      if (data.scenarioId) {
        const scenarioRefinancingEvents = await services.refinancingEvents.list(
          data.scenarioId,
          user.id
        );
        if (scenarioRefinancingEvents) {
          refinancingEventsFromScenario = scenarioRefinancingEvents;
        }
      }

      // Merge refinancing events from request and scenario
      const allRefinancingEvents = [
        ...data.refinancingEvents,
        ...refinancingEventsFromScenario.map((event) => ({
          refinancingYear: event.refinancingYear ?? undefined,
          atTermEnd: event.atTermEnd === 1 || event.atTermEnd === true,
          newRate: Number(event.newRate), // Already stored as decimal (e.g., 0.0549 for 5.49%)
          termType: event.termType,
          newAmortizationMonths: event.newAmortizationMonths ?? undefined,
          paymentFrequency: (event.paymentFrequency ?? undefined) as PaymentFrequency | undefined,
        })),
      ];

      // Convert refinancing events to TermRenewal format
      const refinancingTermRenewals: TermRenewal[] = [];
      const paymentsPerYear = getPaymentsPerYear(projectionFrequency);
      const mortgageStartDate =
        data.mortgageId && mortgageTerms.length > 0
          ? new Date(
              mortgageTerms.sort(
                (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
              )[0].startDate
            )
          : projectionStartDate;

      for (const refinancingEvent of allRefinancingEvents) {
        let startPaymentNumber: number;

        if (refinancingEvent.atTermEnd) {
          // Term-end based: find the next term end date after projection start
          if (mortgageTerms.length === 0) {
            // No terms, skip term-end refinancing
            continue;
          }

          const sortedTerms = [...mortgageTerms].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );

          // Find the next term that ends after projection start
          const nextTermEnd = sortedTerms.find(
            (term) => new Date(term.endDate) > projectionStartDate
          );

          if (!nextTermEnd) {
            // No future term ends, skip
            continue;
          }

          startPaymentNumber = calculatePaymentNumberFromDates(
            projectionStartDate,
            new Date(nextTermEnd.endDate),
            projectionFrequency
          );
        } else if (refinancingEvent.refinancingYear) {
          // Year-based: calculate payment number from refinancingYear
          // refinancingYear is relative to mortgage start
          const refinancingDate = new Date(mortgageStartDate);
          refinancingDate.setFullYear(
            refinancingDate.getFullYear() + refinancingEvent.refinancingYear - 1
          );

          // Adjust relative to projection start
          if (refinancingDate <= projectionStartDate) {
            // Refinancing year is in the past relative to projection, skip
            continue;
          }

          startPaymentNumber = calculatePaymentNumberFromDates(
            projectionStartDate,
            refinancingDate,
            projectionFrequency
          );
        } else {
          // Invalid refinancing event (neither atTermEnd nor refinancingYear)
          continue;
        }

        // Calculate new payment amount if term type changes
        // const refinancingFrequency = refinancingEvent.paymentFrequency ?? projectionFrequency;
        const refinancingAmortization =
          refinancingEvent.newAmortizationMonths ?? data.amortizationMonths;

        // Payment recalculation logic:
        // - For fixed and variable-changing: Leave undefined to let schedule generation recalculate
        //   using the actual balance at the refinancing point (more accurate than using starting balance)
        // - For variable-fixed: Also leave undefined for now - the schedule will need to handle
        //   keeping the current payment amount (this may need additional logic in schedule generation)
        //
        // Note: We don't set newPaymentAmount here because we don't know the exact balance at the
        // refinancing point. The amortization schedule generation will recalculate it correctly using
        // the actual remaining balance when it reaches that payment number.
        const newPaymentAmount = undefined;

        refinancingTermRenewals.push({
          startPaymentNumber,
          newRate: refinancingEvent.newRate,
          newPaymentAmount,
          originalAmortizationMonths:
            refinancingAmortization !== data.amortizationMonths
              ? data.amortizationMonths
              : undefined,
          extendedAmortizationMonths:
            refinancingAmortization > data.amortizationMonths ? refinancingAmortization : undefined,
        });
      }

      // Merge refinancing term renewals with existing term renewals
      // Refinancing events take precedence if they occur at the same payment number
      const mergedTermRenewals = [...termRenewals];
      for (const refinancingRenewal of refinancingTermRenewals) {
        const existingIndex = mergedTermRenewals.findIndex(
          (r) => r.startPaymentNumber === refinancingRenewal.startPaymentNumber
        );
        if (existingIndex >= 0) {
          // Replace existing renewal with refinancing renewal
          mergedTermRenewals[existingIndex] = refinancingRenewal;
        } else {
          // Add new refinancing renewal
          mergedTermRenewals.push(refinancingRenewal);
        }
      }

      // Sort by startPaymentNumber
      mergedTermRenewals.sort((a, b) => a.startPaymentNumber - b.startPaymentNumber);
      termRenewals = mergedTermRenewals;

      // Use actual payment amount if provided, otherwise calculate based on rate
      // IMPORTANT: Use lastPaymentBalance (not data.currentBalance) for accurate payment calculation
      // This ensures the payment is calculated from the actual balance at projection start
      const basePayment =
        basePaymentOverride ??
        calculatePayment(
          lastPaymentBalance,
          effectiveRate,
          data.amortizationMonths,
          projectionFrequency
        );

      // Convert prepayment events to calculation engine format
      const prepayments: CalcPrepaymentEvent[] = [];

      // Calculate how many payments have been made historically
      // This is needed to adjust startPaymentNumber relative to projection start
      const historicalPaymentCount = historicalPayments.length;
      // paymentsPerYear already declared above for refinancing events

      // Add monthly prepayment as a percentage of the base payment
      if (data.monthlyPrepayAmount > 0 && basePayment > 0) {
        // Calculate what percentage of the base payment this represents
        const monthlyPrepayPercent = (data.monthlyPrepayAmount / basePayment) * 100;
        prepayments.push({
          type: "monthly-percent",
          amount: 0, // Not used for monthly-percent type
          startPaymentNumber: 1, // Always starts from projection start
          monthlyPercent: monthlyPrepayPercent,
        });
      }

      // Add configured prepayment events
      for (const event of data.prepaymentEvents) {
        // Adjust startPaymentNumber relative to projection start
        // startPaymentNumber is relative to mortgage start, but projection paymentNumber starts at 1
        // So we subtract historicalPaymentCount to get the relative payment number in the projection
        let adjustedStartPaymentNumber = event.startPaymentNumber;

        if (event.startPaymentNumber > historicalPaymentCount) {
          // Prepayment hasn't occurred yet, adjust relative to projection start
          adjustedStartPaymentNumber = event.startPaymentNumber - historicalPaymentCount;
        } else {
          // Prepayment already occurred in historical payments
          // For annual events, calculate when the next occurrence should be
          if (event.type === "annual") {
            // For annual events, calculate when the next occurrence should be
            // Find the next year when this prepayment should occur
            const yearsSinceStart = Math.floor(
              (historicalPaymentCount - event.startPaymentNumber) / paymentsPerYear
            );
            const nextOccurrenceYear = yearsSinceStart + 1;
            // Calculate the payment number for the next occurrence
            // This should be: original startPaymentNumber + (nextOccurrenceYear * paymentsPerYear)
            // Then adjust relative to projection start
            const nextOccurrencePaymentNumber =
              event.startPaymentNumber + nextOccurrenceYear * paymentsPerYear;
            adjustedStartPaymentNumber = nextOccurrencePaymentNumber - historicalPaymentCount;
            // Ensure it's positive
            if (adjustedStartPaymentNumber <= 0) {
              adjustedStartPaymentNumber = 1; // Apply in first payment of projection
            }
          } else {
            // One-time event already occurred, skip it
            continue;
          }
        }

        prepayments.push({
          type: event.type,
          amount: event.amount,
          startPaymentNumber: adjustedStartPaymentNumber,
          recurrenceMonth: event.recurrenceMonth,
          monthlyPercent: event.monthlyPercent,
        });
      }

      // Validate starting balance
      if (lastPaymentBalance <= 0) {
        sendError(res, 400, "Cannot generate projection: mortgage balance is zero or negative.");
        return;
      }

      // Validate base payment amount
      if (!basePayment || basePayment <= 0) {
        console.error("Invalid basePayment:", {
          basePayment,
          basePaymentOverride,
          actualPaymentAmount: data.actualPaymentAmount,
          lastPaymentBalance,
          effectiveRate,
          amortizationMonths: data.amortizationMonths,
        });
        sendError(
          res,
          400,
          "Cannot generate projection: payment amount is zero or invalid. Please ensure your mortgage has a valid payment amount."
        );
        return;
      }

      // Generate amortization schedule using the authoritative calculation engine
      // Start from the balance AFTER last payment, from projection start date
      const schedule = generateAmortizationScheduleWithPayment(
        lastPaymentBalance,
        effectiveRate,
        data.amortizationMonths,
        projectionFrequency,
        projectionStartDate,
        basePayment,
        prepayments,
        termRenewals,
        360 // Max 30 years
      );

      // Aggregate historical payments by year
      const historicalYearlyMap = new Map<
        number,
        {
          totalPaid: number;
          principalPaid: number;
          interestPaid: number;
          endingBalance: number;
          lastPaymentMonth: number;
        }
      >();

      for (const payment of historicalPayments) {
        const paymentDate = new Date(payment.paymentDate);
        const year = paymentDate.getFullYear();
        const month = paymentDate.getMonth();

        const existing = historicalYearlyMap.get(year) || {
          totalPaid: 0,
          principalPaid: 0,
          interestPaid: 0,
          endingBalance: 0,
          lastPaymentMonth: -1,
        };

        existing.totalPaid += Number(payment.paymentAmount || 0);
        existing.principalPaid += Number(payment.principalPaid || 0);
        existing.interestPaid += Number(payment.interestPaid || 0);
        existing.endingBalance = Number(payment.remainingBalance || 0);
        existing.lastPaymentMonth = Math.max(existing.lastPaymentMonth, month);

        historicalYearlyMap.set(year, existing);
      }

      // Find years that need projected data to complete them
      const currentCalendarYear = new Date().getFullYear();
      const yearsNeedingCompletion = new Set<number>();

      // Check if there are any prepayment events configured
      const hasPrepaymentEvents = data.prepaymentEvents && data.prepaymentEvents.length > 0;

      Array.from(historicalYearlyMap.entries()).forEach(([year, yearData]) => {
        // If historical data doesn't cover the full year (month 11 = December), mark for completion
        if (yearData.lastPaymentMonth < 11 && year >= currentCalendarYear) {
          yearsNeedingCompletion.add(year);
        }
        // If prepayment events are configured, we need to re-project historical years
        // to include prepayment events in the scenario projection
        // This ensures scenario projections show "what if" prepayment events were applied
        if (hasPrepaymentEvents && year >= currentCalendarYear) {
          yearsNeedingCompletion.add(year);
        }
      });

      // Aggregate projected payments by year
      const projectedYearlyMap = new Map<
        number,
        {
          totalPaid: number;
          principalPaid: number;
          interestPaid: number;
          endingBalance: number;
        }
      >();

      for (const payment of schedule.payments) {
        const paymentYear = payment.paymentDate.getFullYear();

        const existing = projectedYearlyMap.get(paymentYear) || {
          totalPaid: 0,
          principalPaid: 0,
          interestPaid: 0,
          endingBalance: 0,
        };

        existing.totalPaid += payment.paymentAmount + payment.extraPrepayment;
        existing.principalPaid += payment.totalPrincipalPayment;
        existing.interestPaid += payment.interestPayment;
        existing.endingBalance = payment.remainingBalance;

        projectedYearlyMap.set(paymentYear, existing);
      }

      // Build final yearly data, merging historical + projected for incomplete years
      const yearlyData: Array<{
        year: number;
        totalPaid: number;
        principalPaid: number;
        interestPaid: number;
        endingBalance: number;
        isHistorical: boolean;
      }> = [];

      // Get all years we have data for
      const allYearsArr = [
        ...Array.from(historicalYearlyMap.keys()),
        ...Array.from(projectedYearlyMap.keys()),
      ];
      const allYears = new Set(allYearsArr);
      const sortedYears = Array.from(allYears).sort((a, b) => a - b);

      for (const year of sortedYears) {
        const historical = historicalYearlyMap.get(year);
        const projected = projectedYearlyMap.get(year);

        if (historical && yearsNeedingCompletion.has(year) && projected) {
          // Merge historical + projected for this year
          yearlyData.push({
            year,
            totalPaid: Math.round(historical.totalPaid + projected.totalPaid),
            principalPaid: Math.round(historical.principalPaid + projected.principalPaid),
            interestPaid: Math.round(historical.interestPaid + projected.interestPaid),
            endingBalance: Math.round(projected.endingBalance), // Use projected end balance
            isHistorical: true, // Mark as historical since it includes logged data
          });
        } else if (historical && projected && hasPrepaymentEvents) {
          // For scenario projections with prepayment events, merge historical + projected
          // even for complete historical years, so prepayment events are included
          // This shows "what if" prepayment events were applied to historical years
          yearlyData.push({
            year,
            totalPaid: Math.round(historical.totalPaid + projected.totalPaid),
            principalPaid: Math.round(historical.principalPaid + projected.principalPaid),
            interestPaid: Math.round(historical.interestPaid + projected.interestPaid),
            endingBalance: Math.round(projected.endingBalance), // Use projected end balance
            isHistorical: true, // Mark as historical since it includes logged data
          });
        } else if (historical) {
          // Pure historical year (no prepayment events or no projected data)
          yearlyData.push({
            year,
            totalPaid: Math.round(historical.totalPaid),
            principalPaid: Math.round(historical.principalPaid),
            interestPaid: Math.round(historical.interestPaid),
            endingBalance: Math.round(historical.endingBalance),
            isHistorical: true,
          });
        } else if (projected) {
          // Pure projected year
          yearlyData.push({
            year,
            totalPaid: Math.round(projected.totalPaid),
            principalPaid: Math.round(projected.principalPaid),
            interestPaid: Math.round(projected.interestPaid),
            endingBalance: Math.round(projected.endingBalance),
            isHistorical: false,
          });
        }
      }

      // Generate chart data (every 2 years)
      const chartData: Array<{
        year: number;
        balance: number;
        principal: number;
        interest: number;
      }> = [];

      // Calculate payments per 2 years based on actual payment frequency
      // paymentsPerYear already declared above
      const paymentsPerTwoYears = paymentsPerYear * 2;

      let cumulativePrincipal = 0;
      let cumulativeInterest = 0;

      for (let i = 0; i < schedule.payments.length; i++) {
        const payment = schedule.payments[i];
        cumulativePrincipal += payment.totalPrincipalPayment;
        cumulativeInterest += payment.interestPayment;

        // Add data point every 2 years worth of payments (based on actual frequency)
        if (i % paymentsPerTwoYears === 0) {
          const yearsFromNow = i / paymentsPerYear;
          chartData.push({
            year: Math.round(yearsFromNow * 10) / 10, // Round to 1 decimal place
            balance: Math.round(payment.remainingBalance),
            principal: Math.round(cumulativePrincipal),
            interest: Math.round(cumulativeInterest),
          });
        }
      }

      // Ensure final point is included
      if (schedule.payments.length > 0) {
        // const lastPayment = schedule.payments[schedule.payments.length - 1];
        const finalYears = schedule.payments.length / paymentsPerYear;
        const finalYearsRounded = Math.round(finalYears * 10) / 10;

        // Only add final point if it's different from the last point or if chart is empty
        const lastChartPoint = chartData[chartData.length - 1];
        if (
          chartData.length === 0 ||
          (lastChartPoint &&
            (lastChartPoint.balance > 0 || Math.abs(lastChartPoint.year - finalYearsRounded) > 0.1))
        ) {
          chartData.push({
            year: finalYearsRounded,
            balance: 0,
            principal: Math.round(schedule.summary.totalPrincipal),
            interest: Math.round(schedule.summary.totalInterest),
          });
        }
      }

      // Calculate baseline (no prepayments) for interest savings comparison
      // Use lastPaymentBalance to match the main projection, ensuring accurate interest savings calculation
      const baselineSchedule = generateAmortizationSchedule(
        lastPaymentBalance,
        effectiveRate,
        data.amortizationMonths,
        projectionFrequency,
        projectionStartDate,
        [], // No prepayments
        [],
        360
      );

      // Validate schedule was generated successfully
      if (!schedule || !schedule.payments || schedule.payments.length === 0) {
        console.error("Schedule generation failed:", {
          scheduleExists: !!schedule,
          paymentsLength: schedule?.payments?.length || 0,
          lastPaymentBalance,
          effectiveRate,
          amortizationMonths: data.amortizationMonths,
          projectionFrequency,
          basePayment,
          prepaymentsCount: prepayments.length,
          termRenewalsCount: termRenewals.length,
        });
        sendError(
          res,
          400,
          "Failed to generate amortization schedule. Please check your mortgage and refinancing event configuration."
        );
        return;
      }

      // Validate baseline schedule was generated successfully
      if (
        !baselineSchedule ||
        !baselineSchedule.payments ||
        baselineSchedule.payments.length === 0
      ) {
        console.error("Baseline schedule generation failed:", {
          baselineScheduleExists: !!baselineSchedule,
          paymentsLength: baselineSchedule?.payments?.length || 0,
          lastPaymentBalance,
          effectiveRate,
          amortizationMonths: data.amortizationMonths,
        });
        sendError(res, 400, "Failed to generate baseline amortization schedule.");
        return;
      }

      // Note: If schedule has payments but totalInterest is 0, this may indicate a calculation issue

      const interestSaved = Math.max(
        0,
        baselineSchedule.summary.totalInterest - schedule.summary.totalInterest
      );
      // Calculate projected payoff years using correct payments per year for the payment frequency
      // paymentsPerYear already declared above
      // Use schedule summary payoff date if available, otherwise calculate from payment count
      let projectedPayoffYears = 0;
      if (schedule.summary.payoffDate) {
        // Calculate years from projection start to payoff date
        const payoffDate = new Date(schedule.summary.payoffDate);
        const yearsDiff =
          (payoffDate.getTime() - projectionStartDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        projectedPayoffYears = Math.max(0, yearsDiff);
      } else if (schedule.payments.length > 0) {
        // Fallback: calculate from payment count
        // Find the last payment with balance > 0.01 to estimate payoff
        const lastPaymentWithBalance = [...schedule.payments]
          .reverse()
          .find((p) => p.remainingBalance > 0.01);
        if (lastPaymentWithBalance) {
          // Estimate: use payment number to calculate years
          projectedPayoffYears = lastPaymentWithBalance.paymentNumber / paymentsPerYear;
        } else {
          // Balance already paid off, use last payment
          const lastPayment = schedule.payments[schedule.payments.length - 1];
          if (lastPayment) {
            projectedPayoffYears = lastPayment.paymentNumber / paymentsPerYear;
          } else {
            // Fallback to payment count if paymentNumber is not available
            projectedPayoffYears = schedule.payments.length / paymentsPerYear;
          }
        }
      }

      // Ensure we have a valid projected payoff (should never be 0 if schedule has payments)
      if (projectedPayoffYears === 0 && schedule.payments.length > 0) {
        // Last resort: use the last payment's payment number or total payment count
        const lastPayment = schedule.payments[schedule.payments.length - 1];
        if (lastPayment && lastPayment.paymentNumber > 0) {
          projectedPayoffYears = lastPayment.paymentNumber / paymentsPerYear;
        } else {
          projectedPayoffYears = schedule.payments.length / paymentsPerYear;
        }
      }

      // Round to 1 decimal place
      projectedPayoffYears = Math.round(projectedPayoffYears * 10) / 10;

      // Final validation: ensure we have valid summary values
      if (projectedPayoffYears === 0 && schedule.payments.length > 0) {
        // This should never happen, but if it does, log a warning and use a fallback
        console.warn(
          "Projected payoff is 0 but schedule has payments. Schedule length:",
          schedule.payments.length
        );
        // Use the last payment's payment number as fallback
        const lastPayment = schedule.payments[schedule.payments.length - 1];
        if (lastPayment && lastPayment.paymentNumber > 0) {
          projectedPayoffYears = lastPayment.paymentNumber / paymentsPerYear;
        } else {
          projectedPayoffYears = schedule.payments.length / paymentsPerYear;
        }
        projectedPayoffYears = Math.round(projectedPayoffYears * 10) / 10;
      }

      res.json({
        yearlyData,
        chartData,
        summary: {
          projectedPayoff: projectedPayoffYears,
          totalInterest: Math.round(schedule.summary.totalInterest),
          totalPrincipal: Math.round(schedule.summary.totalPrincipal),
          interestSaved: Math.round(interestSaved),
          totalPayments: schedule.summary.totalPayments,
          payoffDate: schedule.summary.payoffDate,
        },
        effectiveRate: effectiveRate * 100, // Return as percentage for display
      });
    } catch (error) {
      sendError(res, 400, "Invalid projection parameters", error);
    }
  });
}
