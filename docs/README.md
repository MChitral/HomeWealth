# Documentation

Essential project documentation organized by purpose and audience.

**Last Updated:** January 2025  
**Status:** Current and accurate based on Product Owner Review

---

## 📁 Structure

```
docs/
├── README.md (this file)
├── PRODUCT_OWNER_REVIEW.md              # ⭐ Most current product assessment (Jan 2025)
│
├── guides/                              # Technical & calculation guides
│   ├── ACCELERATED_PAYMENT_CALCULATION.md
│   ├── PREPAYMENT_LIMIT_CALCULATION.md
│   ├── PRIME_RATE_DATA_FLOW.md
│   ├── PRIME_RATE_SCHEDULER.md
│   ├── ROUNDING_CONVENTIONS.md
│   ├── VARIABLE_RATE_MORTGAGE_BEHAVIOR.md
│   ├── FEATURE_LIMITATIONS.md          # Current gaps & missing features
│   ├── FORM_VALIDATION_GUIDE.md
│   ├── ESLINT_PRETTIER_SETUP.md
│   └── design_guidelines.md
│
├── feature-specifications/               # Detailed feature specs
│   ├── HELOC_READVANCEABLE_FEATURE_SPEC.md
│   ├── SMITH_MANEUVER_FEATURE_SPEC.md
│   ├── RENEWAL_TRACKING_WORKFLOW_FEATURE_SPEC.md
│   ├── VARIABLE_RATE_MORTGAGES_TRIGGER_RATES_FEATURE_SPEC.md
│   ├── PENALTY_CALCULATIONS_FEATURE_SPEC.md
│   ├── REFINANCING_ANALYSIS_FEATURE_SPEC.md
│   ├── PREPAYMENT_MECHANICS_FEATURE_SPEC.md
│   ├── PAYMENT_TRACKING_MANAGEMENT_FEATURE_SPEC.md
│   ├── PROPERTY_VALUE_TRACKING_FEATURE_SPEC.md
│   ├── MORTGAGE_PAYOFF_TRACKING_FEATURE_SPEC.md
│   ├── SCENARIO_PLANNING_PROJECTIONS_FEATURE_SPEC.md
│   ├── MORTGAGE_RECAST_FEATURE_SPEC.md
│   ├── PAYMENT_FREQUENCY_CHANGES_FEATURE_SPEC.md
│   ├── MORTGAGE_PORTABILITY_FEATURE_SPEC.md
│   ├── BLEND_AND_EXTEND_FEATURE_SPEC.md
│   ├── CASH_FLOW_PLANNING_FEATURE_SPEC.md
│   ├── EMERGENCY_FUND_PLANNING_FEATURE_SPEC.md
│   ├── MORTGAGE_CREATION_FEATURE_SPEC.md
│   ├── NOTIFICATIONS_ALERTS_FEATURE_SPEC.md
│   └── REGULATORY_COMPLIANCE_FEATURE_SPEC.md
│
├── audits/                              # Feature-specific audits
│   └── REFINANCING_FEATURE_AUDIT.md    # Technical audit of refinancing feature
│
├── architecture/                        # Technical architecture
│   └── TECHNICAL_ARCHITECTURE.md
│
├── cmhc-insurance-rates.md             # CMHC insurance rate reference
│
└── strategic/                           # Strategic planning documents (not current state)
    ├── PRODUCT_STRATEGY_MORTGAGE_HEALTH_MONITOR.md
    ├── AI_INTEGRATION_STRATEGY.md
    ├── SUBSCRIPTION_VALUE_FRAMEWORK.md
    └── COMPETITIVE_ANALYSIS.md
```

**Total: 24 essential files**

---

## 🚀 Quick Links

### Product Assessment (Start Here)

- **⭐ [Product Owner Review](PRODUCT_OWNER_REVIEW.md)** - Comprehensive January 2025 assessment
  - Current feature completeness
  - Critical gaps identified
  - Strategic recommendations
  - Feature completeness matrix

### Technical Guides

- **Calculation Guides:**
  - [Accelerated Payment Calculation](guides/ACCELERATED_PAYMENT_CALCULATION.md)
  - [Prepayment Limit Calculation](guides/PREPAYMENT_LIMIT_CALCULATION.md)
  - [Variable Rate Mortgage Behavior](guides/VARIABLE_RATE_MORTGAGE_BEHAVIOR.md)
  - [Rounding Conventions](guides/ROUNDING_CONVENTIONS.md)
  - [Prime Rate Data Flow](guides/PRIME_RATE_DATA_FLOW.md)
  - [Prime Rate Scheduler](guides/PRIME_RATE_SCHEDULER.md)

- **Development Guides:**
  - [Form Validation Guide](guides/FORM_VALIDATION_GUIDE.md)
  - [ESLint & Prettier Setup](guides/ESLINT_PRETTIER_SETUP.md)
  - [Design Guidelines](guides/design_guidelines.md)

- **Feature Status:**
  - [Feature Limitations](guides/FEATURE_LIMITATIONS.md) - What's NOT implemented

### Feature Specifications

