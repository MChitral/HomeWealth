import {
  type InsertPrepaymentEvent,
  type PrepaymentEvent,
  insertPrepaymentEventSchema,
} from "@shared/schema";

export type PrepaymentEventEntity = PrepaymentEvent;
export type PrepaymentEventCreateInput = InsertPrepaymentEvent;

export const prepaymentEventCreateSchema = insertPrepaymentEventSchema;
