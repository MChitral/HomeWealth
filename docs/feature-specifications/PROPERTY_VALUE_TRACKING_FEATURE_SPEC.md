# Property Value Tracking Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Property value tracking is essential for HELOC (Home Equity Line of Credit) management and wealth forecasting. Accurate property value tracking enables:

- **HELOC Credit Limit Updates:** Credit limits are based on Loan-to-Value (LTV) ratios, so property value changes directly impact available credit
- **Wealth Tracking:** Property value appreciation contributes to net worth growth
- **Equity Analysis:** Understanding home equity position relative to mortgage balance
- **Refinancing Decisions:** Property value growth creates refinancing opportunities
- **Market Trend Analysis:** Tracking property value trends over time
- **Investment Insights:** Property value appreciation vs mortgage paydown analysis

### Market Context

**Canadian Real Estate Market:**

- **Property Appreciation:** Average 3-5% annual appreciation (varies by region)
- **HELOC Credit Limits:** Typically 65-80% LTV (combined mortgage + HELOC)
- **Property Assessment:** Municipal assessments updated annually
- **Property Appraisals:** Professional appraisals required for HELOC applications and refinancing
- **Market Volatility:** Property values can fluctuate significantly in short periods

**Industry Statistics:**

- Average home value in Canada: $700,000+ (varies by region)
- HELOC utilization: ~30% of eligible homeowners have HELOC
- Property value updates: Typically 1-2 times per year (assessment or appraisal)
- Equity extraction: Common for home renovations, investments, debt consolidation

**Strategic Importance:**

- Critical for HELOC credit limit accuracy
- Essential for accurate wealth forecasting
- Key input for refinancing analysis
- High user value (home equity is largest asset for most homeowners)

### Strategic Positioning

- **Core Feature:** Property value tracking is foundational for HELOC management
- **Integration Value:** Integrates with HELOC credit limit calculations, refinancing analysis, scenario planning
- **User Value:** Home equity tracking provides tangible wealth insights
- **Competitive Differentiation:** Comprehensive property value history with trend analysis

---

## Domain Overview

### Property Value Fundamentals

**Property Value** is the estimated market value of the property at a specific point in time. Key characteristics:

1. **Value Sources:**
   - **Appraisal:** Professional appraiser's opinion of value (most accurate)
   - **Assessment:** Municipal property assessment (annual, tax purposes)
   - **Estimate:** Automated valuation model (AVM) or comparable sales estimate
   - **User Input:** Homeowner's estimate based on market knowledge

2. **Value Updates:**
   - Property values change over time (appreciation or depreciation)
   - Updates should be recorded with date and source
   - History maintained for trend analysis

3. **Value Uses:**
   - HELOC credit limit calculation (LTV-based)
   - Home equity calculation (Property Value - Mortgage Balance)
   - Net worth tracking (property value + other assets)
   - Refinancing analysis (higher value = more equity = better rates)

### HELOC Credit Limit Calculation

**HELOC Credit Limit** is calculated based on Loan-to-Value (LTV) ratio:

```
Available Equity = Property Value × Max LTV - Mortgage Balance - Existing HELOC Balance

HELOC Credit Limit = Available Equity (subject to lender's max HELOC limit)
```

**Example:**
```
Property Value: $800,000
Max LTV: 80%
Mortgage Balance: $500,000
Existing HELOC Balance: $50,000

Available Equity = $800,000 × 0.80 - $500,000 - $50,000
Available Equity = $640,000 - $550,000 = $90,000

HELOC Credit Limit = $90,000 (if within lender's max limit)
```

### Property Value History

**Property Value History** tracks property value changes over time:

1. **History Entry:**
   - Value date (when value was determined)
   - Property value (amount)
   - Source (appraisal, assessment, estimate, user_input)
   - Notes (optional context)

2. **Trend Analysis:**
   - Calculate value appreciation/depreciation rate
   - Project future property values (with assumptions)
   - Compare value growth vs mortgage paydown

