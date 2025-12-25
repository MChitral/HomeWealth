# HELOC & Re-advanceable Mortgages Feature Specification

**Document Version:** 1.0  
**Date:** December 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Home Equity Lines of Credit (HELOC) and Re-advanceable Mortgages represent advanced mortgage products that enable Canadian homeowners to access their home equity for strategic financial purposes. While not core mortgage tracking features, these products are essential for:

- **Advanced Financial Strategies:** Enabling sophisticated tax-optimization strategies like the Smith Maneuver
- **Flexible Equity Access:** Allowing homeowners to borrow against accumulated equity for investments, home improvements, or other purposes
- **Competitive Differentiation:** Positioning the application as a comprehensive mortgage strategy tool beyond basic tracking

### Market Context

**Canadian HELOC Market:**

- HELOCs are widely available from major Canadian banks and credit unions
- Typical credit limits: 65-80% of home value (combined with mortgage)
- Interest rates: Prime + spread (typically Prime + 0.5% to Prime + 2.5%)
- Interest-only payment options are standard
- Revolving credit structure (borrow, repay, borrow again)

**Re-advanceable Mortgages:**

- Niche product offered by select lenders (Manulife One, CIBC Home Power Plan, etc.)
- Combines mortgage and HELOC in single account
- Automatic credit room increase as principal is paid down
- Less common but valuable for specific user segments

### Strategic Positioning

- **Foundation Feature:** HELOC support is a prerequisite for advanced strategies (Smith Maneuver)
- **Premium Capability:** Enables sophisticated financial planning beyond basic mortgage tracking
- **User Segmentation:** Appeals to financially sophisticated homeowners seeking tax optimization
- **Market Differentiation:** Few mortgage tools offer comprehensive HELOC modeling

---

## Domain Overview

### HELOC Fundamentals

**Home Equity Line of Credit (HELOC)** is a revolving line of credit secured by home equity. Key characteristics:

1. **Credit Limit Calculation:**
   - Based on home value and current mortgage balance
   - Formula: `(Home Value × Maximum LTV) - Mortgage Balance`
   - Maximum LTV typically 65-80% (combined mortgage + HELOC)
   - Credit limit increases as mortgage principal is paid down

2. **Interest Rate Structure:**
   - Variable rate: Prime + spread
   - Spread typically ranges from +0.5% to +2.5%
   - Rate adjusts with Bank of Canada Prime Rate changes
   - Interest calculated daily, compounded monthly

3. **Payment Structure:**
   - Interest-only payments (minimum payment)
   - Optional principal payments
   - Revolving credit: Borrow, repay, borrow again
   - No fixed amortization period

4. **Revolving Credit Behavior:**
   - Available credit = Credit limit - Current balance
   - Borrowing increases balance, reduces available credit
   - Repayments increase available credit
   - Can borrow up to credit limit repeatedly

### Re-advanceable Mortgage Mechanics

**Re-advanceable Mortgages** combine a traditional mortgage with a HELOC in a single account structure:

1. **Integrated Account:**
   - Single account for mortgage and HELOC
   - Principal payments automatically increase HELOC credit room
   - No separate HELOC application required

2. **Automatic Credit Room:**
   - As mortgage principal decreases, HELOC credit limit increases
   - Credit room = `(Home Value × Max LTV) - Remaining Mortgage Balance`
   - Credit room updates automatically with each principal payment

3. **Re-borrowing:**
   - Can borrow from increased credit room immediately
   - No separate approval process
   - Seamless access to equity

4. **Lender-Specific Rules:**
   - Each lender has specific terms and conditions
   - Maximum LTV limits vary (typically 65-80%)
   - Interest rate structures may differ
   - Payment allocation rules (principal vs. interest) vary

### Integration with Mortgage Prepayments

**Critical Integration Point:**

- Mortgage prepayments reduce principal balance
- Reduced principal increases home equity
- Increased equity increases HELOC credit limit
- Available credit room = `Credit Limit - Current HELOC Balance`

**Example Flow:**

1. Home value: $500,000
2. Mortgage balance: $400,000
3. HELOC credit limit: `($500,000 × 0.65) - $400,000 = $75,000`
4. User makes $10,000 prepayment
5. New mortgage balance: $390,000
6. New HELOC credit limit: `($500,000 × 0.65) - $390,000 = $85,000`
7. Credit room increased by $10,000

