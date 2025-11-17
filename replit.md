# Canadian Mortgage Strategy & Wealth Forecasting MVP

## Project Overview

A full-stack web application helping Canadians compare financial strategies for managing mortgages and building wealth. Users can model multiple scenarios side-by-side, comparing aggressive prepayment vs investment strategies over 10-30 year horizons.

**Tech Stack**: Express.js (backend) + React + TypeScript (frontend), PostgreSQL database, Shadcn UI components

## Current Status: Core MVP Functional with Horizon-Aware Projections ✅

### ✅ Completed (Nov 2024)
**Backend Infrastructure:**
- ✅ Database schema (8 entities: users, cash flow, EF, mortgages, terms, payments, scenarios, prepayment events)
- ✅ In-memory storage layer (IStorage) with full CRUD operations
- ✅ 30+ secure RESTful API routes with Zod validation
- ✅ Canadian mortgage calculation engine (semi-annual compounding implemented)
- ✅ Net worth projection engine (10-30 year forecasts with horizon-specific metrics)
- ✅ Dev auth middleware (temp mock, Replit Auth identified for later)
- ✅ **Horizon-aware metrics system**: All 10/20/30-year projections working across comparison UI
- ✅ **Projection array indexing**: Correctly indexed [0-30] for years 0-30 with baseline at index 0
- ✅ **Backend ES module fixes**: Resolved require() → import for calculate-mortgage-payment.js
- ✅ **30-year metric fields**: Added mortgageBalance30yr, investments30yr, investmentReturns30yr

**Frontend-Backend Integration (5/8 pages wired):**

1. ✅ **Emergency Fund Page** (wire-1):
   - GET/POST /api/emergency-fund with zero-safe calculations
   - Controlled inputs, cache invalidation, loading states
   - Helpful empty state when cash flow data missing
   - E2E tested ✅

2. ✅ **Scenario Editor Page** (wire-2):
   - GET/POST/PATCH /api/scenarios with UUID routing
   - Number type handling: expectedReturnRate sent as number (6.5), transformed to decimal string ("6.500") by backend
   - Cache invalidation for list + detail queries
   - Create → edit → update flow E2E tested ✅
   - **Critical fix**: Backend Zod schema now accepts both numbers and strings with `.transform()` normalization

3. ✅ **Scenario List Page** (wire-3):
   - GET /api/scenarios + DELETE /api/scenarios/:id
   - UUID-based edit links (prevents 404 errors from name slugs)
   - Delete functionality with AlertDialog confirmation (replaced window.confirm)
   - Empty state, loading skeleton, timestamp formatting
   - E2E tested ✅

4. ✅ **Comparison Page** (wire-4):
   - GET /api/scenarios/with-projections with horizon-specific projection metrics
   - Scenario selection (up to 4 simultaneous comparisons)
   - Horizon selector (10/20/30 year toggles) with getMetricForHorizon helper
   - All metrics table with horizon-aware values (net worth, mortgage balance, investments, etc.)
   - E2E tested ✅
   - Demo data seeded with 2 scenarios ("Aggressive Prepayment", "Balanced Builder")

5. ✅ **Dashboard Page** (wire-5):
   - GET /api/mortgages (array handling), /api/scenarios/with-projections, /api/emergency-fund, /api/cash-flow
   - Current financial snapshot: home equity, mortgage balance, emergency fund
   - Horizon selector (10/20/30 years) affecting all projection sections
   - Metric cards: Net Worth, Mortgage Balance, Investments (all horizon-aware)
   - Strategy Summary panel with dynamic horizon values
   - Charts: Net Worth projection, Mortgage balance, Investment growth
   - Scenario selector to compare different strategies
   - **Critical fixes**: NaN prevention with comprehensive guards, correct API contracts, proper mortgage reduction calculation (current → projected)
   - E2E tested ✅

6. ✅ **Mortgage Page - Edit Details** (wire-6-partial):
   - PATCH /api/mortgages/:id for updating mortgage details
   - Edit Details dialog with form pre-population
   - Editable fields: Property Value, Current Balance, Payment Frequency
   - Form validation, cache invalidation, toast notifications
   - E2E tested ✅

### 🚧 Next Tasks (3 pages remaining)
- wire-6: Complete Mortgage History Page (term tracking, payment history)
- wire-7: Wire Cash Flow Page  
- wire-8: Wire final remaining page
- Known issues: TypeScript req.user type errors (59 non-blocking errors in routes.ts)

## Key Product Differentiators

**vs Government Calculator:**
- ✅ Multi-scenario comparison (4 simultaneous vs 1)
- ✅ Investment alternative modeling (prepay vs invest)
- ✅ Cash flow integration
- ✅ Emergency fund consideration
- ✅ Net worth projections (10-30 years)

**vs Calculator.net:**
- ✅ Canadian-specific rules (semi-annual compounding, VRM types)
- ✅ 4-scenario simultaneous comparison
- ✅ Holistic financial picture (not just mortgage in isolation)

## Canadian Mortgage Specifics

