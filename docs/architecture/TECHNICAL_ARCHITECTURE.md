# Canadian Mortgage Strategy & Wealth Forecasting

## Technical Architecture & Implementation Documentation

**Last Updated**: January 2025  
**Version**: v1.3 (Updated for Current Architecture)  
**Audience**: Developers, Technical Stakeholders

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Calculation Engines](#calculation-engines)
7. [API Design](#api-design)
8. [Data Flow](#data-flow)
9. [Security & Authentication](#security--authentication)
10. [Deployment & Infrastructure](#deployment--infrastructure)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React + TypeScript (Vite)                           │  │
│  │  - Wouter (Routing)                                  │  │
│  │  - TanStack Query (Data Fetching)                    │  │
│  │  - Shadcn UI + Tailwind (Styling)                    │  │
│  │  - React Hook Form + Zod (Forms)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 SERVER (Express.js)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express + TypeScript                                │  │
│  │  - RESTful API Routes (30+ endpoints)                │  │
│  │  - Zod Validation Layer                              │  │
│  │  - Dev Auth Middleware (temp)                        │  │
│  │  - Calculation Engines                               │  │
│  │    * Mortgage Calculations                           │  │
│  │    * Projection Engine                               │  │
│  │    * Net Worth Calculations                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ SQL
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Drizzle ORM                                         │  │
│  │  - 8 Tables (users, mortgages, scenarios, etc.)     │  │
│  │  - PostgreSQL Database (persistent storage)        │  │
│  │  - Type-Safe Queries                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Patterns

**Monorepo Structure:**

- Single repository with client + server + shared
- Shared TypeScript types between frontend and backend
- Single `package.json` for dependency management
- Integrated build process

**Full-Stack TypeScript:**

- End-to-end type safety
- Shared schema definitions
- Compile-time error catching
- Better developer experience

**API-First Design:**

- Backend exposes RESTful JSON API
- Frontend consumes API via TanStack Query
- Clear separation of concerns
- Easy to add mobile app or other clients later

---

## Technology Stack

### Frontend Stack

**Core Framework:**

- **React 18**: Component-based UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Lightning-fast build tool and dev server

**Routing:**

- **Wouter**: Lightweight React router (~2KB)
- File-based page organization
- Client-side navigation

**State Management & Data Fetching:**

- **TanStack Query v5**: Server state management
  - Automatic caching
  - Background refetching
  - Optimistic updates
  - Cache invalidation
- **React Hooks**: Local component state

**Forms & Validation:**

- **React Hook Form**: Performant form library
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Zod integration with RHF
- Shared validation schemas with backend

**UI Components:**

- **Shadcn UI**: High-quality React components
- **Radix UI**: Unstyled accessible primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Charting library for visualizations

**HTTP Client:**

- **Fetch API**: Native browser fetch
- Custom `apiRequest` wrapper for consistent error handling

### Backend Stack

**Core Framework:**

- **Express.js**: Web application framework
- **TypeScript**: Type-safe Node.js
- **Node.js 20+**: JavaScript runtime

**Database:**

- **PostgreSQL**: Relational database
- **Drizzle ORM**: TypeScript-first ORM
  - Type-safe queries
  - SQL-like syntax
  - Automatic migrations via `db:push`
- **Drizzle-Zod**: Schema-to-Zod integration

**Validation:**

- **Zod**: Runtime type validation
- Shared schemas with frontend
- Request body validation

**Authentication (Current):**

- **Dev Auth Middleware**: Mock authentication for development
- **Planned**: Replit Auth for production

**Session Management:**

- **express-session**: Session middleware
- **MemoryStore**: Session storage (development)
- **Planned**: PostgreSQL session store for production

### Shared Layer

**Type Definitions:**

- **Drizzle Schema**: Database table definitions
- **Zod Schemas**: Validation schemas
- **Inferred Types**: Auto-generated TypeScript types

**File Location**: `shared/schema.ts`

### Development Tools

**Build & Dev:**

- **Vite**: Dev server and build tool
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler

**Code Quality:**

- **TypeScript Compiler**: Type checking
- **ESLint**: Code linting (configured)
- **Prettier**: Code formatting (via Replit)

**Database Tools:**

- **Drizzle Kit**: Schema management and migrations
- **Drizzle Studio**: Visual database browser

---

## Database Design

### Schema Overview

**35+ Tables:**

**Core Tables:**

1. `users` - User accounts (Replit Auth compatible)
2. `cash_flow` - User income and expenses
3. `emergency_fund` - Emergency fund settings
4. `mortgages` - Mortgage details
5. `mortgage_terms` - Term-based rate locks (3-5 year periods)
6. `mortgage_payments` - Historical payment records
7. `scenarios` - Financial strategy scenarios
8. `prepayment_events` - Lump sum and recurring prepayment events
9. `refinancing_events` - Refinancing scenario events

**Payment & Mortgage Tracking:** 10. `payment_corrections` - Payment reversal/correction tracking 11. `payment_amount_change_events` - Payment amount change history 12. `payment_frequency_change_events` - Payment frequency change history 13. `recast_events` - Mortgage recast events 14. `mortgage_portability` - Mortgage portability tracking 15. `mortgage_payoff` - Mortgage payoff tracking

**HELOC & Re-Advanceable:** 16. `heloc_accounts` - HELOC account details 17. `heloc_transactions` - HELOC borrowing/repayment transactions

**Renewal & Refinancing:** 18. `renewal_history` - Historical renewal records 19. `renewal_negotiations` - Renewal negotiation tracking

**Property & Valuation:** 20. `property_value_history` - Property value tracking over time

**Rate & Market Data:** 21. `prime_rate_history` - Bank of Canada prime rate history 22. `market_rates` - Market interest rate data

**Notifications:** 23. `notifications` - User notifications 24. `notification_preferences` - User notification preferences 25. `notification_queue` - Notification queue for processing

**Smith Maneuver & Investments:** 26. `investments` - Investment accounts 27. `investment_transactions` - Investment transaction history 28. `investment_income` - Investment income tracking 29. `smith_maneuver_strategies` - Smith Maneuver strategy tracking 30. `smith_maneuver_transactions` - Smith Maneuver transaction history 31. `smith_maneuver_tax_calculations` - Tax calculation records 32. `smith_maneuver_comparisons` - Comparison analysis records

**Tax & Compliance:** 33. `tax_brackets` - Canadian tax bracket data 34. `marginal_tax_rates` - Marginal tax rate data

**Sessions:** 35. `sessions` - Session storage for Replit Auth

### Entity Relationship Diagram

```
users
  │
  ├─── cash_flow (1:1)
  ├─── emergency_fund (1:1)
  ├─── mortgages (1:N)
  │      │
  │      ├─── mortgage_terms (1:N)
  │      │       │
  │      │       ├─── mortgage_payments (1:N)
  │      │       ├─── payment_corrections (1:N, via mortgage_payments)
  │      │       └─── payment_amount_change_events (1:N)
  │      │
  │      ├─── mortgage_payments (1:N)
  │      ├─── payment_frequency_change_events (1:N)
  │      ├─── recast_events (1:N)
  │      ├─── mortgage_portability (1:1, optional)
  │      ├─── mortgage_payoff (1:1, optional)
  │      ├─── renewal_history (1:N)
  │      ├─── renewal_negotiations (1:N)
  │      └─── property_value_history (1:N)
  │
  ├─── scenarios (1:N)
  │      │
  │      ├─── prepayment_events (1:N)
  │      └─── refinancing_events (1:N)
  │
  ├─── heloc_accounts (1:N)
  │      │
  │      └─── heloc_transactions (1:N)
  │
  ├─── investments (1:N)
  │      │
  │      ├─── investment_transactions (1:N)
  │      └─── investment_income (1:N)
  │
  ├─── smith_maneuver_strategies (1:N)
  │      │
  │      ├─── smith_maneuver_transactions (1:N)
  │      ├─── smith_maneuver_tax_calculations (1:N)
  │      └─── smith_maneuver_comparisons (1:N)
  │
  ├─── notifications (1:N)
  └─── notification_preferences (1:1)

mortgages (if re-advanceable)
  └─── heloc_accounts.reAdvanceableHelocId (1:1, optional)

prime_rate_history (global, no FK)
market_rates (global, no FK)
tax_brackets (global, no FK)
marginal_tax_rates (global, no FK)
sessions (Replit Auth)
```

### Table Definitions

#### 1. users

```typescript
{
  id: varchar (UUID, PK),
  email: varchar (unique),
  firstName: varchar,
  lastName: varchar,
  profileImageUrl: varchar,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Purpose**: User accounts compatible with Replit Auth
**Note**: Uses Replit Auth user structure with email, name, and profile image

#### 2. cash_flow

```typescript
{
  id: varchar (UUID, PK),
  userId: varchar (FK -> users.id),

  // Income
  monthlyIncome: decimal(10,2),
  extraPaycheques: integer,
  annualBonus: decimal(10,2),

  // Fixed Housing Expenses
  propertyTax: decimal(10,2),
  homeInsurance: decimal(10,2),
  condoFees: decimal(10,2),
  utilities: decimal(10,2),

  // Variable Expenses
  groceries: decimal(10,2),
  dining: decimal(10,2),
  transportation: decimal(10,2),
  entertainment: decimal(10,2),

  // Other Debt
  carLoan: decimal(10,2),
  studentLoan: decimal(10,2),
  creditCard: decimal(10,2),

  updatedAt: timestamp
}
```

**Purpose**: Track user's monthly income and expenses
**Key Calculation**: Monthly Surplus = (Total Income - Total Expenses) / 12
**Cardinality**: 1:1 with users (one cash flow per user)

#### 3. emergency_fund

```typescript
{
  id: varchar (UUID, PK),
  userId: varchar (FK -> users.id),
  targetMonths: integer,              // Typically 3-12
  currentBalance: decimal(10,2),
  monthlyContribution: decimal(10,2),
  updatedAt: timestamp
}
```

**Purpose**: Emergency fund targets and progress
**Cardinality**: 1:1 with users

#### 4. mortgages

```typescript
{
  id: varchar (UUID, PK),
  userId: varchar (FK -> users.id),
  propertyPrice: decimal(12,2),
  downPayment: decimal(12,2),
  originalAmount: decimal(12,2),      // Calculated: propertyPrice - downPayment
  currentBalance: decimal(12,2),
  startDate: date,
  amortizationYears: integer,
  amortizationMonths: integer,        // Precision for 25.5 years etc.
  paymentFrequency: text,             // monthly, biweekly, accelerated-biweekly, etc.
  annualPrepaymentLimitPercent: integer, // Lender constraint (10-20%)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Purpose**: Core mortgage details
**Cardinality**: 1:N with users (support future multi-mortgage)
**Current**: UI supports multiple mortgages per user; selectors scope downstream data.

#### 5. mortgage_terms

```typescript
{
  id: varchar (UUID, PK),
  mortgageId: varchar (FK -> mortgages.id),
  termType: text,                     // fixed, variable-changing, variable-fixed
  startDate: date,
  endDate: date,
  termYears: integer,                 // Typically 3 or 5

  // Rate Information
  fixedRate: decimal(5,3),            // For fixed terms (e.g., 5.490)
  lockedSpread: decimal(5,3),         // For variable terms (e.g., -0.800)

  paymentFrequency: text,
  regularPaymentAmount: decimal(10,2),
  createdAt: timestamp
}
```

**Purpose**: Track term-based rate locks (Canadian mortgage system)
**Cardinality**: 1:N with mortgages
**Key Concept**:

- Canadian mortgages have 3-5 year "terms" with locked rates
- Over 25-year amortization, user will have ~5-8 different terms
- Rate/spread is locked for term duration only

#### 6. mortgage_payments

```typescript
{
  id: varchar (UUID, PK),
  mortgageId: varchar (FK -> mortgages.id),
  termId: varchar (FK -> mortgage_terms.id),
  paymentDate: date,

  // Enhanced Payment Tracking (Nov 18, 2024)
  paymentPeriodLabel: text,           // Optional label (e.g., "January 2025")
  regularPaymentAmount: decimal(10,2),// Scheduled regular payment
  prepaymentAmount: decimal(10,2),    // Extra payment amount (default 0.00)
  paymentAmount: decimal(10,2),       // Total payment (regular + prepayment)

  principalPaid: decimal(10,2),
  interestPaid: decimal(10,2),
  remainingBalance: decimal(12,2),

  // Variable Rate Tracking
  primeRate: decimal(5,3),            // For VRM terms
  effectiveRate: decimal(5,3),        // Actual rate on this payment

  // VRM-Fixed Payment Tracking
  triggerRateHit: integer,            // Boolean 0/1

  remainingAmortizationMonths: integer,
  createdAt: timestamp
}
```

**Purpose**: Historical payment records with Canadian mortgage specifics
**Cardinality**: 1:N with mortgages and mortgage_terms
**Key Fields**:

- `paymentPeriodLabel` - Optional label for which payment period (e.g., "January 2025", "Payment #23")
- `regularPaymentAmount` - The scheduled regular payment amount
- `prepaymentAmount` - Extra payment amount (defaults to $0.00)
- `paymentAmount` - Total payment (auto-calculated: regular + prepayment)
- `principalPaid` + `interestPaid` calculated using semi-annual compounding
- `primeRate` tracks Bank of Canada rate changes
- `triggerRateHit` flags when VRM-Fixed payment can't cover interest

#### 7. scenarios

```typescript
{
  id: varchar (UUID, PK),
  userId: varchar (FK -> users.id),
  name: text,
  description: text,

  // Prepayment Strategy
  prepaymentMonthlyPercent: integer,  // % of surplus to prepay (0-100)

  // Investment Strategy
  investmentMonthlyPercent: integer,  // % of surplus to invest (0-100)
  expectedReturnRate: decimal(5,3),   // Annual return % (e.g., 6.000)

  // Emergency Fund Priority
  efPriorityPercent: integer,         // % to EF before split (0-100)

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Purpose**: Model different prepayment vs investment strategies
**Validation**: prepaymentMonthlyPercent + investmentMonthlyPercent ≤ 100
**Cardinality**: 1:N with users

#### 8. prepayment_events

```typescript
{
  id: varchar (UUID, PK),
  scenarioId: varchar (FK -> scenarios.id),
  eventType: text,                    // annual, one-time, payment-increase
  amount: decimal(10,2),

  // Timing Controls
  startPaymentNumber: integer,        // Which payment to start (1-indexed)
  recurrenceMonth: integer,           // For annual: 1-12 (e.g., 3 for March)
  oneTimeYear: integer,               // For one-time: year offset

  description: text,
  createdAt: timestamp
}
```

**Purpose**: Model lump sum prepayments (bonuses, windfalls, etc.)
**Cardinality**: 1:N with scenarios
**Event Types**:

- `annual`: Recurring every year (e.g., tax refund in March)
- `one-time`: Single event (e.g., inheritance in year 5)
- `payment-increase`: Regular payment increase (future)

#### 9. refinancing_events

```typescript
{
  id: varchar (UUID, PK),
  scenarioId: varchar (FK -> scenarios.id),

  // Timing options
  refinancingYear: integer,              // For year-based refinancing (nullable)
  atTermEnd: integer,                    // Boolean: 0/1 - for term-end based refinancing

  // Refinancing details
  newRate: decimal(5,3),                // New interest rate (e.g., 5.490)
  termType: text,                       // 'fixed', 'variable-changing', 'variable-fixed'

  // Optional refinancing changes
  newAmortizationMonths: integer,        // If extending amortization (nullable)
  paymentFrequency: text,                // If changing frequency (nullable)

  description: text,
  createdAt: timestamp
}
```

**Purpose**: Model refinancing scenarios at renewal points or specific years
**Cardinality**: 1:N with scenarios
**Timing Options**:

- `refinancingYear`: Refinance at a specific year from mortgage start
- `atTermEnd`: Refinance at the end of the current term
  **Term Types**:
- `fixed`: Fixed interest rate for the term
- `variable-changing`: Payment adjusts when Prime rate changes
- `variable-fixed`: Payment stays constant, but may hit trigger rate if Prime rises

### Database Indexes

**Automatic Indexes:**

- Primary keys (all `id` fields)
- Foreign keys (all `userId`, `mortgageId`, `scenarioId`, etc.)
- `prime_rate_history.effectiveDate` - For efficient rate lookups
- `prime_rate_history.createdAt` - For rate history queries

**Performance Considerations:**

- Small dataset expected (<10K rows per table)
- Indexes on prime rate history for efficient lookups
- Future: Add indexes on `paymentDate`, `startDate` for large datasets

### Data Integrity

**Referential Integrity:**

- All foreign keys enforced by PostgreSQL
- Cascading deletes configured where appropriate
- Orphan prevention via FK constraints

**Validation:**

- Database-level: NOT NULL constraints, data types
- Application-level: Zod schemas validate before insert
- Frontend-level: React Hook Form prevents invalid input

---

## Backend Architecture

### Project Structure

```
server/
├── src/
│   ├── index.ts                    # App entry point
│   ├── api/
│   │   ├── index.ts                # API registration
│   │   ├── routes/                 # API route handlers (30+ route files)
│   │   │   ├── mortgage.routes.ts
│   │   │   ├── scenario.routes.ts
│   │   │   ├── heloc.routes.ts
│   │   │   ├── renewal.routes.ts
│   │   │   └── ... (20+ more routes)
│   │   └── middleware/             # Request logging, error handling, auth
│   ├── application/
│   │   └── services/               # Business logic services (50+ services)
│   │       ├── mortgage.service.ts
│   │       ├── scenario.service.ts
│   │       ├── heloc.service.ts
│   │       └── ... (50+ more services)
│   ├── domain/
│   │   ├── calculations/           # Domain calculation engines
│   │   ├── models/                 # Domain models
│   │   └── validations/            # Domain validations
│   ├── infrastructure/
│   │   ├── db/
│   │   │   └── connection.ts       # Drizzle ORM database connection
│   │   ├── repositories/           # Data access layer (29 repositories)
│   │   ├── jobs/                   # Scheduled jobs (cron tasks)
│   │   └── email/                  # Email service
│   ├── config/
│   │   └── loadEnv.ts              # Environment configuration
│   └── shared/                     # Shared utilities and calculations
└── tsconfig.json
```

### Storage Layer (Repository Pattern)

**Purpose**: Abstract database operations for testability and flexibility

**Pattern**: Repository pattern with Drizzle ORM and PostgreSQL

- 29 repository classes define all CRUD operations per entity
- PostgreSQL database provides persistent storage
- Type-safe queries via Drizzle ORM
- All data persists across server restarts
- Repository factory pattern for dependency injection

**Repository Interface**:

```typescript
export interface Repositories {
  users: UsersRepository;
  cashFlows: CashFlowRepository;
  emergencyFunds: EmergencyFundRepository;
  mortgages: MortgagesRepository;
  mortgageTerms: MortgageTermsRepository;
  mortgagePayments: MortgagePaymentsRepository;
  scenarios: ScenariosRepository;
  prepaymentEvents: PrepaymentEventsRepository;
  refinancingEvents: RefinancingEventsRepository;
  helocAccounts: HelocAccountRepository;
  helocTransactions: HelocTransactionRepository;
  renewalHistory: RenewalHistoryRepository;
  propertyValueHistory: PropertyValueHistoryRepository;
  // ... (16+ more repositories)
}
```

**Implementation**: PostgreSQL with Drizzle ORM

```typescript
// Database connection (infrastructure/db/connection.ts)
import { db } from "@infrastructure/db/connection"; // Drizzle ORM instance

// Repository implementation example
class MortgagesRepository {
  async findById(id: string): Promise<Mortgage | null> {
    return await db.query.mortgages.findFirst({
      where: eq(mortgages.id, id),
    });
  }

  async findByUser(userId: string): Promise<Mortgage[]> {
    return await db.query.mortgages.findMany({
      where: eq(mortgages.userId, userId),
    });
  }

  async create(data: InsertMortgage): Promise<Mortgage> {
    const [result] = await db.insert(mortgages).values(data).returning();
    return result;
  }
  // ... more CRUD operations
}
```

**Benefits**:

- Type-safe database operations
- Persistent storage across restarts
- Scalable architecture
- Easy to test (can mock repositories)
- Clear separation of concerns (domain logic vs data access)
- Supports both Neon serverless and standard PostgreSQL

### Middleware Stack

**Request Pipeline**:

```
Incoming Request
  ↓
[Express JSON Parser]
  ↓
[Request Logger] ← Logs all requests
  ↓
[Dev Auth Middleware] ← Adds req.user (development only)
  ↓
[Route Handler]
  ↓
[Zod Validation]
  ↓
[Service Layer] ← Business logic
  ↓
[Repository Layer] ← Data access
  ↓
[Database (PostgreSQL)]
  ↓
[Response]
  ↓
[Error Handler] ← Catches and formats errors
```

**Dev Auth Middleware**:

```typescript
export function devAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    (req as any).user = {
      id: "dev-user-123",
      username: "devuser",
    };
  }
  next();
}
```

**Applied To**: All `/api/*` routes
**Production Plan**: Replace with Replit Auth

### Error Handling

**Strategy**: Consistent error responses

**Validation Errors** (400 Bad Request):

```json
{
  "error": "Invalid mortgage data",
  "details": {
    /* Zod error details */
  }
}
```

**Not Found** (404):

```json
{
  "error": "Mortgage not found"
}
```

**Unauthorized** (401):

```json
{
  "error": "Unauthorized"
}
```

**Forbidden** (403):

```json
{
  "error": "Forbidden"
}
```

**Server Error** (500):

```json
{
  "error": "Internal server error",
  "details": "Error message"
}
```

---

## Frontend Architecture

### Project Structure

```
client/src/
├── App.tsx                # Root component, routing
├── main.tsx               # Entry point
├── index.css              # Global styles, Tailwind config
├── pages/
│   ├── dashboard-page.tsx
│   ├── mortgage-page.tsx
│   ├── cash-flow-page.tsx
│   ├── emergency-fund-page.tsx
│   ├── scenario-editor-page.tsx
│   ├── scenario-list-page.tsx
│   ├── comparison-page.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ... (30+ components)
│   └── app-sidebar.tsx    # Application sidebar
├── lib/
│   └── queryClient.ts     # TanStack Query configuration
└── hooks/
    └── use-toast.ts       # Toast notification hook
```

### Component Architecture

**Page Components**:

- One component per route
- Responsible for data fetching
- Compose UI components
- Handle user interactions

**UI Components (Shadcn)**:

- Reusable, accessible primitives
- Styled with Tailwind
- Radix UI under the hood
- Variant-based customization

**Layout Pattern**:

```tsx
<SidebarProvider>
  <AppSidebar />
  <div className="flex flex-col flex-1">
    <header>
      <SidebarTrigger />
    </header>
    <main>
      <Router />
    </main>
  </div>
</SidebarProvider>
```

### State Management

**Server State** (TanStack Query):

- All API data managed by TanStack Query
- Automatic caching with query keys
- Background refetching
- Optimistic updates
- Cache invalidation on mutations

**Example**:

```typescript
// Query
const { data: mortgage, isLoading } = useQuery({
  queryKey: ["/api/mortgages"],
});

// Mutation
const mutation = useMutation({
  mutationFn: (data) => apiRequest("POST", "/api/mortgages", data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/mortgages"] });
  },
});
```

**Local State** (useState):

- Form inputs
- UI toggles (dialogs, dropdowns)
- Temporary selections

**No Global State Library Needed**:

- TanStack Query handles server state
- React Context for theme/auth (future)
- Props/hooks for component communication

### Feature-Based Architecture (Mortgage Tracking)

The mortgage tracking feature follows a modular, component-based architecture:

```
client/src/features/mortgage-tracking/
├── components/              # UI Components (14 components)
│   ├── backfill-payments-dialog.tsx
│   ├── create-mortgage-dialog.tsx
│   ├── edit-mortgage-dialog.tsx
│   ├── edit-term-dialog.tsx
│   ├── education-sidebar.tsx
│   ├── log-payment-dialog.tsx
│   ├── mortgage-empty-state.tsx
│   ├── mortgage-header.tsx
│   ├── mortgage-layout.tsx
│   ├── mortgage-prime-banner.tsx
│   ├── mortgage-summary-panels.tsx
│   ├── payment-history-section.tsx
│   ├── term-details-section.tsx
│   └── term-renewal-dialog.tsx
├── hooks/                   # Custom Hooks (4 hooks)
│   ├── use-auto-payments.ts      # Auto-calculate payment amounts
│   ├── use-mortgage-data.ts      # Fetch mortgage/term/payment data
│   ├── use-mortgage-tracking-state.ts  # Centralized state management
│   └── use-prime-rate.ts          # Bank of Canada prime rate
├── utils/                   # Utility Functions
│   ├── mortgage-math.ts          # Canadian mortgage calculations
│   ├── normalize.ts             # Data normalization
│   └── __tests__/
│       └── mortgage-math.test.ts # Unit tests
├── api/                     # API Layer
│   ├── mortgage-api.ts          # API functions
│   └── index.ts
├── types.ts                 # TypeScript types
└── mortgage-feature.tsx     # Main feature component (~555 lines)
```

**Architecture Principles**:

1. **Separation of Concerns**: Each component has a single responsibility
2. **State Management**: `useMortgageTrackingState` centralizes all state, queries, and mutations
3. **Reusability**: Dialog components can be reused (e.g., `TermRenewalDialog` for both renewal and first-term creation)
4. **Testability**: Components can be tested in isolation
5. **Maintainability**: Clear component hierarchy makes it easy to locate and modify code

**Component Categories**:

- **Layout Components**: `MortgageLayout`, `MortgageHeader` - Page structure
- **Content Components**: `TermDetailsSection`, `MortgageSummaryPanels`, `PaymentHistorySection` - Data display
- **Dialog Components**: `EditMortgageDialog`, `EditTermDialog`, `TermRenewalDialog` - User interactions
- **Utility Components**: `MortgagePrimeBanner`, `EducationSidebar` - Supporting UI

**State Flow**:

```
mortgage-feature.tsx
  └── useMortgageTrackingState (hook)
      ├── useMortgageData (data fetching)
      ├── usePrimeRate (prime rate fetching)
      ├── useAutoPayments (payment calculations)
      └── mutations (create/update/delete operations)
```

### Routing

**Wouter Router**:

```typescript
<Switch>
  <Route path="/" component={DashboardPage} />
  <Route path="/mortgage" component={MortgagePage} />
  <Route path="/cash-flow" component={CashFlowPage} />
  <Route path="/emergency-fund" component={EmergencyFundPage} />
  <Route path="/scenarios" component={ScenarioListPage} />
  <Route path="/scenarios/new" component={ScenarioEditorPage} />
  <Route path="/scenarios/:id" component={ScenarioEditorPage} />
  <Route path="/comparison" component={ComparisonPage} />
  <Route component={NotFoundPage} />
</Switch>
```

**Navigation**:

```typescript
import { Link } from "wouter";

<Link href="/scenarios">
  <Button>View Scenarios</Button>
</Link>
```

### Form Handling

**Pattern**: React Hook Form + Zod + Shadcn Form

**Example**:

```typescript
// 1. Define Zod schema (from backend insertSchema)
const formSchema = insertMortgageSchema.pick({
  propertyPrice: true,
  downPayment: true,
}).extend({
  // Add frontend-specific validation
  propertyPrice: z.string().min(1, "Required"),
});

// 2. Create form with useForm
const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: {
    propertyPrice: "",
    downPayment: "",
  },
});

