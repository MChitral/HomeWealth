# Memory Index

- [App DB is DATABASE_URL; NEON_DATABASE_URL is orphaned](database-env-vars.md) — verify the connection bootstrap before destructive SQL; a stale twin DB with matching schema exists.
- [Dev server runs stale code after merges](dev-server-stale-code.md) — tsx has no watch; restart the workflow after server-side changes or task-agent merges before judging behavior.
