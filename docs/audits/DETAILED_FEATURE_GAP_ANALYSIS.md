# Detailed Feature Gap Analysis

**Date:** December 2025  
**Auditor:** Product Owner (Mortgage Domain Expert)  
**Purpose:** Comprehensive analysis of feature gaps across the entire Canadian mortgage lifecycle  
**Status:** Current State Assessment

---

## Executive Summary

This document provides a detailed gap analysis of the Canadian Mortgage Strategy & Wealth Forecasting application, organized by:

1. **Mortgage Lifecycle Stage** - Features needed at each stage
2. **Implementation Status** - What exists vs what's missing
3. **Domain Completeness** - Whether gaps affect Canadian mortgage accuracy
4. **User Impact** - How gaps affect user workflows
5. **Strategic Priority** - What should be built next

**Key Findings:**

- **Core mortgage calculations**: ✅ Complete and accurate
- **Payment management**: ✅ Complete (with one UI gap)
- **Renewal/refinancing**: ⚠️ Partially complete (penalties need market rate data)
- **Advanced features**: ❌ Not implemented (HELOC, Smith Maneuver)
- **Monitoring features**: ❌ Not implemented (alerts, proactive insights)

---

## Gap Analysis by Mortgage Lifecycle Stage

### 1. Mortgage Origination

#### 1.1 Mortgage Setup

**Status:** ✅ **COMPLETE**

**Implemented:**

- Property price and down payment input
- Original amount calculation
- Amortization period (years + months)
- Payment frequency selection (all 6 Canadian frequencies)
- Annual prepayment limit configuration
- Multiple mortgages per user

**Gaps:** None

**Domain Assessment:** Complete and accurate for Canadian mortgages.

---

#### 1.2 Term Creation

**Status:** ✅ **COMPLETE**

**Implemented:**

- First term and renewal term creation
- Term type selection (fixed, variable-changing, variable-fixed)
- Rate configuration (fixed rate or prime + spread)
- Term duration (3-5 years typical)
- Start and end date selection
- Automatic prime rate snapshot for variable terms
- Payment frequency per term
- Regular payment amount calculation

**Gaps:** None

**Domain Assessment:** Complete and accurate. Supports all major Canadian term types.

---

#### 1.3 CMHC Insurance Calculator

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**

- Insurance premium calculation for high-ratio mortgages (<20% down)
- Premium rate tables (CMHC, Sagen, Genworth)
- Insurance amount added to mortgage principal
- High-ratio vs conventional mortgage flag

**Current Workaround:**

- Users can manually add insurance premium to property price
- System doesn't distinguish high-ratio vs conventional

**User Impact:**

- **Low** - Insurance is one-time at origination
- Users can manually account for it
- Doesn't affect ongoing calculations

**Domain Impact:**

- **Low** - Insurance doesn't affect payment calculations after origination
- Would be useful for mortgage planning tools

**Priority:** **LOW**

- Can be added as a planning calculator
- Doesn't affect existing mortgage tracking
- Useful for first-time homebuyers

**Implementation Estimate:** 2-3 weeks

- Premium rate tables (CMHC, Sagen, Genworth)
- Calculator UI component
- Integration with mortgage creation flow

---

### 2. Payment Management

#### 2.1 Regular Payment Logging

**Status:** ✅ **COMPLETE**

**Implemented:**

- Log regular payments
- Automatic principal/interest breakdown
- Balance and amortization updates
- Payment history tracking
- All payment frequencies supported

**Gaps:** None

---

#### 2.2 Prepayment Logging

**Status:** ✅ **COMPLETE**

**Implemented:**

- Lump sum prepayments
- Percentage-based prepayments
- Annual prepayment limit enforcement
- Calendar year tracking
- Prepayment breakdown in payment records

**Gaps:** None

---

#### 2.3 Payment Skipping

**Status:** ⚠️ **BACKEND COMPLETE, UI MISSING**

**What Exists:**

