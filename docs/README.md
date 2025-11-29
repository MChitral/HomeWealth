# Canadian Mortgage Strategy & Wealth Forecasting App

A full-stack web application helping Canadians compare financial strategies for managing mortgages and building wealth.

## Quick Start with Docker

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- Git

### Run the App

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local`**
   ```bash
   cp env.local.example .env.local
   # Update DATABASE_URL if you changed the Postgres port/user/password
   ```

4. **Start PostgreSQL with Docker Compose**
   ```bash
   docker compose up db -d
   ```

5. **Push the database schema**
   ```bash
   npm run db:push
   ```

6. **Start the dev server**
   ```bash
   npm run dev
   ```
   - Open http://localhost:5000 in your browser

7. **Stop services**
   ```bash
   # Stop the app (Ctrl+C)
   docker compose down
   ```

### Useful Docker Commands

```bash
# Start Postgres in the background
docker compose up db -d

# View Postgres logs
docker compose logs -f db

# Stop the database
docker compose down

# Stop and remove data (fresh start)
docker compose down -v
```

## Local Development (Without Docker)

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### Setup

The steps above already cover local development (run Docker for Postgres, push the schema, then `npm run dev`). If you prefer a fully manual setup, create a Postgres database yourself and point `DATABASE_URL` at it before running `npm run db:push`.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **UI**: Shadcn UI + Tailwind CSS

## Features

- 🏠 Mortgage tracking with Canadian-specific calculations (multi-mortgage selector + BoC prime snapshots)
- 📊 Multi-scenario comparison (up to 4 simultaneous) tied to the real mortgage + surplus math
- 💰 Investment alternative modeling
- 📈 10-30 year net worth projections
- 🎯 Emergency fund planning
- 💸 Cash flow management
- 🔄 Shared Canadian amortization helper consumed by tracker, dashboard, and scenario planner + compliance checks for prepayment limits

## Architecture Overview

### Backend (monolithic, layered)
- `server/src/api`: Express routers + middleware (validation, error handling, logging).
- `server/src/application`: Orchestrates business rules via services, seeding, background jobs.
- `server/src/domain`: Pure domain models, calculation helpers, and shared DTOs.
- `server/src/infrastructure`: Drizzle repositories, db connection management, Vite/static hosting helpers.
- Dependency flow is strictly one-directional: `api → application → domain/infrastructure`.

### Frontend (feature-first)
- `client/src/app`: App shell, global providers, router, and layout scaffolding.
- `client/src/features`: Each slice (dashboard, mortgage-tracking, cash-flow, etc) owns UI + hooks + API helpers.
- `client/src/widgets`: Larger reusable compositions (navigation, charts).
- `client/src/shared`: Design system primitives (`ui/`), hooks (`use-page-title`, `use-toast`), and API utilities.
- `client/src/entities`: Cross-feature types (`ScenarioWithMetrics`, etc).
- Pages in `client/src/pages` are now thin wrappers that render a feature.

```
client/src/
  app/
  entities/
  features/
  pages/
  shared/
  widgets/
server/src/
  api/
  application/
  config/
  domain/
  infrastructure/
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Sync database schema
- `npm run db:studio` - Open database GUI
- `npm run check` - Type-check the monorepo (frontend + backend)

## Environment

- `.env.local` is loaded after `.env` so you can override values locally.
- Set `DATABASE_URL`, `DATABASE_CLIENT=pg`, and `PORT` for local dev (see `env.local.example`).
- Backend and Drizzle CLI both read the same variables because `server/src/config/loadEnv.ts` is imported first.

## License

MIT
