# Mortgage Portability Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Mortgage portability is a unique Canadian mortgage feature that allows homeowners to transfer their existing mortgage to a new property, avoiding prepayment penalties when moving. The Mortgage Portability feature provides:

- **Penalty Avoidance:** Port mortgage to new property without paying prepayment penalties
- **Rate Preservation:** Keep existing interest rate on ported amount (if favorable)
- **Top-Up Calculation:** Calculate additional borrowing needed if new property costs more
- **Blended Rate Calculation:** Calculate blended rate when top-up is required
- **Cost Savings:** Avoid penalties that can cost thousands of dollars

### Market Context

**Canadian Mortgage Portability Market:**

- **Portability Definition:** Transfer existing mortgage to new property without penalty
- **Common Use Case:** Moving to new home (upgrade, downsizing, relocation)
- **Availability:** Most Canadian lenders offer portability (with conditions)
- **Portable Amount:** Typically up to original mortgage amount (some lenders allow current balance)
- **Top-Up Requirements:** If new property costs more, borrower may need additional financing (top-up)

**Industry Statistics:**

- Average Canadian moves every 5-7 years (portability opportunity frequent)
- Typical prepayment penalty: $1,500-$10,000 (portability saves this cost)
- Portability available: ~80% of mortgages (varies by lender)
- Top-up required: 40-50% of portability transactions (when upgrading homes)
- Portability can save thousands in penalties vs breaking mortgage

**Strategic Importance:**

- Portability is unique Canadian feature (differentiator vs international tools)
- Penalty savings provide significant value to homeowners
- Moving/migration is common homeowner lifecycle event
- Portability decisions require complex calculations (blended rates, top-ups)

### Strategic Positioning

- **Unique Canadian Feature:** Mortgage portability is Canada-specific, providing competitive differentiation
- **User Value:** Avoids prepayment penalties when moving (significant cost savings)
- **Integration Value:** Integrates with renewal workflow, refinancing analysis, and property value tracking
- **Educational Opportunity:** Raises awareness of portability option (many homeowners unaware)

---

## Domain Overview

### Portability Fundamentals

**Mortgage Portability** allows homeowners to transfer their existing mortgage from one property to another, avoiding prepayment penalties that would otherwise apply when breaking the mortgage term.

**Key Characteristics:**

1. **When Portability Occurs:**
   - Homeowner sells current property
   - Homeowner purchases new property
   - Mortgage is transferred to new property
   - No prepayment penalty applies (on ported amount)

2. **Portability Benefits:**
   - **Penalty Avoidance:** No penalty for breaking term to move
   - **Rate Preservation:** Keep existing interest rate on ported amount
   - **Flexibility:** Can move without refinancing

3. **Portability Limitations:**
   - Portable amount typically limited (original amount or current balance)
   - Must be within lender's portability window (usually within 30-90 days)
   - Top-up required if new property costs more (may have different rate)

### Portable Amount

**What Is Portable Amount?**

The **portable amount** is the maximum mortgage balance that can be transferred to the new property without penalty.

**Calculation:**

```
Portable Amount = min(Current Balance, Original Mortgage Amount, 95% of New Property Price)

Where:
  - Current Balance: Remaining mortgage balance
  - Original Mortgage Amount: Original mortgage amount at origination
  - 95% of New Property Price: Maximum LTV (loan-to-value) constraint
```

**Key Points:**

- Most lenders allow porting up to **original mortgage amount**
- Some lenders allow porting **current balance** (even if less than original)
- Cannot port more than **95% of new property value** (LTV constraint)
- Portable amount is minimum of these constraints

**Example:**

```
Current Balance: $350,000
Original Amount: $400,000
New Property Price: $500,000

Portable Amount = min($350,000, $400,000, $500,000 × 0.95)
                = min($350,000, $400,000, $475,000)
                = $350,000
```

### Top-Up Amount

**What Is Top-Up Amount?**

The **top-up amount** is the additional financing needed when the new property costs more than the old property, after accounting for equity from the old property sale.

**When Top-Up Required:**

