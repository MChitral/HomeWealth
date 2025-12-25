# Smith Maneuver Feature Specification

**Document Version:** 1.0  
**Date:** December 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Tax-Optimized Mortgage Strategy Overview

The Smith Maneuver is a sophisticated Canadian tax strategy that enables homeowners to convert non-deductible mortgage interest into tax-deductible investment loan interest. This advanced financial strategy requires careful modeling, risk assessment, and integration of multiple financial components.

**Strategy Mechanics:**
1. Make prepayments to mortgage (increases home equity)
2. Borrow from HELOC against increased equity
3. Invest HELOC funds in income-producing investments
4. Claim HELOC interest as tax deduction (investment loan interest)
5. Use investment returns to accelerate mortgage payoff
6. Repeat the cycle to maximize tax benefits

### Target User

**Primary Persona:**
- High-income homeowners (marginal tax rate 40%+)
- Sophisticated investors comfortable with leverage
- Tax-optimization seekers
- Risk-aware users who understand leverage implications

**User Characteristics:**
- Annual income: $100,000+ (higher marginal tax rates)
- Existing mortgage with equity
- Investment knowledge and risk tolerance
- Willingness to use leverage for tax optimization
- Access to professional tax advice

### Regulatory and Disclaimer Requirements

**Critical Compliance:**
- **Not Tax Advice:** Application provides educational modeling only
- **Professional Consultation Required:** Users must consult tax professionals
- **Educational Tool Positioning:** Clear disclaimers throughout
- **Risk Warnings:** Leverage risk, market volatility, tax law changes
- **No Guarantees:** Outcomes are projections, not guarantees

**Required Disclaimers:**
- Tax laws may change
- Investment returns are not guaranteed
- Leverage amplifies both gains and losses
- Professional tax and investment advice recommended
- Individual circumstances vary

---

## Domain Overview - Smith Maneuver

### Strategy Mechanics

**Core Cycle:**
1. **Prepayment Phase:**
   - User makes prepayment to mortgage
   - Mortgage principal decreases
   - Home equity increases
   - HELOC credit room increases

2. **Borrowing Phase:**
   - User borrows from HELOC (up to increased credit room)
   - HELOC balance increases
   - Available credit decreases

3. **Investment Phase:**
   - HELOC funds invested in income-producing assets
   - Investments generate returns (dividends, capital gains)
   - Investment returns tracked separately

4. **Tax Deduction Phase:**
   - HELOC interest is tax-deductible (investment loan interest)
   - Tax deduction = HELOC Interest × Marginal Tax Rate
   - Tax savings reduce net HELOC cost

5. **Reinvestment Phase:**
   - Investment returns used to pay down mortgage
   - Cycle repeats with increased equity
   - Compound effect over time

**Key Principle:**
Convert non-deductible mortgage interest into tax-deductible investment loan interest, while using investment returns to accelerate mortgage payoff.

### Tax Deduction Rules

**Investment Loan Interest Deductibility:**
- HELOC interest is deductible if funds used for investment purposes
- Must be "reasonable expectation of profit" from investments
- Investment must generate income (dividends, interest, capital gains)
- Personal use of HELOC funds is NOT deductible

**Eligibility Requirements:**
- HELOC funds must be traceable to investments
- Investments must be income-producing
- Tax deduction requires proper documentation
- CRA (Canada Revenue Agency) compliance required

**Tax Calculation:**
```
Tax Deduction = HELOC Interest × Marginal Tax Rate
Tax Savings = Tax Deduction × Marginal Tax Rate
Net HELOC Cost = HELOC Interest - Tax Savings
```

**Example:**
- HELOC Interest: $5,000/year
- Marginal Tax Rate: 45%
- Tax Deduction: $5,000
- Tax Savings: $5,000 × 45% = $2,250
- Net HELOC Cost: $5,000 - $2,250 = $2,750

### Risk Factors

**Leverage Risk:**
- Borrowing to invest amplifies both gains and losses
- Market downturns can result in significant losses
- HELOC interest must be paid regardless of investment performance
- Negative returns can exceed tax savings

**Interest Rate Risk:**
- HELOC rates are variable (Prime + spread)
- Rising interest rates increase HELOC costs
- Prime rate increases reduce net benefit
- Rate volatility affects strategy viability

**Market Volatility Risk:**
- Investment returns are not guaranteed
- Market downturns can erode investment value
- Capital losses may exceed tax savings
- Recovery time uncertain

**Tax Law Risk:**
- Tax laws may change
- Deduction rules may be modified
- CRA interpretation may evolve
- Retroactive changes possible

**Liquidity Risk:**
- HELOC credit may be reduced or revoked
- Lender may call HELOC in financial stress
- Investment liquidation may be required
- Forced selling in down markets

### Canadian Tax Law Compliance

**CRA Requirements:**
- Proper documentation of HELOC borrowings
- Traceability of funds to investments
- Investment income tracking
- Interest deduction calculations
- Tax return compliance

