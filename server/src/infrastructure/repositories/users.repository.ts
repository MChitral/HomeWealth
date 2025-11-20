import { eq } from "drizzle-orm";
import { db } from "@infrastructure/db/connection";
import { users, type InsertUser, type User } from "@shared/schema";

export class UsersRepository {
  constructor(private readonly database = db) {}

  async findById(id: string): Promise<User | undefined> {
    const result = await this.database.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const result = await this.database.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async create(payload: InsertUser): Promise<User> {
    const [created] = await this.database.insert(users).values(payload).returning();
    return created;
  }
}

