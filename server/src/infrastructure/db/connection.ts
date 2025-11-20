import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import {
  drizzle as drizzleNeon,
  type NeonDatabase,
} from "drizzle-orm/neon-serverless";
import { Pool as PgPool } from "pg";
import {
  drizzle as drizzlePg,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import ws from "ws";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

type DatabaseClient = "neon" | "pg";

const envPreference = (process.env.DATABASE_CLIENT ?? "").toLowerCase() as DatabaseClient | "";
const inferredPreference: DatabaseClient =
  connectionString.includes("localhost") || connectionString.includes("127.0.0.1") ? "pg" : "neon";
const client: DatabaseClient =
  envPreference === "neon" || envPreference === "pg" ? envPreference : inferredPreference;

let db: NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

if (client === "neon") {
  neonConfig.webSocketConstructor = ws;
  const pool = new NeonPool({ connectionString });
  db = drizzleNeon({ client: pool, schema });
} else {
  const pool = new PgPool({ connectionString });
  db = drizzlePg(pool, { schema });
}

export { db };

