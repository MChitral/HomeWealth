# Canadian Mortgage Strategy & Wealth Forecasting

## Overview

A full-stack financial planning application designed specifically for Canadian homeowners to compare mortgage management strategies and build wealth. The system allows users to model multiple scenarios (up to 4 simultaneously) comparing aggressive mortgage prepayment versus balanced versus investment-focused approaches, projecting net worth over 10-30 year horizons. Users can track their mortgage details, cash flow, emergency fund, and investment growth while understanding trade-offs between mortgage freedom and wealth accumulation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture (Feature-Sliced Design)**
- **Pattern**: Feature-Sliced Design (FSD) with facade pattern for clean module boundaries
- **Structure**: 
  - `app/` - Application shell (layout, providers, router)
  - `pages/` - Thin orchestrators (< 50 lines) that import features
  - `features/` - Self-contained feature modules with private internals (cash-flow, dashboard, emergency-fund, mortgage-tracking, scenario-management, scenario-comparison)
  - `widgets/` - Complex reusable components (charts, navigation)
  - `shared/` - Shared utilities, UI components, hooks
  - `entities/` - Business entity types
- **Framework**: React with TypeScript, built using Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management, caching, and automatic refetching
- **Form Handling**: React Hook Form with Zod for schema validation and type-safe form management
- **UI Components**: Shadcn UI component library built on Radix UI primitives, styled with Tailwind CSS
- **Design System**: Material Design + Carbon Design System hybrid for professional financial data presentation with consistent form interactions
- **Visualization**: Recharts for financial charts (net worth projections, mortgage balance, investment growth)
- **Feature Module Structure**: Each feature contains api/, hooks/, components/, main feature component, types, and public API facade (index.ts)

**Backend Architecture (Clean Architecture / Layered)**
- **Pattern**: Clean Architecture with clear layer separation and dependency inversion
- **Structure**:
  - `api/` - HTTP layer (routes by domain, middleware, request validation)
  - `application/` - Business orchestration layer (services coordinate repositories)
  - `domain/` - Core business models and entity types
  - `infrastructure/` - External dependencies (database connection, repositories)
  - `shared/` - Pure calculation utilities (mortgage, projections)
  - `types/` - Type augmentations (Express session types)
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ESNext modules
- **API Design**: RESTful API with 30+ endpoints organized by domain (cash-flow.routes.ts, mortgage.routes.ts, scenario.routes.ts)
- **Validation Layer**: Zod schemas for request/response validation at API boundaries
- **Authentication**: Development auth middleware (placeholder for production Replit Auth)
- **Service Layer**: Business logic orchestration (cascade deletes, cross-domain workflows)
- **Repository Pattern**: Thin data access layer (Drizzle ORM queries)
- **Calculation Engines**: Separate modules for mortgage calculations (Canadian-specific semi-annual compounding) and net worth projections

**Database Design**
- **ORM**: Drizzle ORM with type-safe query builder
- **Schema Management**: Centralized schema definition in `shared/schema.ts` with Drizzle-Zod integration
- **Tables**: users, cashFlow, emergencyFund, mortgages, mortgageTerms, mortgagePayments, scenarios, prepaymentEvents
- **Key Features**: UUID primary keys, timestamp tracking, decimal precision for financial data, foreign key relationships

**Core Calculation Logic**
- **Canadian Mortgage Specifics**: 
  - Semi-annual compounding (not monthly like US mortgages)
  - Payment frequency conversions (monthly, biweekly, accelerated-biweekly, weekly, etc.)
  - Term-based renewals (3-5 year terms vs 25-30 year amortization)
  - Variable Rate Mortgage (VRM) support with two types: Variable-Changing Payment and Variable-Fixed Payment
  - Trigger rate detection for VRMs
- **Projection Engine**: 
  - Generates 10-30 year monthly projections integrating mortgage paydown, investment growth, emergency fund contributions, and cash flow
  - Horizon-aware metrics (10yr/20yr/30yr snapshots)
  - Scenario comparison calculations (interest savings, time savings, net worth differences)
- **Prepayment Modeling**: Annual recurring and one-time prepayment events with amount and timing specifications

**Data Flow**
- Client fetches data via TanStack Query from REST endpoints
- API routes validate requests with Zod schemas
- Storage layer (DBStorage) executes Drizzle ORM queries against PostgreSQL
- Calculation engines process financial data and return metrics
- Results cached client-side until invalidated by mutations

**Key Architectural Decisions**
- **Monorepo Structure**: Shared types and schemas between client/server via `@shared` path alias eliminates type drift
- **Type Safety**: End-to-end TypeScript with Zod runtime validation ensures data integrity
- **Separation of Concerns**: Calculation logic isolated from data access and API layers for testability
- **Canadian-First Design**: All financial calculations built specifically for Canadian mortgage rules rather than adapting US-centric logic
- **Scenario-Based Planning**: Core feature allows comparing up to 4 strategies simultaneously with side-by-side metrics and visualizations
- **Layered Architecture**: Backend follows Clean Architecture principles with API → Services → Repositories → Database dependency flow
- **Feature-Sliced Design**: Frontend organizes code by features (not technical layers) with facade pattern for clean module boundaries
- **Thin Pages**: Page components are < 50 lines and simply orchestrate features (e.g., comparison-page.tsx: 5 lines, down from 567)
- **Private Internals**: Features expose only public APIs via index.ts; hooks, components, and types remain private unless explicitly exported

## External Dependencies

**Database**
- PostgreSQL via Neon serverless driver (`@neondatabase/serverless`)
- Drizzle ORM (`drizzle-orm`) for type-safe database queries
- Drizzle Kit (`drizzle-kit`) for schema migrations

**Frontend Libraries**
- React 18 with TypeScript
- Wouter (lightweight routing)
- TanStack Query (data fetching and caching)
- React Hook Form (form state management)
- Zod (schema validation)
- Shadcn UI + Radix UI (component primitives)
- Tailwind CSS (styling)
- Recharts (data visualization)
- date-fns (date manipulation)

**Backend Libraries**
- Express.js (web framework)
- ws (WebSocket for Neon connection)
- Zod (request validation)

**Development Tools**
- Vite (build tool and dev server)
- tsx (TypeScript execution)
- esbuild (production bundling)
- TypeScript compiler
- Replit-specific plugins (error overlay, cartographer, dev banner)

**Session Management**
- connect-pg-simple (PostgreSQL session store for Express)

**CSS Processing**
- PostCSS with Tailwind CSS and Autoprefixer