- New property price > Old property price
- New property requires more financing than portable amount
- Borrower needs additional mortgage amount

**Calculation:**

```
Top-Up Amount = max(0, New Property Price - Old Property Price - Equity from Sale)

Where:
  Equity from Sale = Old Property Price - Current Balance
  Top-Up Amount = New Property Price - (Old Property Price + Equity) - Portable Amount
```

**Simplified Calculation:**

```
If New Property Price > Old Property Price:
  Top-Up Amount = New Property Price - Old Property Price - (Old Property Price - Current Balance)
Else:
  Top-Up Amount = 0
```

**Example:**

```
Old Property Price: $500,000
Current Balance: $350,000
New Property Price: $600,000

Equity from Sale: $500,000 - $350,000 = $150,000
Top-Up Amount: $600,000 - $500,000 - $150,000 = -$50,000 (negative, so 0)

Actually: Top-Up = $600,000 - (Old Price + Equity) - Portable
         = $600,000 - ($500,000 + $150,000) - $350,000
         = $600,000 - $650,000 - $350,000 = 0 (no top-up if equity covers difference)
```

**Top-Up Scenarios:**

1. **Upgrading (More Expensive Property):**
   - New property costs more
   - Top-up required if equity + portable amount insufficient
   - Top-up typically at current market rate (not ported rate)

2. **Same Price or Less:**
   - New property same price or less
   - No top-up required
   - May have excess equity (can be used for down payment on new property)

### Blended Rate

**What Is Blended Rate?**

The **blended rate** is the weighted average interest rate when a top-up is required, combining the ported mortgage rate with the top-up rate.

**Calculation:**

```
Blended Rate = (Ported Amount × Ported Rate + Top-Up Amount × Top-Up Rate) / Total Amount

Where:
  Total Amount = Ported Amount + Top-Up Amount
  Ported Rate = Existing mortgage rate (preserved)
  Top-Up Rate = Current market rate (for additional borrowing)
```

**Key Points:**

- Ported amount keeps **existing rate** (if favorable)
- Top-up amount gets **current market rate** (may be higher or lower)
- Blended rate is **weighted average** of both rates
- Blended rate used for total mortgage balance

**Example:**

```
Ported Amount: $350,000 at 3.5% rate
Top-Up Amount: $50,000 at 5.5% rate
Total Amount: $400,000

Blended Rate = ($350,000 × 0.035 + $50,000 × 0.055) / $400,000
             = ($12,250 + $2,750) / $400,000
             = $15,000 / $400,000
             = 3.75%
```

### Portability vs Refinancing

**Key Differences:**

1. **Portability:**
   - Transfers existing mortgage to new property
   - No prepayment penalty (on ported amount)
   - Keeps existing rate (on ported amount)
   - Must occur within portability window (30-90 days)
   - Top-up at market rate if needed

2. **Refinancing:**
   - New mortgage (breaks existing term)
   - Prepayment penalty applies
   - New interest rate (current market rate)
   - Can occur anytime
   - Single rate for entire amount

**When to Use Portability:**

- Moving to new property
- Want to avoid prepayment penalty
- Existing rate is favorable (lower than current market rate)
- Within portability window (30-90 days)

**When to Use Refinancing:**

- Not moving (staying in same property)
- Current market rate is better than existing rate
- Want to change mortgage terms
- Outside portability window

### Canadian Lender Conventions

**Portability Availability:**

- **Major Lenders:** Most offer portability (RBC, TD, BMO, Scotiabank, CIBC)
- **Conditions:** Must be within portability window (typically 30-90 days)
- **Portable Amount:** Typically up to original mortgage amount
- **Penalty:** No penalty on ported amount (penalty may apply to top-up if breaking term)

**Common Rules:**

1. **Portability Window:**
   - Must complete sale and purchase within specified window (30-90 days)
   - Some lenders require simultaneous closing
   - Window starts from sale date or mortgage break date

2. **Portable Amount:**
   - Most lenders: Up to original mortgage amount
   - Some lenders: Up to current balance
   - Maximum: 95% of new property value (LTV constraint)