### Canadian Lender Conventions

**Standard HELOC Features:**

- Prime + spread pricing (variable rate)
- Interest-only minimum payments
- Revolving credit structure
- Maximum LTV: 65-80% combined
- No fixed term (open-ended credit)

**Re-advanceable Mortgage Providers:**

- Manulife One (Manulife Bank)
- CIBC Home Power Plan
- TD FlexLine
- Scotiabank STEP (Selective Total Equity Plan)
- BMO ReadiLine

**Regulatory Constraints:**

- OSFI guidelines for maximum LTV
- Stress test requirements for new HELOC applications
- Interest rate disclosure requirements
- Payment minimum requirements

---

## User Personas & Use Cases

### Persona 1: HELOC Owner

**Profile:**

- Existing homeowner with active HELOC
- Uses HELOC for home improvements, investments, or cash flow management
- Wants to track HELOC balance, credit limit, and interest costs

**Use Cases:**

- Track HELOC balance and available credit
- Monitor interest costs
- Plan borrowing and repayment strategies
- Understand impact of mortgage prepayments on credit limit

### Persona 2: HELOC Considerer

**Profile:**

- Homeowner considering opening a HELOC
- Evaluating HELOC for home improvements or investments
- Needs to understand credit limit and costs

**Use Cases:**

- Calculate potential HELOC credit limit
- Model interest costs under different scenarios
- Compare HELOC costs to other financing options
- Understand impact on overall debt structure

### Persona 3: Re-advanceable Mortgage Holder

**Profile:**

- Homeowner with re-advanceable mortgage product
- Wants to track automatic credit room increases
- Plans to use increased credit room for investments or expenses

**Use Cases:**

- Track automatic credit room increases
- Model re-borrowing scenarios
- Understand total available credit
- Plan strategic use of credit room

### Persona 4: Smith Maneuver Practitioner

**Profile:**

- Sophisticated investor using tax-optimization strategy
- Requires HELOC for Smith Maneuver implementation
- Needs accurate HELOC tracking for tax deduction calculations

**Use Cases:**

- Track HELOC borrowing for investment purposes
- Calculate HELOC interest for tax deductions
- Model credit room increases from prepayments
- Integrate HELOC data with investment tracking

---

## Feature Requirements - HELOC

### Data Model Requirements

**HELOC Account Table:**

- User ID (foreign key)
- HELOC account name/identifier
- Lender name
- Credit limit (calculated or manual)
- Maximum LTV percentage
- Interest rate spread (Prime + X%)
- Home value reference (for credit limit calculation)
- Associated mortgage ID (for credit limit calculation)
- Account opening date
- Account status (active, closed, suspended)

**HELOC Transactions Table:**

- HELOC account ID (foreign key)
- Transaction date
- Transaction type (borrowing, repayment, interest payment, interest accrual)
- Transaction amount
- Balance after transaction
- Available credit after transaction
- Interest rate at time of transaction
- Prime rate at time of transaction
- Notes/description

**HELOC Interest Calculations:**

- Daily interest calculation
- Monthly compounding
- Interest-only payment tracking
- Accrued interest tracking

### Credit Limit Calculation Logic

**Primary Formula:**

```
Credit Limit = (Home Value × Maximum LTV) - Mortgage Balance
```

**Calculation Rules:**

1. **Home Value Source:**
   - User-provided current home value
   - Optional: Property value tracking over time
   - Default to original property price if not updated

2. **Maximum LTV:**
   - User-configurable (typically 65-80%)
   - Lender-specific default values
   - Can vary by lender and product type

3. **Mortgage Balance:**
   - Current mortgage balance from mortgage tracking
   - Real-time balance from payment history
   - Includes all associated mortgages if multiple

4. **Credit Limit Updates:**
   - Recalculate on mortgage prepayment
   - Recalculate on home value update
   - Recalculate on mortgage payment
   - Display available credit = Credit Limit - Current Balance

### Interest Rate Modeling

**Rate Structure:**