**Compliance Considerations:**
- Educational tool cannot guarantee CRA acceptance
- Users must maintain proper records
- Professional tax advice recommended
- Individual circumstances vary
- Tax law changes may affect strategy

**Documentation Requirements:**
- HELOC borrowing dates and amounts
- Investment purchase dates and amounts
- HELOC interest paid
- Investment income received
- Tax deduction calculations

---

## User Personas & Use Cases

### Persona 1: High-Income Homeowner

**Profile:**
- Annual income: $150,000+
- Marginal tax rate: 45%+
- Existing mortgage with significant equity
- Comfortable with investment risk
- Seeks tax optimization

**Use Cases:**
- Model Smith Maneuver strategy
- Calculate potential tax savings
- Compare Smith Maneuver vs. direct prepayment
- Assess long-term net worth impact
- Understand leverage risk

### Persona 2: Sophisticated Investor

**Profile:**
- Active investor with portfolio
- Understands leverage and tax strategies
- Comfortable with complex financial planning
- Uses professional advisors
- Seeks advanced optimization

**Use Cases:**
- Model Smith Maneuver with existing investments
- Integrate with investment portfolio
- Calculate tax deduction benefits
- Assess risk-adjusted returns
- Optimize strategy parameters

### Persona 3: Tax-Optimization Seeker

**Profile:**
- High marginal tax rate
- Seeks legitimate tax deductions
- Understands tax law basics
- Willing to use leverage for tax benefits
- Consults tax professionals

**Use Cases:**
- Understand tax deduction mechanics
- Calculate tax savings potential
- Model different scenarios
- Assess strategy viability
- Plan implementation approach

### Persona 4: Risk-Aware User

**Profile:**
- Understands leverage risks
- Wants to assess worst-case scenarios
- Seeks probability-based outcomes
- Values risk transparency
- Makes informed decisions

**Use Cases:**
- Assess leverage risk
- Model worst-case scenarios
- Understand probability distributions
- Evaluate risk-adjusted benefits
- Make informed strategy decisions

---

## Feature Requirements

### Strategy Modeling Engine

**Core Capabilities:**
- Model complete Smith Maneuver cycle
- Track prepayments, borrowings, investments
- Calculate tax deductions and savings
- Project long-term outcomes
- Compare strategies (Smith Maneuver vs. alternatives)

**Modeling Components:**
1. **Prepayment Modeling:**
   - User-specified prepayment amounts
   - Prepayment frequency and timing
   - Impact on mortgage balance
   - HELOC credit room increases

2. **Borrowing Modeling:**
   - HELOC borrowing amounts
   - Borrowing timing relative to prepayments
   - HELOC balance tracking
   - Available credit monitoring

3. **Investment Modeling:**
   - Investment allocation of HELOC funds
   - Expected investment returns
   - Investment income (dividends, capital gains)
   - Investment value tracking

4. **Tax Calculation:**
   - HELOC interest calculation
   - Marginal tax rate application
   - Tax deduction calculations
   - Tax savings computation

5. **Net Benefit Analysis:**
   - Investment returns
   - HELOC interest costs
   - Tax savings
   - Net benefit = Investment Returns - HELOC Cost + Tax Savings

### Tax Calculation Integration

**Required Components:**
- Marginal tax rate by income and province
- HELOC interest deduction calculations
- Investment income tax calculations
- Tax refund modeling
- Integration with investment returns

**Tax Engine Requirements:**
- Canadian marginal tax rates by province
- Federal and provincial tax brackets
- Investment income tax rates (dividends, capital gains)
- Tax deduction eligibility rules
- Tax refund calculations

**Integration Points:**
- HELOC interest data
- Investment income data
- User income and province
- Tax year modeling

### Investment Tracking Integration

**Existing System:**
- Investment tracking already implemented
- Portfolio management capabilities
- Investment return calculations
- Income tracking (dividends, interest)

**Integration Requirements:**
- Link HELOC borrowings to investments
- Track investment performance
- Calculate investment returns
- Monitor investment income
- Assess investment risk

**Data Flow:**
- HELOC borrowing → Investment purchase
- Investment returns → Strategy benefit
- Investment income → Tax calculations
- Investment value → Portfolio tracking

### Cash Flow Modeling

**Cash Flow Components:**
1. **Mortgage Payments:**
   - Regular mortgage payments
   - Prepayment amounts
   - Total mortgage cash outflow

2. **HELOC Payments:**
   - Interest-only payments
   - Principal repayments (optional)
   - Total HELOC cash outflow

3. **Investment Income:**
   - Dividend income
   - Interest income
   - Capital gains (realized)
   - Total investment cash inflow

4. **Tax Impact:**
   - Tax savings from deductions
   - Tax on investment income
   - Net tax benefit

