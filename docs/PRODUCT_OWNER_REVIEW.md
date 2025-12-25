# Comprehensive Product Owner Review

## HomeWealth Mortgage & Wealth Forecasting Application

**Review Date:** January 2025  
**Reviewer:** Mortgage Product Owner / Canadian Mortgage SME  
**Scope:** Domain completeness, feature accuracy, strategic gaps, and Canadian mortgage industry alignment

---

## Executive Summary

The HomeWealth application demonstrates **strong foundational architecture** for a Canadian mortgage and wealth forecasting platform. The codebase shows sophisticated understanding of key mortgage concepts including variable rate mortgages, trigger rates, prepayment mechanics, and re-advanceable mortgages. However, several **critical domain gaps** and **strategic feature omissions** need attention to meet industry standards and homeowner expectations.

**Overall Assessment:** **7.5/10** - Solid foundation with important gaps to address

**Key Strengths:**

- Comprehensive data model supporting complex mortgage scenarios
- Strong variable rate mortgage handling (VRM-Changing vs VRM-Fixed-Payment)
- Trigger rate monitoring and negative amortization tracking
- Re-advanceable mortgage and HELOC integration
- Prepayment limit enforcement aligned with Canadian lender conventions
- Blend-and-extend calculation and UI

**Critical Gaps:**

- Missing mortgage recast functionality
- Incomplete penalty calculation accuracy (IRD methodology)
- Limited renewal workflow automation
- Missing payment frequency change handling
- Incomplete Smith Maneuver tax optimization
- No mortgage portability modeling

---

## 1. Data Model & Schema Review

### 1.1 Core Mortgage Entities ✅ **STRONG**

**Assessment:** The schema design is comprehensive and well-structured for Canadian mortgage requirements.

**Strengths:**

- **Mortgage Terms:** Properly separates term-based rate locking from amortization period
- **Payment Frequency:** Supports all Canadian standard frequencies (monthly, biweekly, accelerated-biweekly, semi-monthly, weekly, accelerated-weekly)
- **Variable Rate Support:** Distinguishes between `variable-changing` (payment adjusts) and `variable-fixed` (payment fixed, balance may increase)
- **Prepayment Tracking:** Annual prepayment limits based on original amount (correct Canadian convention)
- **Insurance Support:** CMHC/Sagen/Genworth tracking with premium storage

**Issues Identified:**

- ⚠️ **Missing:** `mortgage.currentBalance` update mechanism - unclear if this is maintained automatically or manually
- ⚠️ **Missing:** Property value tracking over time (needed for HELOC credit limit recalculations)
- ⚠️ **Missing:** Mortgage portability fields (porting date, ported amount, new property details)

**Recommendations:**

1. Add `propertyValueHistory` table to track home value changes for HELOC recalculations
2. Add `mortgagePortability` table for porting scenarios
3. Document `currentBalance` update strategy (automatic vs manual)

---

### 1.2 Payment & Transaction Tracking ✅ **GOOD**

**Assessment:** Payment tracking is comprehensive with good historical record keeping.

**Strengths:**

- Payment breakdown (principal, interest, prepayment) properly separated
- Trigger rate hit tracking for VRM-Fixed-Payment mortgages
- Payment skipping support with interest accrual tracking
- Remaining amortization months tracked per payment
- Prime rate snapshots for variable rate payments

**Issues Identified:**

- ⚠️ **Missing:** Payment reversal/correction mechanism
- ⚠️ **Missing:** Payment frequency change tracking (when user switches from monthly to biweekly mid-term)
- ⚠️ **Missing:** Payment amount change tracking (when regular payment amount changes)

**Recommendations:**

1. Add `paymentCorrections` table for audit trail
2. Track payment frequency changes in `mortgageTerms` history
3. Add `paymentAmountChange` events for payment increases/decreases

---

### 1.3 HELOC & Re-Advanceable Mortgage ✅ **STRONG**

**Assessment:** Excellent support for re-advanceable mortgages and HELOC integration.

**Strengths:**