- ✅ Calculation engine (`server/src/shared/calculations/payment-skipping.ts`)
  - `calculateSkippedPayment()` - Calculates interest accrual
  - `canSkipPayment()` - Validates skip eligibility
  - `countSkippedPaymentsInYear()` - Tracks annual skip count
  - `calculateTotalSkippedInterest()` - Sums skipped interest
- ✅ Service method (`mortgage-payment.service.ts`)
  - `skipPayment()` - Creates skipped payment record
  - Validates annual skip limits (typically 1-2 per year)
  - Calculates interest accrual and balance increase
- ✅ API endpoint (`POST /api/mortgages/:mortgageId/terms/:termId/skip-payment`)
- ✅ Database schema support (`isSkipped`, `skippedInterestAccrued` fields)

**What's Missing:**

- ❌ UI component for skipping payments
- ❌ "Skip Payment" button in payment dialog
- ❌ Skip eligibility indicator
- ❌ Skip history display
- ❌ Skip limit tracking UI

**Current Workaround:**

- Users can manually log $0 payment
- System will calculate interest accrual correctly
- Not user-friendly

**User Impact:**

- **Medium** - Some lenders allow payment skipping
- Users with this feature can't use it easily
- Workaround exists but is not intuitive

**Domain Impact:**

- **Low** - Feature is less common (not all lenders offer it)
- Calculation logic is correct
- Just needs UI integration

**Priority:** **LOW-MEDIUM**

- Feature is less common
- Workaround available
- Would improve UX for users with skip privileges

**Implementation Estimate:** 1-2 weeks

- Add "Skip Payment" button to payment dialog
- Add skip eligibility check and display
- Add skip limit indicator
- Add skip history to payment history

**Code Location:**

- Backend: `server/src/shared/calculations/payment-skipping.ts`
- Service: `server/src/application/services/mortgage-payment.service.ts`
- API: `server/src/api/routes/mortgage.routes.ts` (line 558)
- UI: Needs to be added to `client/src/features/mortgage-tracking/components/log-payment-dialog.tsx`

---

#### 2.4 Backfill Historical Payments

**Status:** ✅ **COMPLETE**

**Implemented:**

- Bulk payment import
- Historical prime rate lookup
- Automatic rate application
- Prepayment limit validation

**Gaps:** None

---

### 3. Variable Rate Mortgage (VRM) Features

#### 3.1 VRM-Changing Payment

**Status:** ✅ **COMPLETE**

**Implemented:**

- Payment adjusts with prime rate changes
- Automatic payment recalculation
- Prime rate tracking
- Effective rate calculation

**Gaps:** None

---

#### 3.2 VRM-Fixed Payment & Trigger Rate

**Status:** ✅ **COMPLETE**

**Implemented:**

- Fixed payment amount
- Trigger rate calculation
- Negative amortization tracking
- Balance increase when trigger rate hit
- UI warnings and indicators

**Gaps:** None

---

#### 3.3 Prime Rate Tracking

**Status:** ✅ **COMPLETE**

**Implemented:**

- Bank of Canada API integration
- Daily automatic updates (scheduler)
- Historical rate storage
- Historical rate lookups for backfill

**Gaps:** None

---

### 4. Renewal & Refinancing

#### 4.1 Term Renewal

**Status:** ✅ **COMPLETE**

**Implemented:**

- Create renewal terms
- Rate and term type selection
- Payment recalculation
- Term end date tracking

**Gaps:** None

---

#### 4.2 Blend-and-Extend Renewal

**Status:** ⚠️ **BACKEND COMPLETE, UI MISSING**

**What Exists:**

- ✅ Calculation engine (`server/src/shared/calculations/blend-and-extend.ts`)
  - `calculateBlendedRate()` - Blends old and new rates
  - `calculateBlendAndExtend()` - Full calculation with payment amounts
  - `calculateExtendedAmortization()` - Amortization extension logic
- ✅ API endpoint (`POST /api/mortgage-terms/:id/blend-and-extend`)
  - Accepts `newMarketRate` and `extendedAmortizationMonths`
  - Returns blended rate, new payment, comparison payments
