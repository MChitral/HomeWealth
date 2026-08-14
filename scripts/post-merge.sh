#!/bin/bash
# Post-merge setup: runs automatically after a task merge.
# Keep idempotent, non-interactive, and fast.
set -e

# Sync dependencies with the merged package-lock.json
npm install --no-audit --no-fund
