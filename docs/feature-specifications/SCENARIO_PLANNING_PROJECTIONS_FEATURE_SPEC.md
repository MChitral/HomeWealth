# Scenario Planning & Projections Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Scenario planning is a powerful tool that enables homeowners to model different financial strategies and understand their long-term financial outcomes. The Scenario Planning & Projections feature provides:

- **Strategic Financial Planning:** Model different prepayment and investment strategies over 10-30 year horizons
- **Monte Carlo Rate Simulation:** Understand rate uncertainty and probability distributions for mortgage outcomes
- **What-If Analysis:** Analyze impact of rate changes on financial projections
- **Scenario Templates:** Quick-start templates for common strategies (aggressive prepayment, Smith Maneuver, balanced growth)
- **Scenario Comparison:** Compare multiple scenarios side-by-side with export capabilities
- **Data-Driven Decision Making:** Net worth projections, interest savings, and payoff timelines for informed choices

### Market Context

**Canadian Mortgage Scenario Planning Market:**

- **Planning Horizon:** Most homeowners plan 10-30 years ahead for mortgage payoff and retirement
- **Key Decisions:** Prepayment vs investment allocation, emergency fund priority, Smith Maneuver strategies
- **Rate Uncertainty:** Variable rate mortgages create uncertainty - Monte Carlo simulations help quantify risk
- **Strategic Planning:** Homeowners need tools to model "what if" scenarios (rate changes, income changes, prepayments)

**Industry Statistics:**

- Average Canadian mortgage term: 5 years (requires multiple renewal decisions)
- Typical mortgage amortization: 25-30 years (long-term planning essential)
- Average prepayment vs investment dilemma: 60% of homeowners struggle with allocation decisions
- Scenario planning tools are premium differentiators in fintech mortgage applications

**Strategic Importance:**

- Scenario planning drives long-term user engagement (high-value, strategic feature)
- Monte Carlo simulations provide sophisticated risk analysis (competitive differentiator)
- Scenario templates reduce friction for new users
- Comparison tools help homeowners make optimal decisions

### Strategic Positioning

- **Premium Feature:** Scenario planning is a high-value, strategic capability that differentiates from basic mortgage calculators
- **Competitive Differentiation:** Monte Carlo simulations and comprehensive projection engine exceed basic tools
- **User Retention:** Long-term planning features drive continued engagement over months/years
- **Integration Value:** Integrates with prepayments, refinancing, Smith Maneuver, and emergency fund strategies

---

## Domain Overview

### Scenario Planning Fundamentals

**Scenario Planning** allows homeowners to model different financial strategies and project their long-term financial outcomes. A scenario defines:

1. **Strategy Components:**
   - Prepayment allocation (% of surplus to prepay)
   - Investment allocation (% of surplus to invest)
   - Emergency fund priority (% to emergency fund before split)
   - Expected investment return rate

2. **Event Scheduling:**
   - Prepayment events (annual, one-time, payment increases)
   - Refinancing events (rate changes, term changes)

3. **Projection Outcomes:**
   - Net worth over time (10, 20, 30 years)
   - Mortgage balance over time
   - Investment value growth
   - Emergency fund status
   - Total interest paid
   - Mortgage payoff year

### Scenario Metrics

**What Are Scenario Metrics?**

Scenario metrics summarize the financial outcomes of a scenario at key time horizons (10, 20, 30 years).

**Key Metrics:**

1. **Net Worth:**
   - Net worth at 10, 20, 30 years
   - Net worth = Home Value + Investments + Emergency Fund - Mortgage Balance

2. **Mortgage Balance:**
   - Remaining mortgage balance at 10, 20, 30 years
   - Mortgage payoff year (when balance reaches zero)

3. **Interest Costs:**
   - Total interest paid over projection period

4. **Investments:**
   - Investment value at 10, 20, 30 years
   - Investment returns (cumulative) at 10, 20, 30 years

5. **Cash Flow:**
   - Average monthly surplus
   - Emergency fund status

### Yearly Projections

**What Are Yearly Projections?**

Yearly projections provide year-by-year breakdown of financial outcomes, showing how net worth, mortgage balance, investments, and other metrics evolve over time.

**Projection Components:**

- **Year:** Projection year (1, 2, 3, ... up to 30)
- **Net Worth:** Total net worth at end of year
- **Mortgage Balance:** Remaining mortgage balance at end of year
- **Investment Value:** Total investment value at end of year
- **Emergency Fund Value:** Emergency fund balance at end of year
- **Cumulative Interest Paid:** Total interest paid through end of year
- **Cumulative Prepayments:** Total prepayments made through end of year
- **Cumulative Investments:** Total invested amount through end of year
- **Cumulative Principal:** Total principal paid through end of year

### Scenario Templates

**What Are Scenario Templates?**

Scenario templates are pre-configured strategies that users can quickly start with, providing common allocation strategies without manual configuration.

**Available Templates:**

1. **Aggressive Prepayment (90/10):**
   - 90% prepayment, 10% investment
   - Focus on paying down mortgage quickly
   - Minimal investment allocation

2. **Smith Maneuver (0/100):**
   - 0% prepayment, 100% investment
   - Maximize investment returns
   - Use HELOC for tax-deductible interest

3. **Status Quo (50/50):**
   - 50% prepayment, 50% investment
   - Balanced approach
   - Moderate strategy

4. **Renewal Optimization (40/40/20):**
   - 40% prepayment, 40% investment, 20% emergency fund
   - Prepare for renewal with emergency fund
   - Flexible strategy