- ✅ Unit tests (`blend-and-extend.test.ts`)

**What's Missing:**

- ❌ UI component for blend-and-extend
- ❌ Integration into term renewal dialog
- ❌ Side-by-side comparison with other renewal options
- ❌ Market rate input/selection
- ❌ Amortization extension options

**Current Workaround:**

- Users can call API endpoint directly (not user-friendly)
- Can approximate using refinancing events

**User Impact:**

- **Medium** - Blend-and-extend is a common renewal option
- Users can't easily compare this option
- Affects renewal decision-making

**Domain Impact:**

- **Medium** - Important Canadian renewal option
- Calculation is correct
- Just needs UI integration

**Priority:** **MEDIUM**

- Common renewal option
- Calculation exists, just needs UI
- Would complete renewal workflow

**Implementation Estimate:** 2-3 weeks

- Add blend-and-extend option to term renewal dialog
- Add market rate input field
- Add amortization extension selector
- Add comparison view (blend-and-extend vs new term)
- Integrate with renewal workflow

**Code Location:**

- Backend: `server/src/shared/calculations/blend-and-extend.ts`
- API: `server/src/api/routes/mortgage.routes.ts` (line 370)
- UI: Needs to be added to `client/src/features/mortgage-tracking/components/term-renewal-dialog.tsx`

---

#### 4.3 Mortgage Penalties (IRD & 3-Month Interest)

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**What Exists:**

- ✅ Calculation engine (`server/src/domain/calculations/penalty.ts`)
  - `calculateThreeMonthInterestPenalty()` - 3-month interest calculation
  - `calculateIRDPenalty()` - Interest Rate Differential calculation
  - `calculateStandardPenalty()` - "Greater of" rule (IRD vs 3-month)
- ✅ Service integration (`renewal.service.ts`)
  - Calculates penalty for renewal status
  - Shows penalty estimate in renewal card
- ✅ UI display (`renewal-card.tsx`)
  - Shows estimated penalty amount
  - Shows penalty method (IRD or 3-Month Interest)

**What's Missing:**

- ❌ **Market rate data source** - Critical gap
  - Current: Market rate is hardcoded to current rate (TODO comment in code)
  - Impact: IRD calculation is inaccurate (always returns 0)
  - Need: Real market rate service or data source
- ❌ Standalone penalty calculator UI
- ❌ Penalty calculation in refinancing analysis
- ❌ Break-even analysis (penalty vs savings)
- ❌ Lender-specific penalty formulas
  - Current: Uses simplified formula
  - Reality: Each lender has different IRD calculation method

**Current Implementation Issues:**

```typescript
// From renewal.service.ts (line 65)
const marketRate = currentRate; // MVP simplification
// TODO: Fetch real market rate for IRD
```

**User Impact:**

- **HIGH** - Penalties are critical for renewal/refinancing decisions
- Current implementation shows 3-month interest only (IRD always 0)
- Users can't accurately assess early renewal costs
- Affects refinancing opportunity analysis

**Domain Impact:**

- **HIGH** - Penalties are a core Canadian mortgage feature
- IRD is often the higher penalty (especially for fixed-rate mortgages)
- Without accurate IRD, users can't make informed decisions

**Priority:** **HIGH**

- Critical for renewal decisions
- Affects refinancing analysis
- Current implementation is incomplete

**Implementation Estimate:** 4-6 weeks

- **Phase 1 (2 weeks):** Market rate service
  - Research market rate data sources (Bank of Canada, rate comparison sites)
  - Create market rate service/API
  - Store historical market rates
  - Integrate with penalty calculations
- **Phase 2 (2 weeks):** Standalone penalty calculator
  - UI component for penalty calculation
  - Input: balance, current rate, market rate, remaining months
  - Output: IRD, 3-month interest, which applies, total penalty
- **Phase 3 (2 weeks):** Lender-specific formulas
  - Research lender IRD calculation methods
  - Add lender selection/configuration
  - Implement different IRD formulas
  - Add to mortgage/term data model

