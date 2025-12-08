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
async function ensurePrimeRate<T extends { termType?: string; primeRate?: string | number; startDate?: string }>(payload: T): Promise<T> {
  if (payload.termType && payload.termType.startsWith("variable") && (payload.primeRate == null || payload.primeRate === "")) {
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
            const rates = data.observations
              .map((obs: any) => ({ date: obs.d, rate: parseFloat(obs.V121796.v) }))
              .filter((r: any) => r.date <= payload.startDate)
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            if (rates.length > 0) {
              console.log(`[ensurePrimeRate] Using historical rate ${rates[0].rate}% for startDate ${payload.startDate}`);
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
            const rates = wideData.observations
              .map((obs: any) => ({ date: obs.d, rate: parseFloat(obs.V121796.v) }))
              .filter((r: any) => r.date <= payload.startDate)
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            if (rates.length > 0) {
              console.log(`[ensurePrimeRate] Using historical rate ${rates[0].rate}% for startDate ${payload.startDate} (from wider range)`);
              return { ...payload, primeRate: rates[0].rate.toFixed(3) };
            }
          }
        }
      }
      
      // Fallback to current rate if no startDate or historical fetch failed
      const { primeRate } = await fetchLatestPrimeRate();
      console.log(`[ensurePrimeRate] Using current rate ${primeRate}% (no startDate or historical fetch failed)`);
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
        console.log(`[ensurePrimeRate] Using fallback rate ${fallbackRate}% for startDate ${payload.startDate}`);
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
  frequency: PaymentFrequency,
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
  frequency: PaymentFrequency,
): TermRenewal[] {
  return terms
    .filter((term) => new Date(term.startDate) > projectionStartDate)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .map((term) => ({
      startPaymentNumber: calculatePaymentNumberFromDates(
        projectionStartDate,
        new Date(term.startDate),
        frequency,
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

  router.post("/mortgages", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = mortgageCreateSchema.parse({ ...req.body, userId: user.id });
      const { userId, ...payload } = data;
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
      const { mortgageId, ...payload } = data;
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
      const { 
        newMarketRate, 
        extendedAmortizationMonths,
      } = req.body as { 
        newMarketRate: number; 
        extendedAmortizationMonths?: number;
      };

      if (!newMarketRate || typeof newMarketRate !== "number") {
        sendError(res, 400, "newMarketRate is required and must be a number");
        return;
      }

      // Get the term and mortgage
      const term = await services.mortgageTerms.findById(req.params.id);
      if (!term) {
        sendError(res, 404, "Term not found");
        return;
      }

      // Authorize access
      const mortgage = await services.mortgages.findById(term.mortgageId);
      if (!mortgage || mortgage.userId !== user.id) {
        sendError(res, 404, "Term not found or unauthorized");
        return;
      }

      // Get latest payment to find remaining balance
      const payments = await services.mortgagePayments.findByTermId(term.id);
      const latestPayment = payments.length > 0
        ? payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0]
        : null;

      const remainingBalance = latestPayment
        ? Number(latestPayment.remainingBalance)
        : Number(mortgage.currentBalance);

      // Calculate remaining term months
      const termEndDate = new Date(term.endDate);
      const today = new Date();
      const remainingTermMonths = Math.max(0, Math.ceil((termEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));

      // Get original and remaining amortization
      const originalAmortizationMonths = (mortgage.amortizationYears * 12) + (mortgage.amortizationMonths ?? 0);
      const remainingAmortizationMonths = latestPayment
        ? Number(latestPayment.remainingAmortizationMonths)
        : originalAmortizationMonths;

      // Calculate extended amortization (default to original if not specified)
      const extendedAmort = extendedAmortizationMonths ?? originalAmortizationMonths;

      // Get old rate
      const oldRate = getTermEffectiveRate(term);

      // Calculate blend-and-extend
      const { calculateBlendAndExtend } = await import("@server-shared/calculations/blend-and-extend");
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
      const { mortgageId, ...payload } = data;
      const payment = await services.mortgagePayments.create(
        req.params.mortgageId,
        user.id,
        payload,
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
        const { mortgageId, ...payload } = data;
        validatedPayments.push(payload);
      }

      // Create all payments in a transaction (all-or-nothing)
      const result = await services.mortgagePayments.createBulk(
        req.params.mortgageId,
        user.id,
        validatedPayments,
      );

      res.json(result);
    } catch (error) {
      sendError(res, 400, "Invalid payment data", error);
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
    paymentFrequency: z.enum(['monthly', 'semi-monthly', 'biweekly', 'accelerated-biweekly', 'weekly', 'accelerated-weekly']).default('monthly'),
    actualPaymentAmount: z.number().positive().optional(), // User's actual payment amount (use instead of recalculating)
    monthlyPrepayAmount: z.number().min(0).default(0),
    prepaymentEvents: z.array(z.object({
      type: z.enum(['annual', 'one-time', 'monthly-percent']),
      amount: z.number().min(0),
      startPaymentNumber: z.number().int().min(1).default(1),
      recurrenceMonth: z.number().int().min(1).max(12).optional(),
      monthlyPercent: z.number().min(0).max(100).optional(),
    })).default([]),
    rateOverride: z.number().min(0).max(1).optional(), // Optional rate override for scenario modeling
    mortgageId: z.string().optional(), // Optional: include historical payments
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

        mortgageTerms = (await services.mortgageTerms.listForMortgage(data.mortgageId, user.id)) ?? [];

        historicalPayments = await services.mortgagePayments.listByMortgage(data.mortgageId, user.id) || [];
        
        if (historicalPayments.length > 0) {
          // Sort by date to find the last payment
          historicalPayments.sort((a, b) => 
            new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
          );
          const lastPayment = historicalPayments[historicalPayments.length - 1];
          lastPaymentDate = new Date(lastPayment.paymentDate);
          lastPaymentBalance = Number(lastPayment.remainingBalance || data.currentBalance);
        }

        if (mortgageTerms.length > 0) {
          const sortedTerms = [...mortgageTerms].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
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
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
        const activeTerm = getActiveTermForDate(sortedTerms, projectionStartDate) ?? sortedTerms[sortedTerms.length - 1];
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
            projectionFrequency,
          );
        }
      }
      
      // Use actual payment amount if provided, otherwise calculate based on rate
      const basePayment = basePaymentOverride ?? calculatePayment(
        data.currentBalance,
        effectiveRate,
        data.amortizationMonths,
        projectionFrequency
      );
      
      // Convert prepayment events to calculation engine format
      const prepayments: CalcPrepaymentEvent[] = [];
      
      // Calculate how many payments have been made historically
      // This is needed to adjust startPaymentNumber relative to projection start
      const historicalPaymentCount = historicalPayments.length;
      const paymentsPerYear = getPaymentsPerYear(projectionFrequency);
      
      // Add monthly prepayment as a percentage of the base payment
      if (data.monthlyPrepayAmount > 0 && basePayment > 0) {
        // Calculate what percentage of the base payment this represents
        const monthlyPrepayPercent = (data.monthlyPrepayAmount / basePayment) * 100;
        prepayments.push({
          type: 'monthly-percent',
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
          // Prepayment already occurred in historical payments, skip it
          // For annual events, we might want to apply it in future years
          // For now, skip if it already occurred
          if (event.type === 'annual') {
            // For annual events, calculate when the next occurrence should be
            // Find the next year when this prepayment should occur
            const yearsSinceStart = Math.floor((historicalPaymentCount - event.startPaymentNumber) / paymentsPerYear);
            const nextOccurrenceYear = yearsSinceStart + 1;
            adjustedStartPaymentNumber = (nextOccurrenceYear * paymentsPerYear) - historicalPaymentCount + 1;
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
      const historicalYearlyMap = new Map<number, { 
        totalPaid: number; 
        principalPaid: number; 
        interestPaid: number; 
        endingBalance: number;
        lastPaymentMonth: number;
      }>();

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
      const projectedYearlyMap = new Map<number, { 
        totalPaid: number; 
        principalPaid: number; 
        interestPaid: number; 
        endingBalance: number;
      }>();

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
        ...Array.from(projectedYearlyMap.keys())
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
      const paymentsPerYear = getPaymentsPerYear(projectionFrequency);
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
        const lastPayment = schedule.payments[schedule.payments.length - 1];
        const finalYears = schedule.payments.length / paymentsPerYear;
        const finalYearsRounded = Math.round(finalYears * 10) / 10;
        
        // Only add final point if it's different from the last point or if chart is empty
        const lastChartPoint = chartData[chartData.length - 1];
        if (
          chartData.length === 0 ||
          (lastChartPoint && (
            lastChartPoint.balance > 0 ||
            Math.abs(lastChartPoint.year - finalYearsRounded) > 0.1
          ))
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

      const interestSaved = Math.max(0, baselineSchedule.summary.totalInterest - schedule.summary.totalInterest);
      const projectedPayoffYears = schedule.payments.length / 12;

      res.json({
        yearlyData,
        chartData,
        summary: {
          projectedPayoff: Math.round(projectedPayoffYears * 10) / 10,
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