- Variable rate: Prime + Spread
- Prime rate from Bank of Canada (already tracked in system)
- Spread: User-configurable (typically +0.5% to +2.5%)
- Rate updates automatically with Prime rate changes

**Interest Calculation:**

- Daily interest: `(Balance × Daily Rate)`
- Daily rate: `(Prime + Spread) / 365`
- Monthly compounding
- Interest accrues daily, compounds monthly

**Interest Payment Options:**

- Interest-only (minimum payment)
- Interest + principal (optional)
- Full payment (pay down balance)

### Payment Tracking

**Payment Types:**

1. **Interest-Only Payment:**
   - Minimum required payment
   - Covers accrued interest only
   - Does not reduce principal balance

2. **Interest + Principal Payment:**
   - Optional payment
   - Reduces principal balance
   - Increases available credit

3. **Full Payment:**
   - Pays entire balance
   - Maximizes available credit
   - Resets to zero balance

**Payment Tracking Requirements:**

- Record payment date and amount
- Update balance after payment
- Track payment type (interest-only, principal, full)
- Calculate available credit after payment

### Revolving Credit Behavior

**Borrowing:**

- User can borrow up to available credit limit
- Borrowing increases balance
- Borrowing decreases available credit
- Track borrowing date, amount, and purpose (optional)

**Repayment:**

- User can repay any amount (minimum = interest-only)
- Repayment decreases balance
- Repayment increases available credit
- Track repayment date and amount

**Re-borrowing:**

- After repayment, user can borrow again
- Available credit = Credit Limit - Current Balance
- No restrictions on re-borrowing (within credit limit)

### Integration with Mortgage Prepayments

**Automatic Credit Limit Updates:**

- When mortgage prepayment is recorded, recalculate HELOC credit limit
- New credit limit = `(Home Value × Max LTV) - New Mortgage Balance`
- Available credit increases by prepayment amount (if HELOC balance unchanged)
- Notify user of increased credit room

**Prepayment Impact Display:**

- Show current credit limit
- Show projected credit limit after prepayment
- Show credit room increase from prepayment
- Display in prepayment planning tools

---

## Feature Requirements - Re-advanceable Mortgages

### Data Model Requirements

**Re-advanceable Mortgage Flag:**

- Add flag to mortgage table: `isReAdvanceable` (boolean)
- Link to HELOC account (if separate HELOC component)
- Store lender-specific re-advanceable product type

**Credit Room Tracking:**

- Current credit room (available to borrow)
- Maximum credit room (based on LTV limits)
- Credit room history (track increases over time)
- Automatic credit room updates on principal payments

### Automatic Credit Room Increase

**Update Triggers:**

- Regular mortgage payment (principal portion)
- Mortgage prepayment (full amount)
- Principal-only payment
- Any transaction that reduces mortgage principal

**Calculation:**

```
Credit Room = (Home Value × Maximum LTV) - Remaining Mortgage Balance
```

**Update Rules:**

1. Calculate credit room after each principal-reducing transaction
2. Store credit room snapshot with transaction
3. Display credit room increase notification
4. Update available credit for borrowing

### Re-borrowing Functionality

**Borrowing from Credit Room:**

- User can borrow from increased credit room
- Borrowing amount cannot exceed available credit room
- Borrowing creates HELOC transaction
- Borrowing increases HELOC balance
- Borrowing reduces available credit room

**Transaction Flow:**

1. Mortgage payment reduces principal
2. Credit room automatically increases
3. User can immediately borrow from increased credit room
4. Borrowing recorded as HELOC transaction
5. Available credit room decreases by borrowing amount

### HELOC Integration Requirements

**For Re-advanceable Mortgages:**

- HELOC component is automatically linked to mortgage
- Credit limit updates automatically with principal payments
- No separate HELOC application required
- Single account structure (mortgage + HELOC combined)

**For Separate HELOC Accounts:**

- HELOC can be linked to mortgage for credit limit calculation
- Credit limit updates when linked mortgage principal decreases
- Multiple HELOCs can be linked to same mortgage
- Each HELOC has independent balance and transactions

---

## Business Rules & Domain Logic

### Credit Limit Formulas

**Standard HELOC:**

```
Credit Limit = (Home Value × Maximum LTV) - Mortgage Balance
Available Credit = Credit Limit - HELOC Balance
```