- Re-advanceable mortgage linking (`mortgages.reAdvanceableHelocId`)
- HELOC credit limit calculation based on LTV
- HELOC transaction tracking (borrowing, repayment, interest)
- Credit room calculation and history

**Issues Identified:**

- ⚠️ **Missing:** HELOC minimum payment calculations (interest-only vs principal+interest)
- ⚠️ **Missing:** HELOC draw period vs repayment period tracking
- ⚠️ **Missing:** HELOC interest-only payment option tracking

**Recommendations:**

1. Add `helocPaymentType` field (interest-only vs principal+interest)
2. Add `helocDrawPeriodEndDate` for draw period tracking
3. Implement minimum payment calculation logic

---

## 2. Core Mortgage Features Review

### 2.1 Payment Calculation & Amortization ✅ **STRONG**

**Assessment:** Payment calculations appear accurate with proper handling of different frequencies.

**Strengths:**

- Payment frequency conversion logic implemented
- Principal/interest breakdown calculations
- Remaining amortization tracking
- Support for accelerated payment frequencies

**Issues Identified:**

- ⚠️ **Unclear:** Rounding conventions - need to verify Canadian lender rounding rules (typically round to nearest cent, but some lenders round down)
- ⚠️ **Missing:** Payment recalculation when rate changes mid-term (for variable-changing mortgages)
- ⚠️ **Missing:** Payment recalculation when amortization changes (recast scenarios)

**Recommendations:**

1. Document rounding conventions used
2. Add payment recalculation service for rate changes
3. Implement mortgage recast functionality (see Section 2.5)

---

### 2.2 Variable Rate Mortgage Behavior ✅ **EXCELLENT**

**Assessment:** This is one of the strongest areas of the application.

**Strengths:**

- **Trigger Rate Calculation:** Properly implemented for VRM-Fixed-Payment mortgages
- **Negative Amortization Tracking:** Balance increases tracked when trigger rate is hit
- **Prime Rate Tracking:** Prime rate history and current rate monitoring
- **Rate Change Handling:** Distinguishes between payment-changing and payment-fixed variable mortgages
- **Trigger Rate Alerts:** Proactive monitoring with distance-to-trigger calculations

**Issues Identified:**

- ⚠️ **Minor:** Trigger rate calculation should account for payment frequency (weekly vs monthly affects trigger rate)
- ⚠️ **Missing:** Variable rate cap tracking (maximum rate increase per period)
- ⚠️ **Missing:** Variable rate floor tracking (minimum rate)

**Recommendations:**

1. Verify trigger rate calculation accounts for all payment frequencies correctly
2. Add rate cap/floor fields to `mortgageTerms` for variable mortgages
3. Add rate cap/floor alerts

---

### 2.3 Prepayment Mechanics ✅ **STRONG**

**Assessment:** Prepayment handling aligns well with Canadian lender conventions.

**Strengths:**

- Annual prepayment limit based on original mortgage amount (correct)
- Prepayment limit enforcement with proper error handling
- Prepayment event tracking (annual, one-time, payment-increase)
- Year-to-date prepayment tracking
- Prepayment opportunity recommendations

**Issues Identified:**

- ⚠️ **Missing:** Prepayment limit reset date tracking (some lenders reset on anniversary date, not calendar year)
- ⚠️ **Missing:** Prepayment privilege carry-forward (unused room from previous year)
- ⚠️ **Missing:** Prepayment penalty on over-limit prepayments

**Recommendations:**

1. Add `prepaymentLimitResetDate` field (anniversary date vs calendar year)
2. Implement prepayment privilege carry-forward logic
3. Add over-limit prepayment penalty calculation

---

### 2.4 Penalty Calculations ⚠️ **NEEDS IMPROVEMENT**

**Assessment:** Basic penalty calculation exists but lacks lender-specific accuracy.

**Strengths:**

- IRD (Interest Rate Differential) calculation implemented
- 3-month interest penalty calculation
- "Greater of" rule implementation
- Market rate integration for IRD calculations

**Issues Identified:**