5. **Balanced Growth (40/40/20):**
   - 40% prepayment, 40% investment, 20% emergency fund
   - Balanced with emergency fund priority
   - Growth-focused

6. **Conservative Prepayment (30/50/20):**
   - 30% prepayment, 50% investment, 20% emergency fund
   - Conservative prepayment with investment focus
   - Emergency fund priority

### Monte Carlo Simulations

**What Is Monte Carlo Simulation?**

Monte Carlo simulation models interest rate uncertainty by generating thousands of possible rate paths and calculating outcomes for each path. This provides probability distributions for financial outcomes.

**Key Concepts:**

1. **Rate Models:**
   - **GBM (Geometric Brownian Motion):** Models rates as random walk with drift and volatility
   - **Vasicek Model:** Mean-reverting model (rates tend to return to long-term mean)

2. **Simulation Parameters:**
   - Number of iterations (1,000-10,000 paths)
   - Time horizon (months)
   - Interest rate volatility
   - Rate drift (expected rate change)
   - Rate cap and floor (constraints)

3. **Results:**
   - Probability distributions (10th, 50th, 90th percentiles)
   - Balance distribution (mean, std dev, percentiles)
   - Interest distribution
   - Rate path statistics
   - Probability of payoff (within horizon)
   - Sample paths for visualization

**GBM Model:**

Geometric Brownian Motion models rates as:
```
dS = S × (mu × dt + sigma × dW)

Where:
  - S = interest rate
  - mu = drift (expected rate change)
  - sigma = volatility
  - dW = random shock (Wiener process)
```

**Vasicek Model:**

Vasicek model adds mean reversion:
```
dr = k(theta - r)dt + sigma × dW

Where:
  - r = interest rate
  - k = mean reversion speed
  - theta = long-term mean rate
  - sigma = volatility
  - dW = random shock
```

### What-If Rate Analysis

**What Is What-If Rate Analysis?**

What-if rate analysis compares a baseline scenario with different interest rate assumptions to understand how rate changes affect financial outcomes.

**Analysis Components:**

1. **Baseline Scenario:**
   - Uses current mortgage rate
   - Calculates baseline metrics and projections

2. **Rate Change Scenarios:**
   - Multiple rate change assumptions (e.g., -0.5%, 0%, +0.5%, +1.0%)
   - Calculates metrics and projections for each rate change

3. **Impact Analysis:**
   - Net worth change vs baseline
   - Interest paid change
   - Payoff year change
   - Monthly payment change

**Use Cases:**
- Understand impact of rate increases (variable mortgages)
- Plan for renewal rate changes
- Evaluate refinancing decisions
- Stress testing financial plan

### Scenario Comparison

**What Is Scenario Comparison?**

Scenario comparison allows users to compare multiple scenarios side-by-side to evaluate different strategies and choose optimal approach.

**Comparison Features:**

1. **Metrics Comparison:**
   - Net worth at 10, 20, 30 years
   - Mortgage payoff year
   - Total interest paid
   - Investment returns

2. **Visualization:**
   - Charts comparing scenarios
   - Projection timelines
   - Rate path comparisons (Monte Carlo)

3. **Export Capabilities:**
   - CSV export for further analysis
   - JSON export for programmatic access

### Prepayment Event Scheduling

**What Are Prepayment Events?**

Prepayment events allow users to schedule specific prepayments in scenarios (e.g., annual bonuses, tax refunds, one-time payments).

**Event Types:**

1. **Annual Events:**
   - Recurring annual prepayment (e.g., tax refund every March)
   - Specified by recurrence month (1-12)

2. **One-Time Events:**
   - Single prepayment at specific time
   - Specified by year offset from mortgage start

3. **Payment Increases:**
   - Increase regular payment amount permanently
   - Starts at specified payment number

**Event Configuration:**

- Amount (prepayment amount)
- Start payment number (when event begins)
- Event type (annual, one-time, payment-increase)
- Recurrence month (for annual events)
- One-time year (for one-time events)
- Description (optional)

### Refinancing Event Scheduling

**What Are Refinancing Events?**

Refinancing events allow users to model rate changes, term changes, and refinancing decisions in scenarios.

**Event Configuration:**

- Timing (by year or at term end)
- New interest rate
- Term type (fixed, variable-changing, variable-fixed)
- New amortization months (optional)
- Payment frequency (optional)
- Closing costs (with breakdown)
- Description (optional)

---

## User Personas & Use Cases

### Persona 1: Strategic Planner (Long-Term Optimization)

**Profile:**
- Plans 10-30 years ahead
- Wants to optimize net worth and mortgage payoff
- Considers multiple strategies (prepayment vs investment)
- Values data-driven decision making

**Use Cases:**
- Create multiple scenarios with different allocation strategies
- Compare scenarios to choose optimal strategy
- Run Monte Carlo simulations to understand rate uncertainty
- Analyze what-if rate changes
- Export data for further analysis

**Pain Points Addressed:**
- Uncertainty about optimal prepayment vs investment allocation
- Need for long-term financial projections
- Wanting to understand probability distributions (Monte Carlo)
- Need for side-by-side strategy comparison

### Persona 2: Rate Risk Averse (Variable Rate Mortgage)

**Profile:**
- Has variable rate mortgage
- Concerned about rate increases
- Wants to understand potential impacts
- Needs risk quantification

