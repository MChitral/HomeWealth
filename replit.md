# Mortgage Strategy & Wealth Forecasting

## Overview

A Canadian mortgage strategy and wealth forecasting application that helps users compare prepayment vs investment strategies to maximize net worth. The application enables mortgage tracking, scenario modeling, cash flow planning, and long-term financial projections.

The system follows a clean architecture pattern with a React frontend and Express backend, using PostgreSQL for data persistence. Core features include mortgage payment tracking with Canadian-specific calculations (semi-annual compounding), scenario comparison tools, emergency fund planning, and automated prime rate tracking from the Bank of Canada.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled with Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: 
  - Server state: TanStack Query for all API data with 5-minute stale time
  - Global state: React Context for mortgage selection (single concern)
  - Form state: React Hook Form with Zod validation schemas
- **UI Components**: Shadcn UI (New York style) with Radix primitives and Tailwind CSS
- **Code Organization**: Feature-based folder structure (`client/src/features/`)
  - Each feature contains components, hooks, and types
  - Shared utilities in `client/src/shared/`
  - Route-level code splitting with React.lazy

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Architecture Pattern**: Clean Architecture layers:
  - `api/` - Routes and middleware
  - `application/` - Business services
  - `domain/` - Domain models
  - `infrastructure/` - Database and external integrations
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas shared between frontend and backend
- **Scheduled Jobs**: Node-cron for automated prime rate checking

### Data Storage
- **Database**: PostgreSQL (Neon serverless)
- **Connection**: `DATABASE_URL` env var (used by both `server/src/infrastructure/db/connection.ts` and `drizzle.config.ts`). Note: the `NEON_DATABASE_URL` secret is orphaned — no code reads it.
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit (`migrations/` folder), applied via `npm run db:push`
- **Key Tables**: users, sessions, cash_flow, mortgages, mortgage_terms, mortgage_payments, scenarios, prepayment_events, refinancing_events, emergency_fund, prime_rate_history

### Auth & Request Pattern
- No real authentication yet: a single hardcoded dev user (`dev-user-001`) is auto-created by `ensureDevUserExists()` in `server/src/api/utils/auth.ts`.
- `requireUser(req, res)` is a **callable, not middleware**. Correct usage inside a handler: `const user = requireUser(req, res); if (!user) return;`. Never place it in Express middleware position — it never calls `next()`, so the route hangs forever.

### Intentionally Dormant / Removed (Aug 2026 audit)
- **Notifications**: UI is hidden (no nav link, bell, or route) until the feature is built properly. Server-side machinery (queue, cron jobs, preferences API, `client/src/features/notifications/`) is intact but delivery is mocked and alerts are never persisted.
- **Investments backend**: removed entirely (routes, service, repositories, DB tables) — it had zero client callers. Scenario-level "investment strategy" percentages are a separate, live concept.
- **Known tech debt**: ~55 pre-existing TypeScript errors, concentrated in `server/src/infrastructure/jobs/*` (notification cron jobs) and `server/src/index.ts` logging. The app runs via tsx (no typecheck at runtime).

### Calculation Engine
- Canadian mortgage calculations with semi-annual compounding
- Payment frequencies: monthly, biweekly, accelerated-biweekly, semi-monthly, weekly, accelerated-weekly
- Prepayment limit calculations based on original mortgage amount
- All monetary amounts rounded to nearest cent

### Path Aliases
```
@/* -> client/src/*
@shared/* -> shared/*
@server/* -> server/src/*
@api/* -> server/src/api/*
@application/* -> server/src/application/*
@domain/* -> server/src/domain/*
@infrastructure/* -> server/src/infrastructure/*
```

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL via `@neondatabase/serverless`
- Connection string via `DATABASE_URL` environment variable

### External APIs
- **Bank of Canada API**: Fetches current prime rate from `https://www.bankofcanada.ca/valet/observations/V121796/json`
- Automated daily check at 9:00 AM Eastern Time (configurable via `ENABLE_PRIME_RATE_SCHEDULER`)

### Key NPM Dependencies
- **Frontend**: React, TanStack Query, Wouter, React Hook Form, Zod, Recharts, date-fns
- **Backend**: Express, Drizzle ORM, node-cron, connect-pg-simple (sessions)
- **Shared**: Radix UI primitives, Tailwind CSS, class-variance-authority

### Development Tools
- ESLint with TypeScript, React, and accessibility plugins
- Prettier for code formatting
- Vite dev server with HMR
- esbuild for production bundling