// 3. Render with Shadcn Form components
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="propertyPrice"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Property Price</FormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

**Benefits**:

- Type-safe forms
- Automatic validation
- Error handling
- Controlled inputs
- Shared validation with backend

### Cross-Cutting Improvements (January 2025)

The application has been enhanced with three major cross-cutting improvements that improve consistency, reusability, and developer experience across all features.

#### 1. Global Mortgage Selection Context

**Location**: `client/src/shared/contexts/mortgage-selection-context.tsx`

**Purpose**: Provides global state management for mortgage selection across all features.

**Features**:

- Persistent selection via localStorage
- Auto-selects first mortgage if none selected
- Validates selected mortgage still exists
- Provides mortgages list and selected mortgage to all features

**Usage**:

```typescript
import { useMortgageSelection } from "@/shared/contexts/mortgage-selection-context";

function MyComponent() {
  const { selectedMortgageId, setSelectedMortgageId, mortgages, selectedMortgage } =
    useMortgageSelection();
  // Use selectedMortgageId for data fetching
  // Use setSelectedMortgageId to change selection
}
```

**Integration**:

- Wrapped in `AppProviders` at app root
- Used by Dashboard, Scenario Editor, and Mortgage Tracking features
- Selection persists across page navigation and refreshes

#### 2. Shared Component Library

