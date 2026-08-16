#!/usr/bin/env bash
# Cloud Agent start script: per-boot reconciliation.
# Starts PostgreSQL and waits for readiness. Idempotent and tolerant of restarts.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PG_VER="$(ls /etc/postgresql 2>/dev/null | sort -V | tail -1)"
if [ -z "$PG_VER" ]; then
  echo "[start] PostgreSQL not installed; run scripts/cloud-agent-install.sh first." >&2
  exit 0
fi

echo "[start] Starting PostgreSQL cluster ${PG_VER}/main..."
sudo pg_ctlcluster "$PG_VER" main start 2>/dev/null || true

for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then
    echo "[start] PostgreSQL is ready."
    exit 0
  fi
  sleep 1
done

echo "[start] PostgreSQL did not become ready in time." >&2
exit 1
