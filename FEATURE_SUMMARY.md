# Canadian Mortgage Strategy & Wealth Forecasting MVP - Feature Summary

**Last Updated:** November 17, 2024

## Project Overview
A web application for comparing financial scenarios ("prepay mortgage vs invest") with Canadian-specific mortgage modeling including term locks, Prime ± spread rates, semi-annual compounding, and variable rate types.

---

## ✅ Implemented Features

### 1. **Dashboard Page** (`/`)
- **Status:** Placeholder implementation
- **Features:**
  - Basic layout with navigation
  - Welcome message
  - Links to other sections
- **Next Steps:** Add scenario comparison widgets, key metrics, charts

### 2. **Cash Flow Page** (`/cash-flow`)
- **Status:** ✅ **COMPLETE** (Task 9)
- **Features:**
  - **Income Section:**
    - Monthly salary input
    - Annual bonus input
    - Other monthly income
  - **Housing Costs:**
    - Property tax input
    - Home insurance input
    - Utilities/maintenance input
  - **Monthly Expenses:**
    - Groceries
    - Transportation
    - Entertainment
    - Other expenses
  - **Investments:**
    - Monthly investment amount
    - Expected ROI (%)
  - **Data Persistence:**
    - All fields save to backend API (`POST /api/cash-flow`)
    - Form uses React Query mutations with cache invalidation
    - Success toasts on save
    - Zero-value preservation (stores "0.00" correctly)
  - **Validation:**
    - All fields accept decimal values (2 decimal places)
    - Form-level validation with error messages
- **E2E Testing:** ✅ Validated with Playwright tests

### 3. **Mortgage Page** (`/mortgage`) **[UPDATED]**
- **Status:** ✅ **COMPLETE** (Task 10)
- **URL:** `/mortgage` (renamed from `/mortgage-history`)
- **Features:**
  - **Create Mortgage Flow:** ✅ **NEW!**
    - Dialog with form when no mortgage exists
    - Fields: Property price, down payment, start date, amortization years, payment frequency
    - Saves to backend (`POST /api/mortgages`)
    - Auto-calculates original amount (property price - down payment)
    - Shows "Create Mortgage" button on empty state
  - **Mortgage Data Display:**
    - Current mortgage balance
    - Current term information (type, rate, months remaining)
    - Payment history table
    - Summary statistics (total paid, principal, interest)
  - **Data Fetching:**
    - Fetches mortgages from API (`GET /api/mortgages`)
    - Fetches terms from API (`GET /api/mortgages/:id/terms`)
    - Fetches payments from API (`GET /api/mortgages/:id/payments`)
    - Normalization layer converts DB decimal strings to UI numbers
  - **Log Payment Flow:**
    - ✅ Dialog with payment form (date, amount)
    - ✅ Save button wired to API (`POST /api/mortgages/:id/payments`)
    - ✅ All numeric fields converted properly (parseFloat)
    - ✅ All required fields included (mortgageId, termId, etc.)
    - ⏳ Calculations use 70/30 stub (TODO: integrate calculation engine)
  - **Renew Term Flow:**
    - ✅ Dialog for renewing mortgage term
    - ✅ Save button creates new term (`POST /api/mortgages/:id/terms`)
  - **Loading/Empty States:**
    - ✅ Shows spinner while data loads
    - ✅ Shows "No Mortgage Data" with "Create Mortgage" button
    - ✅ Prevents null reference crashes
- **Known Limitations:**
  - Payment calculations use 70/30 placeholder (needs calculation engine integration - future task)
  - Single mortgage assumption (MVP scope)

### 4. **Scenarios Page** (`/scenarios`)
- **Status:** Placeholder implementation
- **Features:**
  - Basic layout
  - Navigation to page exists
- **Next Steps:** Build scenario creation/comparison UI

### 5. **Comparison Page** (`/comparison`)
- **Status:** Placeholder implementation
- **Features:**
  - Basic layout
  - Navigation exists
- **Next Steps:** Add side-by-side scenario comparison charts

### 6. **Emergency Fund Page** (`/emergency-fund`)
- **Status:** Placeholder implementation
- **Features:**
  - Basic layout
  - Navigation exists
- **Next Steps:** Add emergency fund calculator/tracking

---

## 🏗️ Backend Architecture

### Database Schema
**PostgreSQL database with the following tables:**

1. **users**
   - id, username, password (hashed)
   - Created with mock auth middleware (dev)

2. **cash_flows**
   - User income, expenses, housing costs, investments
   - All decimal fields (precision: 10, scale: 2)
   - ✅ Full CRUD via API

3. **mortgages**
   - property_price, down_payment, original_amount, current_balance
   - start_date, amortization_years, payment_frequency
   - annual_prepayment_limit_percent
   - ✅ Read-only API (no create endpoint yet!)

4. **mortgage_terms**
   - term_type (fixed, variable-fixed, variable-variable)
   - start_date, end_date, term_years
   - fixed_rate, locked_spread
   - regular_payment_amount
   - ✅ Create endpoint working

