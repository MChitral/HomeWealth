---
name: App DB is DATABASE_URL; NEON_DATABASE_URL is orphaned
description: Which connection string the app actually uses, and the stale twin DB trap
---

**Rule:** The app and drizzle both use `DATABASE_URL` (`server/src/infrastructure/db/connection.ts`, `drizzle.config.ts`). The `NEON_DATABASE_URL` secret is read by NO code — it points to a stale copy of the database with a similar schema.

**Why:** During the Aug 2026 cleanup, a data wipe was first run against `NEON_DATABASE_URL` on the assumption it was the app DB (secret name suggested it; the schema even matched). It wasn't — the real data lived behind `DATABASE_URL`. Harmless that time (the orphan DB is unused), but the same mistake in reverse would destroy real data.

**How to apply:** Before any destructive SQL or migration, grep the actual connection bootstrapping code for which env var it reads, and sanity-check with a row-count query that the target DB contains what you expect. Consider deleting the `NEON_DATABASE_URL` secret if the user confirms it's unneeded.
