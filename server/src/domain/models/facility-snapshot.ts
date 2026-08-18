import {
  type InsertFacilitySnapshot,
  type FacilitySnapshot,
  insertFacilitySnapshotSchema,
} from "@shared/schema";

export type FacilitySnapshotEntity = FacilitySnapshot;
export type FacilitySnapshotCreateInput = InsertFacilitySnapshot;

export const facilitySnapshotCreateSchema = insertFacilitySnapshotSchema;