- [HELOC & Re-Advanceable Mortgage Spec](feature-specifications/HELOC_READVANCEABLE_FEATURE_SPEC.md)
- [Smith Maneuver Feature Spec](feature-specifications/SMITH_MANEUVER_FEATURE_SPEC.md)
- [Renewal Tracking & Workflow Spec](feature-specifications/RENEWAL_TRACKING_WORKFLOW_FEATURE_SPEC.md)
- [Variable Rate Mortgages & Trigger Rates Spec](feature-specifications/VARIABLE_RATE_MORTGAGES_TRIGGER_RATES_FEATURE_SPEC.md)
- [Penalty Calculations Spec](feature-specifications/PENALTY_CALCULATIONS_FEATURE_SPEC.md)
- [Refinancing Analysis Spec](feature-specifications/REFINANCING_ANALYSIS_FEATURE_SPEC.md)
- [Prepayment Mechanics Spec](feature-specifications/PREPAYMENT_MECHANICS_FEATURE_SPEC.md)
- [Payment Tracking & Management Spec](feature-specifications/PAYMENT_TRACKING_MANAGEMENT_FEATURE_SPEC.md)
- [Property Value Tracking Spec](feature-specifications/PROPERTY_VALUE_TRACKING_FEATURE_SPEC.md)
- [Mortgage Payoff Tracking Spec](feature-specifications/MORTGAGE_PAYOFF_TRACKING_FEATURE_SPEC.md)
- [Scenario Planning & Projections Spec](feature-specifications/SCENARIO_PLANNING_PROJECTIONS_FEATURE_SPEC.md)
- [Mortgage Recast Spec](feature-specifications/MORTGAGE_RECAST_FEATURE_SPEC.md)
- [Payment Frequency Changes Spec](feature-specifications/PAYMENT_FREQUENCY_CHANGES_FEATURE_SPEC.md)
- [Mortgage Portability Spec](feature-specifications/MORTGAGE_PORTABILITY_FEATURE_SPEC.md)
- [Blend and Extend Spec](feature-specifications/BLEND_AND_EXTEND_FEATURE_SPEC.md)
- [Cash Flow Planning Spec](feature-specifications/CASH_FLOW_PLANNING_FEATURE_SPEC.md)
- [Emergency Fund Planning Spec](feature-specifications/EMERGENCY_FUND_PLANNING_FEATURE_SPEC.md)
- [Mortgage Creation Spec](feature-specifications/MORTGAGE_CREATION_FEATURE_SPEC.md)
- [Notifications & Alerts Spec](feature-specifications/NOTIFICATIONS_ALERTS_FEATURE_SPEC.md)
- [Regulatory Compliance Spec](feature-specifications/REGULATORY_COMPLIANCE_FEATURE_SPEC.md)

### Architecture

- [Technical Architecture](architecture/TECHNICAL_ARCHITECTURE.md)

### Reference

- [CMHC Insurance Rates](cmhc-insurance-rates.md)

### Strategic Documents

**Note:** These are strategic planning documents, not current state assessments. For current product state, see [Product Owner Review](PRODUCT_OWNER_REVIEW.md).

- [Product Strategy: Mortgage Health Monitor](strategic/PRODUCT_STRATEGY_MORTGAGE_HEALTH_MONITOR.md)
- [AI Integration Strategy](strategic/AI_INTEGRATION_STRATEGY.md)
- [Subscription Value Framework](strategic/SUBSCRIPTION_VALUE_FRAMEWORK.md)
- [Competitive Analysis](strategic/COMPETITIVE_ANALYSIS.md)

---

## ✅ Implemented Features (Current State)

Based on Product Owner Review (January 2025):

### Core Mortgage Features ✅

- Mortgage creation and tracking
- Payment tracking with full breakdown
- Variable rate mortgages (VRM-Changing & VRM-Fixed-Payment)
- Trigger rate monitoring and alerts
- Prepayment mechanics with annual limits
- Penalty calculations (IRD & 3-month interest)
- Renewal tracking and reminders
- Blend-and-extend calculations and UI
- Refinancing analysis
- CMHC insurance premium calculator

### Advanced Features ✅

- Re-advanceable mortgages
- HELOC management
- Smith Maneuver framework
- Scenario planning and projections
- Prime rate tracking
- Market rate service
- Notification system

---

## ❌ Missing Features (High Priority)

Based on Product Owner Review:

1. **Mortgage Recast** - Payment recalculation after large prepayments
2. **Payment Frequency Changes** - Mid-term frequency switching
3. **Mortgage Portability** - Porting mortgage to new property
4. **Lender-Specific Penalty Calculations** - More accurate IRD methods
5. **Property Value Tracking** - For HELOC credit limit updates

See [Feature Limitations](guides/FEATURE_LIMITATIONS.md) for complete list.

---

## 📝 Documentation Principles

1. **Single Source of Truth:** Product Owner Review is the authoritative assessment
2. **Keep Current:** Technical guides updated as features change
3. **Remove Outdated:** Historical/obsolete docs removed
4. **Focus on Value:** Only essential, actionable documentation

---

## 🔄 Recent Cleanup (January 2025)

**Removed:**

- Outdated audit documents (replaced by Product Owner Review)
- Historical implementation plans (features now complete)
- Redundant feature inventories
- Strategic documents superseded by current review

**Kept:**

- Technical calculation guides (still accurate)
- Feature specifications (HELOC, Smith Maneuver, Renewal Tracking & Workflow, Variable Rate Mortgages & Trigger Rates, Penalty Calculations, Refinancing Analysis, Prepayment Mechanics, Payment Tracking & Management, Property Value Tracking, Mortgage Payoff Tracking, Scenario Planning & Projections, Mortgage Recast, Payment Frequency Changes, Mortgage Portability, Blend and Extend, Cash Flow Planning, Emergency Fund Planning, Mortgage Creation, Notifications & Alerts, Regulatory Compliance)
- Architecture documentation
- Current limitations guide

---

**For the most current product assessment, see [PRODUCT_OWNER_REVIEW.md](PRODUCT_OWNER_REVIEW.md)**