**Use Cases:**
- Run what-if rate analysis (scenarios with different rates)
- Run Monte Carlo simulations to see probability distributions
- Understand worst-case scenarios (90th percentile outcomes)
- Plan for rate increases with prepayment strategies

**Pain Points Addressed:**
- Uncertainty about rate increase impacts
- Need for probability-based risk analysis
- Wanting to plan for rate volatility
- Need for stress testing financial plan

### Persona 3: Quick Starter (Template User)

**Profile:**
- Wants quick results without complex configuration
- Prefers guided experience
- Uses templates as starting point
- May customize later

**Use Cases:**
- Select scenario template (e.g., Aggressive Prepayment, Smith Maneuver)
- View projections from template
- Customize template if needed
- Compare template scenarios

**Pain Points Addressed:**
- Complexity of scenario configuration
- Uncertainty about where to start
- Need for quick insights
- Wanting proven strategies

### Persona 4: Event Planner (Scheduled Events)

**Profile:**
- Receives irregular income (bonuses, tax refunds)
- Wants to model scheduled prepayments
- Plans refinancing decisions
- Values event scheduling

**Use Cases:**
- Schedule annual prepayment events (e.g., tax refund every March)
- Schedule one-time prepayment events
- Model refinancing events (rate changes, term changes)
- See impact of scheduled events on projections

**Pain Points Addressed:**
- Need to model irregular income/prepayments
- Wanting to plan for refinancing decisions
- Need to see impact of scheduled events
- Complexity of event scheduling

---

## Feature Requirements

### Data Model Requirements

**Scenarios Table:**

- `id` (UUID, primary key)
- `userId` (foreign key to users)
- `name` (text, required) - Scenario name
- `description` (text, optional) - Scenario description
- `prepaymentMonthlyPercent` (integer, default: 50) - % of surplus to prepay (0-100)
- `investmentMonthlyPercent` (integer, default: 50) - % of surplus to invest (0-100)
- `expectedReturnRate` (decimal 5,3, default: 6.000) - Expected investment return rate (percentage)
- `efPriorityPercent` (integer, default: 0) - % to emergency fund before split (0-100)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Prepayment Events Table:**

- `id` (UUID, primary key)
- `scenarioId` (foreign key to scenarios)
- `eventType` (text, required) - "annual", "one-time", "payment-increase"
- `amount` (decimal 10,2, required) - Prepayment amount
- `startPaymentNumber` (integer, default: 1) - Which payment to start
- `recurrenceMonth` (integer, optional) - 1-12, for annual events
- `oneTimeYear` (integer, optional) - Year offset, for one-time events
- `description` (text, optional)
- `createdAt` (timestamp)

**Refinancing Events Table:**

- `id` (UUID, primary key)
- `scenarioId` (foreign key to scenarios)
- `refinancingYear` (integer, optional) - For year-based refinancing
- `atTermEnd` (integer, default: 0) - Boolean: 0 = false, 1 = true
- `newRate` (decimal 5,3, required) - New interest rate
- `termType` (text, required) - "fixed", "variable-changing", "variable-fixed"
- `newAmortizationMonths` (integer, optional) - Extended amortization
- `paymentFrequency` (text, optional) - New payment frequency
- `closingCosts` (decimal 12,2, optional) - Total closing costs
- `legalFees` (decimal 12,2, optional) - Legal fees breakdown
- `appraisalFees` (decimal 12,2, optional) - Appraisal fees
- `dischargeFees` (decimal 12,2, optional) - Discharge fees
- `otherFees` (decimal 12,2, optional) - Other fees
- `description` (text, optional)
- `createdAt` (timestamp)

### Business Logic Requirements

**Scenario Creation:**

1. **From Template:**
   - Select template (by ID)
   - Template provides default allocation percentages and return rate
   - User can customize name and description
   - Template values copied to scenario

2. **Custom Scenario:**
   - User specifies allocation percentages
   - Allocation must sum to ≤ 100% (prepayment + investment + EF priority)
   - Expected return rate specified (default: 6%)
   - Validation: percentages between 0-100, return rate reasonable (0-20%)

**Projection Calculation:**

1. **Inputs:**
   - Scenario (allocation percentages, expected return rate)
   - Mortgage (balance, rate, amortization, payment frequency)
   - Cash flow (monthly income, expenses, debt)
   - Emergency fund (current balance, monthly contribution, target months)
   - Prepayment events (scheduled prepayments)
   - Refinancing events (rate/term changes)

2. **Calculation Process:**
   - Calculate monthly surplus from cash flow
   - Allocate surplus: emergency fund first (if priority), then prepayment/investment split
   - Generate amortization schedule with prepayments
   - Apply refinancing events at specified times
   - Calculate investment growth (compound interest)
   - Calculate emergency fund growth
   - Calculate net worth (home value + investments + EF - mortgage balance)

3. **Outputs:**
   - Yearly projections (30 years)
   - Scenario metrics (net worth at 10/20/30 years, payoff year, total interest, etc.)

**Monte Carlo Simulation:**

1. **Inputs:**
   - Scenario (optional, for prepayment/investment strategy)
   - Time horizon (months)
   - Number of iterations (1,000-10,000)
   - Rate model (GBM or Vasicek)
   - Rate volatility (annualized)
   - Rate drift (expected rate change)
   - Mean reversion speed (Vasicek)
   - Long-term mean rate (Vasicek)
   - Rate cap and floor (constraints)

