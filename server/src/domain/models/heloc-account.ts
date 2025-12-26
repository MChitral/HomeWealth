import { z } from "zod";
import { insertHelocAccountSchema, updateHelocAccountSchema } from "@shared/schema";

export const helocAccountCreateSchema = insertHelocAccountSchema;
export const helocAccountUpdateSchema = updateHelocAccountSchema;

export type HelocAccountCreateInput = z.infer<typeof helocAccountCreateSchema>;
export type HelocAccountUpdateInput = z.infer<typeof helocAccountUpdateSchema>;