3. **Credit Limit Impact:**
   - Recalculate HELOC credit limits when value updated
   - Track credit limit changes over time
   - Send notifications when credit limit increases

### Property Value Projections

**Property Value Projections** estimate future property values:

1. **Projection Methods:**
   - **Flat Growth:** Assume no change (0% appreciation)
   - **Historical Average:** Use historical appreciation rate
   - **Market Assumption:** User-provided annual appreciation rate
   - **Conservative/Moderate/Aggressive:** Pre-defined appreciation scenarios

2. **Projection Uses:**
   - Scenario planning (project future equity)
   - HELOC capacity forecasting
   - Refinancing opportunity analysis
   - Net worth projections

### Canadian Lender Conventions

1. **HELOC LTV Limits:**
   - Typical max LTV: 65-80% (combined mortgage + HELOC)
   - Varies by lender (RBC: 65%, TD: 80%, BMO: 65%, etc.)
   - Lower LTV = more conservative, higher rates
   - Higher LTV = more aggressive, lower rates

2. **Property Value Sources:**
   - **Appraisal:** Required for HELOC applications and refinancing
   - **Assessment:** Used for initial HELOC qualification (updated annually)
   - **Estimate:** Used for ongoing monitoring (less accurate)

3. **Value Update Frequency:**
   - **Assessment:** Annual (municipal property assessment)
   - **Appraisal:** When applying for HELOC, refinancing, or significant changes
   - **User Updates:** As homeowner becomes aware of value changes

---

## User Personas & Use Cases

### Primary Personas

1. **Homeowner with HELOC:**
   - Tracks property value to monitor HELOC credit limit
   - Updates value when property improvements made
   - Monitors equity growth over time

2. **Homeowner Planning Refinancing:**
   - Tracks property value for refinancing analysis
   - Updates value before refinancing application
   - Analyzes equity position relative to mortgage

3. **Financial Advisor:**
   - Reviews property value trends for clients
   - Projects future property values for planning
   - Analyzes equity extraction opportunities

### Use Cases

#### UC-1: Update Property Value

**Actor:** Homeowner  
**Goal:** Record updated property value

**Steps:**
1. User navigates to mortgage details page
2. User clicks "Update Property Value" button
3. User enters property value
4. User selects value source (appraisal, assessment, estimate, user_input)
5. User enters value date (default: today)
6. User adds optional notes
7. System validates property value (must be > 0)
8. System creates property value history entry
9. System updates mortgage property price
10. System recalculates HELOC credit limits (if HELOC exists)
11. System sends notification if credit limit increased

**Success Criteria:**
- Property value history entry created
- Mortgage property price updated
- HELOC credit limits recalculated
- Notification sent if credit limit increased
- Property value displayed in mortgage details

#### UC-2: View Property Value History

**Actor:** Homeowner  
**Goal:** View property value history and trends

**Steps:**
1. User navigates to mortgage details page
2. User clicks "Property Value" section
3. System displays property value history (most recent first)
4. System displays value trend chart
5. User can filter by date range if needed

**Success Criteria:**
- All property value entries displayed
- Value trend chart visible
- Appreciation/depreciation rate calculated and displayed
- Value changes over time clearly visible

#### UC-3: View HELOC Credit Limit Impact

**Actor:** Homeowner  
**Goal:** Understand how property value affects HELOC credit limit

**Steps:**
1. User navigates to HELOC section
2. System displays current HELOC credit limit
3. User clicks "View Credit Limit Details"
4. System displays property value used in calculation
5. System displays LTV calculation breakdown
6. System shows credit limit history (if property value updated)

**Success Criteria:**
- Current property value displayed
- LTV calculation breakdown visible
- Credit limit calculation explained
- Credit limit history available

#### UC-4: Analyze Property Value Trends

**Actor:** Homeowner  
**Goal:** Analyze property value appreciation over time

**Steps:**
1. User navigates to property value history
2. System displays value trend chart
3. System calculates annual appreciation rate
4. System compares value growth vs mortgage paydown
5. User can see equity growth over time

