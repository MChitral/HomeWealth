# Documentation

Essential project documentation organized in a clean structure.

## 📁 Structure

```
docs/
├── README.md (this file)
│
├── guides/
│   ├── FORM_VALIDATION_GUIDE.md        # Form patterns
│   ├── ESLINT_PRETTIER_SETUP.md        # Code quality setup
│   ├── design_guidelines.md            # UI/UX guidelines
│   ├── ACCELERATED_PAYMENT_CALCULATION.md # Payment calculation guide
│   ├── PREPAYMENT_LIMIT_CALCULATION.md    # Prepayment limit guide
│   ├── PRIME_RATE_DATA_FLOW.md            # Prime rate flow guide
│   ├── PRIME_RATE_SCHEDULER.md           # Prime rate scheduler guide
│   ├── ROUNDING_CONVENTIONS.md           # Rounding rules
│   ├── VARIABLE_RATE_MORTGAGE_BEHAVIOR.md # VRM types and trigger rates
│   └── FEATURE_LIMITATIONS.md            # What's NOT implemented
│
├── audits/
│   └── REFINANCING_FEATURE_AUDIT.md   # Refinancing feature audit
│
└── architecture/
    └── TECHNICAL_ARCHITECTURE.md       # System architecture
```

**Total: 13 essential files**

---

## 🚀 Quick Links

### Getting Started

- **Project Overview:** See root `README.md` in project root
- **Architecture:** [`architecture/TECHNICAL_ARCHITECTURE.md`](architecture/TECHNICAL_ARCHITECTURE.md)

### Reference Guides

- **Form Patterns:** [`guides/FORM_VALIDATION_GUIDE.md`](guides/FORM_VALIDATION_GUIDE.md)
- **Code Quality Setup:** [`guides/ESLINT_PRETTIER_SETUP.md`](guides/ESLINT_PRETTIER_SETUP.md)
- **Design Guidelines:** [`guides/design_guidelines.md`](guides/design_guidelines.md)

### Calculation Guides

- **Accelerated Payments:** [`guides/ACCELERATED_PAYMENT_CALCULATION.md`](guides/ACCELERATED_PAYMENT_CALCULATION.md)
- **Prepayment Limits:** [`guides/PREPAYMENT_LIMIT_CALCULATION.md`](guides/PREPAYMENT_LIMIT_CALCULATION.md)
- **Prime Rate Flow:** [`guides/PRIME_RATE_DATA_FLOW.md`](guides/PRIME_RATE_DATA_FLOW.md)
- **Prime Rate Scheduler:** [`guides/PRIME_RATE_SCHEDULER.md`](guides/PRIME_RATE_SCHEDULER.md)
- **Rounding Conventions:** [`guides/ROUNDING_CONVENTIONS.md`](guides/ROUNDING_CONVENTIONS.md)
- **Variable Rate Mortgages:** [`guides/VARIABLE_RATE_MORTGAGE_BEHAVIOR.md`](guides/VARIABLE_RATE_MORTGAGE_BEHAVIOR.md)

### Feature Information

- **What's NOT Implemented:** [`guides/FEATURE_LIMITATIONS.md`](guides/FEATURE_LIMITATIONS.md) - Comprehensive list of missing features

### Audits

- **Refinancing Feature Audit:** [`audits/REFINANCING_FEATURE_AUDIT.md`](audits/REFINANCING_FEATURE_AUDIT.md)

---

## 📝 Categories

### `/guides` - Reference Guides

Active guides and setup instructions:

- How-to guides for developers
- Calculation guides (mortgage math)
- Feature documentation
- Setup and configuration guides

### `/audits` - Audit Reports

Current feature audits and analysis for reference.

### `/architecture` - Architecture

Technical architecture and system design documentation.

---

**Note:** Historical bug reports, test execution logs, and redundant summaries have been removed. Only essential, current documentation remains.

## What's Included vs What's Not

### ✅ Implemented Features
- Fixed-rate and variable-rate mortgages (VRM-Changing and VRM-Fixed Payment)
- Trigger rate calculations and negative amortization tracking
- Blend-and-extend renewal calculations
- Refinancing events (year-based and term-end)
- Prepayment tracking with annual limits
- Accelerated payment frequencies
- Prime rate tracking and automatic updates
- Scenario modeling and comparison
- Emergency fund planning
- Cash flow tracking

### ❌ Not Implemented (See Limitations Guide)
- Mortgage penalties (IRD, 3-month interest)
- HELOC and re-advanceable mortgages
- Recast functionality
- CMHC insurance calculations
- Payment skipping UI
- Blend-and-extend UI integration

For complete details, see [`guides/FEATURE_LIMITATIONS.md`](guides/FEATURE_LIMITATIONS.md).

---

**Documentation Summary:** 13 essential files (updated December 2025)

**Cleanup:** Removed 6 historical/outdated documents:
- Removed outdated audit documents (REACT_APP_AUDIT)
- Removed historical completed work summaries
- Removed historical architecture decision documents (STATE_MANAGEMENT, REDUX_DECISION)
- Kept only current, actionable documentation
