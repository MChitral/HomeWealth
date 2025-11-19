# Canadian Mortgage Strategy & Wealth Forecasting
## Complete Features Documentation

**Last Updated**: November 2024  
**Version**: MVP 1.0  
**Target Audience**: Canadian homeowners with mortgages

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Core Features](#core-features)
3. [Financial Management Features](#financial-management-features)
4. [Scenario Planning Features](#scenario-planning-features)
5. [Visualization & Analytics](#visualization--analytics)
6. [Canadian Mortgage Specifics](#canadian-mortgage-specifics)
7. [User Workflows](#user-workflows)

---

## Product Overview

### What is This App?

A comprehensive financial planning tool designed specifically for Canadian homeowners to compare different strategies for managing their mortgage while building wealth. Unlike generic mortgage calculators, this application helps you answer the critical question: **"Should I prepay my mortgage or invest that money instead?"**

### Key Value Propositions

**For the User:**
- **Compare up to 4 strategies simultaneously** - See aggressive prepayment vs balanced vs investment-focused approaches side-by-side
- **Long-term visibility** - Project your net worth 10, 20, or 30 years into the future
- **Holistic financial picture** - Integrate mortgage, investments, emergency fund, and cash flow in one place
- **Canadian-specific accuracy** - Built for Canadian mortgage rules (semi-annual compounding, term-based rates, variable rate types)
- **Informed decision-making** - Understand trade-offs between mortgage freedom and wealth accumulation

**Competitive Advantages:**
- vs **Government Calculator**: Multi-scenario comparison, investment modeling, complete financial picture
- vs **Calculator.net**: Canadian mortgage rules, term-based modeling, holistic wealth tracking
- vs **Spreadsheets**: Professional UI, automatic calculations, scenario management, visual insights

---

## Core Features

### 1. Dashboard (Financial Command Center)

**Purpose**: Get a complete snapshot of your current financial position and projected future across all strategies.

**What You Can Do:**
- View **Current Financial Snapshot**:
  - Home equity (property value - mortgage balance)
  - Current mortgage balance
  - Emergency fund status
  - Monthly surplus available for prepayments/investments

- See **Projected Future State** (10/20/30 year horizons):
  - Projected net worth
  - Remaining mortgage balance
  - Investment portfolio value
  - Mortgage reduction amount
  - Emergency fund status

- Compare **Different Strategies**:
  - Select from your created scenarios
  - Toggle between 10, 20, and 30-year views
  - See how different approaches impact your future

- Visualize **Financial Trajectories**:
  - Net worth growth chart over time
  - Mortgage balance reduction timeline
  - Investment portfolio growth curve

**Key Metrics Displayed:**
- Net Worth Projection
- Mortgage Balance (current and projected)
- Investment Value (total and returns)
- Emergency Fund Status
- Mortgage Reduction (how much you'll pay down)
- Total Interest Paid

---

### 2. Mortgage Management

**Purpose**: Track and manage your actual mortgage details with Canadian-specific features.

#### 2.1 Mortgage Details

**What You Can Track:**
- **Property Information**:
  - Current property value
  - Original purchase price
  - Down payment amount
  
- **Mortgage Specifics**:
  - Original mortgage amount
  - Current balance
  - Start date
  - Amortization period (years and months)
  - Payment frequency (6 options)

- **Lender Constraints**:
  - Annual prepayment limit (typically 10-20% of original balance)

**Edit Mortgage Details:**
- Update property value as market changes
- Adjust current balance after extra payments
- Change payment frequency
- All changes automatically update projections

#### 2.2 Term Management (Canadian Term-Based System)

**What You Can Track:**
- **Current Term Information**:
  - Term type (Fixed, VRM-Changing, VRM-Fixed Payment)
  - Term length (typically 3-5 years)
  - Start and end dates
  - Months remaining in term

- **Rate/Spread Information**:
  - Fixed Rate: Your locked-in interest rate
  - Variable Rate: Your locked spread (e.g., Prime - 0.80%)
  - Current effective rate

**Term Renewal:**
- Create new term when current term expires
- Set new rate or spread
- Update payment frequency if needed
- Track term history over mortgage lifetime

#### 2.3 Payment History Tracking

**What You Can Log:**
- Individual payment details
- Payment date
- Payment period label (e.g., "January 2025", "Payment #23")
- Regular payment amount (scheduled payment)
- Prepayment amount (extra payments)
- Total payment amount (auto-calculated: regular + prepayment)
- Principal vs interest breakdown
- Remaining balance after payment
- Current Prime rate (for variable mortgages)
- Effective interest rate
- Trigger rate status (VRM-Fixed Payment only)
- Remaining amortization

**Enhanced Payment Tracking** (Nov 18, 2024):
- Track regular payments separately from prepayments
- Optional payment period labels for organization
- Auto-calculated totals show full payment breakdown
- Expanded 12-column payment history table
- Prepayments highlighted when > $0

**Canadian-Specific Calculations:**
- Semi-annual compounding (not monthly like US)
- Automatic principal/interest split
- Effective rate calculation from Prime + spread
- Trigger rate tracking for fixed-payment VRMs

#### 2.4 Payment Frequencies Supported

1. **Monthly** (12 payments/year)
2. **Bi-weekly** (26 payments/year)
3. **Accelerated Bi-weekly** (26 payments/year, pays off faster)
4. **Semi-monthly** (24 payments/year)
5. **Weekly** (52 payments/year)
6. **Accelerated Weekly** (52 payments/year, pays off faster)

**Understanding Accelerated:**
- Takes monthly payment amount
- Divides by 2 (bi-weekly) or 4 (weekly)
- Results in extra payments per year
- Pays off mortgage faster with no budget change

---

### 3. Cash Flow Management

**Purpose**: Understand your income, expenses, and available surplus for financial decisions.

**Income Tracking:**
- **Monthly Base Income**: Your regular monthly pay
- **Extra Paycheques**: Additional paycheques in year (typically 2 if paid bi-weekly)
- **Annual Bonus**: Year-end or performance bonuses

**Fixed Housing Expenses:**
- Property tax (annual amount)
- Home insurance (annual amount)
- Condo/HOA fees (monthly)
- Utilities (monthly average)

**Variable Living Expenses:**
- Groceries (monthly)
- Dining out (monthly)
- Transportation (monthly)
- Entertainment (monthly)

**Other Debt Obligations:**
- Car loan payment (monthly)
- Student loan payment (monthly)
- Credit card minimum payment (monthly)

**Automatic Calculation:**
- **Monthly Surplus** = (Total Annual Income - All Expenses) / 12
- This surplus is what you have available for:
  - Mortgage prepayments
  - Investments
  - Emergency fund contributions

---

### 4. Emergency Fund Planning

**Purpose**: Ensure financial security before aggressive prepayment or investment strategies.

**What You Can Configure:**
- **Target Coverage**: How many months of expenses to save (typically 3-12 months)
- **Current Balance**: How much you've already saved
- **Monthly Contribution**: How much to add each month

**Smart Features:**
- **Automatic Target Calculation**: System calculates target based on your expenses
- **Progress Tracking**: Visual indicator of funding status
- **Scenario Integration**: Emergency fund considered in all scenario projections
- **Priority Setting**: Can prioritize EF before prepayments/investments in scenarios

**Status Indicators:**
- Fully Funded (100%)
- Partially Funded (X% of target)
- Not Started (0%)

---

## Scenario Planning Features

### 5. Create & Manage Financial Scenarios

**Purpose**: Model different financial strategies to find your optimal approach.

#### 5.1 Scenario Creation

**Basic Information:**
- **Scenario Name**: e.g., "Aggressive Prepayment", "Balanced Builder", "Investment Focus"
- **Description**: Notes about strategy intent

**Prepayment Strategy Configuration:**
- **Monthly Prepayment %**: What percentage of surplus goes to extra mortgage payments (0-100%)
- **Annual Lump Sum Events**: Model bonuses or tax refunds
  - Amount (e.g., $5,000)
  - Which month (e.g., March for tax refund)
  - Recurring every year
- **One-Time Prepayments**: Model inheritance or windfalls
  - Amount
  - Which year
  - One-time only

**Investment Strategy Configuration:**
- **Monthly Investment %**: What percentage of surplus goes to investments (0-100%)
- **Expected Return Rate**: Annual expected return (e.g., 6.5%)
- **Asset Allocation**: Future feature for stocks/bonds/cash mix

**Emergency Fund Priority:**
- **EF First %**: What percentage goes to EF before splitting to prepayment/investment
- Ensures financial security before wealth building

**Validation:**
- Prepayment % + Investment % cannot exceed 100%
- Respects lender's annual prepayment limits
- All percentages work from your available surplus

#### 5.2 Scenario Management

**List View:**
- See all your created scenarios
- Preview key settings (prepayment %, investment %, expected return)
- Last updated timestamp
- Quick edit or delete

**Edit Scenarios:**
- Update any strategy settings
- Changes automatically recalculate projections
- Preserve scenario history

**Delete Scenarios:**
- Remove strategies you no longer want to explore
- Confirmation dialog prevents accidents

#### 5.3 Example Scenarios

**Aggressive Prepayment:**
- 80% surplus to mortgage prepayment
- 20% surplus to investments
- Goal: Mortgage freedom ASAP
- Projected: Mortgage paid in 12 years vs 25 years

**Balanced Builder:**
- 50% surplus to mortgage prepayment
- 50% surplus to investments
- Goal: Balance debt reduction and wealth building
- Projected: Moderate mortgage payoff, good investment growth

**Investment Focus:**
- 20% surplus to mortgage prepayment
- 80% surplus to investments
- Goal: Maximize investment growth
- Projected: Longer mortgage, higher net worth from investments

**Safety First:**
- 100% surplus to emergency fund until fully funded
- Then 50/50 split to prepayment/investment
- Goal: Security first, then wealth building

---

### 6. Scenario Comparison

**Purpose**: Compare up to 4 scenarios side-by-side to make informed decisions.

**Comparison Features:**
- **Select Scenarios**: Choose 2-4 scenarios to compare
- **Horizon Selection**: Toggle between 10, 20, or 30-year projections
- **Side-by-Side Metrics Table**:
  - Net worth at selected horizon
  - Mortgage balance remaining
  - Investment portfolio value
  - Total interest paid
  - Mortgage payoff year
  - Average monthly surplus utilized

**Key Insights:**
- See which strategy builds most wealth
- Understand trade-offs (lower mortgage balance vs higher investments)
- Identify mortgage payoff timeline differences
- Calculate total interest savings

**Decision Support:**
- Green highlighting shows best outcomes per metric
- Clear visibility into opportunity costs
- Understand long-term impacts of today's decisions

---

## Visualization & Analytics

### 7. Charts & Graphs

**Net Worth Trajectory Chart:**
- Line chart showing net worth growth over 30 years
- Multiple lines for different scenarios (when comparing)
- Clear visibility into wealth accumulation

**Mortgage Balance Chart:**
- Shows mortgage paydown over time
- Visualize impact of prepayment strategies
- See when mortgage reaches $0

**Investment Growth Chart:**
- Shows investment portfolio growth
- Includes both contributions and returns
- Compound growth visualization

**All Charts Feature:**
- Interactive hover tooltips with exact values
- Horizon-aware (respects 10/20/30 year selection)
- Responsive design for all screen sizes

---

### 8. Horizon Selection (Time Travel Feature)

**Purpose**: See your financial future at different time horizons.

**How It Works:**
- Toggle buttons for 10, 20, or 30 years
- **Global Impact**: Changes all metrics across:
  - Dashboard projections
  - Comparison tables
  - Charts and visualizations
  - Strategy summary

**Why Multiple Horizons:**
- **10 Years**: Near-term planning, mortgage renewals, first milestone
- **20 Years**: Mid-term wealth building, kids' education timeframe
- **30 Years**: Long-term retirement planning, complete mortgage payoff

**All Metrics Adapt:**
- Net worth projection
- Mortgage balance
- Investment value
- Cumulative interest paid
- Emergency fund status

---

## Canadian Mortgage Specifics

### 9. Semi-Annual Compounding

**What It Means:**
- Unlike US mortgages (monthly compounding), Canadian mortgages compound interest **twice per year**
- This affects the effective interest rate you pay
- Payment frequency changes effective rate, not just payment amounts

**How We Handle It:**
- Automatic calculation of effective rate from nominal rate
- Different effective rates for each payment frequency
- More accurate projections than generic calculators

**Example:**
- Nominal Rate: 5.49% compounded semi-annually
- Effective Rate (Monthly): ~5.35%
- Effective Rate (Bi-weekly): ~5.33%
- You pay less interest with more frequent payments

---

### 10. Variable Rate Mortgage (VRM) Types

#### VRM-Changing Payment
**How It Works:**
- You have Prime + Spread locked for term (e.g., Prime - 0.80%)
- When Prime changes, your payment recalculates
- Amortization stays the same
- Payment amount goes up/down with Prime

**Example:**
- Locked Spread: Prime - 0.80%
- Prime starts at 6.45% → Effective rate 5.65%
- Prime rises to 6.95% → Effective rate 6.15%
- Your payment increases to maintain amortization

#### VRM-Fixed Payment
**How It Works:**
- You have Prime + Spread locked for term
- Payment amount stays the same even if Prime changes
- If Prime rises, more goes to interest, less to principal
- Amortization extends

**Trigger Rate Risk:**
- **Trigger Rate**: When your fixed payment doesn't cover interest
- You go "underwater" - balance increases instead of decreases
- Lender may require payment increase or lump sum

**Example:**
- Locked Spread: Prime - 0.80%
- Payment: $2,100/month (fixed)
- Prime rises from 6.45% to 7.45%
- Interest portion exceeds $2,100
- **Trigger Hit** - need to increase payment or pay lump sum

---

### 11. Term-Based Rate System

**Understanding Terms:**
- **Term**: Period your rate/spread is locked (typically 3-5 years)
- **Amortization**: Total payoff period (typically 25-30 years)
- You'll have 5-8 terms over your mortgage lifetime

**Rate Lock Rules:**
- **Fixed Rate**: Exact rate locked for term (e.g., 5.49%)
- **Variable Rate**: Spread to Prime locked for term (e.g., Prime - 0.80%)

**Term Renewal Process:**
1. Current term expires (e.g., after 5 years)
2. Negotiate new rate or spread with lender
3. Create new term in app
4. Continue tracking payments under new term

**Why This Matters:**
- Canadian mortgages are NOT 25-year fixed like US
- Rate changes every 3-5 years
- Must plan for potential rate increases
- Historical term tracking shows your rate journey

---

### 12. First-Time Buyer Rules (2024)

**30-Year Amortization Eligibility:**
- You're a first-time homebuyer, OR
- You're purchasing a new build property

**25-Year Amortization (Standard):**
- All other cases with down payment < 20%

**20%+ Down Payment:**
- Lender sets maximum amortization
- Can be 30+ years if lender approves
- Better rates typically available

**Impact on Projections:**
- Longer amortization = lower payments but more interest
- App models any amortization period
- Compare 25-year vs 30-year scenarios

---

## User Workflows

### 13. Getting Started (Initial Setup)

**Step 1: Add Your Mortgage**
1. Navigate to Mortgage page
2. Click "Create Mortgage"
3. Enter:
   - Property purchase price
   - Down payment amount
   - Start date
   - Amortization (25 or 30 years)
   - Payment frequency

**Step 2: Add Current Term**
1. On Mortgage page, click "Renew Term"
2. Select term type (Fixed or Variable)
3. Enter:
   - Term length (years)
   - Fixed rate OR variable spread
   - Payment amount
   - Term start/end dates

**Step 3: Set Up Cash Flow**
1. Navigate to Cash Flow page
2. Enter your income:
   - Monthly salary
   - Extra paycheques per year
   - Annual bonus
3. Enter all expenses (categorized)
4. System calculates your monthly surplus

**Step 4: Set Emergency Fund Target**
1. Navigate to Emergency Fund page
2. Choose target months (3-12 months recommended)
3. Enter current balance
4. Set monthly contribution
5. System calculates progress

**Step 5: Create Your First Scenario**
1. Navigate to Scenarios page
2. Click "Create Scenario"
3. Name it (e.g., "Aggressive Prepayment")
4. Set prepayment percentage
5. Set investment percentage
6. Set expected return rate
7. Save

**You're Ready!**
- Dashboard now shows projections
- Create more scenarios to compare
- Make informed financial decisions

---

### 14. Monthly Routine (Ongoing Use)

**Log Mortgage Payments:**
1. When you make a payment, go to Mortgage page
2. Click "Log Payment"
3. Enter:
   - Payment date
   - Payment amount
   - Prime rate (if variable)
4. System calculates principal/interest split
5. Tracks cumulative totals

**Update Cash Flow (Quarterly):**
- Review income changes (raises, bonuses)
- Update expense estimates
- Ensure surplus calculation is accurate

**Check Progress (Monthly):**
- Visit Dashboard
- See net worth trajectory
- Compare scenarios
- Adjust strategies if needed

---

### 15. Annual Review Workflow

**Review Financial Position:**
1. Update property value (check market comps)
2. Verify mortgage balance (from lender statement)
3. Update emergency fund balance
4. Review cash flow changes

**Scenario Refinement:**
1. Compare last year's projections to actual
2. Adjust expected return rates if needed
3. Create new scenarios based on learnings
4. Delete outdated scenarios

**Tax Refund Season:**
- Add one-time prepayment event to scenarios
- Compare impact of lump sum vs investment
- Make data-driven decision

**Term Renewal Time (Every 3-5 Years):**
1. Shop for new rates
2. Create scenarios with different rate options
3. See long-term impact of 0.5% rate difference
4. Negotiate confidently with data

---

### 16. Life Event Planning

**Expecting a Windfall (Inheritance, Bonus):**
1. Create scenario with one-time prepayment
2. Create scenario investing the windfall
3. Compare 30-year outcomes
4. Make informed decision

**Considering Refinance:**
1. Create scenario with new rate/amortization
2. Compare to current scenario
3. Calculate break-even point
4. Include refinance costs

**Planning for Rate Increase (Variable Mortgage):**
1. Create scenario with higher Prime rate
2. See payment impact
3. Stress-test affordability
4. Plan response strategy

**Job Change / Income Change:**
1. Update cash flow with new income
2. All scenarios recalculate automatically
3. See impact on prepayment capacity
4. Adjust strategies accordingly

---

## Future Enhancements (Roadmap Preview)

**Coming Soon:**
- Export to PDF reports
- Multiple mortgage support
- Spouse/joint account management
- Real authentication (Replit Auth)
- Custom prepayment schedules
- Rate change notifications
- Amortization schedule table view
- Principal vs interest visualization
- Refinance scenario modeling
- Tax optimization features

---

## Support & Resources

**External Resources:**
- [Government of Canada Mortgage Calculator](https://itools-ioutils.fcac-acfc.gc.ca/MC-CH/MCCalc-CHCalc-eng.aspx)
- CMHC First-Time Buyer Programs
- Bank of Canada Prime Rate History

**App Features:**
- Demo data seeding for exploration
- Helpful empty states guide new users
- Form validation prevents errors
- Loading states show progress
- Toast notifications confirm actions

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**For**: Canadian Mortgage Strategy MVP