2. **Simulation Process:**
   - Generate random rate paths (GBM or Vasicek model)
   - For each path, calculate mortgage outcomes
   - Apply rate constraints (cap/floor)
   - Aggregate results (mean, percentiles, distributions)

3. **Outputs:**
   - Balance distribution (mean, std dev, 10th/50th/90th percentiles)
   - Interest distribution
   - Rate path statistics
   - Probability of payoff
   - Sample paths (for visualization)

**What-If Rate Analysis:**

1. **Inputs:**
   - Scenario (optional)
   - Rate changes (array of percentage point changes, e.g., [-0.5, 0, 0.5, 1.0])
   - Time horizon (years, default: 30)

2. **Analysis Process:**
   - Calculate baseline scenario with current rate
   - For each rate change, calculate scenario with new rate
   - Compare outcomes vs baseline
   - Calculate impact (net worth change, interest change, payoff year change)

3. **Outputs:**
   - Baseline metrics and projections
   - Scenario metrics and projections for each rate change
   - Impact analysis (vs baseline)

**Scenario Comparison:**

1. **Inputs:**
   - Multiple scenarios (user-selected)
   - Metrics to compare (net worth, payoff year, interest paid, etc.)

2. **Comparison Process:**
   - Calculate metrics for each scenario
   - Format comparison table/chart
   - Generate export data (CSV/JSON)

3. **Outputs:**
   - Comparison table
   - Comparison charts
   - Export files (CSV/JSON)

### Calculation Requirements

**Monthly Surplus Calculation:**

```
Total Annual Income = (Monthly Income × 12) + (Monthly Income × Extra Paycheques) + Annual Bonus

Total Annual Expenses = Property Tax + Home Insurance + (Condo Fees × 12) + (Utilities × 12) + 
                        (Groceries × 12) + (Dining × 12) + (Transportation × 12) + 
                        (Entertainment × 12) + (Car Loan × 12) + (Student Loan × 12) + 
                        (Credit Card × 12)

Monthly Surplus = (Total Annual Income - Total Annual Expenses) / 12
Monthly Surplus = max(0, Monthly Surplus)  // Non-negative
```

**Surplus Allocation:**

```
Emergency Fund Allocation = Monthly Surplus × (EF Priority Percent / 100)

Remaining Surplus = Monthly Surplus - Emergency Fund Allocation

Prepayment Amount = Remaining Surplus × (Prepayment Percent / 100)
Investment Amount = Remaining Surplus × (Investment Percent / 100)
```

**Investment Growth (Compound Interest):**

```
Monthly Investment Return Rate = (1 + Annual Return Rate)^(1/12) - 1

Investment Value[Month N] = Investment Value[Month N-1] × (1 + Monthly Return Rate) + 
                             Investment Amount[Month N]
```

**Emergency Fund Growth:**

```
Emergency Fund Value[Month N] = Emergency Fund Value[Month N-1] + 
                                 Emergency Fund Allocation[Month N]
```

**Net Worth Calculation:**

```
Net Worth = Home Value + Investment Value + Emergency Fund Value - Mortgage Balance
```

**Projection Generation:**

1. Start with current mortgage balance, investment value, emergency fund value
2. For each month in projection:
   - Calculate monthly surplus
   - Allocate surplus (EF, prepayment, investment)
   - Apply prepayment to mortgage (if scheduled event)
   - Calculate mortgage payment (principal + interest)
   - Update mortgage balance
   - Update investment value (with growth)
   - Update emergency fund value
   - Apply refinancing events (if scheduled)
3. Aggregate monthly results into yearly projections

### Validation Requirements

**Scenario Validation:**

- `prepaymentMonthlyPercent`: 0-100 (integer)
- `investmentMonthlyPercent`: 0-100 (integer)
- `efPriorityPercent`: 0-100 (integer)
- Sum of percentages ≤ 100: `prepaymentMonthlyPercent + investmentMonthlyPercent + efPriorityPercent ≤ 100`
- `expectedReturnRate`: 0-20% (decimal, reasonable range)

**Prepayment Event Validation:**

- `amount`: Positive (> 0)
- `eventType`: Enum ("annual", "one-time", "payment-increase")
- `recurrenceMonth`: 1-12 (required if eventType = "annual")
- `oneTimeYear`: Positive (required if eventType = "one-time")
- `startPaymentNumber`: Positive (≥ 1)

**Refinancing Event Validation:**

- `newRate`: 0-20% (decimal, reasonable range)
- `termType`: Enum ("fixed", "variable-changing", "variable-fixed")
- `refinancingYear` or `atTermEnd`: At least one required
- `closingCosts` or breakdown: If provided, must be positive

**Monte Carlo Simulation Validation:**

- `timeHorizonMonths`: 1-360 (reasonable range)
- `numIterations`: 100-10,000 (reasonable range)
- `rateModel`: Enum ("gbm", "vasicek")
- `interestRateVolatility`: 0-1 (0-100%, reasonable range)
- `rateCap`, `rateFloor`: 0-1 (0-100%, reasonable range), cap ≥ floor

### Integration Requirements

**Mortgage Integration:**
- Fetches current mortgage balance, rate, amortization
- Uses mortgage payment frequency and calculation
- Integrates with prepayment mechanics (limits, carry-forward)

**Cash Flow Integration:**
- Uses cash flow data for surplus calculation
- Integrates with income, expenses, debt

**Emergency Fund Integration:**
- Uses emergency fund current balance and target
- Integrates with emergency fund contribution strategy

