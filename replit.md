# Canadian Mortgage Strategy & Wealth Forecasting MVP

## Overview
This full-stack web application assists Canadians in optimizing mortgage management and wealth building. It allows users to compare various financial strategies, such as aggressive mortgage prepayment versus investment, over 10-30 year horizons. The project aims to provide a holistic view of financial health, integrating cash flow, emergency funds, and net worth projections, distinguishing itself from standard calculators by offering multi-scenario comparisons and Canadian-specific mortgage rules.

## User Preferences
Not specified.

## System Architecture

**UI/UX Decisions:**
- **Component Library**: Shadcn UI for consistent and accessible components.
- **Styling**: Tailwind CSS for utility-first styling.
- **Design Approach**: Focus on clear data visualization with tables, charts, and metric cards for scenario comparison and financial snapshots.
- **Interaction**: Controlled inputs, loading states, and confirmation dialogs (e.g., AlertDialog for deletions).

**Technical Implementations:**
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query for data fetching. Form validation handled by `react-hook-form` and Zod.
- **Backend**: Express.js with TypeScript, RESTful API design. Zod for request body validation.
- **Database**: PostgreSQL (currently using in-memory `MemStorage` for MVP, Drizzle ORM planned for persistence).
- **Core Engine**:
    - **Mortgage Calculation**: Canadian-specific semi-annual compounding, payment frequency conversions, amortization schedule generation, and prepayment modeling (lump sum, annual, one-time).
    - **Net Worth Projection**: 10-30 year forecasts integrating mortgage, investments, emergency fund, and expenses.
    - **Comparison Metrics**: Calculates interest savings, time savings, and net worth differences between strategies.
- **Data Flow**:
    - Uses an `IStorage` interface for data operations, allowing easy switching between in-memory and persistent storage.
    - API routes are secured and validated.
    - Horizon-aware metrics system for consistent 10/20/30-year projections across the UI.

**Feature Specifications:**
- **Emergency Fund Page**: Manages EF targets, current balance, and contributions with zero-safe calculations.
- **Scenario Management**: CRUD operations for financial scenarios, supporting up to 4 simultaneous comparisons. Scenarios define prepayment and investment strategies, and EF priority.
- **Cash Flow Management**: Input for income, fixed/variable expenses, and other debts, with real-time surplus calculation and negative cash flow warnings.
- **Mortgage History**: Tracks mortgage details, terms (renewals), and payment history with principal/interest breakdowns. Supports updating property values and payment frequencies.
- **Prepayment Events UI**: Full CRUD for annual and one-time prepayment events, integrated into scenario modeling.
- **Dashboard**: Provides a financial snapshot (home equity, EF, mortgage balance), horizon-aware metric cards, and charts for net worth, mortgage balance, and investment growth.
- **Validation**: Comprehensive Zod schemas for all API endpoints (POST, PATCH) ensuring data integrity and consistency, including number-to-string transformations for decimal fields.

## External Dependencies
- **PostgreSQL**: Relational database for persistent data storage (planned, currently using in-memory `MemStorage`).
- **Shadcn UI**: Frontend component library.
- **TanStack Query**: Data fetching and state management in the frontend.
- **Zod**: Schema validation for both frontend forms and backend API requests.
- **React Hook Form**: Form management and validation in the frontend.
- **Express.js**: Backend web framework.
- **Drizzle ORM**: (Planned) ORM for interacting with PostgreSQL.