**Semi-Annual Compounding:**
- Interest compounds twice per year (not monthly like US)
- Effective rate differs from nominal rate
- Payment frequency affects total interest paid

**Variable Rate Mortgages (VRM):**
- **VRM-Changing Payment**: Payment recalculates when Prime changes
- **VRM-Fixed Payment**: Payment stays same, amortization extends if rates rise
- **Trigger Rate**: Point where payment doesn't cover interest (VRM-Fixed only)

**Term vs Amortization:**
- **Term**: 1-10 years (typically 3-5), rate/spread locked for this period
- **Amortization**: 25-30 years total payoff period
- Term renewal every 3-5 years with new negotiated rate/spread

**Payment Frequencies:**
1. Monthly (12/year)
2. Bi-weekly (26/year)
3. Accelerated Bi-weekly (26/year, pays off faster)
4. Semi-monthly (24/year)
5. Weekly (52/year)
6. Accelerated Weekly (52/year, pays off faster)

**First-Time Buyer Rules (as of Dec 2024):**
- 30-year amortization if: first-time buyer OR purchasing new build
- 25-year amortization in all other cases (if down payment < 20%)
- 20%+ down payment: lender sets max amortization

## Data Model

### Core Entities

**User Cash Flow:**
- Monthly income (base + extra paycheques + bonus)
- Fixed expenses (property tax, insurance, condo fees, utilities)
- Variable expenses (groceries, dining, transportation, entertainment)
- Other debt (car loan, student loan, credit card)
- Calculated: monthly surplus

**Mortgage:**
- Original amount, purchase price, down payment
- Current balance, start date
- Payment frequency
- Amortization period (years + months)

**Mortgage Terms (Historical):**
- Term type: Fixed / VRM-Changing / VRM-Fixed
- Start/end dates, term length
- Locked rate (fixed) OR locked spread (variable)
- Payment amount, frequency
- Payment history with principal/interest breakdown

**Emergency Fund:**
- Target months of expenses (3-12 months)
- Current balance
- Monthly contribution

**Scenario:**
- Name, description
- Prepayment strategy:
  - % of surplus to mortgage prepayment
  - Annual lump sum prepayments (bonus, tax refund)
  - One-time prepayments with timing
- Investment allocation:
  - % of surplus to investments
  - Asset allocation (stocks/bonds/cash)
  - Expected return rate
- EF priority: build EF first vs split with investments

### Calculated Outputs (Per Scenario)

**10/20/30 Year Metrics:**
- Net worth trajectory
- Mortgage balance over time
- Investment portfolio value
- Total interest paid
- Mortgage payoff date
- Emergency fund status

**Comparison Metrics:**
- Interest savings vs baseline ($ and %)
- Time savings (years earlier payoff)
- Net worth difference
- Trade-off analysis (payment increase vs long-term savings)

## File Structure

```
client/src/
  pages/
    mortgage-history-page.tsx    # Term tracking, payment history
    cash-flow-page.tsx           # Income/expense inputs, surplus calculation
    emergency-fund-page.tsx      # EF target, contribution, status
    scenario-editor-page.tsx     # Create/edit scenarios (stub)
    comparison-page.tsx          # 4-scenario comparison with charts
  components/ui/                 # Shadcn components
  lib/queryClient.ts             # TanStack Query setup

server/
  routes.ts                      # API routes (to be implemented)
  storage.ts                     # Storage interface (to be implemented)
  vite.ts                        # Vite dev server integration

shared/
  schema.ts                      # Shared types (to be implemented)
```

## Development Guidelines

**Frontend:**
- React + TypeScript + Wouter (routing)
- TanStack Query for data fetching
- Shadcn UI + Tailwind CSS
- Form validation with react-hook-form + zod
- All inputs controlled (value + onChange)
- Mock data currently, will wire to backend APIs

**Backend:**
- Express.js + TypeScript
- PostgreSQL database (Drizzle ORM)
- RESTful API design
- Zod validation for request bodies

**Calculation Engine:**
- Semi-annual compounding for Canadian mortgages
- Payment frequency conversions
- Amortization schedule generation
- Prepayment modeling (lump sum, annual, one-time)
- Net worth projection (mortgage + investments + EF - expenses)
- Comparison metrics (savings calculations)

## Next Steps

1. Design database schema with prepayment support
2. Implement Canadian mortgage calculation engine
3. Build amortization schedule generator
4. Create net worth projection engine
5. Wire frontend to backend APIs
6. Add savings metrics to comparison page
7. Validate calculations against government calculator
8. User testing & refinement

## Resources

- [Government of Canada Mortgage Calculator](https://itools-ioutils.fcac-acfc.gc.ca/MC-CH/MCCalc-CHCalc-eng.aspx)
- [Calculator.net Mortgage Payoff Calculator](https://www.calculator.net/mortgage-payoff-calculator.html)
- PRODUCT_ROADMAP.md - Full feature roadmap with priorities
- PRD_vs_MVP_Analysis.md - Original requirements analysis
- DESIGN_DEFICIENCIES.md - Addressed design gaps