- ❌ **CRITICAL:** IRD calculation is simplified - real Canadian lenders use complex formulas:
  - Some use posted rate vs discounted rate
  - Some use comparison rate from date of mortgage origination
  - Some use remaining term vs original term
  - Some apply discounts to comparison rate
- ⚠️ **Missing:** Lender-specific penalty calculation methods
- ⚠️ **Missing:** Penalty calculation for variable rate mortgages (typically 3-month interest only)
- ⚠️ **Missing:** Penalty calculation for open mortgages (typically 0 or minimal)
- ⚠️ **Missing:** Penalty calculation for fixed-rate mortgages with different methodologies (posted rate discount, etc.)

**Recommendations:**

1. **HIGH PRIORITY:** Research and implement lender-specific IRD methodologies
2. Add `penaltyCalculationMethod` field to `mortgageTerms` (IRD method, 3-month interest, open mortgage)
3. Implement variable rate penalty logic (typically 3-month interest only)
4. Add penalty calculator UI with lender selection
5. Document that current IRD is an approximation

---

### 2.5 Mortgage Recast ❌ **MISSING**

**Assessment:** Mortgage recast functionality is completely absent.

**What is Recast:**

- Recast occurs when a large prepayment is made and the lender recalculates the payment based on the new (lower) balance
- Payment amount decreases while keeping the same amortization period
- Common after large lump sum prepayments or property sales

**Impact:**

- **HIGH** - Recast is a common homeowner scenario, especially after:
  - Large bonus payments
  - Property sales (downsizing)
  - Inheritance or windfall
  - Refinancing with cash-out

**Recommendations:**

1. **HIGH PRIORITY:** Add recast calculation service
2. Add `recastEvents` table to track recast history
3. Add recast option to prepayment workflow
4. Update payment amount after recast
5. Add UI for recast scenarios

---

### 2.6 Renewal & Refinancing ⚠️ **PARTIAL**

**Assessment:** Renewal tracking exists but workflow is incomplete.

**Strengths:**

- Renewal date tracking and status (urgent, soon, upcoming, safe)
- Renewal reminders with configurable timing
- Blend-and-extend calculation and UI
- Refinancing event tracking
- Refinancing benefit calculation

**Issues Identified:**

- ⚠️ **Missing:** Automatic term creation workflow at renewal
- ⚠️ **Missing:** Renewal rate negotiation tracking
- ⚠️ **Missing:** Renewal options comparison (stay with lender vs switch)
- ⚠️ **Missing:** Refinancing closing costs tracking
- ⚠️ **Missing:** Refinancing break-even analysis improvements
- ⚠️ **Missing:** Mortgage portability modeling

**Recommendations:**

1. Add renewal workflow wizard (guided term creation)
2. Add closing costs to refinancing analysis
3. Add mortgage portability feature (porting mortgage to new property)
4. Add renewal rate negotiation tracking
5. Improve break-even analysis with closing costs

---

### 2.7 Payment Frequency Changes ❌ **MISSING**

**Assessment:** No support for changing payment frequency mid-term.

**What is Missing:**

- Users cannot change from monthly to biweekly payments
- No payment frequency change impact analysis
- No payment amount recalculation when frequency changes

**Impact:**

- **MEDIUM** - Many homeowners want to switch to accelerated payments mid-term

**Recommendations:**

1. Add payment frequency change service
2. Add `paymentFrequencyChangeEvents` table
3. Recalculate payment amount when frequency changes
4. Add UI for frequency change scenarios
5. Show impact of frequency change (interest savings, payoff time)

---

## 3. Advanced Features Review

### 3.1 Re-Advanceable Mortgages & HELOC ✅ **STRONG**

**Assessment:** Excellent implementation of re-advanceable mortgage mechanics.

**Strengths:**

- Automatic credit room calculation
- Credit limit updates on principal payments
- HELOC transaction tracking
- Re-advanceable mortgage linking
- Credit room history

**Issues Identified:**

- ⚠️ **Missing:** Home value appreciation tracking (credit limit should increase with property value)
- ⚠️ **Missing:** HELOC minimum payment calculations
- ⚠️ **Missing:** HELOC draw period vs repayment period
- ⚠️ **Missing:** HELOC interest-only payment option

