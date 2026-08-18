import {
  type InsertPrivilegeEvent,
  type PrivilegeEvent,
  insertPrivilegeEventSchema,
} from "@shared/schema";

export type PrivilegeEventEntity = PrivilegeEvent;
export type PrivilegeEventCreateInput = InsertPrivilegeEvent;

export const privilegeEventCreateSchema = insertPrivilegeEventSchema;
