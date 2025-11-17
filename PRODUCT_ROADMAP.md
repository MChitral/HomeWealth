# Canadian Mortgage Strategy & Wealth Forecasting - Product Roadmap

## Executive Summary

Analysis of leading mortgage calculators (Canadian Government tool, Calculator.net) reveals critical features needed to make our MVP best-in-class. This roadmap prioritizes features by impact and implementation complexity.

**Our Unique Value Proposition:**
- Multi-scenario comparison (4 strategies simultaneously)
- Cash flow integration with income/expense modeling
- Investment alternatives (prepay vs invest analysis)
- Emergency fund consideration
- 10-30 year net worth projections
- Variable rate mortgage support (VRM changing/fixed payment, trigger rates)

## Priority 1: Critical Missing Features (Implement with Backend)

### 1.1 Prepayment Modeling Engine ⚠️ CRITICAL

**Problem**: Users cannot model the impact of extra payments (bonuses, lump sums, increased regular payments)

**Solution**: Add comprehensive prepayment modeling to scenario settings

**Features:**
- Percentage of monthly surplus allocated to prepayment (already planned)
- Annual lump sum prepayments (e.g., $5000 bonus every year)
- One-time prepayments with specific timing (e.g., $20000 inheritance in Year 3)
- Prepayment limits validation (most Canadian lenders allow 10-20%/year)
- Start payment number for prepayments (e.g., begin extra payments after 6 months)

**Schema Changes:**
```typescript
scenario {
  prepaymentStrategy: {
    monthlyExtraPercent: number;        // % of surplus to mortgage
    annualLumpSum: number;              // Yearly bonus payment
    annualLumpSumMonth: number;         // Which month (e.g., March for tax refund)
    oneTimePrepayments: Array<{
      amount: number;
      paymentNumber: number;
    }>;
    prepaymentLimit: number;            // Lender's annual prepayment cap (%)
  }
}
```

**Impact**: Users can model realistic prepayment strategies matching their actual financial situation

---

### 1.2 Amortization Schedule Generation ⚠️ CRITICAL

**Problem**: Users cannot see month-by-month mortgage breakdown showing when they'll be mortgage-free

**Solution**: Generate forward-looking amortization schedules for each scenario

**Features:**
- Month-by-month payment breakdown (principal, interest, balance)
- Year-end summaries (total principal paid, total interest paid)
- Payment schedule respects:
  - Payment frequency (monthly/bi-weekly/accelerated)
  - Prepayment strategy
  - Variable rate changes (for VRM)
  - Term renewals with rate changes
- Highlight mortgage payoff date
- Show cumulative interest paid over time

**Calculation Engine Requirements:**
```typescript
generateAmortizationSchedule(
  mortgage: MortgageDetails,
  scenario: Scenario,
  projectionYears: number
): AmortizationSchedule {
  // For each payment period:
  // 1. Calculate interest on remaining balance
  // 2. Apply payment (split principal/interest)
  // 3. Apply prepayments if scheduled
  // 4. Track remaining balance
  // 5. Check for term renewal (rate change)
  // 6. For VRM: recalculate based on new prime rate
  // 7. Detect trigger rate (VRM-Fixed Payment)
}
```

**UI Display:**
- Expandable table showing year-by-year then month-by-month
- Chart: Balance over time
- Chart: Cumulative interest over time
- Export to CSV/PDF

**Impact**: Core feature users expect - seeing exactly when they'll be debt-free

---

### 1.3 Savings Metrics & Comparison ⚠️ HIGH VALUE

**Problem**: Users cannot easily quantify the benefit of one strategy vs another

**Solution**: Add savings metrics to scenario comparison showing time & money saved

**Features:**
- **Interest Savings**: "$45,230 less interest vs baseline"
- **Time Savings**: "Pay off 6.3 years earlier"
- **Percentage Metrics**: 
  - "Pay 35% less interest"
  - "Payoff 31% faster"
- **Winner Callout Enhancement**: Show why the winner is best
- **Trade-off Analysis**: "Pay $380 more per month, save $67K over life of mortgage"

**UI Components:**
```typescript
// Comparison Page Enhancements
<SavingsCallout>
  <MetricCard>
    <Label>Interest Savings</Label>
    <Value>$45,230</Value>
    <Comparison>35% less than Balanced</Comparison>
  </MetricCard>
  <MetricCard>
    <Label>Time Savings</Label>
    <Value>6.3 years earlier</Value>
    <Comparison>Payoff in Year 18.7 vs 25.0</Comparison>
  </MetricCard>
</SavingsCallout>
```

**Calculation Requirements:**
- Baseline scenario for comparison (typically "minimum payment, no prepayment")
- Difference calculations: absolute ($) and relative (%)
- Consider both term (5-year) and full amortization period

**Impact**: Quantifies value of different strategies, making decision-making easier

---

## Priority 2: User Experience Enhancements

### 2.1 Payment Schedule Export 📋

**Features:**
- Export amortization schedule to CSV
- Generate PDF scenario comparison report
- Include all metrics, charts, and payment breakdown
- Branded report for sharing with financial advisors

**Formats:**
- CSV: Full payment schedule with all columns
- PDF: Executive summary + detailed amortization + charts
- Shareable link to scenario comparison

---

### 2.2 Canadian Mortgage Rules Education 🇨🇦

**Problem**: Users may not know about first-time buyer advantages or down payment rules

**Solution**: Add educational callouts based on user's situation

**Features:**
- **First-Time Buyer Alert**: "As a first-time buyer purchasing a new build, you qualify for 30-year amortization (vs standard 25-year)"
- **Down Payment Impact**: "With 20%+ down payment, you avoid mortgage insurance and can negotiate better rates"
- **Prepayment Limits**: "Most lenders allow 10-20% prepayment per year without penalty. Check your mortgage contract."
- **Term Renewal Advice**: "Shop around 120 days before term renewal to get the best rate"

