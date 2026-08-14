---
name: Dev server runs stale code after merges
description: The dev workflow runs tsx without watch, so server-side changes (especially task-agent merges) are invisible until an explicit workflow restart
---

**Rule:** After any server-side code change that didn't come from your own edit-restart loop — task-agent merges above all — restart the `Start application` workflow before testing server behavior.

**Why:** The dev script runs `tsx server/src/index.ts` with no watch mode. In one session a merged skip-payment fix appeared broken (canonical mortgage balance not updating after a skip) purely because the running process predated the merge; a restart made the exact same request work. Client code is safe (Vite HMR), server code is not.

**How to apply:** Before concluding a server-side fix "doesn't work" or a merge "is broken", check whether the workflow was restarted after the code landed. Restart first, then re-test. Also remember the post-merge hook only runs `npm install` — it does not restart the workflow or push schema changes.
