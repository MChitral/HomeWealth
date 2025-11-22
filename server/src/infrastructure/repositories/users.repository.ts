import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import { users, type UpsertUser, type User } from "@shared/schema";

export class UsersRepository {
  constructor(private readonly database = db) {}

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.database.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await this.database
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