**Success Criteria:**
- Value trend chart displays historical values
- Annual appreciation rate calculated
- Comparison with mortgage paydown shown
- Equity growth visualization available

#### UC-5: Project Future Property Values

**Actor:** Homeowner  
**Goal:** Project future property values for planning

**Steps:**
1. User navigates to property value section
2. User clicks "Project Future Values"
3. User selects projection method (flat, historical, custom rate)
4. System calculates projected values for next 5-10 years
5. System displays projection chart
6. System shows impact on HELOC credit limits

**Success Criteria:**
- Projection method selectable
- Projected values calculated correctly
- Projection chart displays future values
- HELOC credit limit projections shown

---

## Feature Requirements

### Data Models

#### property_value_history Table

```typescript
{
  id: string (UUID, primary key)
  mortgageId: string (foreign key → mortgages.id, cascade delete)
  valueDate: date (not null)
  propertyValue: decimal (not null, precision 12, scale 2)
  source: string? (optional: "appraisal", "assessment", "estimate", "user_input")
  notes: string? (optional)
  createdAt: timestamp (default now)
}
```

#### mortgages Table (Property Value Field)

```typescript
{
  propertyPrice: decimal (precision 12, scale 2) // Current property value
}
```

### Business Logic

#### Property Value Update

1. **Validation:**
   - Property value must be > 0
   - Value date must be valid date
   - Source must be valid option (if provided)

2. **History Entry Creation:**
   - Create property value history entry
   - Store value date, amount, source, notes

3. **Mortgage Update:**
   - Update mortgage.propertyPrice with new value
   - Use latest value as current property price

4. **HELOC Credit Limit Recalculation:**
   - Trigger HELOC credit limit recalculation for all HELOC accounts
   - Calculate new credit limit based on updated property value
   - Compare new limit vs previous limit
   - Send notification if credit limit increased

#### Property Value Trend Analysis

1. **Appreciation Rate Calculation:**
   - Calculate annual appreciation rate between value entries
   - Average appreciation rate over history period
   - Display trend (appreciating, depreciating, stable)

2. **Equity Analysis:**
   - Calculate home equity: Property Value - Mortgage Balance
   - Track equity growth over time
   - Compare equity growth vs property value appreciation

3. **Mortgage Paydown vs Value Growth:**
   - Track mortgage balance reduction over time
   - Compare mortgage paydown vs property value appreciation
   - Show net equity change

#### Property Value Projections

1. **Projection Methods:**
   - **Flat:** No appreciation (0% annual)
   - **Historical Average:** Use average appreciation rate from history
   - **Custom Rate:** User-provided annual appreciation rate
   - **Conservative/Moderate/Aggressive:** Pre-defined rates (e.g., 2%, 4%, 6%)

2. **Projection Calculation:**
   - Start from latest property value
   - Apply annual appreciation rate
   - Calculate projected values for each year (1-10 years ahead)
   - Compound appreciation annually

3. **HELOC Credit Limit Projections:**
   - Project HELOC credit limits based on projected property values
   - Assume mortgage balance continues to decrease (or use scenario)
   - Show projected available equity

### Calculations

#### Annual Appreciation Rate

```typescript
function calculateAnnualAppreciationRate(
  valueHistory: PropertyValueHistory[]
): number {
  if (valueHistory.length < 2) return 0;
  
  // Sort by date (oldest first)
  const sorted = valueHistory.sort((a, b) => 
    new Date(a.valueDate).getTime() - new Date(b.valueDate).getTime()
  );
  
  const firstValue = Number(sorted[0].propertyValue);
  const lastValue = Number(sorted[sorted.length - 1].propertyValue);
  const firstDate = new Date(sorted[0].valueDate);
  const lastDate = new Date(sorted[sorted.length - 1].valueDate);
  
  const years = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  if (years <= 0 || firstValue <= 0) return 0;
  
  // Compound annual growth rate (CAGR)
  const cagr = Math.pow(lastValue / firstValue, 1 / years) - 1;
  return cagr * 100; // Return as percentage
}
```