**Code Location:**

- Backend: `server/src/domain/calculations/penalty.ts`
- Service: `server/src/application/services/renewal.service.ts` (line 73)
- UI: `client/src/features/dashboard/components/renewal-card.tsx` (line 94)

**Market Rate Data Sources (Research Needed):**

- Bank of Canada posted rates
- Rate comparison websites (Ratehub, RateSpy)
- Mortgage broker rate sheets
- Lender websites (posted rates)

---

#### 4.4 Refinancing Events

**Status:** ✅ **COMPLETE**

**Implemented:**

- Year-based refinancing
- Term-end refinancing
- Rate changes
- Term type changes
- Amortization extensions
- Payment frequency changes
- Integration with projections

**Gaps:** None (see refinancing audit for details)

---

### 5. Advanced Mortgage Features

#### 5.1 HELOC (Home Equity Line of Credit)

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**

- HELOC data model
- Credit limit calculations (based on home equity)
- Interest rate modeling (Prime + spread)
- Interest-only payments
- Revolving credit tracking (borrow, repay, borrow again)
- Balance tracking
- Integration with mortgage prepayments

**User Impact:**

- **LOW-MEDIUM** - HELOC is a different product category
- Affects users with HELOC strategies (Smith Maneuver)
- Not needed for standard mortgage tracking

**Domain Impact:**

- **LOW** - HELOC is separate from mortgage
- Would enable advanced strategies (Smith Maneuver)
- Not a core mortgage feature

**Priority:** **LOW**

- Different product category
- Significant development effort (6+ months)
- Prerequisite for Smith Maneuver (advanced feature)

**Implementation Estimate:** 6 months

- Data model design
- Credit limit calculations
- Interest calculations
- Payment tracking
- UI components
- Integration with mortgage prepayments

**Dependencies:**

- None (standalone feature)
- Required for Smith Maneuver modeling

---

#### 5.2 Re-advanceable Mortgages

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**

- Re-advanceable mortgage data model
- Credit limit tracking (increases as principal paid)
- Re-borrowing functionality
- Integration with HELOC

**User Impact:**

- **LOW** - Niche product
- Very few lenders offer this

**Domain Impact:**

- **LOW** - Rare product type
- Requires HELOC functionality first

**Priority:** **VERY LOW**

- Niche product
- Requires HELOC first
- Low user demand

**Implementation Estimate:** 3-4 months (after HELOC)

---

#### 5.3 Recast Functionality

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**

- Payment recalculation after large prepayment
- Amortization extension option
- Rate/term unchanged
- Lower payment amount

**Current Workaround:**

- Use refinancing event with same rate
- Extend amortization if desired

**User Impact:**

- **LOW** - Less common in Canada (more US feature)
- Workaround available

**Domain Impact:**

- **LOW** - Not standard Canadian feature
- Can be modeled via refinancing events

**Priority:** **LOW**

- Less common feature
- Workaround exists
- Lower user demand

**Implementation Estimate:** 2-3 weeks

- Payment recalculation logic
- UI for recast option
- Integration with prepayment flow

---

### 6. Monitoring & Alerts

#### 6.1 Alert & Notification System

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**

- Email notification system
- In-app notification center
- Push notifications (future: mobile app)
- User notification preferences
- Alert scheduling and delivery

**Planned Features (from strategy doc):**

- Trigger rate alerts
- Renewal reminders
- Prime rate change alerts
- Prepayment opportunity alerts
- Refinancing opportunity alerts

**User Impact:**

- **HIGH** - Transforms product from calculator to monitoring platform
- Enables recurring engagement
- Critical for subscription model

**Domain Impact:**

- **MEDIUM** - Not domain logic, but user experience
- Enables proactive mortgage management

**Priority:** **HIGH** (Strategic)

- Foundation for monitoring platform pivot
- Enables subscription model
- Differentiates from competitors

**Implementation Estimate:** 6-8 weeks