3. **Top-Up Requirements:**
   - Top-up at current market rate
   - May require new term agreement
   - May have penalty if top-up breaks existing term

**Process:**

1. Homeowner sells current property
2. Homeowner purchases new property
3. Lender transfers mortgage to new property
4. Portable amount transferred (no penalty)
5. Top-up added if needed (at market rate)
6. Blended rate calculated if top-up required

---

## User Personas & Use Cases

### Persona 1: Home Mover (Avoiding Penalties)

**Profile:**
- Selling current property and buying new one
- Has mortgage with remaining term
- Wants to avoid prepayment penalty
- Moving within portability window (30-90 days)

**Use Cases:**
- Calculate portability options for new property
- Understand portable amount and top-up requirements
- Apply portability to transfer mortgage
- View portability history

**Pain Points Addressed:**
- Uncertainty about portability option
- Wanting to avoid prepayment penalty
- Need to understand portable amount
- Complexity of portability calculations

### Persona 2: Property Upgrader (Top-Up Scenario)

**Profile:**
- Buying more expensive property
- Needs additional financing (top-up)
- Wants to understand blended rate
- Evaluating portability vs refinancing

**Use Cases:**
- Calculate portability with top-up
- See blended rate calculation
- Compare portability vs refinancing
- Understand total financing required

**Pain Points Addressed:**
- Uncertainty about top-up requirements
- Need to understand blended rate
- Comparing portability vs refinancing
- Complexity of top-up calculations

### Persona 3: Strategic Planner (Portability Analysis)

**Profile:**
- Planning to move in future
- Wants to understand portability implications
- Values avoiding penalties
- Makes data-driven decisions

**Use Cases:**
- Calculate portability scenarios (different property prices)
- Understand portable amount for planning
- Evaluate portability benefits
- Plan for top-up if upgrading

**Pain Points Addressed:**
- Need for portability planning
- Wanting to understand portable amount in advance
- Uncertainty about portability eligibility
- Complexity of portability rules

---

## Feature Requirements

### Data Model Requirements

**Mortgage Portability Table:**

- `id` (UUID, primary key)
- `mortgageId` (foreign key to mortgages, cascade delete)
- `portDate` (date, required) - Date portability was applied
- `oldPropertyPrice` (decimal 12,2, required) - Price of old property
- `newPropertyPrice` (decimal 12,2, required) - Price of new property
- `portedAmount` (decimal 12,2, required) - Amount ported to new property
- `topUpAmount` (decimal 12,2, optional) - Additional amount if top-up required
- `newMortgageId` (varchar, optional) - Reference to new mortgage if created
- `description` (text, optional) - Event description
- `createdAt` (timestamp)

**Mortgage Table Fields:**

- `isPorted` (integer, default: 0) - Boolean flag: 0 = false, 1 = true
- `originalMortgageId` (varchar, optional) - Reference to original mortgage if this is ported mortgage
- `propertyPrice` (decimal 12,2) - Current property price (updated after portability)

**Indexes:**
- Index on `mortgageId` for quick lookup
- Index on `newMortgageId` for new mortgage queries
- Index on `portDate` for date-based queries

### Business Logic Requirements

**Portability Calculation:**

1. **Inputs:**
   - Mortgage ID
   - New property price
   - Optional: Port date (defaults to today)

2. **Process:**
   - Fetch mortgage (current balance, original amount, old property price)
   - Validate new property price (> 0)
   - Calculate portable amount: `min(currentBalance, originalAmount, 95% of newPropertyPrice)`
   - Calculate top-up amount (if new property > old property)
   - Determine if top-up required
   - Calculate blended rate (if top-up required)
   - Return portability result

3. **Outputs:**
   - Old property price
   - New property price
   - Portable amount
   - Top-up amount
   - Requires top-up flag (true/false)
   - Blended rate (if top-up required)
   - Can port flag (true/false)
   - Message (if cannot port)

**Portability Application:**

1. **Pre-conditions:**
   - Portability calculation successful (`canPort = true`)
   - User authorized for mortgage
   - Active term exists

