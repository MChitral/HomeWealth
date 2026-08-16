import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@shared/schema";
import {
  privilegeEvents,
  type InsertPrivilegeEvent,
  type PrivilegeEvent as PrivilegeEventRecord,
} from "@shared/schema";

type Database = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

export class PrivilegeEventsRepository {
  constructor(private readonly database: Database = db) {}

  async findByMortgageId(mortgageId: string): Promise<PrivilegeEventRecord[]> {
    return this.database
      .select()
      .from(privilegeEvents)
      .where(eq(privilegeEvents.mortgageId, mortgageId));
  }

  async create(payload: InsertPrivilegeEvent): Promise<PrivilegeEventRecord> {
    const [created] = await this.database.insert(privilegeEvents).values(payload).returning();
    return created;
  }

  async deleteByStagedImportId(stagedImportId: string): Promise<void> {
    await this.database
      .delete(privilegeEvents)
      .where(eq(privilegeEvents.stagedImportId, stagedImportId));
  }
}
