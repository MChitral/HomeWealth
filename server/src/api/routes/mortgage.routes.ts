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
  calculatePayment,
  type PaymentFrequency,
  type PrepaymentEvent as CalcPrepaymentEvent,
} from "../../shared/calculations/mortgage";
import { z } from "zod";

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
      const effectiveRate = data.rateOverride ?? data.annualRate;
      
      // Calculate base payment to determine monthly prepay percentage
      const basePayment = calculatePayment(
        data.currentBalance,
        effectiveRate,
        data.amortizationMonths,
        data.paymentFrequency as PaymentFrequency
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
      const schedule = generateAmortizationSchedule(
        data.currentBalance,
        effectiveRate,
        data.amortizationMonths,
        data.paymentFrequency as PaymentFrequency,
        new Date(), // Start from today
        prepayments,
        [], // No term renewals for projection
        360 // Max 30 years
      );

      // Fetch historical payments if mortgageId is provided
      const historicalYearlyData: Array<{
        year: number;
        totalPaid: number;
        principalPaid: number;
        interestPaid: number;
        endingBalance: number;
        isHistorical: boolean;
      }> = [];

      if (data.mortgageId) {
        const historicalPayments = await services.mortgagePayments.listByMortgage(data.mortgageId, user.id);
        
        if (historicalPayments && historicalPayments.length > 0) {
          // Aggregate historical payments by year
          const yearlyHistorical = new Map<number, { 
            totalPaid: number; 
            principalPaid: number; 
            interestPaid: number; 
            endingBalance: number;
          }>();

          for (const payment of historicalPayments) {
            const paymentDate = new Date(payment.paymentDate);
            const year = paymentDate.getFullYear();
            
            const existing = yearlyHistorical.get(year) || {
              totalPaid: 0,
              principalPaid: 0,
              interestPaid: 0,
              endingBalance: 0,
            };

            existing.totalPaid += Number(payment.paymentAmount || 0);
            existing.principalPaid += Number(payment.principalPaid || 0);
            existing.interestPaid += Number(payment.interestPaid || 0);
            existing.endingBalance = Number(payment.remainingBalance || 0); // Use last payment's balance
            
            yearlyHistorical.set(year, existing);
          }

          // Convert to array and sort by year
          const sortedYears = Array.from(yearlyHistorical.keys()).sort((a, b) => a - b);
          for (const year of sortedYears) {
            const yearData = yearlyHistorical.get(year)!;
            historicalYearlyData.push({
              year,
              totalPaid: Math.round(yearData.totalPaid),
              principalPaid: Math.round(yearData.principalPaid),
              interestPaid: Math.round(yearData.interestPaid),
              endingBalance: Math.round(yearData.endingBalance),
              isHistorical: true,
            });
          }
        }
      }

      // Aggregate projected payments by year for the table
      const projectedYearlyData: Array<{
        year: number;
        totalPaid: number;
        principalPaid: number;
        interestPaid: number;
        endingBalance: number;
        isHistorical: boolean;
      }> = [];

      let currentYear = new Date().getFullYear();
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      let lastBalance = data.currentBalance;

      // Get the last year that has complete historical data
      const lastHistoricalYear = historicalYearlyData.length > 0 
        ? Math.max(...historicalYearlyData.map(d => d.year))
        : 0;

      for (const payment of schedule.payments) {
        const paymentYear = payment.paymentDate.getFullYear();
        
        if (paymentYear !== currentYear) {
          // Save previous year's data (only if year is after last historical year)
          if ((yearlyPrincipal > 0 || yearlyInterest > 0) && currentYear > lastHistoricalYear) {
            projectedYearlyData.push({
              year: currentYear,
              totalPaid: Math.round(yearlyPrincipal + yearlyInterest),
              principalPaid: Math.round(yearlyPrincipal),
              interestPaid: Math.round(yearlyInterest),
              endingBalance: Math.round(lastBalance),
              isHistorical: false,
            });
          }
          currentYear = paymentYear;
          yearlyPrincipal = 0;
          yearlyInterest = 0;
        }

        yearlyPrincipal += payment.totalPrincipalPayment;
        yearlyInterest += payment.interestPayment;
        lastBalance = payment.remainingBalance;
      }

      // Add final year (only if year is after last historical year)
      if ((yearlyPrincipal > 0 || yearlyInterest > 0) && currentYear > lastHistoricalYear) {
        projectedYearlyData.push({
          year: currentYear,
          totalPaid: Math.round(yearlyPrincipal + yearlyInterest),
          principalPaid: Math.round(yearlyPrincipal),
          interestPaid: Math.round(yearlyInterest),
          endingBalance: Math.round(lastBalance),
          isHistorical: false,
        });
      }
      
      // Merge historical and projected data (no duplicates possible now)
      const yearlyData = [...historicalYearlyData, ...projectedYearlyData];

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
        data.paymentFrequency as PaymentFrequency,
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