**Prepayment Events Integration:**
- Prepayment events scheduled in scenarios affect projections
- Respects prepayment limits (annual limits, carry-forward)

**Refinancing Events Integration:**
- Refinancing events scheduled in scenarios affect projections
- Applies rate/term changes at specified times

**Smith Maneuver Integration:**
- Scenario templates include Smith Maneuver strategy
- Investment allocation supports Smith Maneuver approach

---

## User Stories & Acceptance Criteria

### Epic: Scenario Management

**Story 1: Create Custom Scenario**
- **As a** homeowner
- **I want to** create a custom scenario with my own allocation strategy
- **So that** I can model my preferred prepayment/investment split

**Acceptance Criteria:**
- ✅ Scenario creation form with allocation percentages
- ✅ Prepayment percent, investment percent, EF priority percent inputs
- ✅ Expected return rate input
- ✅ Validation: Percentages 0-100, sum ≤ 100
- ✅ Validation: Return rate 0-20%
- ✅ Scenario saved to database

**Story 2: Create Scenario from Template**
- **As a** homeowner
- **I want to** create a scenario from a template
- **So that** I can quickly start with a proven strategy

**Acceptance Criteria:**
- ✅ Template selection (6 templates available)
- ✅ Template preview (name, description, allocation percentages)
- ✅ Create scenario from template with one click
- ✅ Template values copied to scenario
- ✅ User can customize name and description
- ✅ Scenario saved with template allocation values

**Story 3: List Scenarios**
- **As a** homeowner
- **I want to** view all my scenarios
- **So that** I can manage and compare them

**Acceptance Criteria:**
- ✅ List all scenarios for user
- ✅ Display scenario name, description, allocation percentages
- ✅ Options to edit, delete, view projections
- ✅ Scenarios sorted by creation date (newest first)

**Story 4: Edit Scenario**
- **As a** homeowner
- **I want to** edit scenario allocation percentages
- **So that** I can adjust my strategy

**Acceptance Criteria:**
- ✅ Edit form with current scenario values
- ✅ Update allocation percentages
- ✅ Update expected return rate
- ✅ Validation same as creation
- ✅ Scenario updated in database

**Story 5: Delete Scenario**
- **As a** homeowner
- **I want to** delete scenarios I no longer need
- **So that** I can keep my scenario list organized

**Acceptance Criteria:**
- ✅ Delete button on scenario
- ✅ Confirmation dialog
- ✅ Scenario and associated events deleted
- ✅ Cascading delete for prepayment/refinancing events

### Epic: Projections & Metrics

**Story 6: View Scenario Projections**
- **As a** homeowner
- **I want to** see yearly projections for my scenario
- **So that** I can understand long-term financial outcomes

**Acceptance Criteria:**
- ✅ Yearly projections displayed (1-30 years)
- ✅ Metrics shown: net worth, mortgage balance, investments, emergency fund
- ✅ Cumulative metrics: interest paid, prepayments, investments, principal
- ✅ Charts/graphs for visualization
- ✅ Projections calculated from scenario, mortgage, cash flow, EF

**Story 7: View Scenario Metrics**
- **As a** homeowner
- **I want to** see summary metrics for my scenario
- **So that** I can quickly compare scenarios

**Acceptance Criteria:**
- ✅ Net worth at 10, 20, 30 years displayed
- ✅ Mortgage balance at 10, 20, 30 years displayed
- ✅ Mortgage payoff year displayed
- ✅ Total interest paid displayed
- ✅ Investment values and returns at 10, 20, 30 years
- ✅ Emergency fund status displayed

**Story 8: Projections Include Prepayment Events**
- **As a** system
- **I want to** include scheduled prepayment events in projections
- **So that** projections reflect planned prepayments

**Acceptance Criteria:**
- ✅ Prepayment events scheduled in scenario included in projections
- ✅ Annual events applied at specified recurrence month
- ✅ One-time events applied at specified year
- ✅ Payment increases applied at specified payment number
- ✅ Projections reflect prepayment impact on balance and interest

**Story 9: Projections Include Refinancing Events**
- **As a** system
- **I want to** include scheduled refinancing events in projections
- **So that** projections reflect planned refinancing

**Acceptance Criteria:**
- ✅ Refinancing events scheduled in scenario included in projections
- ✅ Rate changes applied at specified time (year or term end)
- ✅ Term changes (amortization, frequency) applied
- ✅ Closing costs included in calculations
- ✅ Projections reflect refinancing impact on rate and balance

### Epic: Monte Carlo Simulations

**Story 10: Run Monte Carlo Simulation**
- **As a** homeowner
- **I want to** run Monte Carlo simulation for rate uncertainty
- **So that** I can understand probability distributions for outcomes

**Acceptance Criteria:**
- ✅ Monte Carlo simulation form with parameters
- ✅ Rate model selection (GBM or Vasicek)
- ✅ Time horizon input (months)
- ✅ Number of iterations input (1,000-10,000)
- ✅ Volatility, drift, mean reversion parameters
- ✅ Rate cap and floor inputs
- ✅ Simulation runs and returns results

**Story 11: View Monte Carlo Results**
- **As a** homeowner
- **I want to** see Monte Carlo simulation results
- **So that** I can understand probability distributions

**Acceptance Criteria:**
- ✅ Balance distribution displayed (mean, std dev, 10th/50th/90th percentiles)
- ✅ Interest distribution displayed
- ✅ Rate path statistics displayed
- ✅ Probability of payoff displayed
- ✅ Sample paths displayed (for visualization)
- ✅ Charts/graphs for distributions