**Location**: `client/src/shared/components/`

**Components**:

**StatDisplay** (`stat-display.tsx`):

- Displays metrics with consistent styling
- Supports variants (default, success, warning, error)
- Supports sizes (sm, md, lg)
- Optional subtitle and test ID support

**PageSkeleton** (`page-skeleton.tsx`):

- Configurable loading skeleton
- Supports header, cards, and charts
- Customizable counts for each section

**EmptyState** (`empty-state.tsx`):

- Three variants: default (card), centered, minimal
- Optional icon, action buttons, and numbered items list
- Consistent empty state UX across features

**Form Components** (`forms/`):

- `FormSection`: Card wrapper for form sections
- `FormField`: Standardized field with label, error, and hint

**Benefits**:

- Reduced code duplication by ~40%
- Consistent UI patterns across features
- Easier maintenance (single source of truth)

#### 3. Form Validation System

**Location**:

- `client/src/shared/utils/form-validation.ts` - Validation functions
- `client/src/shared/hooks/use-form-validation.ts` - Form field hooks
- `client/src/shared/constants/validation-messages.ts` - Error messages

**Validation Functions**:

- `required`, `positiveNumber`, `nonNegativeNumber`
- `numberRange`, `minLength`, `maxLength`
- `email`, `date`, `futureDate`, `pastDate`
- `percentage`, `interestRate`
- `lessThan`, `greaterThan`
- `combineValidations` - Combine multiple validators

