# Canadian Mortgage Strategy & Wealth Forecasting
## Technical Architecture & Implementation Documentation

**Last Updated**: November 18, 2024  
**Version**: MVP 1.0 (All Core Pages Complete)  
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
│  │  - In-Memory Storage Layer (IStorage)               │  │
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

**8 Core Tables:**
1. `users` - User accounts
2. `cash_flow` - User income and expenses
3. `emergency_fund` - Emergency fund settings
4. `mortgages` - Mortgage details
5. `mortgage_terms` - Term-based rate locks (3-5 year periods)
6. `mortgage_payments` - Historical payment records
7. `scenarios` - Financial strategy scenarios
8. `prepayment_events` - Lump sum and recurring prepayment events

### Entity Relationship Diagram

```
users
  │
  ├─── cash_flow (1:1)
  │
  ├─── emergency_fund (1:1)
  │
  ├─── mortgages (1:N)
  │      │
  │      ├─── mortgage_terms (1:N)
  │      │       │
  │      │       └─── mortgage_payments (1:N)
  │      │
  │      └─── (implicitly linked to scenarios via userId)
  │
  └─── scenarios (1:N)
           │
           └─── prepayment_events (1:N)
```

### Table Definitions

#### 1. users
```typescript
{
  id: varchar (UUID, PK),
  username: text (unique),
  password: text  // Currently unused (dev auth)
}
```

**Purpose**: User authentication and data ownership
**Note**: Password field exists for future Replit Auth integration

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
**Current**: App assumes one mortgage per user

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
  paymentAmount: decimal(10,2),
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

### Database Indexes

**Automatic Indexes:**
- Primary keys (all `id` fields)
- Foreign keys (all `userId`, `mortgageId`, `scenarioId`, etc.)

**Performance Considerations:**
- Small dataset expected (<10K rows per table)
- No additional indexes needed at MVP scale
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
├── routes.ts              # All API route definitions
├── storage.ts             # Storage interface (IStorage) and implementation
├── devAuth.ts             # Development authentication middleware
├── seed.ts                # Demo data seeding
├── types.d.ts             # Express type extensions
├── vite.ts                # Vite dev server integration
├── calculations/
│   ├── mortgage.ts        # Mortgage payment calculations
│   └── projections.ts     # Net worth projection engine
└── index.ts               # App entry point
```

### Storage Layer (IStorage Interface)

**Purpose**: Abstract database operations for testability and flexibility

**Pattern**: Repository pattern
- Interface defines all CRUD operations
- `MemStorage` implements interface with in-memory storage
- Future: Can swap for different storage backends

**Interface Definition**:
```typescript
interface IStorage {
  // Cash Flow
  getCashFlow(userId: string): Promise<CashFlow | null>
  createCashFlow(data: InsertCashFlow): Promise<CashFlow>
  updateCashFlow(id: string, data: Partial<InsertCashFlow>): Promise<CashFlow>
  
  // Emergency Fund
  getEmergencyFund(userId: string): Promise<EmergencyFund | null>
  createEmergencyFund(data: InsertEmergencyFund): Promise<EmergencyFund>
  updateEmergencyFund(id: string, data: Partial<InsertEmergencyFund>): Promise<EmergencyFund>
  
  // Mortgages
  getMortgage(id: string): Promise<Mortgage | null>
  getMortgagesByUser(userId: string): Promise<Mortgage[]>
  createMortgage(data: InsertMortgage): Promise<Mortgage>
  updateMortgage(id: string, data: Partial<InsertMortgage>): Promise<Mortgage>
  deleteMortgage(id: string): Promise<void>
  
  // Mortgage Terms
  getMortgageTerm(id: string): Promise<MortgageTerm | null>
  getMortgageTermsByMortgage(mortgageId: string): Promise<MortgageTerm[]>
  createMortgageTerm(data: InsertMortgageTerm): Promise<MortgageTerm>
  updateMortgageTerm(id: string, data: Partial<InsertMortgageTerm>): Promise<MortgageTerm>
  deleteMortgageTerm(id: string): Promise<void>
  
  // Mortgage Payments
  getMortgagePaymentsByMortgage(mortgageId: string): Promise<MortgagePayment[]>
  getMortgagePaymentsByTerm(termId: string): Promise<MortgagePayment[]>
  createMortgagePayment(data: InsertMortgagePayment): Promise<MortgagePayment>
  
  // Scenarios
  getScenario(id: string): Promise<Scenario | null>
  getScenariosByUser(userId: string): Promise<Scenario[]>
  createScenario(data: InsertScenario): Promise<Scenario>
  updateScenario(id: string, data: Partial<InsertScenario>): Promise<Scenario>
  deleteScenario(id: string): Promise<void>
  
  // Prepayment Events
  getPrepaymentEvent(id: string): Promise<PrepaymentEvent | null>
  getPrepaymentEventsByScenario(scenarioId: string): Promise<PrepaymentEvent[]>
  createPrepaymentEvent(data: InsertPrepaymentEvent): Promise<PrepaymentEvent>
  updatePrepaymentEvent(id: string, data: Partial<InsertPrepaymentEvent>): Promise<PrepaymentEvent>
  deletePrepaymentEvent(id: string): Promise<void>
}
```

**Implementation**: In-memory with Maps
```typescript
class MemStorage implements IStorage {
  private cashFlowData = new Map<string, CashFlow>()
  private emergencyFundData = new Map<string, EmergencyFund>()
  private mortgageData = new Map<string, Mortgage>()
  // ... etc
}
```

**Benefits**:
- Fast development (no database setup needed initially)
- Easy testing (reset state between tests)
- Type-safe operations
- Can swap to real database without changing routes

### Middleware Stack

**Request Pipeline**:
```
Incoming Request
  ↓
