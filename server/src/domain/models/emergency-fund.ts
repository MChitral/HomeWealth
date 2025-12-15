import {
  type EmergencyFund,
  type InsertEmergencyFund,
  type UpdateEmergencyFund,
  insertEmergencyFundSchema,
  updateEmergencyFundSchema,
} from "@shared/schema";

export type EmergencyFundEntity = EmergencyFund;
export type EmergencyFundCreateInput = InsertEmergencyFund;
export type EmergencyFundUpdateInput = UpdateEmergencyFund;

export const emergencyFundCreateSchema = insertEmergencyFundSchema;
export const emergencyFundUpdateSchema = updateEmergencyFundSchema;