- Email service integration (SendGrid, Resend)
- Notification queue system
- User preferences management
- Alert scheduling jobs
- In-app notification center UI

---

#### 6.2 Renewal Planning & Reminders

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**What Exists:**

- ✅ Renewal date tracking (`renewal.service.ts`)
- ✅ Days until renewal calculation
- ✅ Renewal status (urgent, soon, upcoming, safe)
- ✅ UI display (`renewal-card.tsx`)

**What's Missing:**

- ❌ Automated renewal reminders (6mo, 3mo, 1mo, 1 week)
- ❌ Email notifications for renewal
- ❌ Renewal rate comparison tool
- ❌ Renewal decision support workflow
- ❌ Market rate comparison for renewal

**User Impact:**

- **HIGH** - Renewal is high-stakes decision
- Users need proactive reminders
- Rate comparison is critical

**Domain Impact:**

- **MEDIUM** - Core renewal workflow incomplete
- Missing proactive elements

**Priority:** **HIGH**

- High-stakes, time-sensitive
- Completes renewal workflow
- Enables subscription value

**Implementation Estimate:** 4-6 weeks

- Scheduled renewal check jobs
- Email notification system
- Rate comparison tool
- Renewal decision support UI

---

#### 6.3 Trigger Rate Monitoring & Alerts

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**What Exists:**

- ✅ Trigger rate calculation
- ✅ Negative amortization tracking
- ✅ UI warnings in payment history

**What's Missing:**

- ❌ Daily trigger rate monitoring
- ❌ Proactive alerts (within 1%, within 0.5%, hit)
- ❌ Email notifications
- ❌ Impact analysis (balance increase projections)
- ❌ Historical trigger rate tracking

**User Impact:**

- **HIGH** - Critical for VRM-Fixed Payment users
- Daily value proposition
- Early warning system needed

**Domain Impact:**

- **MEDIUM** - Monitoring feature, not domain logic
- Critical for user protection

**Priority:** **HIGH**

- Daily value for VRM users
- Differentiates product
- Enables subscription model

**Implementation Estimate:** 3-4 weeks

- Daily scheduled job for trigger rate checks
- Alert threshold configuration
- Email notification system
- Impact analysis calculations
- Historical tracking

---

#### 6.4 Prime Rate Change Impact Analysis

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**What Exists:**

- ✅ Prime rate tracking (daily updates)
- ✅ Prime rate history storage
- ✅ Payment recalculation for VRM-Changing

**What's Missing:**

- ❌ Automatic rate change detection
- ❌ Immediate impact calculation
- ❌ Alert system for rate changes
- ❌ Impact summary (new payment, new trigger rate)
- ❌ Historical rate change analysis

**User Impact:**

- **MEDIUM-HIGH** - Immediate value when rates change
- Users need to know impact immediately
- Enables proactive strategy adjustments

**Domain Impact:**

- **LOW** - Monitoring feature
- Calculations already exist

**Priority:** **MEDIUM-HIGH**

- Immediate value when rates change
- Enhances prime rate tracking
- Enables proactive management

**Implementation Estimate:** 2-3 weeks

- Rate change detection in scheduler
- Impact calculation on change
- Alert system integration
- Historical analysis UI

---

### 7. Analytics & Reporting

#### 7.1 Mortgage Health Score

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**What Exists:**

- ✅ Health score engine (`server/src/domain/health/health-score.engine.ts`)
- ✅ Score calculation (0-100)
- ✅ Component scores (trigger rate, prepayment, rate, renewal)

**What's Missing:**

- ❌ UI display of health score
- ❌ Score breakdown visualization
- ❌ Improvement recommendations
- ❌ Historical score tracking
- ❌ Benchmarking

**User Impact:**

- **MEDIUM** - Gamification and engagement
- Quick health assessment
- Motivation to improve

**Domain Impact:**

- **LOW** - Analytics feature
- Not domain logic

**Priority:** **MEDIUM**