2. **Process:**
   - Calculate portability (verify can port)
   - Create portability event record
   - Mark mortgage as ported (`isPorted = 1`)
   - Update mortgage `propertyPrice` to new property price
   - Update mortgage `currentBalance` if top-up required
   - Return portability event

3. **Post-conditions:**
   - Portability event saved to database
   - Mortgage marked as ported
   - Property price updated
   - Current balance updated (if top-up applied)

**Portability History:**

1. **Fetch History:**
   - Get all portability events for mortgage
   - Sort by port date (newest first)
   - Return event list

2. **History Display:**
   - Show port date
   - Show old and new property prices
   - Show portable amount
   - Show top-up amount (if applicable)

### Calculation Requirements

**Portable Amount Calculation:**

```typescript
function calculatePortability(
  currentBalance: number,
  originalMortgageAmount: number,
  oldPropertyPrice: number,
  newPropertyPrice: number
): PortabilityResult {
  // Validate inputs
  if (currentBalance <= 0) throw new Error("Balance must be > 0");
  if (originalMortgageAmount <= 0) throw new Error("Original amount must be > 0");
  if (oldPropertyPrice <= 0 || newPropertyPrice <= 0) throw new Error("Property prices must be > 0");
  
  // Calculate portable amount (minimum of constraints)
  const maxPortableAmount = Math.min(currentBalance, originalMortgageAmount);
  const ltvLimit = newPropertyPrice * 0.95; // 95% LTV maximum
  const portedAmount = Math.min(maxPortableAmount, ltvLimit);
  
  // Calculate top-up if new property is more expensive
  // Simplified: Top-up needed if new property price > old property price + equity
  const equity = oldPropertyPrice - currentBalance;
  const topUpAmount = newPropertyPrice > oldPropertyPrice
    ? Math.max(0, newPropertyPrice - oldPropertyPrice - equity)
    : 0;
  
  const requiresTopUp = topUpAmount > 0;
  
  return {
    oldPropertyPrice,
    newPropertyPrice,
    portedAmount,
    topUpAmount,
    requiresTopUp
  };
}
```

**Blended Rate Calculation:**

```typescript
function calculateBlendedRate(
  portedAmount: number,
  portedRate: number,
  topUpAmount: number,
  topUpRate: number
): number {
  if (portedAmount <= 0 && topUpAmount <= 0) return 0;
  
  const totalAmount = portedAmount + topUpAmount;
  if (totalAmount === 0) return 0;
  
  const portedWeight = portedAmount / totalAmount;
  const topUpWeight = topUpAmount / totalAmount;
  
  return (portedRate * portedWeight) + (topUpRate * topUpWeight);
}
```

### Validation Requirements

**Property Price Validation:**

- New property price must be positive (> 0)
- Old property price must be positive (> 0, from mortgage)

**Portability Eligibility Validation:**

- Mortgage must exist and be active
- Active term must exist
- Current balance must be positive
- Original amount must be positive

**Portable Amount Validation:**

- Portable amount ≤ current balance
- Portable amount ≤ original amount
- Portable amount ≤ 95% of new property price

### Integration Requirements

**Mortgage Integration:**

- Fetches mortgage (balance, original amount, property price)
- Updates mortgage after portability (property price, isPorted flag)
- Updates mortgage balance if top-up applied

**Property Value Integration:**

- Uses current property price from mortgage
- Updates property price after portability
- Links to property value tracking

**Renewal Integration:**

- Portability can occur at renewal time (alternative to refinancing)
- Portability vs refinancing comparison in renewal workflow

---

## User Stories & Acceptance Criteria

### Epic: Portability Calculation

**Story 1: Calculate Portability Options**
- **As a** homeowner
- **I want to** calculate portability options for new property
- **So that** I can understand portable amount and top-up requirements

**Acceptance Criteria:**
- ✅ Portability calculation form with new property price input
- ✅ Calculate button triggers calculation
- ✅ Results show: old property price, new property price, portable amount, top-up amount
- ✅ Results show: requires top-up flag, blended rate (if top-up required)
- ✅ Can port flag displayed (true/false)
- ✅ Error message displayed if cannot port

