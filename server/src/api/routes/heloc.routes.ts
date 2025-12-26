import { Router } from "express";
import type { ApplicationServices } from "@application/services";
import { helocAccountCreateSchema, helocAccountUpdateSchema } from "@domain/models";
import { requireUser } from "@api/utils/auth";
import { sendError } from "@server-shared/utils/api-response";
import { z } from "zod";

const borrowSchema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "number" ? val : parseFloat(val))),
  transactionDate: z.string(),
  description: z.string().optional(),
});

const paymentSchema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "number" ? val : parseFloat(val))),
  transactionDate: z.string(),
  paymentType: z.enum(["interest_only", "interest_principal", "full"]),
  description: z.string().optional(),
});

export function registerHelocRoutes(router: Router, services: ApplicationServices) {
  // Get all HELOC accounts for user
  router.get("/heloc/accounts", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const accounts = await services.heloc.getAccountsByUserId(user.id);
      res.json(accounts);
    } catch (error) {
      sendError(res, 500, "Failed to fetch HELOC accounts", error);
    }
  });

  // Get HELOC account by ID
  router.get("/heloc/accounts/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const account = await services.heloc.getAccountById(req.params.id, user.id);
      if (!account) {
        sendError(res, 404, "HELOC account not found");
        return;
      }
      res.json(account);
    } catch (error) {
      sendError(res, 500, "Failed to fetch HELOC account", error);
    }
  });

  // Create HELOC account
  router.post("/heloc/accounts", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = helocAccountCreateSchema.parse({ ...req.body, userId: user.id });
      const { userId: _userId, ...payload } = data;
      const created = await services.heloc.createAccount(user.id, payload);
      res.json(created);
    } catch (error) {
      sendError(res, 400, "Invalid HELOC account data", error);
    }
  });

  // Update HELOC account
  router.put("/heloc/accounts/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = helocAccountUpdateSchema.parse(req.body);
      const updated = await services.heloc.updateAccount(req.params.id, user.id, data);
      if (!updated) {
        sendError(res, 404, "HELOC account not found");
        return;
      }
      res.json(updated);
    } catch (error) {
      sendError(res, 400, "Invalid update data", error);
    }
  });

  // Calculate HELOC minimum payment
  router.post("/heloc/accounts/:id/calculate-minimum-payment", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const account = await services.heloc.getAccountById(req.params.id, user.id);
      if (!account) {
        sendError(res, 404, "HELOC account not found");
        return;
      }

      const { calculateHelocMinimumPayment } = await import("@domain/calculations/heloc-payment");
      const { fetchLatestPrimeRate } = await import("@server-shared/services/prime-rate");

      const balance = Number(account.currentBalance);
      const spread = Number(account.interestSpread);
      const { primeRate } = await fetchLatestPrimeRate();
      const annualRate = (primeRate + spread) / 100;
      const paymentType = (account.helocPaymentType || "interest_only") as
        | "interest_only"
        | "principal_plus_interest";

      const minimumPayment = calculateHelocMinimumPayment(balance, annualRate, paymentType);

      res.json({
        minimumPayment,
        paymentType,
        balance,
        annualRate: annualRate * 100, // Return as percentage
      });
    } catch (error) {
      sendError(res, 400, "Failed to calculate minimum payment", error);
    }
  });

  // Delete HELOC account
  router.delete("/heloc/accounts/:id", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const deleted = await services.heloc.deleteAccount(req.params.id, user.id);
      if (!deleted) {
        sendError(res, 404, "HELOC account not found");
        return;
      }
      res.json({ success: true });
    } catch (error) {
      sendError(res, 500, "Failed to delete HELOC account", error);
    }
  });

  // Record borrowing transaction
  router.post("/heloc/accounts/:id/borrow", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = borrowSchema.parse(req.body);
      const transaction = await services.heloc.recordBorrowing(
        req.params.id,
        user.id,
        data.amount,
        data.transactionDate,
        data.description
      );
      res.json(transaction);
    } catch (error) {
      if (error instanceof Error && error.message.includes("exceeds available credit")) {
        sendError(res, 400, error.message, error);
        return;
      }
      sendError(res, 400, "Invalid borrowing data", error);
    }
  });

  // Record payment transaction
  router.post("/heloc/accounts/:id/payments", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const data = paymentSchema.parse(req.body);
      const transaction = await services.heloc.recordPayment(
        req.params.id,
        user.id,
        data.amount,
        data.transactionDate,
        data.paymentType,
        data.description
      );
      res.json(transaction);
    } catch (error) {
      if (error instanceof Error && error.message.includes("must be at least")) {
        sendError(res, 400, error.message, error);
        return;
      }
      sendError(res, 400, "Invalid payment data", error);
    }
  });

  // Get transaction history
  router.get("/heloc/accounts/:id/transactions", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const transactions = await services.heloc.getTransactions(req.params.id, user.id);
      if (!transactions) {
        sendError(res, 404, "HELOC account not found");
        return;
      }
      res.json(transactions);
    } catch (error) {
      sendError(res, 500, "Failed to fetch transactions", error);
    }
  });

  // Get current credit limit
  router.get("/heloc/accounts/:id/credit-limit", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const account = await services.heloc.getAccountById(req.params.id, user.id);
      if (!account) {
        sendError(res, 404, "HELOC account not found");
        return;
      }
      res.json({
        creditLimit: account.creditLimit,
        currentBalance: account.currentBalance,
        availableCredit: services.helocCreditLimit.getAvailableCredit(
          Number(account.creditLimit),
          Number(account.currentBalance)
        ),
      });
    } catch (error) {
      sendError(res, 500, "Failed to fetch credit limit", error);
    }
  });

  // Manually recalculate credit limit
  router.post("/heloc/accounts/:id/recalculate-credit-limit", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;

    try {
      const updated = await services.heloc.recalculateCreditLimit(req.params.id, user.id);
      if (!updated) {
        sendError(res, 404, "HELOC account not found");
        return;
      }
      res.json(updated);
    } catch (error) {
      sendError(res, 500, "Failed to recalculate credit limit", error);
    }
  });
}
