import type { Request, Response } from "express";
import { db } from "@infrastructure/db/connection";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const DEV_USER_ID = "dev-user-001";

/**
 * Ensures the dev user exists in the database, creating it if necessary.
 * This is needed for development environments where authentication is bypassed.
 */
async function ensureDevUserExists(): Promise<void> {
  try {
    const [existingUser] = await db.select().from(users).where(eq(users.id, DEV_USER_ID)).limit(1);

    if (!existingUser) {
      await db.insert(users).values({
        id: DEV_USER_ID,
        email: "dev@example.com",
        firstName: "Dev",
        lastName: "User",
        profileImageUrl: null,
      });
    }
  } catch (error) {
    // Log but don't throw - allow the request to continue
    // The foreign key constraint will catch the issue if user doesn't exist
    console.error("⚠️ Error ensuring dev user exists:", error);
  }
}

// Ensure dev user exists on module load (for development)
if (process.env.NODE_ENV !== "production") {
  ensureDevUserExists().catch(console.error);
}

export function requireUser(_req: Request, _res: Response): Express.User | null {
  // Ensure user exists before returning (async but fire-and-forget)
  ensureDevUserExists().catch(console.error);
  return { id: DEV_USER_ID } as any;
}