**Story 2: View Portability Calculation Results**
- **As a** homeowner
- **I want to** see detailed portability calculation results
- **So that** I can understand the portability scenario

**Acceptance Criteria:**
- ✅ Old and new property prices displayed
- ✅ Portable amount displayed clearly
- ✅ Top-up amount displayed (if required)
- ✅ Blended rate displayed (if top-up required)
- ✅ Results clearly formatted and easy to understand

### Epic: Portability Application

**Story 3: Apply Portability**
- **As a** homeowner
- **I want to** apply portability to transfer mortgage to new property
- **So that** I can avoid prepayment penalty

**Acceptance Criteria:**
- ✅ Apply button available after calculation
- ✅ Confirmation step before applying
- ✅ Portability applied successfully
- ✅ Mortgage marked as ported
- ✅ Property price updated to new property price
- ✅ Current balance updated if top-up applied
- ✅ Portability event created and saved

**Story 4: View Portability History**
- **As a** homeowner
- **I want to** view my portability history
- **So that** I can see past portability events

**Acceptance Criteria:**
- ✅ Portability history list displayed
- ✅ History sorted by date (newest first)
- ✅ Each event shows: date, old/new property prices, portable amount, top-up amount
- ✅ History accessible from mortgage details

### Epic: Top-Up and Blended Rate

**Story 5: Calculate Top-Up Amount**
- **As a** homeowner
- **I want to** see top-up amount if new property costs more
- **So that** I can plan additional financing

**Acceptance Criteria:**
- ✅ Top-up amount calculated when new property > old property
- ✅ Top-up amount displayed clearly
- ✅ Requires top-up flag shown
- ✅ Top-up explanation provided

**Story 6: Calculate Blended Rate**
- **As a** homeowner
- **I want to** see blended rate when top-up is required
- **So that** I can understand combined interest rate

**Acceptance Criteria:**
- ✅ Blended rate calculated when top-up required
- ✅ Blended rate displayed clearly
- ✅ Ported rate and top-up rate shown
- ✅ Blended rate calculation explained

---

## Technical Implementation Notes

### API Endpoints

**Portability Calculation:**
- `POST /api/mortgages/:id/portability/calculate` - Calculate portability options
  - Body: `{ newPropertyPrice: number, portDate?: string }`
  - Returns: `PortabilityCalculationResult` (oldPropertyPrice, newPropertyPrice, portedAmount, topUpAmount, requiresTopUp, blendedRate, canPort, message)

**Portability Application:**
- `POST /api/mortgages/:id/portability/apply` - Apply portability
  - Body: `{ newPropertyPrice: number, portDate?: string }`
  - Returns: `{ portabilityEvent, newMortgage? }`

**Portability History:**
- `GET /api/mortgages/:id/portability/history` - Get portability history
  - Returns: `MortgagePortability[]` (sorted by date, newest first)

### Database Schema

**Mortgage Portability Table:**
```sql
CREATE TABLE mortgage_portability (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  mortgage_id VARCHAR NOT NULL REFERENCES mortgages(id) ON DELETE CASCADE,
  port_date DATE NOT NULL,
  old_property_price DECIMAL(12,2) NOT NULL,
  new_property_price DECIMAL(12,2) NOT NULL,
  ported_amount DECIMAL(12,2) NOT NULL,
  top_up_amount DECIMAL(12,2),
  new_mortgage_id VARCHAR REFERENCES mortgages(id),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IDX_mortgage_portability_mortgage ON mortgage_portability(mortgage_id);
CREATE INDEX IDX_mortgage_portability_new_mortgage ON mortgage_portability(new_mortgage_id);
CREATE INDEX IDX_mortgage_portability_date ON mortgage_portability(port_date);
```

**Mortgage Table Fields:**
```sql
is_ported INTEGER DEFAULT 0, -- 0 = false, 1 = true
original_mortgage_id VARCHAR REFERENCES mortgages(id), -- Reference to original mortgage if ported
property_price DECIMAL(12,2) -- Updated after portability
```

