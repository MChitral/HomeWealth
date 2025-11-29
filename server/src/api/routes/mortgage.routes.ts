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
import {
  generateAmortizationSchedule,
  generateAmortizationScheduleWithPayment,
  calculatePayment,
  type PaymentFrequency,
  type PrepaymentEvent as CalcPrepaymentEvent,
  type TermRenewal,
} from "../../shared/calculations/mortgage";
import type { MortgageTerm } from "@shared/schema";
import {
  getTermEffectiveRate,
  shouldUpdatePaymentAmount,
} from "@server-shared/calculations/term-helpers";
import { z } from "zod";

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
      res.status(404).json({ error: "Mortgage not found" });
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
      res.status(400).json({ error: "Invalid mortgage data", details: error });
    }
  });

  router.patch("/mortgages/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = mortgageUpdateSchema.parse(req.body);
      const updated = await services.mortgages.update(req.params.id, user.id, data);
      if (!updated) {
        res.status(404).json({ error: "Mortgage not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  router.delete("/mortgages/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.mortgages.delete(req.params.id, user.id);
    if (!deleted) {
      res.status(404).json({ error: "Mortgage not found" });
      return;
    }
    res.json({ success: true });
  });

  router.get("/mortgages/:mortgageId/terms", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const terms = await services.mortgageTerms.listForMortgage(req.params.mortgageId, user.id);
    if (!terms) {
      res.status(404).json({ error: "Mortgage not found" });
      return;
    }
    res.json(terms);
  });

  router.post("/mortgages/:mortgageId/terms", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = mortgageTermCreateSchema.parse({
        ...req.body,
        mortgageId: req.params.mortgageId,
      });
      const { mortgageId, ...payload } = data;
      const term = await services.mortgageTerms.create(req.params.mortgageId, user.id, payload);
      if (!term) {
        res.status(404).json({ error: "Mortgage not found" });
        return;
      }
      res.json(term);
    } catch (error) {
      res.status(400).json({ error: "Invalid term data", details: error });
    }
  });

  router.patch("/mortgage-terms/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = mortgageTermUpdateSchema.parse(req.body);
      const updated = await services.mortgageTerms.update(req.params.id, user.id, data);
      if (!updated) {
        res.status(404).json({ error: "Term not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data", details: error });
    }
  });

  router.delete("/mortgage-terms/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.mortgageTerms.delete(req.params.id, user.id);
    if (!deleted) {
      res.status(404).json({ error: "Term not found" });
      return;
    }
    res.json({ success: true });
  });

  router.get("/mortgages/:mortgageId/payments", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const payments = await services.mortgagePayments.listByMortgage(req.params.mortgageId, user.id);
    if (!payments) {
      res.status(404).json({ error: "Mortgage not found" });
      return;
    }
    res.json(payments);
  });

  router.get("/mortgage-terms/:termId/payments", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const payments = await services.mortgagePayments.listByTerm(req.params.termId, user.id);
    if (!payments) {
      res.status(404).json({ error: "Term not found" });
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
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid payment data", details: error });
    }
  });

  router.post("/mortgages/:mortgageId/payments/bulk", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const { payments } = req.body as { payments: Array<Record<string, unknown>> };
      
      if (!Array.isArray(payments) || payments.length === 0) {
        res.status(400).json({ error: "Payments array is required" });
        return;
      }

      if (payments.length > 60) {
        res.status(400).json({ error: "Maximum 60 payments can be created at once" });
        return;
      }

      const createdPayments = [];
      for (const paymentData of payments) {
        const data = mortgagePaymentCreateSchema.parse({
          ...paymentData,
          mortgageId: req.params.mortgageId,
        });
        const { mortgageId, ...payload } = data;
        const payment = await services.mortgagePayments.create(
          req.params.mortgageId,
          user.id,
          payload,
        );
        if (payment) {
          createdPayments.push(payment);
        }
      }

      res.json({ created: createdPayments.length, payments: createdPayments });
    } catch (error) {
      res.status(400).json({ error: "Invalid payment data", details: error });
    }
  });

  router.delete("/mortgage-payments/:paymentId", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    const deleted = await services.mortgagePayments.delete(req.params.paymentId, user.id);
    if (!deleted) {
      res.status(404).json({ error: "Payment not found or not authorized" });
      return;
    }
    res.json({ success: true });
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
          res.status(404).json({ error: "Mortgage not found" });
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
      
      // Add monthly prepayment as a percentage of the base payment
      if (data.monthlyPrepayAmount > 0 && basePayment > 0) {
        // Calculate what percentage of the base payment this represents
        const monthlyPrepayPercent = (data.monthlyPrepayAmount / basePayment) * 100;
        prepayments.push({
          type: 'monthly-percent',
          amount: 0, // Not used for monthly-percent type
          startPaymentNumber: 1,
          monthlyPercent: monthlyPrepayPercent,
        });
      }
      
      // Add configured prepayment events
      for (const event of data.prepaymentEvents) {
        prepayments.push({
          type: event.type,
          amount: event.amount,
          startPaymentNumber: event.startPaymentNumber,
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
      
      Array.from(historicalYearlyMap.entries()).forEach(([year, yearData]) => {
        // If historical data doesn't cover the full year (month 11 = December), mark for completion
        if (yearData.lastPaymentMonth < 11 && year >= currentCalendarYear) {
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
        } else if (historical) {
          // Pure historical year
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
      
      let cumulativePrincipal = 0;
      let cumulativeInterest = 0;
      
      for (let i = 0; i < schedule.payments.length; i++) {
        const payment = schedule.payments[i];
        cumulativePrincipal += payment.totalPrincipalPayment;
        cumulativeInterest += payment.interestPayment;
        
        // Add data point every 24 months (2 years)
        if (i % 24 === 0) {
          const yearsFromNow = Math.floor(i / 12);
          chartData.push({
            year: yearsFromNow,
            balance: Math.round(payment.remainingBalance),
            principal: Math.round(cumulativePrincipal),
            interest: Math.round(cumulativeInterest),
          });
        }
      }
      
      // Ensure final point
      if (schedule.payments.length > 0) {
        const lastPayment = schedule.payments[schedule.payments.length - 1];
        const finalYears = Math.ceil(schedule.payments.length / 12);
        if (chartData.length === 0 || chartData[chartData.length - 1].balance > 0) {
          chartData.push({
            year: finalYears,
            balance: 0,
            principal: Math.round(schedule.summary.totalPrincipal),
            interest: Math.round(schedule.summary.totalInterest),
          });
        }
      }

      // Calculate baseline (no prepayments) for interest savings comparison
      const baselineSchedule = generateAmortizationSchedule(
        data.currentBalance,
        effectiveRate,
        data.amortizationMonths,
        projectionFrequency,
        new Date(),
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
      res.status(400).json({ error: "Invalid projection parameters", details: error });
    }
  });
}

