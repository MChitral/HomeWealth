import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import { z } from "zod";

const marginalRateQuerySchema = z.object({
  income: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
  province: z.string().length(2),
  year: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val === undefined ? 2025 : typeof val === "string" ? parseInt(val, 10) : val)),
});

const taxDeductionSchema = z.object({
  helocInterest: z.union([z.string(), z.number()]).transform((val) => (typeof val === "number" ? val : parseFloat(val))),
  investmentUsePercent: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "number" ? val : parseFloat(val)))
    .refine((val) => val >= 0 && val <= 100, "Investment use percentage must be between 0 and 100"),
  marginalTaxRate: z.union([z.string(), z.number()]).transform((val) => (typeof val === "number" ? val : parseFloat(val))),
});

const taxSavingsSchema = z.object({
  deduction: z.union([z.string(), z.number()]).transform((val) => (typeof val === "number" ? val : parseFloat(val))),
  marginalTaxRate: z.union([z.string(), z.number()]).transform((val) => (typeof val === "number" ? val : parseFloat(val))),
});

const investmentIncomeTaxSchema = z.object({
  income: z.union([z.string(), z.number()]).transform((val) => (typeof val === "number" ? val : parseFloat(val))),
  incomeType: z.enum(["eligible_dividend", "non_eligible_dividend", "interest", "capital_gain"]),
  province: z.string().length(2),
  marginalTaxRate: z.union([z.string(), z.number()]).transform((val) => (typeof val === "number" ? val : parseFloat(val))),
  taxYear: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val === undefined ? 2025 : typeof val === "string" ? parseInt(val, 10) : val)),
});

export function registerTaxRoutes(router: Router, services: ApplicationServices) {
  // Get marginal tax rate
  router.get("/tax/marginal-rate", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = marginalRateQuerySchema.parse({
        income: req.query.income,
        province: req.query.province,
        year: req.query.year,
      });

      const marginalRate = await services.taxCalculation.calculateMarginalTaxRate(
        validated.income,
        validated.province,
        validated.year
      );

      res.json({
        income: validated.income,
        province: validated.province,
        taxYear: validated.year,
        marginalTaxRate: marginalRate,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid query parameters", error.errors);
        return;
      }
      sendError(res, 500, "Failed to calculate marginal tax rate", error);
    }
  });

  // Calculate tax deduction
  router.post("/tax/calculate-deduction", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = taxDeductionSchema.parse(req.body);
      const result = await services.taxCalculation.calculateTaxDeduction(
        validated.helocInterest,
        validated.investmentUsePercent,
        validated.marginalTaxRate
      );

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid request data", error.errors);
        return;
      }
      sendError(res, 500, "Failed to calculate tax deduction", error);
    }
  });

  // Calculate tax savings
  router.post("/tax/calculate-savings", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = taxSavingsSchema.parse(req.body);
      const taxSavings = await services.taxCalculation.calculateTaxSavings(
        validated.deduction,
        validated.marginalTaxRate
      );

      res.json({ taxSavings });
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid request data", error.errors);
        return;
      }
      sendError(res, 500, "Failed to calculate tax savings", error);
    }
  });

  // Calculate investment income tax
  router.post("/tax/calculate-investment-income-tax", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const validated = investmentIncomeTaxSchema.parse(req.body);
      const result = await services.taxCalculation.calculateInvestmentIncomeTax(
        validated.income,
        validated.incomeType,
        validated.province,
        validated.marginalTaxRate,
        validated.taxYear
      );

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, "Invalid request data", error.errors);
        return;
      }
      sendError(res, 500, "Failed to calculate investment income tax", error);
    }
  });

  // Get tax brackets
  router.get("/tax/brackets", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const province = req.query.province as string;
      const year = req.query.year
        ? parseInt(req.query.year as string, 10)
        : 2025;

      if (!province || province.length !== 2) {
        sendError(res, 400, "Province code (2 letters) is required");
        return;
      }

      const brackets = await services.taxCalculation.getTaxBrackets(province, year);
      res.json(brackets);
    } catch (error) {
      sendError(res, 500, "Failed to fetch tax brackets", error);
    }
  });
}

