import {
  type InsertStagedImport,
  type StagedImport,
  insertStagedImportSchema,
} from "@shared/schema";

export type StagedImportEntity = StagedImport;
export type StagedImportCreateInput = InsertStagedImport;

export const stagedImportCreateSchema = insertStagedImportSchema;