**Form Field Hook**:

```typescript
import { useFormField } from "@/shared/hooks/use-form-validation";
import { required, positiveNumber } from "@/shared/utils/form-validation";

const nameField = useFormField({
  initialValue: "",
  validate: required,
});

const ageField = useFormField({
  initialValue: 0,
  validate: positiveNumber,
});
```

**Benefits**:

- Consistent validation patterns
- Type-safe validation
- Better UX (errors shown only after interaction)
- Reusable validation logic
- Standardized error messages

**Documentation**: See `docs/FORM_VALIDATION_GUIDE.md` for complete usage guide.

### Data Fetching Patterns

**Query Keys Strategy**:

```typescript
// Simple
queryKey: ["/api/mortgages"];

// With ID (hierarchical)
queryKey: ["/api/mortgages", mortgageId, "terms"];

// With filters
queryKey: ["/api/scenarios", { horizon: "10yr" }];
```

**Cache Invalidation**:

```typescript
// Invalidate all mortgages
queryClient.invalidateQueries({ queryKey: ["/api/mortgages"] });

// Invalidate specific mortgage terms
queryClient.invalidateQueries({ queryKey: ["/api/mortgages", id, "terms"] });
```

**Loading States**:

```typescript
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage />;
return <Content data={data} />;
```

**Mutations**:

```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    return apiRequest("POST", "/api/scenarios", data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/scenarios"] });
    toast({ title: "Scenario created" });
  },
  onError: (error) => {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  },
});
```