**Recommendations:**

1. Add property value tracking and updates
2. Implement HELOC minimum payment calculations
3. Add draw period tracking
4. Add interest-only payment option

---

### 3.2 Smith Maneuver ⚠️ **PARTIAL**

**Assessment:** Smith Maneuver framework exists but tax optimization is incomplete.

**Strengths:**

- Smith Maneuver strategy tracking
- HELOC borrowing linked to investments
- Investment transaction tracking
- Tax calculation structure

**Issues Identified:**

- ⚠️ **Missing:** Detailed tax deduction calculations (eligible vs non-eligible interest)
- ⚠️ **Missing:** Investment income tax treatment (dividend tax credit, capital gains)
- ⚠️ **Missing:** Net tax benefit calculations
- ⚠️ **Missing:** Smith Maneuver ROI analysis
- ⚠️ **Missing:** Comparison with direct prepayment strategy

**Recommendations:**

1. **MEDIUM PRIORITY:** Enhance tax calculation service with detailed Canadian tax rules
2. Add dividend tax credit calculations
3. Add capital gains tax calculations
4. Add Smith Maneuver vs prepayment comparison
5. Add ROI analysis for Smith Maneuver strategies

---

### 3.3 Scenario Planning & Projections ✅ **GOOD**

**Assessment:** Scenario planning framework is solid.

**Strengths:**

- Scenario creation and management
- Prepayment event scheduling
- Refinancing event scheduling
- Projection calculations

**Issues Identified:**

- ⚠️ **Missing:** Monte Carlo simulations for rate uncertainty
- ⚠️ **Missing:** Scenario comparison UI improvements
- ⚠️ **Missing:** What-if analysis for rate changes
- ⚠️ **Missing:** Scenario templates (common strategies)

**Recommendations:**

1. Enhance scenario comparison UI
2. Add scenario templates (aggressive prepayment, Smith Maneuver, status quo)
3. Add Monte Carlo rate simulation
4. Add what-if rate change analysis

---

## 4. Canadian Mortgage Industry Alignment

### 4.1 Lender Conventions ✅ **MOSTLY ALIGNED**

**Assessment:** Most Canadian lender conventions are followed.

**Correctly Implemented:**

- Annual prepayment limits based on original amount
- Prepayment limit reset (calendar year - though some lenders use anniversary)
- Payment frequency support (all standard frequencies)
- Variable rate mortgage types (changing vs fixed payment)
- Trigger rate calculations
- Blend-and-extend calculations

**Missing Conventions:**

- ❌ Lender-specific penalty calculations
- ❌ Mortgage portability
- ❌ Payment frequency change mid-term
- ❌ Recast functionality
- ❌ Open vs closed mortgage distinction

**Recommendations:**

1. Add lender selection to mortgage creation
2. Implement lender-specific rules engine
3. Add mortgage portability feature
4. Add open/closed mortgage type

---

### 4.2 Regulatory Compliance ⚠️ **PARTIAL**

**Assessment:** Basic compliance considerations present but incomplete.

**Strengths:**

- CMHC insurance premium calculations
- High-ratio mortgage tracking
- Insurance provider support (CMHC, Sagen, Genworth)

**Issues Identified:**

- ⚠️ **Missing:** Stress test rate calculations (B-20 guidelines)
- ⚠️ **Missing:** Maximum amortization enforcement (25-30 years)
- ⚠️ **Missing:** Maximum LTV tracking and validation
- ⚠️ **Missing:** Debt service ratio calculations (GDS/TDS)

**Recommendations:**

1. Add stress test rate calculator (qualifying rate)
2. Add amortization period validation (max 30 years)
3. Add LTV validation (max 95% for insured, 80% for uninsured)
4. Add GDS/TDS ratio calculations

---

## 5. User Experience & Workflow Gaps

### 5.1 Mortgage Lifecycle Coverage ⚠️ **PARTIAL**