**Story 12: Historical Volatility Option**
- **As a** homeowner
- **I want to** use historical volatility for Monte Carlo simulation
- **So that** simulations are based on actual rate history

**Acceptance Criteria:**
- ✅ Option to use historical volatility
- ✅ Historical rates input (array of rates)
- ✅ Volatility calculated from historical rates
- ✅ Calculated volatility used in simulation

### Epic: What-If Rate Analysis

**Story 13: Analyze Rate Change Scenarios**
- **As a** homeowner
- **I want to** analyze different rate change scenarios
- **So that** I can understand impact of rate changes

**Acceptance Criteria:**
- ✅ What-if analysis form with rate changes input
- ✅ Rate changes as array (e.g., [-0.5, 0, 0.5, 1.0] percentage points)
- ✅ Time horizon input (years, default: 30)
- ✅ Analysis runs for baseline and each rate change
- ✅ Results displayed for baseline and each scenario

**Story 14: View Rate Change Impact**
- **As a** homeowner
- **I want to** see impact of rate changes vs baseline
- **So that** I can understand sensitivity to rate changes

**Acceptance Criteria:**
- ✅ Baseline metrics and projections displayed
- ✅ Scenario metrics and projections for each rate change displayed
- ✅ Impact analysis displayed (net worth change, interest change, payoff year change)
- ✅ Comparison table/chart
- ✅ Clear indication of rate change vs baseline

### Epic: Scenario Comparison

**Story 15: Compare Multiple Scenarios**
- **As a** homeowner
- **I want to** compare multiple scenarios side-by-side
- **So that** I can choose optimal strategy

**Acceptance Criteria:**
- ✅ Scenario selection (multiple scenarios)
- ✅ Comparison table with key metrics
- ✅ Comparison charts/graphs
- ✅ Side-by-side metrics display
- ✅ Clear winner indication (if applicable)

**Story 16: Export Scenario Comparison**
- **As a** homeowner
- **I want to** export scenario comparison data
- **So that** I can analyze further or share

**Acceptance Criteria:**
- ✅ CSV export button
- ✅ JSON export button
- ✅ Export includes metrics and projections
- ✅ Export file downloaded

### Epic: Event Scheduling

**Story 17: Schedule Prepayment Events**
- **As a** homeowner
- **I want to** schedule prepayment events in scenarios
- **So that** projections include planned prepayments

**Acceptance Criteria:**
- ✅ Prepayment event form (amount, type, timing)
- ✅ Event types: annual, one-time, payment-increase
- ✅ Annual events: recurrence month selection
- ✅ One-time events: year offset input
- ✅ Payment increases: payment number input
- ✅ Events saved to scenario

**Story 18: Schedule Refinancing Events**
- **As a** homeowner
- **I want to** schedule refinancing events in scenarios
- **So that** projections include planned refinancing

**Acceptance Criteria:**
- ✅ Refinancing event form (timing, new rate, term type)
- ✅ Timing options: by year or at term end
- ✅ New rate input
- ✅ Term type selection (fixed, variable-changing, variable-fixed)
- ✅ Optional: new amortization, payment frequency
- ✅ Closing costs input (total or breakdown)
- ✅ Events saved to scenario

---

## Technical Implementation Notes

### API Endpoints

**Scenario Management:**
- `GET /api/scenarios` - List scenarios for user
- `GET /api/scenarios/:id` - Get scenario by ID
- `POST /api/scenarios` - Create scenario
- `PATCH /api/scenarios/:id` - Update scenario
- `DELETE /api/scenarios/:id` - Delete scenario

**Scenario with Projections:**
- `GET /api/scenarios/with-projections` - List scenarios with projections and metrics

**Templates:**
- `GET /api/scenarios/templates` - List all templates
- `GET /api/scenarios/templates/:id` - Get template by ID
- `POST /api/scenarios/from-template` - Create scenario from template

**Monte Carlo:**
- `POST /api/scenarios/monte-carlo` - Run Monte Carlo simulation
  - Body: `{ scenarioId?, timeHorizonMonths, numIterations?, rateModel?, interestRateVolatility?, ... }`

**What-If Analysis:**
- `POST /api/scenarios/what-if-rate` - Analyze rate change scenarios
  - Body: `{ scenarioId?, rateChanges[], timeHorizonYears? }`

**Prepayment Events:**
- `GET /api/scenarios/:scenarioId/prepayment-events` - List prepayment events
- `POST /api/scenarios/:scenarioId/prepayment-events` - Create prepayment event
- `PATCH /api/scenarios/:scenarioId/prepayment-events/:id` - Update prepayment event
- `DELETE /api/scenarios/:scenarioId/prepayment-events/:id` - Delete prepayment event

**Refinancing Events:**
- `GET /api/scenarios/:scenarioId/refinancing-events` - List refinancing events
- `POST /api/scenarios/:scenarioId/refinancing-events` - Create refinancing event
- `PATCH /api/scenarios/:scenarioId/refinancing-events/:id` - Update refinancing event
- `DELETE /api/scenarios/:scenarioId/refinancing-events/:id` - Delete refinancing event

### Database Schema