5. **Net Cash Flow:**
   - Total cash outflow (mortgage + HELOC)
   - Total cash inflow (investment income + tax savings)
   - Net monthly/annual cash flow

### Net Benefit Analysis

**Calculation Formula:**
```
Net Benefit = Investment Returns - HELOC Cost + Tax Savings
```

**Components:**
- **Investment Returns:** Dividends, interest, capital gains from HELOC-funded investments
- **HELOC Cost:** Interest paid on HELOC borrowings
- **Tax Savings:** Tax deduction value (HELOC Interest × Marginal Tax Rate)

**Analysis Dimensions:**
- Annual net benefit
- Cumulative net benefit over time
- Net benefit vs. direct prepayment
- Risk-adjusted net benefit
- Probability distributions

### Risk Assessment

**Risk Metrics:**
1. **Leverage Ratio:**
   - HELOC balance / Investment value
   - Measures leverage exposure
   - Higher ratio = higher risk

2. **Interest Coverage:**
   - Investment income / HELOC interest
   - Measures ability to cover interest
   - Ratio < 1.0 indicates risk

3. **Margin Call Probability:**
   - Probability of forced liquidation
   - Based on investment volatility
   - Leverage and market conditions

4. **Worst-Case Scenarios:**
   - Market downturn impact
   - Interest rate increase impact
   - Combined stress scenarios
   - Recovery time estimates

**Risk Warnings:**
- Leverage amplifies losses
- Market volatility risk
- Interest rate risk
- Liquidity risk
- Tax law change risk

---

## Business Rules & Domain Logic

### HELOC Interest Deduction Calculations

**Deduction Eligibility:**
- HELOC funds must be used for investment purposes
- Investments must have "reasonable expectation of profit"
- Investment income must be generated
- Proper documentation required

**Deduction Calculation:**
```
Tax Deduction = HELOC Interest × Eligibility Factor
```

**Eligibility Factor:**
- 100% if all HELOC funds used for investments
- Pro-rated if partial investment use
- 0% if personal use

**Tax Savings:**
```
Tax Savings = Tax Deduction × Marginal Tax Rate
```

### Marginal Tax Rate Application

**Rate Determination:**
- Based on user's annual income
- Provincial tax rates vary
- Combined federal + provincial rate
- Highest marginal bracket applies

**Canadian Tax Brackets (2025):**
- Federal: 15%, 20.5%, 26%, 29%, 33%
- Provincial: Varies by province (10-25%)
- Combined: 20-54% typical range

**Rate Application:**
- Apply to HELOC interest deduction
- Apply to investment income
- Net tax benefit calculation

### Investment Return Modeling

**Return Components:**
1. **Dividend Income:**
   - Annual dividend yield
   - Dividend tax treatment (gross-up and credit)
   - Regular dividend payments

2. **Interest Income:**
   - Bond interest
   - GIC interest
   - Fully taxable at marginal rate

3. **Capital Gains:**
   - Realized capital gains
   - 50% inclusion rate
   - Taxed at marginal rate on 50%

**Return Assumptions:**
- User-specified expected returns
- Historical return distributions (for Monte Carlo)
- Conservative, moderate, aggressive scenarios
- Risk-adjusted returns

### Net Benefit Formula

**Complete Formula:**
```
Net Benefit = Investment Returns - HELOC Interest + Tax Savings

Where:
- Investment Returns = Dividends + Interest + Capital Gains
- HELOC Interest = Prime + Spread on HELOC Balance
- Tax Savings = HELOC Interest × Marginal Tax Rate
```

**Annual Calculation:**
```
Annual Net Benefit = 
  (Investment Returns × (1 - Investment Tax Rate)) -
  (HELOC Interest × (1 - Marginal Tax Rate))
```

**Cumulative Calculation:**
```
Cumulative Net Benefit = Sum of Annual Net Benefits over Time
```

### Leverage Risk Calculations

**Leverage Ratio:**
```
Leverage Ratio = HELOC Balance / Investment Value
```

**Risk Indicators:**
- Leverage Ratio > 2.0: High risk
- Leverage Ratio 1.0-2.0: Moderate risk
- Leverage Ratio < 1.0: Lower risk

**Interest Coverage:**
```
Interest Coverage = Investment Income / HELOC Interest
```

**Coverage Indicators:**
- Coverage > 1.5: Strong coverage
- Coverage 1.0-1.5: Adequate coverage
- Coverage < 1.0: Insufficient coverage (risk)

**Margin Call Probability:**
- Based on investment volatility
- Leverage ratio
- Market conditions
- Historical stress scenarios

---

## Prerequisites

### HELOC Support (Document 1)

**Required Features:**
- HELOC account creation and management
- Credit limit calculation and tracking
- HELOC transaction recording (borrowing, payments)
- Interest calculation and tracking
- Integration with mortgage prepayments

**Why Required:**
- Smith Maneuver depends on HELOC borrowing
- Need accurate HELOC interest for tax deductions
- Credit room tracking essential for strategy modeling
- Transaction history required for tax documentation