---

## Calculation Engines

### 1. Canadian Mortgage Calculation Engine

**Locations**:

- **Server:** `server/src/shared/calculations/mortgage.ts` (authoritative amortization + compliance checks)
- **Shared Client Helper:** `client/src/features/mortgage-tracking/utils/mortgage-math.ts` (used by tracker, dashboard, scenario planner)
- **Prime Rate Service:** `server/src/application/services/prime-rate-tracking.service.ts` + `client/src/features/mortgage-tracking/hooks/use-prime-rate.ts`
- **Blend-and-Extend:** `server/src/shared/calculations/blend-and-extend.ts`

**Core Functions**:

#### Semi-Annual Compounding

```typescript
function getEffectiveRate(nominalRate: number, frequency: PaymentFrequency): number {
  // Canadian mortgages compound semi-annually
  const semiAnnualRate = nominalRate / 2;
  const effectiveSemiAnnual = Math.pow(1 + semiAnnualRate, 2) - 1;

  const paymentsPerYear = getPaymentsPerYear(frequency);
  const effectiveRate = Math.pow(1 + effectiveSemiAnnual, 1 / paymentsPerYear) - 1;

  return effectiveRate;
}
```

**Why This Matters**:

- US mortgages: compound monthly
- Canadian mortgages: compound semi-annually (2x per year)
- Affects effective interest rate
- Different effective rates for each payment frequency

#### Payment Calculation

```typescript
function calculatePayment(
  principal: number,
  annualRate: number,
  amortizationMonths: number,
  frequency: PaymentFrequency
): number {
  const effectiveRate = getEffectiveRate(annualRate, frequency);
  const numPayments = getPaymentsPerYear(frequency) * (amortizationMonths / 12);

  if (effectiveRate === 0) return principal / numPayments;

  // Standard mortgage payment formula
  const payment =
    (principal * (effectiveRate * Math.pow(1 + effectiveRate, numPayments))) /
    (Math.pow(1 + effectiveRate, numPayments) - 1);

  return payment;
}
```

#### Accelerated Payment Calculation

```typescript
// For accelerated frequencies
if (frequency === "accelerated-biweekly") {
  const monthlyPayment = calculatePayment(principal, annualRate, amortizationMonths, "monthly");
  return monthlyPayment / 2; // Half of monthly payment, paid 26x/year
}
```

**Result**: More principal paid per year, faster payoff

#### Amortization Schedule Generation

```typescript
function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  amortizationMonths: number,
  frequency: PaymentFrequency,
  startDate: Date,
  prepayments?: Prepayment[]
): AmortizationSchedule {
  // Calculate regular payment
  const regularPayment = calculatePayment(principal, annualRate, amortizationMonths, frequency);

  let balance = principal;
  const payments: PaymentDetail[] = [];

  for (let i = 0; i < totalPayments && balance > 0; i++) {
    const interest = balance * effectiveRate;
    const principalPortion = Math.min(regularPayment - interest, balance);

    // Apply prepayments
    const prepayment = getPrepaymentForPayment(i, prepayments);
    const totalPrincipal = principalPortion + prepayment;

    balance -= totalPrincipal;

    payments.push({
      paymentNumber: i + 1,
      paymentAmount: regularPayment,
      interest,
      principal: principalPortion,
      prepayment,
      remainingBalance: Math.max(0, balance),
      // ... other fields
    });
  }

  return { payments, summary };
}
```

#### Trigger Rate & Negative Amortization (VRM-Fixed Payment)

**Location**: `server/src/shared/calculations/mortgage.ts`

For Variable Rate Mortgages with Fixed Payment (VRM-Fixed Payment), the system calculates and tracks trigger rate conditions:

```typescript
function calculateTriggerRate(
  paymentAmount: number,
  remainingBalance: number,
  frequency: PaymentFrequency
): number {
  // Trigger rate is the rate at which payment = interest only
  // When rate exceeds trigger rate, payment doesn't cover interest
  // Result: negative amortization (balance increases)
}

function isTriggerRateHit(
  currentRate: number,
  paymentAmount: number,
  remainingBalance: number,
  frequency: PaymentFrequency
): boolean {
  const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
  return currentRate >= triggerRate;
}
```

**Behavior When Trigger Rate Hit**:

- Payment amount stays constant (fixed payment)
- Payment doesn't cover full interest
- Unpaid interest is added to principal (negative amortization)
- Balance increases instead of decreases
- Prepayments can still be made to reduce negative amortization
- System tracks `triggerRateHit` flag in payment records

#### Blend-and-Extend Renewals

**Location**: `server/src/shared/calculations/blend-and-extend.ts`

Blend-and-extend is a renewal option that combines the old rate with a new rate and extends amortization:

```typescript
function calculateBlendAndExtend(input: BlendAndExtendInput): BlendAndExtendResult {
  // Blends old rate (for remaining term) with new rate (for extended term)
  // Calculates new payment amount with extended amortization
  // Returns blended rate and new payment amount
}
```

**API Endpoint**: `POST /api/mortgage-terms/:id/blend-and-extend`

**Use Cases**:

- Lock in lower rate before term ends
- Extend amortization to reduce payment
- Combine benefits of old and new rates

#### Refinancing Events in Projections

**Location**: `server/src/api/routes/mortgage.routes.ts` (projection endpoint)

Refinancing events are applied during amortization schedule generation:

- Year-based refinancing: Applied at specified year from mortgage start
- Term-end refinancing: Applied at the end of each term
- Supports rate changes, term type changes, amortization extensions, payment frequency changes
- Integrated with prepayment events for comprehensive scenario modeling

### 2. Net Worth Projection Engine

**Location**: `server/src/shared/calculations/projections.ts`

**Core Algorithm**:

#### Monthly Surplus Calculation

```typescript
function calculateMonthlySurplus(cashFlow?: CashFlow): number {
  if (!cashFlow) return 0;

  // Annual income
  const totalIncome = monthlyIncome * 12 + monthlyIncome * extraPaycheques + annualBonus;

  // All expenses (converted to annual)
  const totalExpenses =
    propertyTax +
    homeInsurance +
    condoFees * 12 +
    utilities * 12 +
    groceries * 12 +
    dining * 12 +
    transportation * 12 +
    entertainment * 12 +
    carLoan * 12 +
    studentLoan * 12 +
    creditCard * 12;

  const annualSurplus = totalIncome - totalExpenses;
  return annualSurplus / 12; // Monthly surplus
}
```

#### Investment Growth Calculation

```typescript
function calculateInvestments(
  scenario: Scenario,
  monthlySurplus: number,
  years: number
): { value: number; contributions: number; returns: number } {
  const investmentPercent = scenario.investmentMonthlyPercent || 0;
  const monthlyInvestment = (monthlySurplus * investmentPercent) / 100;
  const annualReturn = parseFloat(scenario.expectedReturnRate || "7") / 100;

  let value = 0;
  let totalContributions = 0;

  // Compound monthly
  for (let month = 0; month < years * 12; month++) {
    value += monthlyInvestment;
    totalContributions += monthlyInvestment;
    value *= 1 + annualReturn / 12; // Monthly compounding
  }

  return {
    value: Math.round(value * 100) / 100,
    contributions: Math.round(totalContributions * 100) / 100,
    returns: Math.round((value - totalContributions) * 100) / 100,
  };
}
```

#### Yearly Projections Generation

