# Canadian Mortgage Strategy & Wealth Forecasting MVP

## Project Overview

A full-stack web application helping Canadians compare financial strategies for managing mortgages and building wealth. Users can model multiple scenarios side-by-side, comparing aggressive prepayment vs investment strategies over 10-30 year horizons.

**Tech Stack**: Express.js (backend) + React + TypeScript (frontend), PostgreSQL database, Shadcn UI components

## Current Status: Frontend Complete, Backend Implementation Next

### ✅ Completed (Frontend)
- Mortgage History page with term tracking (Fixed/VRM-Changing/VRM-Fixed Payment)
- Cash Flow page (fully reactive, 11 inputs controlled, accurate calculations)
- Comparison page (4 scenarios with charts and winner callout)
- Emergency Fund page
- Scenario Editor page (stub)
- Design system aligned with design_guidelines.md
- All critical design deficiencies from PRD analysis fixed
- Variable rate mortgage support (spread tracking, payment frequency, trigger rates)

### 🚧 Current Sprint: Backend + Calculation Engine
Following analysis of Canadian Government calculator and Calculator.net, implementing:

**Priority 1 Features:**
1. Prepayment modeling engine (lump sums, annual bonuses, one-time payments)
2. Amortization schedule generation (month-by-month breakdown)
3. Savings metrics & comparison (interest saved, time saved, percentage metrics)

**Backend Implementation:**
- Database schema (mortgages, terms, cash flow, scenarios)
- API routes for CRUD operations
- Canadian mortgage calculation engine (semi-annual compounding, payment frequency)
- Net worth projection engine

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
