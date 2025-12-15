import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import {
  emergencyFund,
  type EmergencyFund as EmergencyFundRecord,
  type InsertEmergencyFund,
  type UpdateEmergencyFund,
} from "@shared/schema";

export class EmergencyFundRepository {
  constructor(private readonly database = db) {}

  async findByUserId(userId: string): Promise<EmergencyFundRecord | undefined> {
    const result = await this.database
      .select()
      .from(emergencyFund)
      .where(eq(emergencyFund.userId, userId));
    return result[0];
  }

  async create(payload: InsertEmergencyFund): Promise<EmergencyFundRecord> {
    const [created] = await this.database.insert(emergencyFund).values(payload).returning();
    return created;
  }

  async update(
    id: string,
    payload: Partial<UpdateEmergencyFund>
  ): Promise<EmergencyFundRecord | undefined> {
    const [updated] = await this.database
      .update(emergencyFund)
      .set(payload)
      .where(eq(emergencyFund.id, id))
      .returning();

    return updated;
  }
}
