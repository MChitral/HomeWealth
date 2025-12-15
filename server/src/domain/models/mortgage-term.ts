import {
  type InsertMortgageTerm,
  type MortgageTerm,
  type UpdateMortgageTerm,
  insertMortgageTermSchema,
  updateMortgageTermSchema,
} from "@shared/schema";

export type MortgageTermEntity = MortgageTerm;
export type MortgageTermCreateInput = InsertMortgageTerm;
export type MortgageTermUpdateInput = UpdateMortgageTerm;

export const mortgageTermCreateSchema = insertMortgageTermSchema;
export const mortgageTermUpdateSchema = updateMortgageTermSchema;