#### Property Value Projection

```typescript
function projectPropertyValue(
  currentValue: number,
  annualAppreciationRate: number, // as percentage (e.g., 4 for 4%)
  years: number
): number {
  const rate = annualAppreciationRate / 100;
  return currentValue * Math.pow(1 + rate, years);
}
```

#### HELOC Credit Limit (with Property Value)

```typescript
function calculateHelocCreditLimit(
  propertyValue: number,
  mortgageBalance: number,
  existingHelocBalance: number,
  maxLtv: number // as decimal (e.g., 0.80 for 80%)
): number {
  const maxCombinedBalance = propertyValue * maxLtv;
  const currentCombinedBalance = mortgageBalance + existingHelocBalance;
  const availableEquity = maxCombinedBalance - currentCombinedBalance;
  
  return Math.max(0, availableEquity);
}
```

### Validation

1. **Property Value Validation:**
   - Value must be > 0
   - Value must be reasonable (e.g., > $10,000, < $50,000,000)
   - Value date must be valid date

2. **Source Validation:**
   - Source must be one of: "appraisal", "assessment", "estimate", "user_input"
   - Source is optional (defaults to "user_input")

3. **History Validation:**
   - Cannot have duplicate entries for same date (or warn user)
   - Value date should not be in future (warn if future date)

### Integrations

1. **HELOC Credit Limit Service:**
   - Trigger credit limit recalculation when property value updated
   - Compare new limit vs previous limit
   - Send notification if credit limit increased

2. **Mortgage Service:**
   - Update mortgage.propertyPrice with latest value
   - Use property value in refinancing analysis

3. **Scenario Planning:**
   - Property value projections used in scenario planning
   - Property value history used for baseline projections

4. **Notification Service:**
   - Send notification when credit limit increases
   - Send reminder to update property value (optional, annually)

---

## User Stories & Acceptance Criteria

### US-1: Update Property Value

**As a** homeowner  
**I want to** update my property value  
**So that** my HELOC credit limit is accurate

**Acceptance Criteria:**
- ✅ Property value input field (required)
- ✅ Value source dropdown (appraisal, assessment, estimate, user_input)
- ✅ Value date picker (default: today)
- ✅ Notes field (optional)
- ✅ System validates value (> 0)
- ✅ System creates property value history entry
- ✅ System updates mortgage property price
- ✅ System recalculates HELOC credit limits
- ✅ System sends notification if credit limit increased

### US-2: View Property Value History

**As a** homeowner  
**I want to** view my property value history  
**So that** I can track value changes over time

**Acceptance Criteria:**
- ✅ Property value history displayed (most recent first)
- ✅ Value date, amount, source, notes visible
- ✅ Value trend chart displayed
- ✅ Annual appreciation rate calculated and displayed
- ✅ History can be filtered by date range (optional)

### US-3: View Property Value Trends

**As a** homeowner  
**I want to** view property value trends  
**So that** I can understand value appreciation/depreciation

**Acceptance Criteria:**
- ✅ Value trend chart displays historical values
- ✅ Annual appreciation rate calculated
- ✅ Trend direction displayed (appreciating, depreciating, stable)
- ✅ Comparison with mortgage paydown shown
- ✅ Equity growth visualization available

### US-4: Project Future Property Values

**As a** homeowner  
**I want to** project future property values  
**So that** I can plan for HELOC capacity and equity growth

**Acceptance Criteria:**
- ✅ Projection method selectable (flat, historical, custom rate)
- ✅ Projected values calculated for next 5-10 years
- ✅ Projection chart displays future values
- ✅ HELOC credit limit projections shown
- ✅ Projections clearly labeled as estimates

### US-5: Receive Credit Limit Increase Notification

**As a** homeowner  
**I want to** be notified when property value update increases HELOC credit limit  
**So that** I know when additional credit becomes available

**Acceptance Criteria:**
- ✅ Notification sent when credit limit increases
- ✅ Notification shows: previous limit, new limit, increase amount
- ✅ Notification includes property value used in calculation
- ✅ Notification provides link to HELOC details