[Express JSON Parser]
  ↓
[Dev Auth Middleware] ← Adds req.user
  ↓
[Route Handler]
  ↓
[Zod Validation]
  ↓
[Storage Layer]
  ↓
[Response]
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
  "details": { /* Zod error details */ }
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

### Data Fetching Patterns

**Query Keys Strategy**:
```typescript
// Simple
queryKey: ["/api/mortgages"]

// With ID (hierarchical)
queryKey: ["/api/mortgages", mortgageId, "terms"]

// With filters
queryKey: ["/api/scenarios", { horizon: "10yr" }]
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

**Location**: `server/calculations/mortgage.ts`

**Core Functions**:

#### Semi-Annual Compounding
```typescript
function getEffectiveRate(
  nominalRate: number,
  frequency: PaymentFrequency
): number {
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
  const payment = principal * 
    (effectiveRate * Math.pow(1 + effectiveRate, numPayments)) /
    (Math.pow(1 + effectiveRate, numPayments) - 1);
  
  return payment;
}
```

#### Accelerated Payment Calculation
```typescript
// For accelerated frequencies
if (frequency === "accelerated-biweekly") {
  const monthlyPayment = calculatePayment(
    principal,
    annualRate,
    amortizationMonths,
    "monthly"
  );
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

### 2. Net Worth Projection Engine

**Location**: `server/calculations/projections.ts`

**Core Algorithm**:

#### Monthly Surplus Calculation
```typescript
function calculateMonthlySurplus(cashFlow?: CashFlow): number {
  if (!cashFlow) return 0;
  
  // Annual income
  const totalIncome = 
    (monthlyIncome * 12) + 
    (monthlyIncome * extraPaycheques) + 
    annualBonus;
  
  // All expenses (converted to annual)
  const totalExpenses = 
    propertyTax + homeInsurance + 
    (condoFees * 12) + (utilities * 12) +
    (groceries * 12) + (dining * 12) +
    (transportation * 12) + (entertainment * 12) +
    (carLoan * 12) + (studentLoan * 12) + (creditCard * 12);
  
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
    value *= (1 + annualReturn / 12); // Monthly compounding
  }
  
  return {
    value: Math.round(value * 100) / 100,
    contributions: Math.round(totalContributions * 100) / 100,
    returns: Math.round((value - totalContributions) * 100) / 100
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
    const paymentIndex = Math.min((year * paymentsPerYear) - 1, schedule.payments.length - 1);
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
      cumulativeInvestments: Math.round(investments.contributions)
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
    avgMonthlySurplus: Math.round(monthlySurplus)
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
GET    /api/mortgages               # List user's mortgages
GET    /api/mortgages/:id           # Get specific mortgage
POST   /api/mortgages               # Create mortgage
PATCH  /api/mortgages/:id           # Update mortgage
DELETE /api/mortgages/:id           # Delete mortgage
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

#### Scenarios
```
GET    /api/scenarios                       # List user's scenarios
GET    /api/scenarios/:id                   # Get specific scenario
GET    /api/scenarios/with-projections      # Get all scenarios with metrics
POST   /api/scenarios                       # Create scenario
PATCH  /api/scenarios/:id                   # Update scenario
DELETE /api/scenarios/:id                   # Delete scenario
```

#### Prepayment Events
```
GET    /api/scenarios/:scenarioId/prepayment-events  # List events for scenario
POST   /api/scenarios/:scenarioId/prepayment-events  # Create event
PATCH  /api/prepayment-events/:id                    # Update event
DELETE /api/prepayment-events/:id                    # Delete event
```

#### Utility
```
POST   /api/seed-demo                       # Seed demo data (dev only)
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
      { "year": 0, "netWorth": 150000, /* ... */ },
      { "year": 1, "netWorth": 165000, /* ... */ },
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
Save to database (or in-memory Map)
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
      userId: req.user.id 
    });
    const scenario = await storage.createScenario(data);
    res.json(scenario);
  } catch (error) {
    res.status(400).json({ 
      error: "Invalid scenario data", 
      details: error 
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
    monthlyIncome: z.union([z.string(), z.number()])
      .transform(val => typeof val === 'number' ? val.toFixed(2) : val),
    propertyTax: z.union([z.string(), z.number()])
      .transform(val => typeof val === 'number' ? val.toFixed(2) : val),
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
      details: error 
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
- In-memory storage (single instance only)
- No caching layer
- Synchronous calculations

**Future Scaling**:
- **Database**: Already PostgreSQL (scales well)
- **Storage**: Swap `MemStorage` for database storage
- **Caching**: Add Redis for projection caching
- **Calculations**: Move to background jobs (Bull, BullMQ)
- **Load Balancing**: Horizontal scaling with session affinity

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
await redis.set(cacheKey, JSON.stringify(projections), 'EX', 3600);
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

### TypeScript Errors

**Issue**: 59 TypeScript errors in `routes.ts`
**Cause**: `req.user` type inference
**Impact**: Non-blocking (app works fine)
**Fix Needed**: Proper Express User type declaration

### Single User Limitation

**Current**: Dev auth creates single user
**Impact**: Can't test multi-user scenarios
**Fix**: Implement Replit Auth

### In-Memory Storage

**Current**: Data lost on server restart
**Impact**: Good for development, bad for production
**Fix**: Swap to database-backed storage

### No Real-Time Updates

**Current**: Polling via TanStack Query
**Impact**: Changes not instant across tabs
**Fix**: Add WebSocket for real-time updates

### Calculation Performance

**Current**: Synchronous, blocks on complex scenarios
**Impact**: Slow response on /api/scenarios/with-projections
**Fix**: Cache projections, use background jobs

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**For**: Canadian Mortgage Strategy MVP