**Re-advanceable Mortgage:**

```
Credit Room = (Home Value × Maximum LTV) - Remaining Mortgage Balance
Available Credit = Credit Room - HELOC Balance (if any)
```

**Multiple Mortgages:**

```
Total Credit Limit = (Home Value × Maximum LTV) - Sum of All Mortgage Balances
```

### HELOC Interest Calculations

**Daily Interest:**

```
Daily Interest = Balance × (Prime Rate + Spread) / 365
```

**Monthly Interest:**

```
Monthly Interest = Sum of Daily Interest for the Month
```

**Interest-Only Payment:**

```
Minimum Payment = Accrued Interest for the Period
```

**Interest Compounding:**

- Interest compounds monthly
- Unpaid interest is added to principal balance
- Compounding occurs on monthly statement date

### Payment Minimums and Options

**Minimum Payment:**

- Interest-only payment required
- Covers accrued interest for the period
- Does not reduce principal balance

**Optional Payments:**

- Interest + Principal (any amount above minimum)
- Full payment (entire balance)
- Partial principal payment

**Payment Allocation:**

1. First: Pay accrued interest
2. Remaining: Reduce principal balance
3. Principal reduction increases available credit

### Re-advanceable Credit Room Updates

**Update Frequency:**

- Real-time: After each principal-reducing transaction
- Automatic: No user action required
- Immediate: Credit room available immediately after principal payment

**Update Calculation:**

```
Old Credit Room = (Home Value × Max LTV) - Old Mortgage Balance
New Credit Room = (Home Value × Max LTV) - New Mortgage Balance
Credit Room Increase = New Credit Room - Old Credit Room
```

**Notification:**

- Display credit room increase after prepayment
- Show available credit for borrowing
- Highlight automatic nature of increase

### Canadian Regulatory Constraints

**Maximum LTV Limits:**

- Combined mortgage + HELOC typically 65-80% of home value
- Varies by lender and product type
- OSFI guidelines for insured mortgages
- Stress test requirements for new applications

**Interest Rate Disclosure:**

- Must display current interest rate
- Must show Prime rate and spread
- Must indicate variable rate nature
- Must show rate change history

**Payment Requirements:**

- Minimum payment (interest-only) must be clearly stated
- Payment due dates must be tracked
- Late payment consequences must be disclosed

**Regulatory Compliance:**

- Educational tool positioning (not financial advice)
- Clear disclaimers about credit risks
- Information accuracy requirements
- User responsibility for lender verification

---

## User Stories & Acceptance Criteria

### User Story 1: Create HELOC Account

**As a** homeowner with a HELOC  
**I want to** add my HELOC account to the system  
**So that** I can track my HELOC balance and credit limit

**Acceptance Criteria:**

- [ ] User can create a new HELOC account
- [ ] User can enter HELOC account name/identifier
- [ ] User can select or enter lender name
- [ ] User can link HELOC to existing mortgage (for credit limit calculation)
- [ ] User can set maximum LTV percentage (default: 65%)
- [ ] User can set interest rate spread (Prime + X%)
- [ ] User can enter current HELOC balance
- [ ] System calculates credit limit based on home value and mortgage balance
- [ ] System displays available credit (credit limit - balance)
- [ ] HELOC account appears in user's account list

### User Story 2: Track HELOC Balance and Credit Limit

**As a** HELOC account holder  
**I want to** see my current balance and available credit  
**So that** I know how much I can borrow

**Acceptance Criteria:**

- [ ] System displays current HELOC balance
- [ ] System displays credit limit
- [ ] System displays available credit (credit limit - balance)
- [ ] System displays current interest rate (Prime + spread)
- [ ] System shows credit utilization percentage
- [ ] Credit limit updates automatically when mortgage balance changes
- [ ] Credit limit updates when home value is updated
- [ ] Historical credit limit changes are tracked

### User Story 3: Make HELOC Payments

**As a** HELOC account holder  
**I want to** record HELOC payments  
**So that** I can track my balance and interest costs

**Acceptance Criteria:**