---

## Technical Implementation Notes

### API Endpoints

#### POST /api/mortgages/:mortgageId/property-value

**Request Body:**
```typescript
{
  propertyValue: number
  valueDate?: string (ISO date, default: today)
  source?: "appraisal" | "assessment" | "estimate" | "user_input"
  notes?: string
}
```

**Response:**
```typescript
{
  valueHistory: PropertyValueHistory
  updatedMortgage: Mortgage
  creditLimitIncrease?: {
    previousLimit: number
    newLimit: number
    increase: number
  }
}
```

#### GET /api/mortgages/:mortgageId/property-value/history

**Response:**
```typescript
Array<PropertyValueHistory>
```

#### GET /api/mortgages/:mortgageId/property-value/latest

**Response:**
```typescript
PropertyValueHistory | null
```

#### GET /api/mortgages/:mortgageId/property-value/trend

**Response:**
```typescript
{
  valueHistory: Array<PropertyValueHistory>
  annualAppreciationRate: number (percentage)
  trend: "appreciating" | "depreciating" | "stable"
  equityAnalysis: {
    currentEquity: number
    equityGrowth: Array<{ date: string; equity: number }>
  }
}
```

#### GET /api/mortgages/:mortgageId/property-value/projections

**Query Parameters:**
- `method?: "flat" | "historical" | "custom"`
- `annualRate?: number` (required if method is "custom")
- `years?: number` (default: 10)

**Response:**
```typescript
{
  projections: Array<{
    year: number
    projectedValue: number
    projectedCreditLimit?: number
  }>
  method: string
  annualRate: number
}
```

### Database Schema

See "Data Models" section above for table schemas.

### Service Layer

#### PropertyValueService

**Methods:**
- `updatePropertyValue(mortgageId, userId, input): Promise<{ valueHistory, updatedMortgage }>`
- `getPropertyValueHistory(mortgageId, userId): Promise<PropertyValueHistory[]>`
- `getLatestPropertyValue(mortgageId, userId): Promise<PropertyValueHistory | null>`
- `getPropertyValueTrend(mortgageId, userId): Promise<PropertyValueTrend>`
- `getPropertyValueProjections(mortgageId, userId, options): Promise<PropertyValueProjections>`

### Frontend Components

#### PropertyValueSection

**Props:**
```typescript
{
  mortgageId: string
  currentPropertyValue: number
  valueHistory: PropertyValueHistory[]
}
```

**Features:**
- Current property value display
- Update property value button
- Property value history table
- Value trend chart
- Projections section

#### UpdatePropertyValueDialog