- Engagement feature
- Differentiates product
- Can be added after core features

**Implementation Estimate:** 2-3 weeks

- Health score UI component
- Score breakdown visualization
- Recommendation engine
- Historical tracking

---

#### 7.2 Advanced Analytics Dashboard

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**What Exists:**

- ✅ Basic dashboard with current status
- ✅ Net worth projections
- ✅ Investment growth tracking
- ✅ Scenario metrics

**What's Missing:**

- ❌ Payment pattern analysis
- ❌ Prepayment utilization tracking
- ❌ Optimization suggestions
- ❌ Comparative analysis (current vs baseline)
- ❌ Trend analysis over time

**User Impact:**

- **MEDIUM** - Deep insights
- Optimization opportunities
- Strategy effectiveness tracking

**Domain Impact:**

- **LOW** - Analytics feature

**Priority:** **MEDIUM**

- Enhances existing dashboard
- Provides deeper insights
- Can be added incrementally

**Implementation Estimate:** 4-6 weeks

- Payment pattern analysis
- Utilization tracking
- Optimization engine
- Comparative visualizations

---

## Summary: Gap Priority Matrix

### Critical Gaps (High Priority)

| Feature                         | Status     | Impact | Effort    | Priority     |
| ------------------------------- | ---------- | ------ | --------- | ------------ |
| **Market Rate Service for IRD** | ⚠️ Partial | HIGH   | 2 weeks   | **CRITICAL** |
| **Penalty Calculator UI**       | ⚠️ Partial | HIGH   | 2 weeks   | **HIGH**     |
| **Alert & Notification System** | ❌ Missing | HIGH   | 6-8 weeks | **HIGH**     |
| **Renewal Reminders**           | ⚠️ Partial | HIGH   | 4-6 weeks | **HIGH**     |
| **Trigger Rate Alerts**         | ⚠️ Partial | HIGH   | 3-4 weeks | **HIGH**     |

### Important Gaps (Medium Priority)

| Feature                      | Status          | Impact      | Effort    | Priority       |
| ---------------------------- | --------------- | ----------- | --------- | -------------- |
| **Blend-and-Extend UI**      | ⚠️ Backend Only | MEDIUM      | 2-3 weeks | **MEDIUM**     |
| **Prime Rate Change Alerts** | ⚠️ Partial      | MEDIUM-HIGH | 2-3 weeks | **MEDIUM**     |
| **Health Score UI**          | ⚠️ Backend Only | MEDIUM      | 2-3 weeks | **MEDIUM**     |
| **Payment Skipping UI**      | ⚠️ Backend Only | MEDIUM      | 1-2 weeks | **MEDIUM-LOW** |

### Nice-to-Have Gaps (Low Priority)

| Feature                       | Status     | Impact | Effort     | Priority     |
| ----------------------------- | ---------- | ------ | ---------- | ------------ |
| **CMHC Insurance Calculator** | ❌ Missing | LOW    | 2-3 weeks  | **LOW**      |
| **Recast Functionality**      | ❌ Missing | LOW    | 2-3 weeks  | **LOW**      |
| **HELOC Support**             | ❌ Missing | LOW    | 6 months   | **LOW**      |
| **Re-advanceable Mortgages**  | ❌ Missing | LOW    | 3-4 months | **VERY LOW** |

---

## Implementation Roadmap Recommendations

### Phase 1: Complete Critical Gaps (Q1 2026)

**Goal:** Fix incomplete features and enable accurate renewal decisions

1. **Market Rate Service** (2 weeks)
   - Research and integrate market rate data source
   - Create market rate service
   - Update IRD calculations to use real market rates

2. **Penalty Calculator UI** (2 weeks)
   - Standalone penalty calculator component
   - Integration with renewal workflow
   - Break-even analysis

3. **Blend-and-Extend UI** (2-3 weeks)
   - Add to term renewal dialog
   - Market rate input
   - Comparison view

**Total:** 6-7 weeks

### Phase 2: Monitoring Foundation (Q2 2026)