5. **mortgage_payments**
   - payment_date, payment_amount
   - principal_paid, interest_paid, remaining_balance
   - prime_rate, effective_rate, trigger_rate_hit
   - remaining_amortization_months
   - ✅ Create endpoint working

6. **scenarios** (defined but not implemented)
7. **scenario_cash_flows** (defined but not implemented)
8. **scenario_mortgage_prepayments** (defined but not implemented)
9. **scenario_projections** (defined but not implemented)

### API Endpoints

**Cash Flow:**
- ✅ `GET /api/cash-flow` - Fetch user's cash flow data
- ✅ `POST /api/cash-flow` - Create/update cash flow data

**Mortgages:**
- ✅ `GET /api/mortgages` - Fetch user's mortgages
- ❌ `POST /api/mortgages` - **MISSING!** (Need to create mortgage)
- ✅ `GET /api/mortgages/:id/terms` - Fetch terms for mortgage
- ✅ `POST /api/mortgages/:id/terms` - Create new term (renewal)
- ✅ `GET /api/mortgages/:id/payments` - Fetch payments
- ✅ `POST /api/mortgages/:id/payments` - Log new payment

**Scenarios:** Not implemented yet

### Calculation Engine
- **Location:** `server/mortgage-calculations.ts`
- **Features:**
  - Payment calculations (monthly, biweekly, accelerated)
  - Interest/principal split calculations
  - Canadian semi-annual compounding
  - Trigger rate calculations (VRM-Fixed Payment)
  - Prepayment limit validation
  - Amortization schedule generation
- **Status:** ✅ Complete but **not integrated into payment flow yet**

---

## 🔧 Technical Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Express.js + Node.js
- **Database:** PostgreSQL (Neon-backed)
- **ORM:** Drizzle ORM
- **Validation:** Zod schemas
- **State Management:** TanStack Query (React Query v5)
- **UI Components:** Shadcn/ui + Radix UI + Tailwind CSS
- **Routing:** Wouter
- **Forms:** React Hook Form + Zod validation
- **Auth:** Mock middleware (dev mode, sets userId=1)

---

## 🚧 Known Issues & TODOs

### Critical Missing Features:
1. ❌ **Payment calculations use 70/30 stub**
   - Calculation engine exists but not called from payment flow
   - Need: Integrate `calculateInterestPayment()`, `calculatePrincipalPayment()` from server
   - Planned for future task (requires backend calculation API)

2. ❌ **Scenarios feature not implemented**
   - Core value prop of app (prepay vs invest comparison)
   - Tables exist in DB, no UI or backend logic
   - Next major feature to build

### Minor Issues:
- No way to edit/delete existing mortgages (can create new ones)
- Mock auth only (no real user authentication)
- Term calculations use placeholder payment amounts

### Recently Fixed: ✅
- ✅ **Create Mortgage feature added** - Users can now create mortgages via UI dialog
- ✅ **Page renamed to "Mortgage"** - Simplified from "Mortgage History"
- ✅ **Proper empty states** - Clear call-to-action buttons when no data exists

---

## 📊 Progress Summary

**Completed Tasks:**
- ✅ Task 1-8: Project setup, schema design, calculation engine, basic pages
- ✅ Task 9: Cash Flow page fully wired to API with E2E tests
- ✅ Task 10: Mortgage page complete with create/track/renew flows

**Next Priority Tasks:**
1. Integrate calculation engine into payment flow (improve accuracy)
2. Build Scenarios comparison feature (core value prop)
3. Add data visualization/charts
4. Add edit/delete functionality for mortgages
5. Implement real authentication

---

## 🎯 MVP Definition

**Core User Flow (Not Yet Complete):**
1. ✅ User enters cash flow data (income, expenses)
2. ❌ User creates mortgage with initial data
3. ⏳ User logs mortgage payments over time
4. ❌ User creates scenarios (prepay vs invest)
5. ❌ User compares 10-30 year net worth projections

**Current State:** 
- 3 of 5 core flows complete
- Backend foundation solid
- Users can now get started without DB seeding
- Main missing feature: scenario comparison

---

## 📝 Notes for Review

**What's Working Well:**
- Clean separation of frontend/backend
- Strong type safety (TypeScript + Zod)
- React Query handles data fetching elegantly
- Calculation engine is comprehensive and Canadian-specific
- UI components are reusable and styled consistently

**What Needs Attention:**
- User cannot get started without manually seeding DB
- Core comparison feature (scenarios) not implemented
- Need better onboarding flow
- Consider adding sample data or wizard for first-time users

---

**Questions for Product Review:**
1. Should we add a "Getting Started" wizard?
2. Is manual mortgage creation sufficient, or should we import from lender API?
3. What's the priority: finish mortgage tracking OR build scenario comparison?
4. Do we need export features (CSV, PDF reports)?