**Status:** Not yet implemented (see HELOC Feature Specification)

### Tax Calculation Engine

**Required Components:**
- Marginal tax rates by income and province
- Federal and provincial tax brackets
- Investment income tax calculations
- Tax deduction calculations
- Tax refund modeling

**Why Required:**
- Tax savings are core to Smith Maneuver benefit
- Accurate tax calculations essential for strategy viability
- Provincial tax rates vary significantly
- Investment income tax affects net benefit

**Status:** Not yet implemented

**Implementation Estimate:** 3 months

### Investment Tracking (Existing)

**Current Capabilities:**
- Investment portfolio tracking
- Investment return calculations
- Income tracking (dividends, interest)
- Portfolio value tracking

**Integration Requirements:**
- Link HELOC borrowings to investments
- Track HELOC-funded investments separately
- Calculate returns on HELOC-funded portion
- Monitor investment performance

**Status:** Already implemented

### Monte Carlo Simulation (Future)

**Required for Advanced Modeling:**
- Investment return volatility modeling
- Interest rate path simulation
- Probability distributions
- Risk assessment
- Scenario analysis

**Why Important:**
- Smith Maneuver involves significant uncertainty
- Leverage amplifies risk
- Need probability-based outcomes
- Risk assessment critical

**Status:** Future enhancement (Phase 2)

---

## User Stories & Acceptance Criteria

### User Story 1: Model Smith Maneuver Strategy

**As a** sophisticated homeowner  
**I want to** model a Smith Maneuver strategy  
**So that** I can assess its viability and potential benefits

**Acceptance Criteria:**
- [ ] User can create a Smith Maneuver scenario
- [ ] User can specify prepayment amounts and frequency
- [ ] User can specify HELOC borrowing amounts
- [ ] User can specify investment allocation and expected returns
- [ ] System calculates HELOC credit room increases from prepayments
- [ ] System validates borrowing does not exceed available credit
- [ ] System tracks HELOC interest costs
- [ ] System calculates tax deductions and savings
- [ ] System calculates investment returns
- [ ] System computes net benefit (returns - cost + tax savings)
- [ ] System projects long-term outcomes (10, 20, 30 years)
- [ ] System displays strategy summary and key metrics

### User Story 2: Compare Smith Maneuver vs. Prepayment

**As a** homeowner evaluating strategies  
**I want to** compare Smith Maneuver to direct prepayment  
**So that** I can make an informed decision

**Acceptance Criteria:**
- [ ] User can create side-by-side comparison
- [ ] System models direct prepayment scenario (same prepayment amounts)
- [ ] System models Smith Maneuver scenario (prepayment + borrowing + investing)
- [ ] System calculates net worth for both scenarios
- [ ] System calculates total interest paid for both scenarios
- [ ] System calculates mortgage payoff time for both scenarios
- [ ] System displays comparative results (net worth, interest, payoff time)
- [ ] System highlights key differences and trade-offs
- [ ] System shows risk differences (leverage risk vs. no leverage)

### User Story 3: Calculate Tax Savings

**As a** high-income homeowner  
**I want to** see tax savings from Smith Maneuver  
**So that** I can assess tax optimization benefits

**Acceptance Criteria:**
- [ ] User can enter annual income and province
- [ ] System calculates marginal tax rate
- [ ] System calculates HELOC interest for the year
- [ ] System calculates tax deduction (HELOC interest × eligibility)
- [ ] System calculates tax savings (deduction × marginal rate)
- [ ] System shows annual tax savings
- [ ] System shows cumulative tax savings over time
- [ ] System displays tax savings as percentage of HELOC interest
- [ ] System shows net HELOC cost after tax savings

### User Story 4: Assess Leverage Risk

**As a** risk-aware user  
**I want to** understand leverage risk in Smith Maneuver  
**So that** I can make informed decisions

**Acceptance Criteria:**
- [ ] System calculates leverage ratio (HELOC balance / investment value)
- [ ] System displays leverage risk indicators
- [ ] System calculates interest coverage ratio
- [ ] System models worst-case scenarios (market downturn, rate increase)
- [ ] System shows potential losses in adverse scenarios
- [ ] System displays risk warnings and disclaimers
- [ ] System provides risk education content
- [ ] System recommends professional advice for risk assessment

### User Story 5: Project Long-Term Outcomes

**As a** strategic planner  
**I want to** see long-term Smith Maneuver projections  
**So that** I can plan my financial strategy

**Acceptance Criteria:**
- [ ] System projects outcomes for 10, 20, 30 years
- [ ] System shows cumulative net benefit over time
- [ ] System shows net worth comparison (Smith Maneuver vs. alternatives)
- [ ] System shows mortgage payoff acceleration
- [ ] System displays investment portfolio growth
- [ ] System shows tax savings accumulation
- [ ] System provides year-by-year breakdown
- [ ] System allows scenario adjustments (returns, rates, prepayments)

