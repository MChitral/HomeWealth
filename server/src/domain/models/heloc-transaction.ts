import { z } from "zod";
import { insertHelocTransactionSchema } from "@shared/schema";

export const helocTransactionCreateSchema = insertHelocTransactionSchema;

export type HelocTransactionCreateInput = z.infer<typeof helocTransactionCreateSchema>;

// Transaction type enum
export const HELOC_TRANSACTION_TYPES = [
  "borrowing",
  "repayment",
  "interest_payment",
  "interest_accrual",
] as const;

export type HelocTransactionType = (typeof HELOC_TRANSACTION_TYPES)[number];
