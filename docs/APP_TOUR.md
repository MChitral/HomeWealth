# Application Tour & Testing Guide

This document provides a comprehensive overview of the **Canadian Mortgage & Wealth Forecasting Application**. It maps the system's layered architecture and defines specific testing journeys based on feature dependencies.

## 🗺️ Feature Dependency Map

The application is built in layers. Testing **must** respect this order: lower layers must be stable before upper layers can be validated.

### 1. FOUNDATION LAYER (No dependencies)

_The bedrock of the application. If these fail, everything fails._

- **Mortgage Creation**: The core entity.
- **Cash Flow Planning**: Income and expense baselines.
- **Prime Rate Tracking**: Global economic indicators.

### 2. CORE LAYER (Depend on Foundation)

_Essential mortgage mechanics and daily tracking._

- **Payment Tracking** (→ Mortgage Creation): Recording actuals.
- **Variable Rate Monitoring** (→ Mortgage Creation): Trigger rates, static payments.
- **Prepayment Mechanics** (→ Mortgage Creation, Payment Tracking): Lump sums, double-up payments.
- **Renewal Tracking** (→ Mortgage Creation): End-of-term logic.
- **Refinancing Analysis** (→ Mortgage Creation): Breaking term analysis.
- **Penalty Calculations** (→ Mortgage Creation): IRD vs 3-month interest.
- **Property Value Tracking** (→ Mortgage Creation): LTV monitoring.
- **Emergency Fund Planning** (→ Cash Flow Planning): Liquid reserve goals.

### 3. ADVANCED LAYER (Depend on Core)

_Strategic wealth building and complex financial interactions._

- **Mortgage Recast** (→ Mortgage Creation, Payment Tracking): Amortization adjustments.
- **Payment Frequency Changes** (→ Mortgage Creation): Accelerated bi-weekly/weekly effects.
- **Blend-and-Extend** (→ Renewal Tracking): Mid-term rate modification.
- **Mortgage Portability** (→ Mortgage Creation): Moving mortgages to new properties.
- **HELOC Management** (→ Property Value, Mortgage Creation): Equity access.
- **Smith Maneuver** (→ HELOC, Investments, Tax): Debt conversion strategy.
- **Scenario Planning** (→ Mortgage Creation, Cash Flow): "What-if" modeling.
- **Scenario Comparison** (→ Scenario Planning): Side-by-side analysis.

### 4. MONITORING LAYER (Depend on Core/Advanced)

_User feedback and high-level insights._

- **Mortgage Health Score** (→ Trigger Rate, Renewal): Abstracted risk metric.
- **Notifications System**: Global alerts for all layers.
- **Analytics Dashboard**: Visual synthesis of all data.

---

## 🚶 Typical User Journeys (Testing Roadmaps)

Use these flows to simulate real user behavior during testing.

### Journey A: Getting Started (The Setup)

_Focus: Foundation Data Integrity_

1.  **Create Mortgage**: Enter principal, rate, term.
2.  **Record Payments**: Add historical payments.
3.  **Set Up Cash Flow**: Define monthly surplus.
    - _Test Check_: Does the dashboard accurately reflect the current balance and net worth?

### Journey B: Daily/Weekly Monitoring (The Check-in)

_Focus: Core Layer & Monitoring_

1.  **Check Dashboard**: Review high-level metrics.
2.  **Review Notifications**: Check for renewal or payment alerts.
3.  **Monitor Trigger Rate**: (For VRM) Check distance to trigger point.
4.  **Track Health Score**: Verify score updates based on recent inputs.

### Journey C: Strategic Planning (Monthly/Quarterly)

_Focus: Optimizing within the Term_

1.  **Review Prepayment Opportunities**: Check "Prepay" tab capabilities against cash flow.
2.  **Check Renewal Status**: See days remaining in term.
3.  **Analyze Refinancing**: Compare breaking penalty vs. lower rate savings.
4.  **Update Property Value**: Adjust home value and verify LTV updates.

### Journey D: Long-Term Planning (Annually)

_Focus: Advanced & Future Scenarios_

1.  **Create Scenarios**: Model a "High Interest" future.
2.  **Compare Strategies**: "Aggressive Paydown" vs. "Invest Surplus".
3.  **Plan Renewal**: Simulate next term's payments.

### Journey E: Advanced Wealth Strategies

_Focus: Complex Inter-dependencies_

1.  **Set Up HELOC**: Establish credit limit linked to Property Value.
2.  **Model Smith Maneuver**:
    - Execute a mortgage payment.
    - Verify readvanceable HELOC room increases.
    - Simulate investment withdrawal.
3.  **Analyze Tax Benefits**: Check tax deduction projections.

---

## 🏗️ Technical Architecture Notes

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts.
- **Backend**: Reference architecture (Express/Drizzle) handles server-side state.
- **Calculations**: Shared domain logic ensures consistency across all layers.

This guide aligns with the user's mental model and provides a structured approach to validating the system from bottom to top.
