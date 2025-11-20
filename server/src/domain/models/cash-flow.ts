import {
  type CashFlow,
  type InsertCashFlow,
  type UpdateCashFlow,
  insertCashFlowSchema,
  updateCashFlowSchema,
} from "@shared/schema";

export type CashFlowEntity = CashFlow;
export type CashFlowCreateInput = InsertCashFlow;
export type CashFlowUpdateInput = UpdateCashFlow;

export const cashFlowCreateSchema = insertCashFlowSchema;
export const cashFlowUpdateSchema = updateCashFlowSchema;

