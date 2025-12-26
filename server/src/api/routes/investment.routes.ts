import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { insertInvestmentSchema, updateInvestmentSchema } from "@shared/schema";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import { z } from "zod";

const investmentTransactionSchema = z.object({
  transactionDate: z.string(),
  transactionType: z.enum(["purchase", "sale", "dividend", "interest", "capital_gain"]),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  quantity: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .optional()
    .transform((val) =>
      val === null || val === undefined ? undefined : typeof val === "number" ? val.toFixed(4) : val
    ),
  pricePerUnit: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .optional()
    .transform((val) =>
      val === null || val === undefined ? undefined : typeof val === "number" ? val.toFixed(4) : val
    ),
  description: z.string().optional(),
  linkedHelocTransactionId: z.string().optional(),
});

const investmentIncomeSchema = z.object({
  incomeType: z.enum(["dividend", "interest", "capital_gain"]),
  incomeDate: z.string(),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  taxYear: z.number().int().min(2000).max(2100),
  taxTreatment: z.enum(["eligible_dividend", "non_eligible_dividend", "interest", "capital_gain"]),
});

export function registerInvestmentRoutes(router: Router, services: ApplicationServices) {
  // Get all investments for user
  router.get("/investments", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const investments = await services.investments.getInvestmentsByUserId(user.id);
      res.json(investments);
    } catch (error) {
      sendError(res, 500, "Failed to fetch investments", error);
    }
  });

  // Get investment by ID
  router.get("/investments/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const investment = await services.investments.getInvestmentById(req.params.id, user.id);
      if (!investment) {
        sendError(res, 404, "Investment not found");
        return;
      }
      res.json(investment);
    } catch (error) {
      sendError(res, 500, "Failed to fetch investment", error);
    }
  });

  // Create investment
  router.post("/investments", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = insertInvestmentSchema.parse(req.body);
      const investment = await services.investments.createInvestment(user.id, validated);
      res.status(201).json(investment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid investment data", error.errors);
        return;
      }
      sendError(res, 500, "Failed to create investment", error);
    }
  });

  // Update investment
  router.put("/investments/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = updateInvestmentSchema.parse(req.body);
      const investment = await services.investments.updateInvestment(
        req.params.id,
        user.id,
        validated
      );
      if (!investment) {
        sendError(res, 404, "Investment not found");
        return;
      }
      res.json(investment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid investment data", error.errors);
        return;
      }
      sendError(res, 500, "Failed to update investment", error);
    }
  });

  // Delete investment
  router.delete("/investments/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const deleted = await services.investments.deleteInvestment(req.params.id, user.id);
      if (!deleted) {
        sendError(res, 404, "Investment not found");
        return;
      }
      res.json({ success: true });
    } catch (error) {
      sendError(res, 500, "Failed to delete investment", error);
    }
  });

  // Get transactions for an investment
  router.get("/investments/:id/transactions", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const transactions = await services.investments.getTransactionsByInvestmentId(
        req.params.id,
        user.id
      );
      res.json(transactions);
    } catch (error) {
      sendError(res, 500, "Failed to fetch investment transactions", error);
    }
  });

  // Record investment transaction
  router.post("/investments/:id/transactions", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = investmentTransactionSchema.parse(req.body);
      const transaction = await services.investments.recordTransaction(req.params.id, user.id, {
        ...validated,
        investmentId: req.params.id,
      });
      if (!transaction) {
        sendError(res, 404, "Investment not found");
        return;
      }
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid transaction data", error.errors);
        return;
      }
      sendError(res, 500, "Failed to record transaction", error);
    }
  });

  // Get income records for an investment
  router.get("/investments/:id/income", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const taxYear = req.query.taxYear ? parseInt(req.query.taxYear as string, 10) : undefined;
      let income;
      if (taxYear) {
        income = await services.investments.getIncomeByTaxYear(req.params.id, user.id, taxYear);
      } else {
        income = await services.investments.getIncomeByInvestmentId(req.params.id, user.id);
      }
      res.json(income);
    } catch (error) {
      sendError(res, 500, "Failed to fetch investment income", error);
    }
  });

  // Record investment income
  router.post("/investments/:id/income", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = investmentIncomeSchema.parse(req.body);
      const income = await services.investments.recordIncome(req.params.id, user.id, {
        ...validated,
        investmentId: req.params.id,
      });
      if (!income) {
        sendError(res, 404, "Investment not found");
        return;
      }
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid income data", error.errors);
        return;
      }
      sendError(res, 500, "Failed to record investment income", error);
    }
  });

  // Get all income for user by tax year
  router.get("/investments/income/tax-year/:year", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const taxYear = parseInt(req.params.year, 10);
      if (isNaN(taxYear) || taxYear < 2000 || taxYear > 2100) {
        sendError(res, 400, "Invalid tax year");
        return;
      }
      const income = await services.investments.getIncomeByUserIdAndTaxYear(user.id, taxYear);
      res.json(income);
    } catch (error) {
      sendError(res, 500, "Failed to fetch investment income", error);
    }
  });
}
