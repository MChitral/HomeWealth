import { z } from "zod";
import {
  type InsertMortgagePayment,
  type MortgagePayment,
  insertMortgagePaymentSchema,
} from "@shared/schema";

export type MortgagePaymentEntity = MortgagePayment;
export type MortgagePaymentCreateInput = InsertMortgagePayment;

export const mortgagePaymentCreateSchema = insertMortgagePaymentSchema;

const moneyAmount = z
  .union([z.string(), z.number()])
  .transform((val) => (typeof val === "number" ? val.toFixed(2) : val));

export const mortgagePaymentUpdateSchema = z.object({
  paymentDate: z.string().optional(),
  paymentPeriodLabel: z.string().nullable().optional(),
  regularPaymentAmount: moneyAmount.optional(),
  prepaymentAmount: moneyAmount.optional(),
});

export type MortgagePaymentUpdateInput = z.infer<typeof mortgagePaymentUpdateSchema>;