**Assessment:** Core lifecycle stages are covered but some transitions are missing.

**Covered Stages:**

- ✅ Origination (mortgage creation)
- ✅ Amortization (payment tracking)
- ✅ Prepayments
- ✅ Rate changes (variable mortgages)
- ✅ Renewals (tracking, not full workflow)

**Missing Stages:**

- ❌ Payment frequency changes
- ❌ Recast
- ❌ Portability
- ❌ Refinancing workflow (analysis exists, workflow incomplete)
- ❌ Payoff (final payment tracking)

**Recommendations:**

1. Add complete refinancing workflow wizard
2. Add mortgage payoff tracking
3. Add payment frequency change workflow
4. Add recast workflow

---

### 5.2 Notifications & Alerts ✅ **GOOD**

**Assessment:** Notification system is comprehensive.

**Strengths:**

- Renewal reminders
- Trigger rate alerts
- Rate change notifications
- Penalty alerts
- Blend-and-extend availability

**Issues Identified:**

- ⚠️ **Missing:** Prepayment limit approaching alerts
- ⚠️ **Missing:** Payment due reminders
- ⚠️ **Missing:** HELOC credit limit increase notifications
- ⚠️ **Missing:** Recast opportunity alerts

**Recommendations:**

1. Add prepayment limit alerts (80%, 90%, 100% used)
2. Add payment due reminders
3. Add HELOC credit limit increase notifications
4. Add recast opportunity alerts

---

## 6. Strategic Feature Gaps

### 6.1 High-Value Missing Features

**Priority 1 - Critical:**

1. **Mortgage Recast** - Common homeowner scenario, completely missing
2. **Penalty Calculation Accuracy** - Current IRD is simplified, needs lender-specific methods
3. **Payment Frequency Changes** - Common mid-term change, not supported
4. **Mortgage Portability** - Important for homeowners moving

**Priority 2 - Important:**

1. **Smith Maneuver Tax Optimization** - Framework exists but tax calculations incomplete
2. **Renewal Workflow** - Tracking exists but guided workflow missing
3. **Refinancing Closing Costs** - Analysis incomplete without closing costs
4. **Property Value Tracking** - Needed for HELOC credit limit updates

**Priority 3 - Nice to Have:**

1. **Monte Carlo Rate Simulations** - Advanced scenario planning
2. **Lender-Specific Rules Engine** - Customize calculations per lender
3. **Scenario Templates** - Pre-built common strategies
4. **Payment Due Reminders** - User convenience feature

---

### 6.2 Competitive Differentiation Opportunities

**Current Differentiators:**

- Re-advanceable mortgage support (strong)
- Trigger rate monitoring (excellent)
- Smith Maneuver framework (good foundation)
- Blend-and-extend calculations (good)

**Potential Differentiators (Not in Competitors):**

1. **Mortgage Portability Modeling** - Most tools don't support this
2. **Advanced Smith Maneuver Tax Optimization** - Detailed tax benefit analysis
3. **Lender-Specific Penalty Calculations** - Accurate penalty estimates
4. **Recast Workflow** - Guided recast scenarios
5. **Payment Frequency Change Impact Analysis** - Show savings from switching

---

## 7. Data Quality & Accuracy Concerns

### 7.1 Calculation Accuracy

**Concerns:**

- ⚠️ IRD penalty calculation is simplified - may not match actual lender calculations
- ⚠️ Rounding conventions not documented - need to verify Canadian standards
- ⚠️ Trigger rate calculation needs verification for all payment frequencies

**Recommendations:**

1. Document all calculation methodologies
2. Add calculation accuracy disclaimers
3. Verify trigger rate calculations with real lender examples
4. Add unit tests with known lender calculations

---

### 7.2 Data Maintenance

**Concerns:**

- ⚠️ `mortgage.currentBalance` update strategy unclear
- ⚠️ Property value tracking missing (needed for HELOC)
- ⚠️ Prime rate updates - need to verify automatic vs manual

**Recommendations:**

1. Document data update strategies
2. Add property value tracking
3. Verify prime rate update automation
4. Add data validation rules

