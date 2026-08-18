#!/usr/bin/env bash
# Cloud Agent install script: idempotent dependency + database setup.
# Safe to run repeatedly and against cached/partially-prepared state.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

DB_NAME="mortgage_app"
DB_URL="postgresql://postgres:postgres@127.0.0.1:5432/${DB_NAME}"

echo "[install] Ensuring PostgreSQL is installed..."
if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
fi

PG_VER="$(ls /etc/postgresql 2>/dev/null | sort -V | tail -1)"
echo "[install] Using PostgreSQL cluster ${PG_VER}/main"

echo "[install] Starting PostgreSQL..."
sudo pg_ctlcluster "$PG_VER" main start 2>/dev/null || true
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then break; fi
  sleep 1
done

echo "[install] Ensuring postgres role password and database..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" >/dev/null
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" >/dev/null
fi

echo "[install] Installing Node dependencies..."
npm ci --no-audit --no-fund

echo "[install] Writing local .env (if missing)..."
if [ ! -f .env ]; then
  cat > .env <<EOF
NODE_ENV=development
PORT=5000
DATABASE_URL=${DB_URL}
DATABASE_CLIENT=pg
EOF
fi

echo "[install] Applying database schema (drizzle push)..."
DATABASE_URL="$DB_URL" DATABASE_CLIENT=pg npm run db:push

echo "[install] Done."