**Implementation:**
- Add to Mortgage History page as info cards
- Conditional display based on user's mortgage details
- Link to CMHC resources for more info

---

### 2.3 Enhanced Prepayment Flexibility

**Features:**
- **Irregular Income Modeling**: "I get a $10K bonus in March every year"
- **Tax Refund Strategy**: "Apply $4K tax refund annually in April"
- **Windfall Modeling**: "One-time $30K inheritance in Year 5"
- **Prepayment Cap Validation**: Warn if exceeding lender's annual limit
- **Payment Increase Strategy**: "Increase regular payment by $200/month starting Year 2"

**Schema:**
```typescript
prepaymentEvents: Array<{
  type: 'annual' | 'one-time' | 'payment-increase';
  amount: number;
  startDate: string;
  endDate?: string;
  description: string;
}>
```

---

## Priority 3: Advanced Features (Post-MVP)

### 3.1 Rate Change Scenarios

**Features:**
- Model "what if rates rise/fall by X%"
- Stress testing: "Can I afford if rates hit 8%?"
- Rate forecast integration (Bank of Canada predictions)

### 3.2 Refinancing Analysis

**Features:**
- Compare: stay with current mortgage vs refinance
- Break penalty calculation
- Find break-even point for refinancing

### 3.3 Investment Return Modeling

**Features:**
- Different asset allocations (conservative/balanced/aggressive)
- Tax-advantaged accounts (TFSA, RRSP)
- Historical return ranges with Monte Carlo simulation

### 3.4 Tax Optimization

**Features:**
- RRSP contribution modeling (tax refund → prepayment)
- Investment income tax calculations
- Mortgage interest deductibility (rental properties)

### 3.5 Home Equity & Borrowing

**Features:**
- Track home equity build-up
- HELOC availability modeling
- Smith Maneuver calculations (investment loan strategy)

---

## Comparison with Existing Tools

| Feature | Gov Tool | Calculator.net | **Our MVP** |
|---------|----------|----------------|-------------|
| Canadian-specific rules | ✅ | ❌ | ✅ Planned |
| Prepayment modeling | ✅ Basic | ✅ Advanced | 🚧 Implementing |
| Amortization schedule | ✅ | ✅ | 🚧 Implementing |
| Multiple scenarios | ❌ | ❌ Side-by-side | ✅ **4 simultaneous** |
| Cash flow integration | ❌ | ❌ | ✅ **Unique** |
| Investment alternative | ❌ | ❌ | ✅ **Unique** |
| Emergency fund | ❌ | ❌ | ✅ **Unique** |
| Net worth projection | ❌ | ❌ | ✅ **Unique** |
| Variable rate support | ⚠️ Basic | ❌ | ✅ **Advanced VRM** |
| Savings metrics | ❌ | ✅ | 🚧 Implementing |
| Export/PDF | ✅ | ❌ | 🎯 Planned |

**Our Competitive Advantage**: Only tool that compares "prepay mortgage" vs "invest surplus" with full financial picture integration.

---

## Implementation Phases

### Phase 1: MVP Backend (Current Sprint)
- ✅ Database schema design
- ✅ API routes for CRUD operations
- 🚧 Canadian mortgage calculation engine
  - Semi-annual compounding
  - Payment frequency conversions
  - Term vs amortization tracking
- 🚧 Prepayment modeling engine
- 🚧 Amortization schedule generation
- 🚧 Net worth projection engine

### Phase 2: Scenario Comparison Enhancement
- Savings metrics calculation
- Enhanced comparison UI
- Export functionality

### Phase 3: Advanced Prepayment Features
- Irregular income modeling
- Multiple prepayment strategies per scenario
- Prepayment limit validation

### Phase 4: Educational & UX Polish
- Canadian mortgage rules callouts
- Guided scenario creation
- Tutorial/onboarding

### Phase 5: Advanced Features
- Rate change scenarios
- Refinancing analysis
- Tax optimization

---

## Success Metrics

**User Engagement:**
- Average scenarios created per user: Target 3+
- Time spent comparing scenarios: Target 10+ minutes
- Return visit rate: Target 40%+

**Product Value:**
- Users report making informed decisions: Target 80%+
- Users share with spouse/advisor: Target 60%+
- Users recommend to others: NPS target 50+

**Technical:**
- Calculation accuracy: 100% match with manual calculations
- Performance: Scenario generation < 2 seconds
- Availability: 99.9% uptime

---

## Next Steps

1. ✅ Complete frontend design deficiency fixes
2. 🚧 Implement backend schema with prepayment support
3. 🚧 Build Canadian mortgage calculation engine
4. 🚧 Implement amortization schedule generation
5. 🚧 Add savings metrics to comparison page
6. Test calculation accuracy against government calculator
7. Beta launch with real user testing

---

## Notes & Considerations

**Canadian Mortgage Specifics:**
- Semi-annual compounding (not monthly like US)
- Payment frequency options affect effective rate
- Term locks (3-5 years) vs amortization period (25-30 years)
- Variable rate mortgages: two distinct types (changing payment vs fixed payment)
- Trigger rate detection for VRM-Fixed Payment
- First-time buyer advantages (30-year amortization as of Dec 2024)

**Data Sources:**
- Bank of Canada Prime Rate (for VRM calculations)
- CMHC rules and limits
- Typical lender prepayment allowances (10-20% annually)

**Validation:**
- Cross-reference calculations with government tool
- Test edge cases: trigger rates, accelerated payments, term renewals
- User acceptance testing with real financial scenarios