---

## Calculation Specifications

### Tax Deduction Formulas

**Basic Deduction:**
```
Tax Deduction = HELOC Interest × Investment Use Percentage
```

**Investment Use Percentage:**
```
Investment Use % = HELOC Funds Used for Investment / Total HELOC Balance
```

**Eligible Interest:**
```
Eligible Interest = HELOC Interest × Investment Use %
```

**Tax Savings:**
```
Tax Savings = Eligible Interest × Marginal Tax Rate
```

### Net Benefit Calculations

**Annual Net Benefit:**
```
Annual Net Benefit = 
  Investment Returns - 
  HELOC Interest + 
  Tax Savings
```

**Investment Returns:**
```
Investment Returns = 
  Dividend Income + 
  Interest Income + 
  Realized Capital Gains
```

**After-Tax Investment Returns:**
```
After-Tax Returns = 
  (Dividend Income × (1 - Dividend Tax Rate)) +
  (Interest Income × (1 - Marginal Tax Rate)) +
  (Capital Gains × (1 - Capital Gains Tax Rate))
```

**Net HELOC Cost:**
```
Net HELOC Cost = 
  HELOC Interest - 
  Tax Savings
```

**Cumulative Net Benefit:**
```
Cumulative Net Benefit = Sum of Annual Net Benefits
```

### Risk Metrics

**Leverage Ratio:**
```
Leverage Ratio = HELOC Balance / Investment Portfolio Value
```

**Interest Coverage Ratio:**
```
Interest Coverage = Investment Income / HELOC Interest
```

**Debt-to-Equity Ratio:**
```
Debt-to-Equity = HELOC Balance / (Investment Value - HELOC Balance)
```

**Margin Call Probability:**
```
Based on:
- Investment volatility (standard deviation)
- Leverage ratio
- Historical stress scenarios
- Monte Carlo simulation (future)
```

### Scenario Comparisons

**Smith Maneuver Scenario:**
- Prepayments made
- HELOC borrowings
- Investments purchased
- Tax deductions claimed
- Net benefit calculated

**Direct Prepayment Scenario:**
- Same prepayment amounts
- No HELOC borrowing
- No investments
- No tax deductions
- Direct mortgage reduction

**Comparison Metrics:**
- Net worth difference
- Total interest paid difference
- Mortgage payoff time difference
- Risk level difference

---

## Integration Requirements

### HELOC Data and Calculations

**Required Data:**
- HELOC account information
- HELOC credit limit and available credit
- HELOC borrowing transactions
- HELOC interest calculations
- HELOC payment history

**Integration Points:**
- Link Smith Maneuver scenario to HELOC account
- Use HELOC credit limit for borrowing validation
- Calculate HELOC interest from borrowings
- Track HELOC balance over time
- Update credit room from prepayments

### Investment Portfolio Data

**Required Data:**
- Investment portfolio holdings
- Investment returns (dividends, capital gains)
- Investment income tracking
- Portfolio value tracking
- Investment performance metrics

**Integration Points:**
- Link HELOC borrowings to investment purchases
- Track HELOC-funded investments separately
- Calculate returns on HELOC-funded portion
- Monitor investment performance
- Assess investment risk

### Tax Engine (Marginal Rates, Deductions)

**Required Data:**
- User income and province
- Marginal tax rates by bracket
- Federal and provincial tax rates
- Investment income tax rates
- Tax deduction rules

**Integration Points:**
- Calculate marginal tax rate from user income
- Apply tax rates to HELOC interest deductions
- Calculate tax on investment income
- Compute net tax benefit
- Model tax refunds

### Mortgage Prepayment Tracking

**Required Data:**
- Mortgage balance and payments
- Prepayment amounts and dates
- Mortgage interest calculations
- Remaining amortization

**Integration Points:**
- Track prepayments that trigger HELOC credit room
- Calculate credit room increases
- Model mortgage payoff acceleration
- Compare mortgage reduction strategies

---

## Regulatory & Compliance

### Tax Advice Disclaimers

**Required Disclaimers:**
- "This tool provides educational modeling only, not tax advice"
- "Tax laws may change and affect strategy viability"
- "Individual circumstances vary - consult tax professional"
- "CRA interpretation may differ from model assumptions"
- "No guarantee of tax deduction acceptance"

**Placement:**
- Prominent display on Smith Maneuver feature
- Before strategy modeling begins
- In calculation results
- In educational content

### Educational Tool Positioning

**Positioning Statement:**
- Educational financial modeling tool
- Helps users understand strategy mechanics
- Provides projections, not guarantees
- Supports informed decision-making
- Complements professional advice

**Not Positioned As:**
- Tax advice or tax planning service
- Investment advice or recommendations
- Financial planning service
- Guarantee of outcomes
- Replacement for professional advice