### Service Layer

**PortabilityService:**
- `calculatePortability(mortgageId, userId, input): Promise<PortabilityCalculationResult | undefined>`
  - Calculates portability options without applying
  - Returns calculation result with canPort flag

- `applyPortability(mortgageId, userId, input): Promise<{ portabilityEvent, newMortgage? } | undefined>`
  - Applies portability (updates mortgage, creates event)
  - Returns portability event

- `getPortabilityHistory(mortgageId, userId): Promise<MortgagePortability[] | undefined>`
  - Gets all portability events for mortgage
  - Returns sorted list (newest first)

**Portability Calculation Functions:**
- `calculatePortability(currentBalance, originalMortgageAmount, oldPropertyPrice, newPropertyPrice): PortabilityResult`
  - Core portability calculation
  - Returns portable amount, top-up amount, requires top-up flag

- `calculateBlendedRate(portedAmount, portedRate, topUpAmount, topUpRate): number`
  - Calculates weighted average rate
  - Returns blended rate

### Frontend Components

**PortabilityDialog:**
- Dialog component for portability calculation and application
- Form for new property price input
- Calculate button
- Results display (portable amount, top-up, blended rate)
- Apply button (after calculation)
- Success/error handling

**PortabilityHistory:**
- Component displaying portability event history
- List of past portability events
- Event details (date, prices, amounts)
- Sorted by date (newest first)

**PortabilityResults:**
- Component displaying portability calculation results
- Property price comparison
- Portable amount highlight
- Top-up and blended rate (if applicable)
- Clear formatting

### Data Flow

**Portability Calculation Flow:**
1. User opens portability dialog
2. User enters new property price
3. User clicks "Calculate"
4. Frontend sends POST to `/api/mortgages/:id/portability/calculate`
5. Backend: `PortabilityService.calculatePortability()`
   - Fetches mortgage (balance, original amount, property price)
   - Calculates portable amount
   - Calculates top-up amount
   - Calculates blended rate (if top-up required)
   - Returns calculation result
6. Frontend displays results
7. User reviews portability options

**Portability Application Flow:**
1. User reviews calculation results
2. User clicks "Apply Portability"
3. Frontend sends POST to `/api/mortgages/:id/portability/apply`
4. Backend: `PortabilityService.applyPortability()`
   - Calculates portability (verifies can port)
   - Creates portability event
   - Marks mortgage as ported
   - Updates property price
   - Updates current balance (if top-up applied)
5. Returns portability event
6. Frontend displays success message
7. Mortgage data refreshed (property price, isPorted flag)

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Property Price Edge Cases:**

1. **New Property Price = Old Property Price:**
   - No top-up required
   - Portable amount determined by balance/original amount
   - Valid scenario

2. **New Property Price < Old Property Price:**
   - No top-up required (downsizing)
   - May have excess equity
   - Valid scenario

3. **New Property Price = 0:**
   - Invalid input
   - Validation prevents
   - Handle gracefully: Return error

**Portable Amount Edge Cases:**

1. **Current Balance > Original Amount:**
   - Should not occur (balance decreases over time)
   - Handle gracefully: Use minimum (original amount)

2. **Portable Amount > 95% of New Property:**
   - LTV constraint applies
   - Portable amount capped at 95% of new property
   - Valid constraint

3. **Portable Amount = 0:**
   - Current balance = 0 (mortgage paid off)
   - Cannot port (nothing to port)
   - Can port = false

**Top-Up Edge Cases:**

1. **Top-Up Amount = 0:**
   - New property ≤ old property + equity
   - No top-up required
   - Valid scenario

2. **Top-Up Amount Very Large:**
   - New property significantly more expensive
   - Large top-up required
   - May require additional approval (lender-dependent)

3. **Equity Exceeds New Property Price:**
   - Old property worth more, balance low
   - Excess equity available
   - No top-up, may have cash from sale

**Blended Rate Edge Cases:**

