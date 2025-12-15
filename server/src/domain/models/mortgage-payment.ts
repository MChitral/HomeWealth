import {
  type InsertMortgagePayment,
  type MortgagePayment,
  insertMortgagePaymentSchema,
} from "@shared/schema";

export type MortgagePaymentEntity = MortgagePayment;
export type MortgagePaymentCreateInput = InsertMortgagePayment;

export const mortgagePaymentCreateSchema = insertMortgagePaymentSchema;