- [ ] User can record interest-only payment
- [ ] User can record interest + principal payment
- [ ] User can record full payment (pay entire balance)
- [ ] System calculates accrued interest for the period
- [ ] System updates balance after payment
- [ ] System updates available credit after payment
- [ ] System tracks payment date and amount
- [ ] Payment history is displayed in transaction list
- [ ] Interest costs are tracked and displayed

### User Story 4: Borrow from HELOC

**As a** HELOC account holder  
**I want to** record HELOC borrowings  
**So that** I can track my balance and available credit

**Acceptance Criteria:**

- [ ] User can record HELOC borrowing transaction
- [ ] System validates borrowing amount does not exceed available credit
- [ ] System updates balance after borrowing
- [ ] System updates available credit after borrowing
- [ ] System tracks borrowing date and amount
- [ ] User can optionally enter borrowing purpose/description
- [ ] Borrowing transaction appears in transaction history
- [ ] System calculates interest on new balance

### User Story 5: Model Re-advanceable Mortgage Behavior

**As a** re-advanceable mortgage holder  
**I want to** see automatic credit room increases  
**So that** I can plan my borrowing strategy

**Acceptance Criteria:**

- [ ] User can mark mortgage as re-advanceable
- [ ] System automatically calculates credit room after each principal payment
- [ ] System displays credit room increase after prepayment
- [ ] System shows available credit for borrowing
- [ ] Credit room updates are automatic (no manual calculation)
- [ ] Credit room history is tracked over time
- [ ] User can see credit room increase from each payment
- [ ] System integrates credit room with HELOC borrowing functionality

### User Story 6: Integration with Mortgage Prepayments

**As a** homeowner with HELOC  
**I want to** see how prepayments increase my credit limit  
**So that** I can make informed prepayment decisions

**Acceptance Criteria:**

- [ ] When user records mortgage prepayment, system recalculates HELOC credit limit
- [ ] System displays current credit limit before prepayment
- [ ] System displays projected credit limit after prepayment
- [ ] System shows credit room increase from prepayment
- [ ] Credit limit update is automatic and immediate
- [ ] Available credit increases by prepayment amount (if HELOC balance unchanged)
- [ ] Prepayment planning tools show HELOC credit limit impact
- [ ] User can see long-term credit limit projections

---

## UI/UX Requirements (High-Level)

### HELOC Dashboard/Overview

**Key Elements:**

- Current HELOC balance (prominent display)
- Credit limit and available credit
- Current interest rate (Prime + spread)
- Credit utilization percentage (visual indicator)
- Recent transactions (last 5-10)
- Quick actions (borrow, make payment)

**Visual Design:**

- Card-based layout
- Color-coded credit utilization (green/yellow/red)
- Clear separation of balance vs. available credit
- Responsive design for mobile and desktop

### Credit Limit Visualization

**Display Components:**

- Credit limit gauge/chart
- Available credit vs. used credit
- Credit utilization percentage
- Historical credit limit trend (if applicable)
- Impact of mortgage prepayments on credit limit

**Interactive Elements:**

- Hover tooltips explaining calculations
- Click to see credit limit calculation details
- Projection of credit limit changes from prepayments

### Transaction History

**Transaction List:**

- Date, type, amount, balance after transaction
- Filter by transaction type (borrowing, repayment, interest)
- Sort by date (newest first)
- Search functionality
- Export to CSV option

**Transaction Details:**

- Transaction date and time
- Transaction type and amount
- Balance before and after
- Available credit before and after
- Interest rate at time of transaction
- Notes/description (if provided)

### Integration Points with Mortgage Tracking

**Mortgage Detail Page:**

- Display linked HELOC accounts
- Show credit limit impact of prepayments
- Link to HELOC dashboard

**Prepayment Planning:**

- Show HELOC credit limit increase from prepayment
- Display available credit after prepayment
- Include HELOC in scenario comparisons

**Payment History:**

- Link to HELOC transactions if applicable
- Show credit limit changes from mortgage payments

---

## Data Model Specifications

### HELOC Account Table Schema

