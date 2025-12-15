import {
  type InsertMortgage,
  type Mortgage,
  type UpdateMortgage,
  insertMortgageSchema,
  updateMortgageSchema,
} from "@shared/schema";

export type MortgageEntity = Mortgage;
export type MortgageCreateInput = InsertMortgage;
export type MortgageUpdateInput = UpdateMortgage;

export const mortgageCreateSchema = insertMortgageSchema;
export const mortgageUpdateSchema = updateMortgageSchema;