### Professional Advice Recommendations

**When to Recommend:**
- Before implementing Smith Maneuver
- For tax law interpretation
- For investment strategy
- For risk assessment
- For complex situations

**Recommended Professionals:**
- Chartered Professional Accountant (CPA)
- Certified Financial Planner (CFP)
- Tax lawyer (for complex cases)
- Investment advisor (for portfolio strategy)

### Risk Warnings

**Leverage Risk:**
- "Borrowing to invest amplifies both gains and losses"
- "Market downturns can result in significant losses"
- "HELOC interest must be paid regardless of investment performance"

**Interest Rate Risk:**
- "HELOC rates are variable and may increase"
- "Rising rates reduce strategy benefits"
- "Prime rate changes affect HELOC costs"

**Market Volatility Risk:**
- "Investment returns are not guaranteed"
- "Market downturns can erode investment value"
- "Capital losses may exceed tax savings"

**Tax Law Risk:**
- "Tax laws may change"
- "Deduction rules may be modified"
- "CRA interpretation may evolve"

**Liquidity Risk:**
- "HELOC credit may be reduced or revoked"
- "Forced liquidation may be required"
- "Investment selling in down markets"

---

## UI/UX Requirements (High-Level)

### Strategy Comparison Dashboard

**Key Elements:**
- Side-by-side comparison (Smith Maneuver vs. alternatives)
- Net worth projections
- Total interest comparisons
- Mortgage payoff timelines
- Risk indicators

**Visual Design:**
- Clear comparison tables
- Charts showing projections over time
- Color-coded risk indicators
- Interactive scenario adjustments

### Tax Savings Visualization

**Display Components:**
- Annual tax savings chart
- Cumulative tax savings over time
- Tax savings as percentage of HELOC interest
- Net HELOC cost after tax savings
- Marginal tax rate impact

**Interactive Elements:**
- Adjust income to see tax rate impact
- Compare different tax scenarios
- See tax savings breakdown by component

### Risk Assessment Displays

**Risk Metrics:**
- Leverage ratio indicator
- Interest coverage ratio
- Worst-case scenario projections
- Risk level assessment (low/moderate/high)
- Probability distributions (future)

**Visual Design:**
- Risk gauge/chart
- Color-coded risk levels
- Warning indicators
- Educational content links

### Scenario Modeling Interface

**Input Controls:**
- Prepayment amounts and frequency
- HELOC borrowing amounts
- Investment allocation and returns
- Income and province (for tax rate)
- Time horizon

**Output Displays:**
- Strategy summary
- Year-by-year projections
- Key metrics and comparisons
- Risk assessments
- Recommendations

---

## Data Model Specifications

### Smith Maneuver Strategy Records

