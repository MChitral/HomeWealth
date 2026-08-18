import { and, desc, eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  facilitySnapshots,
  type InsertFacilitySnapshot,
  type FacilitySnapshot as FacilitySnapshotRecord,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class FacilitySnapshotsRepository {
  constructor(private readonly database: Database = db) {}

  async findLatestActive(mortgageId: string): Promise<FacilitySnapshotRecord | undefined> {
    const result = await this.database
      .select()
      .from(facilitySnapshots)
      .where(and(eq(facilitySnapshots.mortgageId, mortgageId), eq(facilitySnapshots.status, "active")))
      .orderBy(desc(facilitySnapshots.statementAsOf))
      .limit(1);
    return result[0];
  }

  async create(
    payload: InsertFacilitySnapshot,
    tx?: Database
  ): Promise<FacilitySnapshotRecord> {
    const database = tx ?? this.database;
    const [created] = await database.insert(facilitySnapshots).values(payload).returning();
    return created;
  }

  async retractActiveByPeriod(
    mortgageId: string,
    statementPeriod: string,
    tx?: Database
  ): Promise<void> {
    const database = tx ?? this.database;
    await database
      .update(facilitySnapshots)
      .set({ status: "retracted" })
      .where(
        and(
          eq(facilitySnapshots.mortgageId, mortgageId),
          eq(facilitySnapshots.statementPeriod, statementPeriod),
          eq(facilitySnapshots.status, "active")
        )
      );
  }

  async retractByStagedImportId(stagedImportId: string, tx?: Database): Promise<void> {
    const database = tx ?? this.database;
    await database
      .update(facilitySnapshots)
      .set({ status: "retracted" })
      .where(eq(facilitySnapshots.stagedImportId, stagedImportId));
  }
}