**Goal:** Build alert system and proactive monitoring

1. **Alert & Notification System** (6-8 weeks)
   - Email service integration
   - Notification queue
   - User preferences
   - In-app notification center

2. **Renewal Reminders** (4-6 weeks)
   - Scheduled jobs
   - Email notifications
   - Rate comparison tool

3. **Trigger Rate Alerts** (3-4 weeks)
   - Daily monitoring
   - Alert thresholds
   - Impact analysis

**Total:** 13-18 weeks

### Phase 3: Enhanced Features (Q3-Q4 2026)

**Goal:** Complete remaining gaps and add enhancements

1. **Payment Skipping UI** (1-2 weeks)
2. **Prime Rate Change Alerts** (2-3 weeks)
3. **Health Score UI** (2-3 weeks)
4. **Advanced Analytics** (4-6 weeks)

**Total:** 9-14 weeks

### Phase 4: Advanced Features (2027+)

**Goal:** Add advanced features if demand exists

1. **CMHC Insurance Calculator** (2-3 weeks)
2. **Recast Functionality** (2-3 weeks)
3. **HELOC Support** (6 months) - Only if strong demand
4. **Smith Maneuver Modeling** (6-12 months) - Requires HELOC + Tax engine

---

## Domain Completeness Assessment

### ✅ Complete & Accurate

- Mortgage calculations (semi-annual compounding)
- Payment frequencies (all 6 types)
- Prepayment limits (calendar year, based on original amount)
- Trigger rate calculations
- Variable rate mortgage behavior
- Term-based mortgage structure
- Prime rate tracking
- Scenario modeling
- Projection engine

### ⚠️ Partially Complete

- **Penalty calculations** - Logic correct, but needs market rate data
- **Renewal planning** - Tracking exists, but missing proactive reminders
- **Trigger rate monitoring** - Calculation exists, but missing alerts
- **Blend-and-extend** - Calculation exists, but missing UI
- **Payment skipping** - Logic exists, but missing UI

### ❌ Not Implemented

- HELOC support
- Re-advanceable mortgages
- Recast functionality
- CMHC insurance calculator
- Alert/notification system
- Market rate service

---

## Strategic Recommendations

### Immediate Actions (Next 3 Months)

1. **Fix penalty calculations** - Add market rate service (critical for renewal decisions)
2. **Complete blend-and-extend UI** - Common renewal option, calculation exists
3. **Build alert system foundation** - Enables monitoring platform pivot

### Medium-Term (6-12 Months)

1. **Complete monitoring features** - Renewal reminders, trigger rate alerts
2. **Add payment skipping UI** - Low effort, improves UX
3. **Enhance analytics** - Health score UI, advanced dashboard

### Long-Term (12+ Months)

1. **Evaluate advanced features** - HELOC, Smith Maneuver (only if demand exists)
2. **Add planning tools** - CMHC calculator, recast (low priority)

### Strategic Pivot

The product is well-positioned to pivot from "calculator" to "monitoring platform" with the addition of:

- Alert & notification system
- Proactive monitoring features
- Renewal planning tools

This creates recurring value and justifies subscription model.

---

## Conclusion

The application has a **strong foundation** with accurate Canadian mortgage calculations and comprehensive scenario modeling. The main gaps are:

1. **Incomplete features** - Penalties need market rate data, blend-and-extend needs UI
2. **Missing monitoring** - No alert system or proactive features
3. **Advanced features** - HELOC, Smith Maneuver (low priority, high effort)

**Priority Focus:**

- **Q1 2026:** Complete critical gaps (market rate service, penalty calculator, blend-and-extend UI)
- **Q2 2026:** Build monitoring foundation (alerts, renewal reminders, trigger rate alerts)
- **Q3-Q4 2026:** Enhance features (payment skipping UI, analytics, health score)

The product is **domain-complete** for core Canadian mortgage features. The gaps are primarily in **monitoring/engagement features** and **advanced product types** (HELOC).

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Next Review:** After Phase 1 completion