```sql
heloc_accounts (
  id: VARCHAR (primary key)
  user_id: VARCHAR (foreign key → users.id)
  mortgage_id: VARCHAR (foreign key → mortgages.id, nullable)
  account_name: VARCHAR
  lender_name: VARCHAR
  credit_limit: DECIMAL(12, 2) -- Calculated or manual override
  max_ltv_percent: DECIMAL(5, 2) -- e.g., 65.00
  interest_spread: DECIMAL(5, 3) -- e.g., 0.500 (Prime + 0.5%)
  current_balance: DECIMAL(12, 2)
  home_value_reference: DECIMAL(12, 2) -- Snapshot for credit limit calc
  account_opening_date: DATE
  account_status: VARCHAR -- 'active', 'closed', 'suspended'
  is_re_advanceable: INTEGER -- boolean (0/1)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

### HELOC Transactions Table Schema

```sql
heloc_transactions (
  id: VARCHAR (primary key)
  heloc_account_id: VARCHAR (foreign key → heloc_accounts.id)
  transaction_date: DATE
  transaction_type: VARCHAR -- 'borrowing', 'repayment', 'interest_payment', 'interest_accrual'
  transaction_amount: DECIMAL(12, 2)
  balance_before: DECIMAL(12, 2)
  balance_after: DECIMAL(12, 2)
  available_credit_before: DECIMAL(12, 2)
  available_credit_after: DECIMAL(12, 2)
  interest_rate: DECIMAL(5, 3) -- Prime + spread at time of transaction
  prime_rate: DECIMAL(5, 3) -- Prime rate at time of transaction
  description: TEXT (nullable)
  created_at: TIMESTAMP
)
```

### Mortgage Table Extension

**Add to existing `mortgages` table:**

```sql
is_re_advanceable: INTEGER -- boolean (0/1), default 0
re_advanceable_heloc_id: VARCHAR (foreign key → heloc_accounts.id, nullable)
```

### Relationships

- One user can have multiple HELOC accounts
- One HELOC account can be linked to one mortgage (for credit limit calculation)
- One mortgage can have multiple linked HELOCs
- Re-advanceable mortgage has one associated HELOC account
- HELOC transactions belong to one HELOC account

---

## Calculation Engine Requirements

### HELOC Interest Calculations

**Daily Interest Calculation:**

```typescript
function calculateDailyInterest(balance: number, primeRate: number, spread: number): number {
  const annualRate = (primeRate + spread) / 100;
  const dailyRate = annualRate / 365;
  return balance * dailyRate;
}
```

**Monthly Interest Calculation:**

```typescript
function calculateMonthlyInterest(
  balance: number,
  primeRate: number,
  spread: number,
  daysInMonth: number
): number {
  const dailyInterest = calculateDailyInterest(balance, primeRate, spread);
  return dailyInterest * daysInMonth;
}
```

**Interest Compounding:**

- Interest accrues daily
- Compounds monthly (added to balance on statement date)
- Unpaid interest increases principal balance

### Credit Limit Recalculation on Prepayment

**Trigger:**

- Mortgage prepayment recorded
- Mortgage principal payment recorded
- Home value updated

**Calculation:**

```typescript
function recalculateCreditLimit(
  homeValue: number,
  maxLTV: number,
  mortgageBalance: number
): number {
  const maxCombinedDebt = homeValue * (maxLTV / 100);
  return maxCombinedDebt - mortgageBalance;
}
```

**Update Flow:**

1. Detect mortgage balance change
2. Recalculate credit limit for all linked HELOCs
3. Update available credit (credit limit - current balance)
4. Notify user of credit limit increase (if applicable)
5. Store credit limit history

### Available Credit Room Tracking

**Calculation:**

```typescript
function calculateAvailableCredit(creditLimit: number, currentBalance: number): number {
  return Math.max(0, creditLimit - currentBalance);
}
```

**Tracking Requirements:**

- Calculate after each transaction
- Store in transaction record
- Display in dashboard
- Update in real-time

---

## Integration Points

### Mortgage Prepayment → HELOC Credit Room Increase

**Integration Flow:**

1. User records mortgage prepayment
2. System updates mortgage balance
3. System identifies linked HELOC accounts
4. System recalculates credit limit for each linked HELOC
5. System updates available credit
6. System displays credit room increase notification
7. User can immediately see increased borrowing capacity

**Technical Implementation:**

- Event-driven: Prepayment event triggers credit limit recalculation
- Real-time: Updates occur immediately
- Transactional: All updates in single transaction
- Notification: User sees credit limit change

### Home Value Updates → Credit Limit Recalculation

**Integration Flow:**

1. User updates home value (property appreciation)
2. System recalculates credit limit for all HELOCs
3. System updates available credit
4. System displays credit limit increase

**Update Triggers:**

- Manual home value update
- Property value tracking (if implemented)
- Home improvement value addition

### Prime Rate Changes → HELOC Interest Rate Updates

**Integration Flow:**

1. System tracks Bank of Canada Prime Rate (already implemented)
2. Prime rate change detected
3. System updates HELOC interest rates (Prime + spread)
4. System recalculates interest for current balance
5. System displays rate change notification

**Technical Implementation:**

- Leverage existing prime rate tracking
- Automatic rate updates for all HELOC accounts
- Interest calculations use current rate
- Historical rate tracking in transactions

---

## Edge Cases & Constraints

### Maximum LTV Limits

**Constraint:**

- Combined mortgage + HELOC typically limited to 65-80% of home value
- Varies by lender and product type
- OSFI guidelines for insured mortgages

**Handling:**

- Validate credit limit does not exceed maximum LTV
- Warn user if approaching LTV limit
- Prevent borrowing that would exceed LTV limit
- Display LTV percentage in dashboard

### Interest-Only Payment Minimums

**Constraint:**

- Minimum payment = accrued interest
- Payment must cover all accrued interest
- Unpaid interest compounds (added to balance)

**Handling:**

- Calculate minimum payment = accrued interest
- Validate payment amount >= minimum
- Warn if payment is less than minimum
- Auto-calculate interest-only payment amount

### Credit Limit Caps

**Constraint:**

- Some lenders cap HELOC credit limit regardless of equity
- Maximum credit limit may be lower than calculated limit
- User may need to manually set credit limit cap

**Handling:**

- Allow manual credit limit override
- Support credit limit caps
- Display both calculated and actual credit limit
- Warn if calculated limit exceeds cap

### Re-advanceable Lender-Specific Rules

**Constraint:**

- Each lender has specific re-advanceable product rules
- Maximum LTV may vary
- Interest rate structures may differ
- Payment allocation rules vary

**Handling:**

- Support lender-specific configuration
- Allow customization of re-advanceable rules
- Document lender-specific behaviors
- Provide defaults for common lenders

### Multiple HELOCs

**Constraint:**

- User may have multiple HELOC accounts
- Each HELOC has independent balance and credit limit
- Combined HELOCs share maximum LTV limit

**Handling:**

- Support multiple HELOC accounts per user
- Calculate combined credit limit
- Track each HELOC independently
- Display aggregate view and individual accounts

### Home Value Uncertainty

**Constraint:**

- Home value may be uncertain or outdated
- Property appreciation not automatically tracked
- User must manually update home value

**Handling:**

- Default to original property price if not updated
- Allow manual home value updates
- Warn if home value appears outdated
- Support property value tracking (future enhancement)

---

## Success Metrics

### User Adoption Targets

**Primary Metrics:**

- Percentage of users with HELOCs who add HELOC accounts
- Number of HELOC accounts created per month
- Active HELOC account usage (transactions recorded)

**Target Goals:**

- 30% of users with HELOCs add accounts within 3 months
- 50% of HELOC accounts have at least one transaction per month
- 20% of HELOC accounts used for Smith Maneuver modeling

### Feature Usage Patterns

**Usage Metrics:**

- Frequency of credit limit checks
- Frequency of transaction recording
- Prepayment planning usage with HELOC integration
- Re-advanceable mortgage feature adoption

**Analysis:**

- Track which features are most used
- Identify user segments (Smith Maneuver vs. general HELOC users)
- Monitor integration usage (prepayment → credit limit)

### Prerequisite for Smith Maneuver Adoption

**Success Indicator:**

- HELOC feature adoption enables Smith Maneuver feature
- Users with HELOC accounts more likely to use Smith Maneuver
- HELOC tracking accuracy supports tax deduction calculations

**Measurement:**

- Track HELOC → Smith Maneuver conversion rate
- Monitor HELOC data quality for Smith Maneuver modeling
- Measure user satisfaction with HELOC tracking

---

## Implementation Phases

### Phase 1: HELOC Core Functionality

**Duration:** 4-6 months

**Deliverables:**

- HELOC data model (accounts and transactions)
- Credit limit calculation engine
- Interest calculation engine
- Basic HELOC dashboard
- Transaction recording (borrowing and payments)
- Integration with mortgage prepayments

**Priority Features:**

- Create and manage HELOC accounts
- Track balance and credit limit
- Record transactions
- Calculate interest
- Display available credit

### Phase 2: Re-advanceable Mortgage Support

**Duration:** 2-3 months (after Phase 1)

**Deliverables:**

- Re-advanceable mortgage flag and configuration
- Automatic credit room calculation
- Credit room increase notifications
- Re-borrowing functionality
- Lender-specific re-advanceable rules

**Priority Features:**

- Mark mortgage as re-advanceable
- Automatic credit room updates
- Display credit room increases
- Support re-borrowing from credit room

### Phase 3: Advanced Integrations

**Duration:** 2-3 months (after Phase 2)

**Deliverables:**

- Advanced credit limit projections
- Prepayment planning with HELOC impact
- Multiple HELOC account management
- HELOC scenario modeling
- Integration with Smith Maneuver feature

**Priority Features:**

- Credit limit projections in prepayment planning
- Scenario comparisons including HELOC
- Multiple HELOC account aggregation
- Advanced reporting and analytics

---

## Dependencies

### Prerequisites

**Required:**

- Mortgage tracking system (already implemented)
- Prime rate tracking (already implemented)
- Payment tracking infrastructure (already implemented)

**Optional but Beneficial:**

- Home value tracking (future enhancement)
- Property appreciation modeling (future enhancement)

### Blocks Other Features

**Smith Maneuver Feature:**

- Requires HELOC support (this feature)
- Cannot implement Smith Maneuver without HELOC tracking

**Advanced Tax Strategies:**

- Requires HELOC support for tax deduction calculations
- Enables sophisticated financial planning features

---

## Risk Considerations

### Technical Risks

**Data Accuracy:**

- Credit limit calculations depend on accurate home value
- Interest calculations must be precise for tax purposes
- Transaction tracking must be complete and accurate

**Mitigation:**

- Clear user guidance on home value updates
- Validation of credit limit calculations
- Comprehensive testing of interest calculations
- Transaction audit trail

### User Experience Risks

**Complexity:**

- HELOC concepts may be unfamiliar to some users
- Re-advanceable mortgages are niche products
- Integration with prepayments adds complexity

**Mitigation:**

- Clear educational content
- Intuitive UI design
- Step-by-step guidance
- Help documentation

### Regulatory Risks

**Compliance:**

- Must not provide financial advice
- Must clearly position as educational tool
- Must include appropriate disclaimers

**Mitigation:**

- Clear disclaimers throughout
- Educational positioning
- Professional advice recommendations
- Regular compliance review

---

## Future Enhancements

### Potential Additions

1. **Property Value Tracking:**
   - Automatic home value updates
   - Property appreciation modeling
   - Market value estimates

2. **HELOC Comparison Tools:**
   - Compare HELOC offers from different lenders
   - Rate comparison calculators
   - Cost analysis tools

3. **Advanced Analytics:**
   - HELOC usage patterns
   - Interest cost projections
   - Credit utilization trends

4. **Bank Integration:**
   - Automatic HELOC transaction import
   - Real-time balance synchronization
   - Transaction categorization

---

## Conclusion

HELOC and Re-advanceable Mortgage support represents a strategic enhancement that enables advanced financial strategies while maintaining focus on core mortgage tracking. The feature provides foundation for sophisticated tax-optimization strategies like the Smith Maneuver, while serving users who need comprehensive home equity management.

**Key Success Factors:**

- Accurate credit limit calculations
- Seamless integration with mortgage prepayments
- Clear user experience for complex financial products
- Strong foundation for advanced strategy modeling

**Strategic Value:**

- Enables premium features (Smith Maneuver)
- Differentiates from basic mortgage tracking tools
- Appeals to sophisticated financial planners
- Supports comprehensive wealth optimization strategies
