import {
  type InsertRefinancingEvent,
  type RefinancingEvent,
  insertRefinancingEventSchema,
} from "@shared/schema";

export type RefinancingEventEntity = RefinancingEvent;
export type RefinancingEventCreateInput = InsertRefinancingEvent;

export const refinancingEventCreateSchema = insertRefinancingEventSchema;
export const refinancingEventUpdateSchema = refinancingEventCreateSchema
  .omit({ scenarioId: true })
  .partial();