1. **No Top-Up (Top-Up Amount = 0):**
   - Blended rate = ported rate (no blending needed)
   - Handle gracefully: Return ported rate

2. **Top-Up Amount = 0:**
   - Should not calculate blended rate
   - Handle gracefully: Blended rate undefined

3. **Very Different Rates:**
   - Ported rate very low, top-up rate very high
   - Blended rate weighted average
   - Valid calculation

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid property price, invalid input
- **401 Unauthorized:** User not authenticated
- **404 Not Found:** Mortgage not found, no active term
- **500 Internal Server Error:** Calculation error, unexpected error

**Frontend Error Handling:**

- Display user-friendly error messages
- Show loading states during calculation/application
- Handle network errors gracefully
- Validate inputs before submission
- Log errors for debugging

**Calculation Error Handling:**

- Validate inputs before calculations
- Handle edge cases (zero balance, zero property price, etc.)
- Return appropriate error messages
- Use safe defaults where appropriate
- Log calculation errors for debugging

---

## Testing Considerations

### Unit Tests

**Portability Calculation Tests:**
- `calculatePortability()`: Basic calculation (same price property)
- `calculatePortability()`: Upgrading (new property more expensive, top-up required)
- `calculatePortability()`: Downsizing (new property less expensive, no top-up)
- `calculatePortability()`: Validation - zero balance (error)
- `calculatePortability()`: Validation - zero property price (error)
- `calculateBlendedRate()`: Basic blended rate calculation
- `calculateBlendedRate()`: No top-up (ported rate only)

**PortabilityService Tests:**
- `calculatePortability()`: Complete calculation flow
- `calculatePortability()`: No active term (error)
- `calculatePortability()`: Invalid property price (error)
- `applyPortability()`: Complete application flow
- `applyPortability()`: Cannot port (error)
- `getPortabilityHistory()`: Returns history sorted by date

### Integration Tests

**Portability Calculation API:**
- Calculate portability with valid property price
- Calculate portability with invalid property price (error)
- Calculate portability without active term (error)
- Verify calculation results accuracy

**Portability Application API:**
- Apply portability successfully
- Verify mortgage marked as ported
- Verify property price updated
- Verify current balance updated (if top-up applied)
- Verify portability event created
- Apply portability when cannot port (error)

**Portability History API:**
- Get portability history for mortgage
- Verify history sorted correctly (newest first)
- Verify history includes all events

### End-to-End Tests

**Portability Workflow E2E:**
1. User opens portability dialog
2. User enters new property price
3. User clicks "Calculate"
4. Results displayed (portable amount, top-up, blended rate)
5. User clicks "Apply Portability"
6. Portability applied successfully
7. Mortgage marked as ported
8. Property price updated
9. Portability event created
10. User views portability history
11. New portability event visible in history

**Top-Up Scenario E2E:**
1. User calculates portability for more expensive property
2. Top-up amount calculated
3. Blended rate calculated
4. Results show top-up and blended rate
5. User applies portability
6. Mortgage balance updated (includes top-up)
7. Portability event includes top-up amount

---

## Future Enhancements

### Known Limitations

1. **Top-Up Rate:**
   - Currently assumes same rate as ported amount
   - Should fetch current market rate for top-up
   - Could add market rate integration

2. **Portability Window:**
   - Currently not tracked
   - Could add portability window validation
   - Could add window expiration warnings

3. **New Mortgage Creation:**
   - Currently updates existing mortgage
   - Could create separate mortgage record for ported mortgage
   - Could link original and new mortgages

### Potential Improvements

**Enhanced Analysis:**
- Portability vs refinancing comparison
- Portability cost-benefit analysis (penalty savings vs blended rate impact)
- Portability impact on amortization
- Multiple property scenarios

**Advanced Features:**
- Portability window tracking
- Portability eligibility checker
- Portability calculator (standalone tool)
- Portability educational content

**Integration Enhancements:**
- Portability in renewal workflow (portability vs refinancing comparison)
- Portability projections over time
- Portability optimization recommendations
- Integration with property value tracking

---

**End of Feature Specification**