**Scenarios Table:**
```sql
CREATE TABLE scenarios (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  prepayment_monthly_percent INTEGER NOT NULL DEFAULT 50,
  investment_monthly_percent INTEGER NOT NULL DEFAULT 50,
  expected_return_rate DECIMAL(5,3) NOT NULL DEFAULT 6.000,
  ef_priority_percent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Prepayment Events Table:** (see Prepayment Mechanics spec for full schema)

**Refinancing Events Table:** (see Refinancing Analysis spec for full schema)

### Service Layer

**ScenarioService:**
- `listByUserId(userId): Promise<Scenario[]>`
- `getByIdForUser(id, userId): Promise<Scenario | undefined>`
- `create(userId, payload): Promise<Scenario>`
- `update(id, userId, payload): Promise<Scenario | undefined>`
- `delete(id, userId): Promise<boolean>`

**ScenarioTemplateService:**
- `getTemplates(): ScenarioTemplate[]`
- `getTemplateById(id): ScenarioTemplate | undefined`
- `createFromTemplate(templateId, name?, description?): ScenarioPayload | null`

**ScenarioProjectionService:**
- `buildForUser(userId, scenarios): Promise<ScenarioWithAnalytics[]>`
  - Returns scenarios with metrics and projections
- `runMonteCarloSimulation(userId, params): Promise<MonteCarloResult | null>`
  - Runs Monte Carlo simulation with specified parameters
- `analyzeRateChangeScenarios(userId, params): Promise<{baseline, scenarios} | null>`
  - Analyzes what-if rate change scenarios

### Calculation Functions

**Projection Calculation (`generateProjections`):**
- Inputs: Scenario, Mortgage, CashFlow, EmergencyFund, maxYears, currentRate
- Outputs: YearlyProjection[] (year-by-year projections)

**Metrics Calculation (`calculateScenarioMetrics`):**
- Inputs: ProjectionParams, currentRate
- Outputs: ScenarioMetrics (summary metrics at 10/20/30 years)

**Monte Carlo Engine (`MonteCarloEngine.run`):**
- Inputs: SimulationParams
- Outputs: MonteCarloResult (distributions, percentiles, probabilities)

### Frontend Components

**Scenario Management:**
- Scenario list component
- Scenario creation/edit form
- Template selector
- Scenario card

**Projections & Metrics:**
- Projections chart/table component
- Metrics summary card
- Yearly projection details

**Monte Carlo:**
- Monte Carlo simulation form
- Monte Carlo results visualization
- Distribution charts
- Sample path visualization

**What-If Analysis:**
- What-if analysis form
- Rate change comparison table/chart
- Impact analysis display

**Scenario Comparison:**
- Scenario comparison table
- Comparison charts
- Export buttons (CSV/JSON)

**Event Scheduling:**
- Prepayment event form
- Refinancing event form
- Event list component

### Data Flow

**Scenario Creation Flow:**
1. User creates scenario (custom or from template)
2. Frontend sends POST to `/api/scenarios`
3. Backend validates and saves scenario
4. Returns created scenario
5. Frontend updates scenario list

**Projection Calculation Flow:**
1. User views scenario projections
2. Frontend calls `GET /api/scenarios/with-projections`
3. Backend: `ScenarioProjectionService.buildForUser()`
   - Fetches scenarios, mortgage, cash flow, emergency fund
   - For each scenario: calculates metrics and projections
   - Uses `generateProjections()` and `calculateScenarioMetrics()`
4. Returns scenarios with projections and metrics
5. Frontend displays projections and metrics

**Monte Carlo Simulation Flow:**
1. User runs Monte Carlo simulation
2. Frontend sends POST to `/api/scenarios/monte-carlo` with parameters
3. Backend: `ScenarioProjectionService.runMonteCarloSimulation()`
   - Fetches mortgage and current term
   - Builds simulation parameters
   - Creates `MonteCarloEngine` and runs simulation
   - Returns `MonteCarloResult`
4. Frontend displays results (distributions, charts)

**What-If Analysis Flow:**
1. User runs what-if rate analysis
2. Frontend sends POST to `/api/scenarios/what-if-rate` with rate changes
3. Backend: `ScenarioProjectionService.analyzeRateChangeScenarios()`
   - Calculates baseline scenario with current rate
   - For each rate change, calculates scenario with new rate
   - Compares outcomes vs baseline
   - Returns baseline and scenarios with impact
4. Frontend displays comparison (baseline vs scenarios)

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Allocation Percentage Edge Cases:**

1. **Sum > 100%:**
   - Should not occur (validation prevents)
   - Handle gracefully: Normalize to 100% or error

2. **Sum < 100%:**
   - Valid (remaining surplus not allocated)
   - Handle gracefully: Remaining surplus ignored

3. **Zero Surplus:**
   - Monthly surplus = 0
   - No prepayments or investments allocated
   - Projections show only mortgage paydown (regular payments)

**Projection Edge Cases:**

1. **Mortgage Paid Off Early:**
   - Balance reaches zero before 30 years
   - Payoff year recorded
   - Remaining years show zero mortgage balance
   - Surplus allocated to investments/EF after payoff

2. **Negative Surplus:**
   - Expenses exceed income
   - Monthly surplus = 0 (non-negative)
   - No prepayments or investments
   - Emergency fund may decrease if used

3. **Very High Return Rate:**
   - Expected return rate > 20% (unrealistic)
   - Validation prevents, but handle gracefully if occurs
   - Cap at reasonable maximum

**Monte Carlo Edge Cases:**

1. **Rate Hits Cap/Floor:**
   - Rate constrained by cap or floor
   - Distribution may have spikes at boundaries
   - Handle gracefully in calculations

2. **Very High Volatility:**
   - Volatility > 100% (extreme)
   - Validation prevents, but handle gracefully
   - Rates may hit cap/floor frequently

3. **Negative Rates:**
   - Rates should not go negative
   - Floor ensures minimum rate (e.g., 0.01% or 1%)
   - Handle gracefully in calculations

**Event Scheduling Edge Cases:**

1. **Prepayment Event Before Start:**
   - Event scheduled before mortgage start
   - Validation should prevent
   - Handle gracefully: Skip or error

2. **Refinancing Event After Payoff:**
   - Refinancing scheduled after mortgage paid off
   - Skip refinancing (mortgage already paid)
   - Handle gracefully in projections

3. **Overlapping Events:**
   - Multiple events at same time
   - Apply in order: refinancing first, then prepayments
   - Handle gracefully in calculations

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid scenario data, invalid simulation parameters
- **401 Unauthorized:** User not authenticated
- **404 Not Found:** Scenario not found, mortgage not found
- **500 Internal Server Error:** Calculation error, simulation error

**Frontend Error Handling:**

- Display user-friendly error messages
- Show loading states during calculations
- Handle network errors gracefully
- Fallback to default values if data unavailable
- Log errors for debugging

**Calculation Error Handling:**

- Validate inputs before calculations
- Handle edge cases (zero amounts, missing data, etc.)
- Return appropriate error messages
- Use safe defaults where appropriate
- Log calculation errors for debugging

**Simulation Error Handling:**

- Validate simulation parameters
- Handle convergence issues (if applicable)
- Limit iteration count for performance
- Return partial results if simulation fails partway
- Log simulation errors for debugging

---

## Testing Considerations

### Unit Tests

**Projection Calculation Tests:**
- `generateProjections()`: Basic projection calculation
- `generateProjections()`: With prepayment events
- `generateProjections()`: With refinancing events
- `generateProjections()`: With emergency fund priority
- `calculateScenarioMetrics()`: Metrics calculation accuracy
- Edge cases: Zero surplus, mortgage paid off early, negative surplus

**Monte Carlo Engine Tests:**
- `MonteCarloEngine.run()`: GBM model simulation
- `MonteCarloEngine.run()`: Vasicek model simulation
- `MonteCarloEngine.run()`: With rate cap/floor
- `calculateHistoricalVolatility()`: Volatility calculation
- Edge cases: Extreme parameters, rate constraints

**Scenario Service Tests:**
- `create()`: Scenario creation validation
- `update()`: Scenario update validation
- `delete()`: Cascade delete for events
- Allocation percentage validation

**Template Service Tests:**
- `getTemplates()`: Returns all templates
- `getTemplateById()`: Returns correct template
- `createFromTemplate()`: Creates scenario from template

### Integration Tests

**Scenario Projection API:**
- Create scenario and get projections
- Update scenario and verify projections update
- Delete scenario and verify cleanup

**Monte Carlo API:**
- Run Monte Carlo simulation with different parameters
- Verify results structure and ranges
- Test with different rate models

**What-If Analysis API:**
- Run what-if analysis with rate changes
- Verify baseline and scenario calculations
- Verify impact analysis

**Event Scheduling API:**
- Create prepayment events and verify in projections
- Create refinancing events and verify in projections
- Delete events and verify projections update

### End-to-End Tests

**Scenario Creation E2E:**
1. User creates custom scenario
2. Scenario saved and displayed in list
3. User views projections
4. Projections reflect scenario allocation

**Template Scenario E2E:**
1. User selects template
2. Scenario created from template
3. Template values copied correctly
4. User views projections with template strategy

**Monte Carlo Simulation E2E:**
1. User runs Monte Carlo simulation
2. Simulation completes with results
3. Results displayed (distributions, charts)
4. User can adjust parameters and rerun

**What-If Analysis E2E:**
1. User runs what-if rate analysis
2. Baseline and scenarios calculated
3. Comparison displayed (baseline vs scenarios)
4. Impact analysis shown

**Scenario Comparison E2E:**
1. User selects multiple scenarios
2. Comparison table/chart displayed
3. User exports comparison (CSV/JSON)
4. Export file downloaded correctly

---

## Future Enhancements

### Known Limitations

1. **Rate Volatility Estimation:**
   - Currently user-provided or historical
   - Could enhance with automatic volatility estimation from market data

2. **Investment Returns:**
   - Simple compound interest model
   - Could add more sophisticated models (volatility, tax considerations)

3. **Tax Considerations:**
   - Investment returns not adjusted for taxes
   - Could add tax-adjusted returns (marginal tax rate)

4. **Home Value Appreciation:**
   - Home value assumed constant
   - Could add home value appreciation over time

### Potential Improvements

**Enhanced Simulation:**
- Multi-variate simulations (rates + investment returns)
- Correlation between rates and investment returns
- More sophisticated investment models

**Advanced Analysis:**
- Sensitivity analysis (which parameters matter most)
- Optimization (find optimal allocation)
- Risk-adjusted metrics (Sharpe ratio, etc.)

**User Experience:**
- Scenario wizard (guided scenario creation)
- Pre-built scenario library (common strategies)
- Scenario sharing (share scenarios with others)

**Integration Enhancements:**
- Real-time market data integration
- Automatic rate updates for projections
- Integration with investment tracking

---

**End of Feature Specification**