```typescript
export function generateProjections(
  params: ProjectionParams,
  maxYears: number = 30,
  currentRate: number = 0.0549
): YearlyProjection[] {
  const monthlySurplus = Math.max(0, calculateMonthlySurplus(cashFlow));
  const prepayments = generatePrepayments(scenario, monthlySurplus);

  // Generate mortgage amortization with prepayments
  const schedule = generateAmortizationSchedule(
    parseFloat(mortgage.currentBalance),
    currentRate,
    amortizationMonths,
    mortgage.paymentFrequency,
    new Date(mortgage.startDate),
    prepayments
  );

  const projections: YearlyProjection[] = [];

  // Year 0: Baseline (current state)
  projections.push({
    year: 0,
    netWorth: propertyValue - initialBalance + initialEF,
    mortgageBalance: initialBalance,
    investmentValue: 0,
    emergencyFundValue: initialEF,
    // ...
  });

  // Years 1-30
  for (let year = 1; year <= maxYears; year++) {
    const paymentIndex = Math.min(year * paymentsPerYear - 1, schedule.payments.length - 1);
    const mortgageData = schedule.payments[paymentIndex];

    const investments = calculateInvestments(scenario, monthlySurplus, year);
    const efValue = calculateEmergencyFund(emergencyFund, monthlySurplus, year);

    // Net Worth = Assets - Liabilities
    const netWorth = propertyValue - mortgageData.remainingBalance + investments.value + efValue;

    projections.push({
      year,
      netWorth: Math.round(netWorth),
      mortgageBalance: Math.round(mortgageData.remainingBalance),
      investmentValue: Math.round(investments.value),
      emergencyFundValue: Math.round(efValue),
      cumulativeInterestPaid: Math.round(mortgageData.cumulativeInterest),
      cumulativePrepayments: Math.round(mortgageData.cumulativePrepayments),
      cumulativeInvestments: Math.round(investments.contributions),
    });
  }

  return projections; // Array of 31 items: year 0-30
}
```

#### Scenario Metrics Calculation

```typescript
export function calculateScenarioMetrics(
  params: ProjectionParams,
  currentRate: number = 0.0549
): ScenarioMetrics {
  const projections = generateProjections(params, 30, currentRate);

  // Extract 10/20/30 year metrics
  // Note: projections array is indexed [0-30], where index = year
  const proj10 = projections[10]; // Year 10
  const proj20 = projections[20]; // Year 20
  const proj30 = projections[30]; // Year 30

  const investments10 = calculateInvestments(scenario, monthlySurplus, 10);
  const investments20 = calculateInvestments(scenario, monthlySurplus, 20);
  const investments30 = calculateInvestments(scenario, monthlySurplus, 30);

  return {
    netWorth10yr: proj10?.netWorth || 0,
    netWorth20yr: proj20?.netWorth || 0,
    netWorth30yr: proj30?.netWorth || 0,
    mortgageBalance10yr: proj10?.mortgageBalance || 0,
    mortgageBalance20yr: proj20?.mortgageBalance || 0,
    mortgageBalance30yr: proj30?.mortgageBalance || 0,
    mortgagePayoffYear: Math.round(payoffYear * 10) / 10,
    totalInterestPaid: Math.round(totalInterest),
    investments10yr: Math.round(investments10.value),
    investments20yr: Math.round(investments20.value),
    investments30yr: Math.round(investments30.value),
    investmentReturns10yr: Math.round(investments10.returns),
    investmentReturns20yr: Math.round(investments20.returns),
    investmentReturns30yr: Math.round(investments30.returns),
    emergencyFundStatus: efStatus,
    avgMonthlySurplus: Math.round(monthlySurplus),
  };
}
```

**Key Features**:

- Horizon-aware metrics (10/20/30 years)
- Correct projection array indexing (0-30)
- Integration of mortgage + investments + EF
- Cumulative tracking (interest, prepayments, contributions)

---

## API Design

### RESTful Principles

**Resource-Based URLs**:

```
GET    /api/mortgages           # List all mortgages
GET    /api/mortgages/:id       # Get specific mortgage
POST   /api/mortgages           # Create mortgage
PATCH  /api/mortgages/:id       # Update mortgage
DELETE /api/mortgages/:id       # Delete mortgage
```

**Nested Resources**:

```
GET    /api/mortgages/:mortgageId/terms
POST   /api/mortgages/:mortgageId/terms
GET    /api/mortgages/:mortgageId/payments
POST   /api/mortgages/:mortgageId/payments
```

**HTTP Methods**:

- GET: Retrieve resource(s)
- POST: Create new resource
- PATCH: Partial update existing resource
- DELETE: Remove resource

**Status Codes**:

- 200: Success
- 201: Created (not currently used, could add)
- 400: Bad Request (validation error)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

### Complete API Reference

#### Cash Flow

```
GET    /api/cash-flow               # Get user's cash flow
POST   /api/cash-flow               # Create cash flow
PATCH  /api/cash-flow/:id           # Update cash flow
```

#### Emergency Fund

```
GET    /api/emergency-fund          # Get user's emergency fund
POST   /api/emergency-fund          # Create emergency fund
PATCH  /api/emergency-fund/:id      # Update emergency fund
```

#### Mortgages

```
GET    /api/mortgages                       # List user's mortgages
GET    /api/mortgages/:id                   # Get specific mortgage
POST   /api/mortgages                       # Create mortgage
PATCH  /api/mortgages/:id                   # Update mortgage
DELETE /api/mortgages/:id                   # Delete mortgage
GET    /api/mortgages/:id/projections       # Get mortgage projections
GET    /api/mortgages/:id/health            # Get mortgage health score
POST   /api/mortgages/:id/penalty           # Calculate penalty
POST   /api/mortgage-terms/:id/blend-and-extend  # Blend-and-extend calculation
```

#### Mortgage Terms

```
GET    /api/mortgages/:mortgageId/terms     # List terms for mortgage
POST   /api/mortgages/:mortgageId/terms     # Create term
PATCH  /api/mortgage-terms/:id              # Update term
DELETE /api/mortgage-terms/:id              # Delete term
```

#### Mortgage Payments

```
GET    /api/mortgages/:mortgageId/payments  # List payments for mortgage
GET    /api/mortgage-terms/:termId/payments # List payments for term
POST   /api/mortgages/:mortgageId/payments  # Create payment
```

#### Prepayments

```
POST   /api/prepayment/calculate            # Calculate prepayment impact
POST   /api/prepayment/apply                # Apply prepayment
GET    /api/prepayment/recommendations      # Get prepayment recommendations
```

#### Scenarios

```
GET    /api/scenarios                       # List user's scenarios
GET    /api/scenarios/:id                   # Get specific scenario
GET    /api/scenarios/with-projections      # Get all scenarios with metrics
POST   /api/scenarios                       # Create scenario
PATCH  /api/scenarios/:id                   # Update scenario
DELETE /api/scenarios/:id                   # Delete scenario
GET    /api/scenarios/templates             # Get scenario templates
```

#### Prepayment Events

```
GET    /api/scenarios/:scenarioId/prepayment-events  # List events for scenario
POST   /api/scenarios/:scenarioId/prepayment-events  # Create event
PATCH  /api/prepayment-events/:id                    # Update event
DELETE /api/prepayment-events/:id                    # Delete event
```

#### Refinancing Events

```
GET    /api/scenarios/:scenarioId/refinancing-events  # List events for scenario
POST   /api/scenarios/:scenarioId/refinancing-events  # Create event
PATCH  /api/refinancing-events/:id                    # Update event
DELETE /api/refinancing-events/:id                    # Delete event
```

#### HELOC

```
GET    /api/heloc                           # List HELOC accounts
GET    /api/heloc/:id                       # Get HELOC account
POST   /api/heloc                           # Create HELOC account
PATCH  /api/heloc/:id                       # Update HELOC account
POST   /api/heloc/:id/transactions          # Record HELOC transaction
GET    /api/heloc/:id/credit-room           # Calculate credit room
```

#### Renewals

```
GET    /api/renewals                        # List upcoming renewals
GET    /api/renewals/:mortgageId            # Get renewal info for mortgage
POST   /api/renewals/:mortgageId/workflow   # Start renewal workflow
GET    /api/renewals/:mortgageId/recommendations  # Get renewal recommendations
GET    /api/renewals/:mortgageId/analytics  # Get renewal analytics
```

#### Property Value

```
GET    /api/property-value/:mortgageId      # Get property value history
POST   /api/property-value                  # Record property value
GET    /api/property-value/:mortgageId/trend  # Get property value trend
GET    /api/property-value/:mortgageId/projection  # Get property value projection
```

#### Prime Rate & Market Rates