```sql
smith_maneuver_strategies (
  id: VARCHAR (primary key)
  user_id: VARCHAR (foreign key → users.id)
  strategy_name: VARCHAR
  mortgage_id: VARCHAR (foreign key → mortgages.id)
  heloc_account_id: VARCHAR (foreign key → heloc_accounts.id)
  
  -- Strategy Parameters
  prepayment_amount: DECIMAL(12, 2)
  prepayment_frequency: VARCHAR -- 'monthly', 'quarterly', 'annually', 'lump_sum'
  borrowing_percentage: DECIMAL(5, 2) -- % of prepayment to borrow
  investment_allocation: JSONB -- Investment types and allocations
  expected_return_rate: DECIMAL(5, 2) -- Expected annual return %
  
  -- Tax Parameters
  annual_income: DECIMAL(12, 2)
  province: VARCHAR
  marginal_tax_rate: DECIMAL(5, 2) -- Calculated from income + province
  
  -- Projection Parameters
  projection_years: INTEGER -- 10, 20, 30
  start_date: DATE
  
  -- Status
  status: VARCHAR -- 'draft', 'active', 'archived'
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

### Transaction Tracking

```sql
smith_maneuver_transactions (
  id: VARCHAR (primary key)
  strategy_id: VARCHAR (foreign key → smith_maneuver_strategies.id)
  transaction_date: DATE
  transaction_type: VARCHAR -- 'prepayment', 'borrowing', 'investment', 'repayment'
  
  -- Prepayment Transaction
  prepayment_amount: DECIMAL(12, 2) -- nullable
  
  -- Borrowing Transaction
  borrowing_amount: DECIMAL(12, 2) -- nullable
  heloc_balance_after: DECIMAL(12, 2)
  available_credit_after: DECIMAL(12, 2)
  
  -- Investment Transaction
  investment_amount: DECIMAL(12, 2) -- nullable
  investment_type: VARCHAR -- nullable
  investment_id: VARCHAR (foreign key → investments.id, nullable)
  
  -- Repayment Transaction
  repayment_amount: DECIMAL(12, 2) -- nullable
  
  -- Calculations
  heloc_interest_accrued: DECIMAL(12, 2)
  tax_deduction: DECIMAL(12, 2)
  tax_savings: DECIMAL(12, 2)
  
  created_at: TIMESTAMP
)
```

### Tax Calculation Results

```sql
smith_maneuver_tax_calculations (
  id: VARCHAR (primary key)
  strategy_id: VARCHAR (foreign key → smith_maneuver_strategies.id)
  tax_year: INTEGER
  annual_income: DECIMAL(12, 2)
  province: VARCHAR
  marginal_tax_rate: DECIMAL(5, 2)
  
  -- HELOC Tax Deduction
  heloc_interest_paid: DECIMAL(12, 2)
  investment_use_percentage: DECIMAL(5, 2)
  eligible_interest: DECIMAL(12, 2)
  tax_deduction: DECIMAL(12, 2)
  tax_savings: DECIMAL(12, 2)
  
  -- Investment Income Tax
  investment_income: DECIMAL(12, 2)
  investment_tax: DECIMAL(12, 2)
  
  -- Net Tax Benefit
  net_tax_benefit: DECIMAL(12, 2)
  
  created_at: TIMESTAMP
)
```

### Comparison Scenarios

```sql
smith_maneuver_comparisons (
  id: VARCHAR (primary key)
  user_id: VARCHAR (foreign key → users.id)
  comparison_name: VARCHAR
  
  -- Smith Maneuver Scenario
  smith_maneuver_strategy_id: VARCHAR (foreign key → smith_maneuver_strategies.id)
  
  -- Alternative Scenario (e.g., direct prepayment)
  alternative_type: VARCHAR -- 'direct_prepayment', 'invest_only', 'status_quo'
  alternative_parameters: JSONB
  
  -- Comparison Results
  net_worth_difference: DECIMAL(12, 2)
  interest_paid_difference: DECIMAL(12, 2)
  payoff_time_difference: INTEGER -- months
  risk_level_difference: VARCHAR
  
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

---

## Edge Cases & Constraints

### Tax Deduction Eligibility Rules

**Eligibility Requirements:**
- HELOC funds must be used for investment purposes
- Investments must have "reasonable expectation of profit"
- Investment income must be generated
- Proper documentation required

**Edge Cases:**
- Partial investment use (pro-rated deduction)
- Mixed use of HELOC funds (investment + personal)
- Investment losses (deduction still allowed if income expected)
- CRA audit scenarios (documentation requirements)

**Handling:**
- Track investment use percentage
- Pro-rate deductions accordingly
- Warn if personal use detected
- Provide documentation guidance

### Investment Type Restrictions

**Eligible Investments:**
- Stocks and ETFs (dividend-paying)
- Bonds and GICs
- Real estate investment trusts (REITs)
- Income-producing assets

**Restrictions:**
- Personal use assets (not deductible)
- RRSP contributions (not deductible)
- TFSA contributions (not deductible)
- Non-income-producing assets

**Handling:**
- Validate investment types
- Warn about ineligible investments
- Calculate eligibility percentage
- Adjust deductions accordingly

### Leverage Limits

**Practical Limits:**
- HELOC credit limit constraints
- Lender maximum LTV limits
- Risk tolerance limits
- Regulatory constraints

**Edge Cases:**
- Credit limit reached (cannot borrow more)
- LTV limit exceeded (regulatory constraint)
- Lender reduces credit limit
- Forced repayment scenarios

**Handling:**
- Validate borrowing against credit limits
- Warn if approaching limits
- Model credit limit reductions
- Assess forced repayment scenarios

### Market Volatility Scenarios

**Stress Scenarios:**
- Market downturn (20-50% decline)
- Interest rate spike (2-3% increase)
- Combined stress (market + rates)
- Extended recovery periods

**Edge Cases:**
- Investment value < HELOC balance (negative equity)
- Interest coverage < 1.0 (cannot cover interest)
- Forced liquidation scenarios
- Margin call situations

**Handling:**
- Model worst-case scenarios
- Calculate probability distributions (Monte Carlo)
- Assess recovery time
- Provide risk warnings

---

## Success Metrics

### Premium Feature Adoption

**Primary Metrics:**
- Percentage of eligible users who try Smith Maneuver modeling
- Active Smith Maneuver strategy usage
- Feature completion rate (scenarios created)

**Target Goals:**
- 10% of high-income users try feature within 6 months
- 5% of users create active strategies
- 50% feature completion rate (scenario created to strategy saved)

### User Engagement with Advanced Strategies

**Engagement Metrics:**
- Frequency of scenario modeling
- Number of comparisons created
- Depth of feature usage (advanced parameters)
- Return usage (users come back to refine strategies)

**Analysis:**
- Track power users (frequent, deep usage)
- Identify drop-off points
- Monitor feature discovery
- Measure strategy refinement behavior

### Risk Awareness Metrics

**Awareness Indicators:**
- Users who view risk assessments
- Users who adjust scenarios based on risk
- Users who seek professional advice (self-reported)
- Risk warning acknowledgment rates

**Success Criteria:**
- 80% of users view risk assessments
- 50% of users adjust scenarios after risk review
- Clear understanding of leverage risks
- Informed decision-making

---

## Implementation Phases

### Phase 1: Prerequisites (HELOC + Tax Engine)

**Duration:** 9 months (6 months HELOC + 3 months Tax Engine)

**Deliverables:**
- HELOC support (see HELOC Feature Specification)
- Tax calculation engine
- Marginal tax rate calculations
- Tax deduction calculations
- Integration between HELOC and tax engine

**Priority Features:**
- Complete HELOC implementation
- Tax rate calculations by income and province
- HELOC interest deduction calculations
- Tax savings computations

### Phase 2: Basic Smith Maneuver Modeling

**Duration:** 6 months

**Deliverables:**
- Smith Maneuver strategy creation
- Prepayment and borrowing modeling
- Investment integration
- Tax calculation integration
- Net benefit calculations
- Strategy comparison tools
- Basic risk indicators

**Priority Features:**
- Create and model Smith Maneuver scenarios
- Calculate tax savings
- Compare to alternatives
- Display risk warnings
- Project long-term outcomes

### Phase 3: Monte Carlo Simulation

**Duration:** 4-6 months

**Deliverables:**
- Investment return volatility modeling
- Interest rate path simulation
- Probability distributions
- Risk assessment enhancements
- Scenario stress testing
- Advanced analytics

**Priority Features:**
- Probability-based outcomes
- Risk probability distributions
- Worst-case scenario modeling
- Confidence intervals
- Risk-adjusted metrics

### Phase 4: Advanced Risk Analysis

**Duration:** 3-4 months

**Deliverables:**
- Advanced risk metrics
- Sensitivity analysis
- Stress testing tools
- Risk education content
- Professional advice integration
- Compliance enhancements

**Priority Features:**
- Comprehensive risk assessment
- Sensitivity to key variables
- Stress scenario modeling
- Enhanced risk education
- Professional advisor recommendations

---

## Dependencies

### Prerequisites

**Required:**
- HELOC support (Document 1) - 6 months
- Tax calculation engine - 3 months
- Investment tracking (already implemented)
- Mortgage tracking (already implemented)

**Optional but Beneficial:**
- Monte Carlo simulation foundation
- Property value tracking
- Bank integration for transaction import

### Blocks Other Features

**Advanced Tax Strategies:**
- Smith Maneuver enables other tax-optimization features
- Foundation for sophisticated financial planning

**Premium Features:**
- Smith Maneuver positions as premium capability
- Enables higher-tier subscription pricing

---

## Risk Considerations

### Regulatory Risks

**Tax Law Changes:**
- Tax laws may change affecting strategy viability
- CRA interpretation may evolve
- Retroactive changes possible

**Mitigation:**
- Clear disclaimers about tax law changes
- Educational positioning (not tax advice)
- Professional advice recommendations
- Regular compliance review

### User Risk

**Leverage Risk:**
- Users may not fully understand leverage risks
- Market downturns can cause significant losses
- Forced liquidation scenarios

**Mitigation:**
- Comprehensive risk warnings
- Risk education content
- Professional advice recommendations
- Clear risk indicators and metrics

### Technical Risks

**Calculation Accuracy:**
- Complex calculations require thorough testing
- Tax calculations must be accurate
- Integration points must be reliable

**Mitigation:**
- Comprehensive testing
- Professional tax review
- Validation of calculations
- User testing and feedback

---

## Future Enhancements

### Potential Additions

1. **Advanced Monte Carlo:**
   - Full probability distributions
   - Correlation modeling
   - Advanced risk metrics

2. **Tax Optimization:**
   - Multi-year tax planning
   - Tax loss harvesting
   - Advanced deduction strategies

3. **Investment Integration:**
   - Real portfolio integration
   - Performance tracking
   - Rebalancing recommendations

4. **Professional Advisor Integration:**
   - Share scenarios with advisors
   - Advisor review and feedback
   - Collaborative planning

---

## Conclusion

The Smith Maneuver feature represents a sophisticated, premium capability that enables tax-optimized mortgage strategies for advanced users. While complex to implement and requiring significant prerequisites, it provides strong differentiation and appeals to high-value user segments.

**Key Success Factors:**
- Accurate tax calculations
- Comprehensive risk assessment
- Clear educational positioning
- Strong integration with HELOC and investments
- Professional advice recommendations

**Strategic Value:**
- Premium feature positioning
- Appeals to sophisticated investors
- Strong market differentiation
- Enables advanced financial planning
- Supports higher-tier pricing

**Implementation Priority:**
- Prerequisites must be completed first (HELOC + Tax Engine)
- Phased approach recommended
- User demand validation before full implementation
- Focus on accuracy and risk transparency

