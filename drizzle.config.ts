import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });

console.log("DATABASE_URL", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