```
GET    /api/prime-rate                      # Get current prime rate
GET    /api/prime-rate/history              # Get prime rate history
GET    /api/market-rates                    # Get market rates
```

#### Notifications

```
GET    /api/notifications                   # List user notifications
PATCH  /api/notifications/:id/read          # Mark notification as read
GET    /api/notifications/preferences       # Get notification preferences
PATCH  /api/notifications/preferences       # Update notification preferences
```

#### Smith Maneuver

```
GET    /api/smith-maneuver                  # Get Smith Maneuver strategy
POST   /api/smith-maneuver                  # Create Smith Maneuver strategy
GET    /api/smith-maneuver/:id/roi          # Get ROI analysis
GET    /api/smith-maneuver/:id/comparison   # Get prepayment comparison
```

#### Tax

```
GET    /api/tax/brackets                    # Get tax brackets
GET    /api/tax/marginal-rates              # Get marginal tax rates
POST   /api/tax/calculate                   # Calculate tax
```

#### Simulations

```
POST   /api/simulations/monte-carlo         # Run Monte Carlo simulation
POST   /api/simulations/what-if             # What-if rate change analysis
```

#### Insurance

```
POST   /api/insurance/cmhc                  # Calculate CMHC insurance premium
```

#### Impact Calculator

```
POST   /api/impact                          # Calculate financial impact
```

#### Utility

```
POST   /api/seed-demo                       # Seed demo data (dev only)
GET    /api/health                          # Health check
```

### Request/Response Examples

**Create Scenario**:

```http
POST /api/scenarios
Content-Type: application/json

{
  "name": "Aggressive Prepayment",
  "description": "Focus on paying off mortgage quickly",
  "prepaymentMonthlyPercent": 80,
  "investmentMonthlyPercent": 20,
  "expectedReturnRate": 6.5,
  "efPriorityPercent": 0
}
```

**Response**:

```json
{
  "id": "uuid-here",
  "userId": "dev-user-123",
  "name": "Aggressive Prepayment",
  "description": "Focus on paying off mortgage quickly",
  "prepaymentMonthlyPercent": 80,
  "investmentMonthlyPercent": 20,
  "expectedReturnRate": "6.500",
  "efPriorityPercent": 0,
  "createdAt": "2024-12-15T10:30:00Z",
  "updatedAt": "2024-12-15T10:30:00Z"
}
```

**Get Scenarios With Projections**:

```http
GET /api/scenarios/with-projections
```

**Response**:

```json
[
  {
    "id": "uuid-1",
    "name": "Aggressive Prepayment",
    "description": "...",
    "prepaymentMonthlyPercent": 80,
    "investmentMonthlyPercent": 20,
    "expectedReturnRate": "6.500",
    "metrics": {
      "netWorth10yr": 450000,
      "netWorth20yr": 800000,
      "netWorth30yr": 1500000,
      "mortgageBalance10yr": 200000,
      "mortgageBalance20yr": 0,
      "mortgageBalance30yr": 0,
      "mortgagePayoffYear": 15.3,
      "totalInterestPaid": 180000,
      "investments10yr": 50000,
      "investments20yr": 250000,
      "investments30yr": 600000,
      "emergencyFundStatus": "Funded",
      "avgMonthlySurplus": 1500
    },
    "projections": [
      { "year": 0, "netWorth": 150000 /* ... */ },
      { "year": 1, "netWorth": 165000 /* ... */ }
      // ... years 2-30
    ]
  }
]
```

---

## Data Flow

### Create Scenario Flow

```
User fills form
  ↓
React Hook Form validates (Zod schema)
  ↓
onSubmit triggered
  ↓
useMutation.mutate(data)
  ↓
apiRequest("POST", "/api/scenarios", data)
  ↓
POST /api/scenarios
  ↓
devAuth middleware adds req.user
  ↓
Route handler validates with insertScenarioSchema
  ↓
storage.createScenario(data)
  ↓
Save to PostgreSQL database
  ↓
Return created scenario
  ↓
onSuccess callback
  ↓
queryClient.invalidateQueries({ queryKey: ["/api/scenarios"] })
  ↓
TanStack Query refetches scenarios
  ↓
UI updates with new scenario
  ↓
Toast notification shown
```

### Dashboard Page Load Flow

```
User navigates to "/"
  ↓
DashboardPage component mounts
  ↓
Multiple useQuery hooks fire:
  - useQuery({ queryKey: ["/api/mortgages"] })
  - useQuery({ queryKey: ["/api/scenarios/with-projections"] })
  - useQuery({ queryKey: ["/api/emergency-fund"] })
  - useQuery({ queryKey: ["/api/cash-flow"] })
  ↓
Parallel API requests
  ↓
Responses cached by TanStack Query
  ↓
Component renders with data
  ↓
Charts render with Recharts
  ↓
User selects different horizon (10/20/30)
  ↓
React state updates
  ↓
getMetricForHorizon helper extracts correct values
  ↓
UI re-renders with new horizon data
```

### Projection Calculation Flow

```
GET /api/scenarios/with-projections
  ↓
Fetch all scenarios for user
  ↓
For each scenario:
  ↓
  Fetch related data:
    - Mortgage
    - Cash Flow
    - Emergency Fund
  ↓
  calculateScenarioMetrics(params, currentRate)
    ↓
    generateProjections(params, 30, currentRate)
      ↓
      calculateMonthlySurplus(cashFlow) → $1,500
      ↓
      generatePrepayments(scenario, surplus) → $1,200/month to mortgage
      ↓
      generateAmortizationSchedule(mortgage, rate, amortization, frequency, prepayments)
        ↓
        For each payment (1 to ~650):
          - Calculate interest
          - Calculate principal
          - Apply prepayment
          - Update balance
        ↓
        Return schedule with 650 payments
      ↓
      For each year (0 to 30):
        - Extract mortgage data at year boundary
        - calculateInvestments(scenario, surplus, year) → $50K at year 10
        - calculateEmergencyFund(ef, surplus, year) → $18K at year 10
        - Calculate net worth = property - mortgage + investments + EF
        - Store in projections array
      ↓
      Return projections array [year 0...30]
    ↓
    Extract 10/20/30 year metrics from projections[10/20/30]
    ↓
    Return ScenarioMetrics object
  ↓
Return array of scenarios with metrics and projections
```

---

## Security & Authentication

### Current Implementation (Development)

**Dev Auth Middleware**:

```typescript
export function devAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    (req as any).user = {
      id: "dev-user-123",
      username: "devuser",
    };
  }
  next();
}
```

**Applied**: All `/api/*` routes
**Effect**: Every request gets same user
**Security**: ⚠️ NOT FOR PRODUCTION

### Planned: Replit Auth

**Why Replit Auth:**

- Built-in OAuth (Google, GitHub, etc.)
- Automatic session management
- Secure by default
- Multi-user support
- No manual user management

**Implementation Plan**:

1. Replace `devAuth` with Replit Auth middleware
2. Update user schema for Replit user IDs
3. Add session store (PostgreSQL-backed)
4. Add logout endpoint
5. Protect all API routes
6. Add user profile page

**Code Changes Needed**:

```typescript
// Replace this:
app.use("/api", devAuth);

// With this:
import { requireAuth } from "@replit/repl-auth";
app.use("/api", requireAuth());
```

### Data Isolation

**Current**:

- All API routes check `req.user.id`
- Storage layer filters by `userId`
- Users can only access their own data

**Example**:

```typescript
app.get("/api/scenarios", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const scenarios = await storage.getScenariosByUser(req.user.id);
  res.json(scenarios);
});
```

### Input Validation

**Layers**:

1. Frontend: React Hook Form + Zod (prevent bad UX)
2. Backend: Zod validation (prevent bad data)
3. Database: Type constraints, NOT NULL (last line of defense)

**POST Validation Example**:

```typescript
app.post("/api/scenarios", async (req, res) => {
  try {
    const data = insertScenarioSchema.parse({
      ...req.body,
      userId: req.user.id,
    });
    const scenario = await storage.createScenario(data);
    res.json(scenario);
  } catch (error) {
    res.status(400).json({
      error: "Invalid scenario data",
      details: error,
    });
  }
});
```