**Props:**
```typescript
{
  mortgageId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Features:**
- Property value input
- Value source dropdown
- Value date picker
- Notes textarea
- Validation and error display
- Submit button

#### PropertyValueTrendChart

**Props:**
```typescript
{
  valueHistory: PropertyValueHistory[]
  mortgageBalanceHistory?: Array<{ date: string; balance: number }>
}
```

**Features:**
- Line chart showing property value over time
- Optional mortgage balance overlay (for equity visualization)
- Appreciation rate display
- Interactive tooltips

#### PropertyValueProjections

**Props:**
```typescript
{
  currentValue: number
  appreciationRate: number
  years: number
  helocCreditLimit?: (value: number) => number
}
```

**Features:**
- Projection method selector
- Projected values chart
- HELOC credit limit projections
- Annual appreciation rate input (for custom method)

### Data Flows

#### Property Value Update Flow

1. User clicks "Update Property Value"
2. Frontend opens UpdatePropertyValueDialog
3. User enters property value and details
4. Frontend validates input
5. Frontend calls POST /api/mortgages/:mortgageId/property-value
6. Backend validates property value
7. Backend creates property value history entry
8. Backend updates mortgage.propertyPrice
9. Backend recalculates HELOC credit limits
10. Backend compares new limit vs previous limit
11. Backend sends notification if credit limit increased
12. Backend returns value history and updated mortgage
13. Frontend refreshes property value display
14. Frontend refreshes HELOC credit limit display
15. Frontend shows notification if credit limit increased

#### Property Value Trend Analysis Flow

1. User navigates to property value section
2. Frontend calls GET /api/mortgages/:mortgageId/property-value/trend
3. Backend fetches property value history
4. Backend calculates annual appreciation rate
5. Backend calculates equity analysis
6. Backend returns trend data
7. Frontend displays value trend chart
8. Frontend displays appreciation rate
9. Frontend displays equity analysis

---

## Edge Cases & Error Handling

### Edge Cases

1. **First Property Value Entry:**
   - No previous value for comparison
   - Appreciation rate = 0
   - Trend = "stable"

2. **Property Value Decrease:**
   - Negative appreciation rate
   - Trend = "depreciating"
   - HELOC credit limit may decrease (handle gracefully)

3. **Duplicate Value Dates:**
   - Warn user if value entry exists for same date
   - Allow update to existing entry (or create new with different date)

4. **Future Value Date:**
   - Warn user if value date is in future
   - Allow future date (for planned appraisals)

5. **No Property Value History:**
   - Display message: "No property value history yet"
   - Prompt user to add first property value

6. **Property Value = 0:**
   - Error: "Property value must be greater than zero"
   - Prevent submission

### Error Handling

1. **Validation Errors:**
   - Display field-level errors
   - Prevent submission until errors resolved

2. **Server Errors:**
   - Display user-friendly error messages
   - Log detailed errors for debugging

3. **HELOC Credit Limit Calculation Errors:**
   - Log error but don't fail property value update
   - Show warning if credit limit calculation failed
   - Allow manual credit limit update if needed

---

## Testing Considerations

### Unit Tests

1. **Property Value Validation:**
   - Value > 0 validation
   - Source validation
   - Date validation

2. **Appreciation Rate Calculation:**
   - Single value entry (rate = 0)
   - Multiple entries (calculate CAGR)
   - Negative appreciation (depreciation)

3. **Property Value Projections:**
   - Flat projection (0% rate)
   - Historical projection (use average rate)
   - Custom rate projection

4. **HELOC Credit Limit Calculation:**
   - Credit limit increases when property value increases
   - Credit limit decreases when property value decreases
   - Credit limit = 0 when no equity available

### Integration Tests

1. **Property Value Update:**
   - Full update flow
   - HELOC credit limit recalculation
   - Notification sending

2. **Property Value History:**
   - History entry creation
   - History retrieval
   - Trend analysis

3. **Property Value Projections:**
   - Projection calculation
   - HELOC credit limit projections

### End-to-End Tests

1. **Update Property Value:**
   - User updates property value
   - HELOC credit limit updates
   - Notification received

2. **View Property Value History:**
   - User views value history
   - Trend chart displays correctly

3. **Property Value Projections:**
   - User views projections
   - Projected values calculated correctly

---

## Future Enhancements

### Phase 1: Automated Property Value Updates

- **Assessment Integration:** Import property assessments from municipal databases
- **AVM Integration:** Integrate with automated valuation models (Zillow, etc.)
- **Appraisal Request:** Request professional appraisals through partner network

### Phase 2: Advanced Analytics

- **Market Comparison:** Compare property value vs neighborhood/market averages
- **Value Forecast Models:** Machine learning models for value projections
- **Equity Extraction Analysis:** Analyze optimal equity extraction strategies

### Phase 3: Integration Enhancements

- **Real Estate Platform Integration:** Sync with real estate listing platforms
- **Assessment Service Integration:** Direct integration with municipal assessment services
- **Appraisal Network Integration:** Connect with appraiser network for professional valuations

### Phase 4: Property Portfolio Management

- **Multiple Properties:** Track multiple properties for portfolio analysis
- **Property Comparison:** Compare value appreciation across properties
- **Portfolio Equity Analysis:** Aggregate equity analysis across all properties

---

**End of Property Value Tracking Feature Specification**