---

## 8. Recommendations Summary

### Immediate Actions (Next Sprint)

1. **Document Current State:**
   - Create calculation methodology documentation
   - Document data update strategies
   - Add accuracy disclaimers where approximations are used

2. **Fix Critical Gaps:**
   - Add mortgage recast functionality (HIGH PRIORITY)
   - Improve penalty calculation accuracy (HIGH PRIORITY)
   - Add payment frequency change support (MEDIUM PRIORITY)

3. **Enhance Existing Features:**
   - Complete Smith Maneuver tax calculations
   - Add property value tracking
   - Improve renewal workflow

### Short-Term Roadmap (Next Quarter)

1. **Mortgage Recast Feature** (4-6 weeks)
   - Recast calculation service
   - Recast event tracking
   - Recast UI workflow

2. **Penalty Calculation Improvements** (3-4 weeks)
   - Research lender-specific IRD methods
   - Implement multiple penalty calculation methods
   - Add lender selection to mortgage

3. **Payment Frequency Changes** (2-3 weeks)
   - Frequency change service
   - Payment recalculation
   - Impact analysis UI

4. **Mortgage Portability** (3-4 weeks)
   - Portability data model
   - Portability calculation
   - Portability UI

### Medium-Term Roadmap (Next 6 Months)

1. **Smith Maneuver Tax Optimization** (4-6 weeks)
2. **Renewal Workflow Wizard** (3-4 weeks)
3. **Property Value Tracking** (2-3 weeks)
4. **Refinancing Closing Costs** (2-3 weeks)
5. **Monte Carlo Rate Simulations** (4-6 weeks)

---

## 9. Conclusion

The HomeWealth application demonstrates **strong technical architecture** and **solid understanding** of Canadian mortgage mechanics. The variable rate mortgage handling, trigger rate monitoring, and re-advanceable mortgage support are **industry-leading** features.

However, several **critical domain gaps** need attention:

- Mortgage recast (completely missing)
- Penalty calculation accuracy (simplified)
- Payment frequency changes (not supported)
- Mortgage portability (missing)

**Overall Assessment:** The application is **production-ready for core scenarios** but needs the identified gaps addressed to be **competitive with established mortgage tools** and meet **homeowner expectations** for comprehensive mortgage planning.

**Recommendation:** Prioritize recast and penalty calculation improvements as these are **high-value, commonly-needed features** that will significantly improve user satisfaction and competitive positioning.

---

## Appendix: Feature Completeness Matrix

| Feature                   | Status       | Completeness | Priority |
| ------------------------- | ------------ | ------------ | -------- |
| Mortgage Creation         | ✅ Complete  | 95%          | -        |
| Payment Tracking          | ✅ Complete  | 90%          | -        |
| Variable Rate Mortgages   | ✅ Excellent | 95%          | -        |
| Trigger Rate Monitoring   | ✅ Excellent | 95%          | -        |
| Prepayment Mechanics      | ✅ Strong    | 85%          | -        |
| Penalty Calculations      | ⚠️ Partial   | 60%          | HIGH     |
| Mortgage Recast           | ❌ Missing   | 0%           | HIGH     |
| Renewal Tracking          | ✅ Good      | 75%          | -        |
| Renewal Workflow          | ⚠️ Partial   | 50%          | MEDIUM   |
| Refinancing Analysis      | ✅ Good      | 70%          | -        |
| Blend-and-Extend          | ✅ Complete  | 90%          | -        |
| Payment Frequency Changes | ❌ Missing   | 0%           | MEDIUM   |
| Re-Advanceable Mortgages  | ✅ Excellent | 90%          | -        |
| HELOC Management          | ✅ Strong    | 85%          | -        |
| Smith Maneuver            | ⚠️ Partial   | 65%          | MEDIUM   |
| Mortgage Portability      | ❌ Missing   | 0%           | MEDIUM   |
| Scenario Planning         | ✅ Good      | 75%          | -        |
| Notifications             | ✅ Good      | 80%          | -        |

---

**End of Review**