**PATCH Validation Pattern** (Completed Nov 18, 2024):

All update endpoints now use dedicated update schemas that:

- Omit immutable fields (id, userId, createdAt, updatedAt)
- Make all fields partial (optional) for flexible updates
- Preserve number→string transformations for decimal fields

**Update Schema Pattern**:

```typescript
// Example: updateCashFlowSchema
export const updateCashFlowSchema = insertCashFlowSchema
  .omit({ id: true, userId: true })
  .partial()
  .extend({
    // All decimal fields accept both numbers and strings
    monthlyIncome: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    propertyTax: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    // ... all other decimal fields
  });
```

**PATCH Endpoint Example**:

```typescript
app.patch("/api/cash-flow/:id", async (req, res) => {
  try {
    // Validate with update schema (partial, optional fields)
    const updates = updateCashFlowSchema.parse(req.body);
    const cashFlow = await storage.updateCashFlow(req.params.id, updates);
    res.json(cashFlow);
  } catch (error) {
    res.status(400).json({
      error: "Invalid update data",
      details: error,
    });
  }
});
```

**Update Schemas Created**:

- `updateCashFlowSchema` - 13 decimal fields with transformations
- `updateEmergencyFundSchema` - Target, balance, contribution fields
- `updateMortgageSchema` - Property details, balance, frequency
- `updateMortgageTermSchema` - Term details, rates, payment amounts

**Applied To**:

- PATCH /api/cash-flow/:id
- PATCH /api/emergency-fund/:id
- PATCH /api/mortgages/:id
- PATCH /api/mortgage-terms/:id

**Benefits**:

- Type-safe updates with partial data
- Prevents frontend number/string type mismatches
- Consistent validation across all update operations
- Proper immutability enforcement (can't change IDs)

### SQL Injection Prevention

**Drizzle ORM**:

- Parameterized queries
- No raw SQL (except for schema defaults)
- Type-safe query builder

**Safe**:

```typescript
await db.select().from(scenarios).where(eq(scenarios.userId, userId));
```

**Not Needed** (Drizzle handles this):

```typescript
// Don't do this:
await db.execute(`SELECT * FROM scenarios WHERE user_id = '${userId}'`);
```

---

## Deployment & Infrastructure

### Development Environment

**Prerequisites**:

- Node.js 20+
- PostgreSQL 14+
- npm

**Setup**:

```bash
npm install
npm run db:push
npm run dev
```

**Development Server**:

- Vite dev server: Port 5000
- Express API embedded in Vite
- Hot module reload (HMR)
- Automatic restarts on backend changes

### Docker Setup

**Dockerfile**:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]
```

**docker-compose.yml**:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mortgage_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/mortgage_app
    depends_on:
      - db
    command: sh -c "npm run db:push && npm run dev"
```

**Run**:

```bash
docker-compose up
```

### Production Deployment (Planned)

**Platform Options**:

- **Replit Deployments**: One-click deploy, automatic scaling
- **Vercel**: Frontend + Serverless Functions
- **Railway**: Fullstack with PostgreSQL
- **Fly.io**: Global edge deployment
- **Heroku**: Classic PaaS

**Environment Variables Needed**:

```
DATABASE_URL=postgresql://...
SESSION_SECRET=<random-string>
NODE_ENV=production
```

**Build Process**:

```bash
npm run build     # Build frontend + backend
npm start         # Start production server
```

**Database Migrations**:

```bash
npm run db:push   # Push schema to production DB
```

### Monitoring & Logging

**Current**: Console.log statements

**Planned**:

- Structured logging (Winston, Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic, Datadog)
- Uptime monitoring (UptimeRobot)

### Scalability Considerations

**Current Architecture**:

- PostgreSQL database (persistent, scalable)
- Repository pattern for data access (29 repositories)
- Service layer for business logic (50+ services)
- Synchronous calculations (with optimization opportunities)
- Scheduled jobs for background tasks (prime rate updates, notifications, etc.)

**Scaling Strategy**:

- **Database**: PostgreSQL scales well with connection pooling and read replicas
- **Caching**: Add Redis for projection caching (future enhancement)
- **Calculations**: Background jobs for expensive calculations (Bull, BullMQ)
- **Load Balancing**: Horizontal scaling with PostgreSQL session store
- **CDN**: Static assets via Vite build output
- **Database Indexes**: Key indexes on foreign keys and frequently queried fields

---

## Performance Optimizations

### Frontend Optimizations

**Code Splitting**:

- Route-based code splitting (Wouter + React.lazy)
- Component lazy loading
- Vite optimizes automatically

**TanStack Query Optimizations**:

```typescript
// Stale time: Don't refetch for 5 minutes
useQuery({
  queryKey: ["/api/mortgages"],
  staleTime: 5 * 60 * 1000,
});

// Prefetching
queryClient.prefetchQuery({
  queryKey: ["/api/scenarios"],
});
```

**Image Optimization**:

- No images in MVP
- Future: Use `<img loading="lazy">` or Next.js Image

### Backend Optimizations

**Database Queries**:

- Select only needed fields
- Use indexes on foreign keys
- Avoid N+1 queries

**Caching Strategy** (Future):

- Cache projection calculations (expensive)
- Cache scenario metrics
- Invalidate on scenario/mortgage update

**Example**:

```typescript
// Cache key: `projections:${scenarioId}:${mortgageId}:${currentRate}`
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const projections = generateProjections(params);
await redis.set(cacheKey, JSON.stringify(projections), "EX", 3600);
return projections;
```

### Calculation Optimizations

**Current**:

- Calculations run on every request
- No memoization
- Synchronous execution

**Optimizations Applied**:

- Early returns for zero surplus
- Rounding to avoid floating point issues
- Array pre-allocation
- Minimal object creation in loops

**Future**:

- Memoize projection calculations
- Web Workers for heavy calculations (frontend)
- Background jobs for batch recalculation (backend)

---

## Testing Strategy

### Current Testing

**End-to-End Testing**:

- Playwright-based testing via `run_test` tool
- Tested pages:
  - Emergency Fund
  - Scenario Editor
  - Scenario List
  - Comparison
  - Dashboard
  - Mortgage (Edit Details)

**Testing Pattern**:

```
1. [New Context] Create browser context
2. [Browser] Navigate to page
3. [Verify] Check elements exist
4. [Browser] Interact (click, type, select)
5. [Verify] Assert outcomes
6. [API] Verify backend state
```

**Coverage**:

- Happy paths tested
- Core user workflows validated
- API integration verified
- UI interactions confirmed

### Future Testing

**Unit Tests** (Planned):

- Calculation engines
- Storage layer
- API route handlers
- React components

**Integration Tests** (Planned):

- Full API endpoint testing
- Database integration
- Projection calculation accuracy

**Performance Tests** (Planned):

- Load testing with k6
- Projection calculation benchmarks
- Database query performance

---

## Known Issues & Limitations

### TypeScript Type Safety

**Status**: ✅ Type definitions in place
**Implementation**: Express User type declared in `server/src/types/express.d.ts`
**Note**: Type-safe request handling with proper user type inference

### Single User Limitation

**Current**: Dev auth creates single user
**Impact**: Can't test multi-user scenarios
**Fix**: Implement Replit Auth

### Database Storage

**Current**: PostgreSQL database with Drizzle ORM
**Status**: ✅ Persistent storage fully implemented
**Implementation**: 29 repositories with type-safe queries
**Note**: All data persists across server restarts, supports both Neon serverless and standard PostgreSQL

### No Real-Time Updates

**Current**: Polling via TanStack Query
**Impact**: Changes not instant across tabs
**Fix**: Add WebSocket for real-time updates

### Calculation Performance

**Current**: Synchronous, blocks on complex scenarios
**Impact**: Slow response on /api/scenarios/with-projections
**Fix**: Cache projections, use background jobs

---

**Document Version**: 1.3  
**Last Updated**: January 2025  
**For**: Canadian Mortgage Strategy & Wealth Forecasting Application
