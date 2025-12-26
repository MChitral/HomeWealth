# Renewal Tracking & Workflow Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Mortgage renewal is a critical decision point for Canadian homeowners, occurring every 1-10 years depending on their term length. Making informed renewal decisions can save homeowners thousands of dollars in interest costs over the life of their mortgage. The Renewal Tracking & Workflow feature provides:

- **Proactive Renewal Management:** Automated reminders and status tracking to ensure homeowners don't miss renewal deadlines
- **Data-Driven Decision Making:** Historical renewal performance analytics and rate comparisons
- **Guided Workflow:** Multi-step wizard and recommendation engine to simplify complex renewal decisions
- **Cost Optimization:** Break-even analysis, penalty calculations, and savings projections to maximize value

### Market Context

**Canadian Mortgage Renewal Market:**

- **Typical Term Lengths:** 1, 2, 3, 4, 5, 7, or 10 years (5-year terms are most common)
- **Renewal Process:** At term end, homeowners can:
  - Stay with current lender at new rate
  - Switch to different lender (involves penalties and closing costs)
  - Refinance (borrow more or change terms)
- **Rate Negotiation:** Most lenders will negotiate renewal rates (often 0.10-0.25% improvement possible)
- **Market Rates:** Renewal rates are typically based on current market rates for the selected term length and type (fixed vs variable)

**Industry Statistics:**

- Average Canadian homeowner renews mortgage 4-6 times over 25-30 year amortization
- Typical renewal penalty for breaking term early: $1,500-$5,000 (varies by lender and remaining term)
- Average closing costs for switching lenders: $1,000-$2,000 (legal, appraisal, discharge fees)
- Rate negotiation can save $500-$2,000 in interest over a 5-year term

### Strategic Positioning

- **Core Feature:** Renewal tracking is fundamental to mortgage lifecycle management
- **Competitive Differentiation:** Comprehensive renewal workflow with analytics and recommendations exceeds basic tracking tools
- **User Retention:** Renewal events are high-engagement moments that drive user return and feature adoption
- **Premium Capability:** Advanced analytics and recommendation engine provide significant value beyond basic tracking

---

## Domain Overview

### Renewal Fundamentals

**Mortgage Renewal** occurs when a mortgage term ends and a new term begins. Key characteristics:

1. **Term End Date:**
   - Every mortgage term has a start date and end date
   - Renewal must be finalized before or on the end date
   - Most lenders allow renewal decisions 30-120 days before term end
   - If no action is taken, mortgage typically auto-renews at lender's posted rate (often higher than negotiated rate)

2. **Renewal Options:**
   - **Stay with Current Lender:** Continue mortgage with same lender at new rate (no penalties, minimal paperwork)
   - **Switch Lenders:** Transfer mortgage to new lender (penalty for breaking term early + closing costs)
   - **Refinance:** Borrow additional funds or change terms with current or new lender (penalty + closing costs)

3. **Rate Structure:**
   - New rate based on current market rates for term length and type
   - Rates vary by term length (typically 1-year < 2-year < 3-year < 5-year)
   - Fixed rates vs variable rates have different pricing
   - Posted rates vs negotiated rates (0.10-0.50% difference common)

4. **Costs and Savings:**
   - **Penalty:** Charged if breaking term early (IRD or 3-month interest, whichever is higher)
   - **Closing Costs:** Legal fees, appraisal, discharge fees (typically $1,000-$2,000 for switching)
   - **Rate Savings:** Lower rate = lower monthly payment and total interest over term
   - **Break-Even Analysis:** Months to recover switching costs through rate savings

### Renewal Decision Factors

**Rate Comparison:**
- Current rate vs market rates
- Rate difference magnitude (>0.25% typically significant)
- Term length comparison (can renew into different term length)

**Cost-Benefit Analysis:**
- Penalty amount (if breaking term early)
- Closing costs (if switching lenders)
- Monthly payment difference
- Total interest savings over term
- Break-even period (months to recover costs)

**Strategic Considerations:**
- Plans to move/sell property (shorter term may be better)
- Interest rate outlook (rising rates favor longer terms)
- Financial flexibility needs (variable vs fixed)
- Relationship with current lender (convenience vs savings)

### Canadian Lender Conventions

**Renewal Process Timing:**
- Lenders typically send renewal offers 60-120 days before term end
- Rate locks available 30-90 days before term end
- Final decision usually required 7-14 days before term end
- Auto-renewal occurs if no action taken (often at posted rate, not best rate)

**Rate Negotiation:**
- Posted rates are starting points, not final rates
- Negotiation typically saves 0.10-0.50% from posted rate
- Multiple negotiation rounds possible (offer, counter-offer, acceptance)
- Rate locks protect against rate increases during negotiation period

**Penalty Calculation:**
- IRD (Interest Rate Differential) for fixed-rate mortgages
- 3-month interest for variable-rate mortgages
- Penalty waived if renewing with same lender (unless breaking term early)
- Penalty charged if switching lenders before term end

**Closing Costs (Switching Lenders):**
- Legal fees: $500-$1,000
- Appraisal: $300-$500
- Discharge fee: $200-$400
- Other fees: $0-$300
- Total: Typically $1,000-$2,000

---

## User Personas & Use Cases

### Persona 1: Renewal Planner (Proactive Homeowner)

**Profile:**
- Planning-oriented homeowner
- Wants to start renewal planning early (3-6 months before term end)
- Seeks to understand options and optimize decisions
- Values data-driven insights

**Use Cases:**
- Receive renewal reminders 180 days before term end
- View renewal status and countdown
- Research market rates and compare to current rate
- Use renewal workflow wizard to explore options
- Track rate negotiations with current lender
- View historical renewal performance
- Make informed renewal decision based on analytics

**Pain Points Addressed:**
- Missing renewal deadlines
- Not knowing when to start planning
- Uncertainty about best renewal option
- Lack of historical context for decision-making

### Persona 2: Rate Optimizer (Cost-Conscious Homeowner)

**Profile:**
- Focused on minimizing mortgage costs
- Willing to switch lenders for better rates
- Understands penalty and closing cost trade-offs
- Uses break-even analysis to make decisions

**Use Cases:**
- Compare stay vs switch options with cost analysis
- Calculate break-even periods for switching
- View renewal recommendations with confidence scores
- Track rate negotiation attempts
- Review renewal history to assess past decisions
- Optimize renewal timing for best rates

**Pain Points Addressed:**
- Complex cost-benefit calculations
- Uncertainty about whether switching is worth it
- Difficulty comparing multiple options
- Lack of visibility into negotiation outcomes

### Persona 3: Renewal Procrastinator (Time-Constrained Homeowner)

**Profile:**
- Busy lifestyle, limited time for mortgage research
- Tends to delay renewal planning until last minute
- Needs quick, actionable guidance
- Prefers automated recommendations

**Use Cases:**
- Receive urgent renewal reminders (30 days, 7 days before term end)
- Get automated renewal recommendations
- View simplified comparison of options
- Quick renewal decision workflow
- Auto-record renewal decisions

**Pain Points Addressed:**
- Missing renewal deadlines
- Overwhelming amount of information
- Decision paralysis
- Need for quick, clear guidance

### Persona 4: Renewal Historian (Long-Term Homeowner)

**Profile:**
- Multiple renewal cycles completed
- Values tracking and analyzing renewal decisions
- Wants to learn from past renewals
- Seeks to optimize long-term mortgage strategy

**Use Cases:**
- View complete renewal history across all terms
- Analyze renewal performance metrics
- Compare rates across multiple renewal cycles
- Track decision patterns (stayed vs switched)
- Calculate total savings from renewal strategies
- Plan future renewals based on historical insights

**Pain Points Addressed:**
- Loss of historical renewal data
- Difficulty tracking performance over time
- Lack of insights from past decisions
- Need for long-term strategy optimization

---

## Feature Requirements

### Data Model Requirements

**Renewal History Table (`renewalHistory`):**

- `id` (UUID, primary key)
- `mortgageId` (foreign key to mortgages)
- `termId` (foreign key to mortgageTerms - the new term after renewal)
- `renewalDate` (date) - Date renewal took effect
- `previousRate` (decimal 5,3) - Interest rate before renewal (as decimal, e.g., 0.055 for 5.5%)
- `newRate` (decimal 5,3) - Interest rate after renewal
- `decisionType` (text) - "stayed", "switched", or "refinanced"
- `lenderName` (text, optional) - New lender name if switched
- `estimatedSavings` (decimal 12,2, optional) - Estimated savings over term
- `notes` (text, optional) - User notes about renewal decision
- `createdAt` (timestamp) - Record creation timestamp

**Indexes:**
- Index on `mortgageId` for fast retrieval by mortgage
- Index on `termId` for term lookup
- Index on `renewalDate` for chronological queries

**Renewal Negotiations Table (`renewalNegotiations`):**

- `id` (UUID, primary key)
- `mortgageId` (foreign key to mortgages)
- `termId` (foreign key to mortgageTerms)
- `negotiationDate` (date) - Date of negotiation attempt
- `offeredRate` (decimal 5,3, optional) - Rate offered by lender
- `negotiatedRate` (decimal 5,3, optional) - Final negotiated rate
- `status` (text) - "pending", "accepted", "rejected", or "counter_offered"
- `notes` (text, optional) - User notes about negotiation
- `createdAt` (timestamp) - Record creation timestamp

**Indexes:**
- Index on `mortgageId` for fast retrieval
- Index on `termId` for term lookup
- Index on `negotiationDate` for chronological queries

**Renewal Status (Computed):**

- Calculated from active mortgage term end date
- `daysUntilRenewal` - Days remaining until term end
- `renewalDate` - Term end date
- `status` - "urgent" (<90 days), "soon" (<180 days), "upcoming" (<365 days), or "safe" (>365 days)
- `currentRate` - Current interest rate (from active term)
- `estimatedPenalty` - Estimated penalty if breaking term early

### Business Logic Requirements

**Renewal Status Calculation:**

1. **Identify Active Term:**
   - Find most recent term by start date
   - Verify term is active (current date between start and end date)

2. **Calculate Days Until Renewal:**
   - `daysUntilRenewal = termEndDate - currentDate`
   - Handle edge cases: past renewal dates (negative days), far future dates (>365 days)

3. **Determine Status:**
   - `urgent`: daysUntilRenewal <= 90
   - `soon`: 90 < daysUntilRenewal <= 180
   - `upcoming`: 180 < daysUntilRenewal <= 365
   - `safe`: daysUntilRenewal > 365

4. **Calculate Current Rate:**
   - Fixed-rate term: Use `fixedRate` from term
   - Variable-rate term: `primeRate + lockedSpread` from term
   - Convert to percentage for display (multiply by 100)

5. **Estimate Penalty:**
   - Use penalty calculation service
   - Calculate as if breaking term today
   - Return both amount and method (IRD vs 3-month interest)

**Renewal History Tracking:**

1. **Record Renewal Decision:**
   - Triggered automatically when new term is created (renewal workflow)
   - Captures: previous rate, new rate, decision type, lender name (if switched), estimated savings, notes
   - Links to new term via `termId`

2. **Renewal Performance Analytics:**
   - `totalRenewals`: Count of renewal history entries
   - `averageRateChange`: Average of (newRate - previousRate) across all renewals
   - `totalEstimatedSavings`: Sum of estimatedSavings across all renewals
   - `lastRenewalDate`: Most recent renewal date
   - `lastRenewalRate`: Rate from most recent renewal

3. **Rate Comparison:**
   - Compare current rate to previous renewal rate (from most recent renewal history entry)
   - Calculate rate change (absolute and percentage)
   - Return structured comparison data

**Renewal Recommendation Engine:**

1. **Market Rate Analysis:**
   - Fetch current market rate for term type and length
   - Compare to current mortgage rate
   - Calculate rate difference (percentage points)

2. **Refinancing Analysis:**
   - Check if refinancing opportunity exists
   - Calculate refinancing break-even period
   - Assess if refinancing is beneficial (<24 month break-even)

3. **Decision Logic:**
   - **Refinance Recommended:** If refinancing beneficial and break-even <24 months (high/medium confidence)
   - **Switch Recommended:** If market rates >0.25% lower and break-even <24 months (high/medium confidence)
   - **Consider Switching:** If market rates >0.25% lower but break-even >24 months (low confidence)
   - **Stay Recommended:** If market rates similar or higher, or break-even too long (high/medium confidence)

4. **Confidence Scoring:**
   - **High:** Break-even <12 months, significant rate difference
   - **Medium:** Break-even 12-24 months, moderate rate difference
   - **Low:** Break-even >24 months, uncertain outcomes

5. **Recommendation Data:**
   - Recommendation type (stay/switch/refinance/consider_switching)
   - Reasoning text (explanation of recommendation)
   - Confidence level (high/medium/low)
   - Stay option details (estimated rate, penalty, monthly payment)
   - Switch option details (estimated rate, penalty, closing costs, monthly payment, break-even)
   - Refinance option details (if applicable: estimated rate, penalty, closing costs, monthly payment, savings, break-even)

**Renewal Workflow:**

1. **Workflow Initialization:**
   - Fetch mortgage and active term details
   - Calculate renewal status
   - Generate renewal recommendation (if service available)
   - Return workflow context data

2. **Option Comparison:**
   - Calculate stay option (estimated market rate, zero penalty, estimated monthly payment)
   - Calculate switch option (estimated market rate, penalty amount, closing costs, estimated monthly payment, break-even months)
   - Return side-by-side comparison data

3. **Negotiation Tracking:**
   - Record negotiation attempts with current lender
   - Track offered rates, negotiated rates, status
   - Support multiple negotiation rounds
   - Link negotiations to specific term

4. **Renewal Execution:**
   - Create new term via term creation workflow
   - Auto-record renewal decision in history
   - Extract rates from new term (fixedRate or primeRate + lockedSpread)
   - Determine decision type (stayed/switched/refinanced) based on context
   - Invalidate renewal-related caches/queries

**Renewal Reminders (Scheduled Job):**

1. **Reminder Intervals:**
   - 180 days before renewal (early planning)
   - 90 days before renewal (research phase)
   - 30 days before renewal (decision time)
   - 7 days before renewal (urgent action)

2. **Reminder Logic:**
   - Check all mortgages daily
   - Calculate days until renewal for each
   - Check if reminder should be sent (matches interval)
   - Verify reminder not already sent (deduplication)
   - Fetch market rate for comparison (optional)
   - Create notification with enhanced message

3. **Reminder Escalation:**
   - **180 days:** Informational ("Start planning renewal strategy")
   - **90 days:** Advisory ("Research market rates and consider options")
   - **30 days:** Urgent ("Time to make decision - review rates and penalties")
   - **7 days:** Critical ("Action needed - finalize renewal immediately")

4. **Enhanced Reminder Content:**
   - Include rate comparison if available (current rate vs market rate)
   - Add context about rate direction (market rates higher/lower)
   - Include renewal status and estimated penalty
   - Provide actionable guidance based on urgency level

5. **Notification Metadata:**
   - `mortgageId`: Mortgage identifier
   - `daysUntil`: Days until renewal
   - `renewalDate`: Term end date
   - `reminderInterval`: Which interval triggered (180/90/30/7)
   - `currentRate`: Current interest rate (percentage)
   - `marketRate`: Current market rate if available (percentage)
   - `estimatedPenalty`: Penalty estimate
   - `status`: Renewal status (urgent/soon/upcoming/safe)

### Calculation Requirements

**Break-Even Calculation:**

```
breakEvenMonths = totalCosts / monthlySavings

Where:
  totalCosts = penalty + closingCosts
  monthlySavings = currentMonthlyPayment - newMonthlyPayment
```

**Edge Cases:**
- If monthlySavings <= 0, break-even is Infinity (not beneficial)
- If totalCosts = 0, break-even is 0 (no recovery needed)
- Minimum break-even: 0 months
- Maximum break-even: Infinity (display as "N/A" or "Never")

**Renewal Performance Metrics:**

1. **Average Rate Change:**
   ```
   averageRateChange = sum(rateChanges) / count(renewals)
   rateChange = newRate - previousRate (for each renewal)
   ```

2. **Total Estimated Savings:**
   ```
   totalSavings = sum(estimatedSavings) across all renewals
   ```

**Rate Comparison:**

1. **Rate Change:**
   ```
   rateChange = currentRate - previousRate
   rateChangePercent = (rateChange / previousRate) * 100
   ```

### Validation Requirements

**Renewal History Entry Validation:**

- `termId`: Required, must exist in mortgageTerms table, must belong to same mortgage
- `renewalDate`: Required, valid date, should be on or after term start date
- `previousRate`: Required, number between 0 and 1 (decimal) or 0-100 (percentage) - system converts to decimal
- `newRate`: Required, number between 0 and 1 (decimal) or 0-100 (percentage) - system converts to decimal
- `decisionType`: Required, must be one of: "stayed", "switched", "refinanced"
- `lenderName`: Optional, text string
- `estimatedSavings`: Optional, number (can be negative if rate increased)
- `notes`: Optional, text string (max length: 10,000 characters)

**Renewal Negotiation Validation:**

- `termId`: Required, must exist in mortgageTerms table
- `negotiationDate`: Required, valid date
- `offeredRate`: Optional, number between 0 and 1 (decimal) or 0-100 (percentage)
- `negotiatedRate`: Optional, number between 0 and 1 (decimal) or 0-100 (percentage)
- `status`: Required, must be one of: "pending", "accepted", "rejected", "counter_offered"
- `notes`: Optional, text string (max length: 10,000 characters)

**Business Rules:**

- Cannot record renewal history for future dates (renewalDate cannot be > currentDate + 30 days)
- Previous rate should match rate from previous term (validation suggestion, not enforced)
- New rate should match rate from new term (validation suggestion, not enforced)
- Decision type "switched" should have lenderName (warning, not enforced)
- Estimated savings should be positive for "stay" or "switch" decisions (warning, not enforced)

### Integration Requirements

**Mortgage Service Integration:**
- Fetch mortgage details by ID
- Access current balance for penalty calculations
- Access amortization for payment calculations

**Mortgage Terms Service Integration:**
- Fetch terms by mortgage ID
- Identify active term (most recent start date)
- Create new term (renewal execution)
- Access term details (rates, dates, payment amounts)

**Market Rate Service Integration:**
- Fetch current market rates by term type and length
- Use market rates for recommendation engine
- Include market rates in reminder messages

**Penalty Calculation Service Integration:**
- Calculate penalty for breaking term early
- Determine penalty method (IRD vs 3-month interest)
- Use in renewal status and recommendations

**Refinancing Service Integration:**
- Analyze refinancing opportunities
- Calculate refinancing break-even
- Assess refinancing benefits

**Notification Service Integration:**
- Create renewal reminder notifications
- Include structured metadata in notifications
- Support notification deduplication

**Term Renewal Workflow Integration:**
- Trigger renewal history recording after term creation
- Extract rate information from new term
- Determine decision type based on renewal context

---

## User Stories & Acceptance Criteria

### Epic: Renewal Status Tracking

**Story 1: View Renewal Status**
- **As a** homeowner
- **I want to** see my renewal status and countdown
- **So that** I know when my mortgage term is ending and when to start planning

**Acceptance Criteria:**
- ✅ Renewal status displays days until renewal
- ✅ Status badge shows urgency level (urgent/soon/upcoming/safe)
- ✅ Current interest rate is displayed
- ✅ Estimated penalty is shown (if breaking term early)
- ✅ Renewal date is clearly displayed
- ✅ Status updates automatically as time progresses

**Story 2: Renewal Status Calculation**
- **As a** system
- **I want to** automatically calculate renewal status
- **So that** users always see accurate renewal information

**Acceptance Criteria:**
- ✅ Status calculated from active term end date
- ✅ Days until renewal calculated correctly (including negative days edge case)
- ✅ Status categories correct: urgent (<90), soon (<180), upcoming (<365), safe (>365)
- ✅ Current rate extracted correctly (fixed vs variable)
- ✅ Penalty estimated using penalty calculation service

### Epic: Renewal History Tracking

**Story 3: View Renewal History**
- **As a** homeowner
- **I want to** view my past renewal decisions
- **So that** I can learn from previous renewals and track my mortgage journey

**Acceptance Criteria:**
- ✅ Renewal history table displays all past renewals
- ✅ Each entry shows: date, previous rate, new rate, decision type, savings (if available)
- ✅ History sorted by date (most recent first)
- ✅ Rate changes highlighted (green for decrease, red for increase)
- ✅ Decision type badges displayed (stayed/switched/refinanced)
- ✅ Empty state shown if no history exists

**Story 4: Record Renewal Decision**
- **As a** system
- **I want to** automatically record renewal decisions
- **So that** renewal history is complete and accurate

**Acceptance Criteria:**
- ✅ Renewal decision recorded when new term created via renewal workflow
- ✅ Previous rate captured from previous term
- ✅ New rate captured from new term
- ✅ Decision type determined (stayed/switched/refinanced)
- ✅ Renewal date set to term start date
- ✅ Manual recording also supported via API

**Story 5: Renewal Performance Analytics**
- **As a** homeowner
- **I want to** see performance metrics from my renewal history
- **So that** I can assess the effectiveness of my renewal strategies

**Acceptance Criteria:**
- ✅ Performance dashboard shows: total renewals, average rate change, total savings
- ✅ Last renewal date and rate displayed
- ✅ Metrics calculated correctly from history data
- ✅ Empty state if no renewals exist
- ✅ Metrics update when new renewals recorded

**Story 6: Rate Comparison**
- **As a** homeowner
- **I want to** compare my current rate to previous renewal rates
- **So that** I can understand rate trends and market changes

**Acceptance Criteria:**
- ✅ Current rate compared to most recent renewal rate
- ✅ Rate change displayed (absolute and percentage)
- ✅ Visual indicators for rate direction (up/down/stable)
- ✅ Comparison available even if only one renewal exists
- ✅ Handles case where no previous renewal exists (shows current rate only)

### Epic: Renewal Recommendations

**Story 7: Automated Renewal Recommendation**
- **As a** homeowner
- **I want to** receive automated renewal recommendations
- **So that** I can make informed decisions based on market conditions

**Acceptance Criteria:**
- ✅ Recommendation generated (stay/switch/refinance/consider_switching)
- ✅ Reasoning text explains recommendation
- ✅ Confidence level displayed (high/medium/low)
- ✅ Stay option details shown (rate, penalty, payment)
- ✅ Switch option details shown (rate, penalty, costs, payment, break-even)
- ✅ Refinance option details shown if applicable (rate, penalty, costs, payment, savings, break-even)
- ✅ Recommendation updates when market rates change

**Story 8: Recommendation Logic**
- **As a** system
- **I want to** generate accurate renewal recommendations
- **So that** users receive valuable guidance

**Acceptance Criteria:**
- ✅ Market rates compared to current rate
- ✅ Refinancing analyzed if beneficial
- ✅ Break-even calculations correct
- ✅ Recommendation logic follows business rules:
  - Refinance if break-even <24 months
  - Switch if rates >0.25% lower and break-even <24 months
  - Consider switching if rates >0.25% lower but break-even >24 months
  - Stay otherwise
- ✅ Confidence scores assigned correctly (high/medium/low)

### Epic: Renewal Workflow

**Story 9: Renewal Workflow Wizard**
- **As a** homeowner
- **I want to** use a guided renewal workflow
- **So that** I can navigate the renewal process step-by-step

**Acceptance Criteria:**
- ✅ Multi-step wizard with tabs: Overview, Compare Options, Negotiations
- ✅ Overview tab shows renewal status and recommendation
- ✅ Compare Options tab shows side-by-side comparison
- ✅ Negotiations tab shows negotiation history and tracking form
- ✅ Wizard pre-populated with mortgage and term data
- ✅ Navigation between tabs works smoothly

**Story 10: Compare Renewal Options**
- **As a** homeowner
- **I want to** compare stay vs switch options side-by-side
- **So that** I can make an informed cost-benefit decision

**Acceptance Criteria:**
- ✅ Stay option shows: estimated rate, penalty (0), estimated monthly payment
- ✅ Switch option shows: estimated rate, penalty, closing costs, estimated monthly payment, break-even months
- ✅ Comparison card displays recommendation and confidence
- ✅ Monthly savings calculated and displayed
- ✅ Break-even period highlighted
- ✅ Visual indicators for best option

**Story 11: Track Rate Negotiations**
- **As a** homeowner
- **I want to** track my rate negotiations with my lender
- **So that** I can keep a record of offers and counter-offers

**Acceptance Criteria:**
- ✅ Negotiation tracking form: date, offered rate, negotiated rate, status, notes
- ✅ Negotiation history table displays past negotiations
- ✅ Status badges: pending, accepted, rejected, counter_offered
- ✅ Negotiations linked to specific term
- ✅ Multiple negotiations can be tracked for same term
- ✅ Negotiations sorted by date (most recent first)

### Epic: Renewal Reminders

**Story 12: Receive Renewal Reminders**
- **As a** homeowner
- **I want to** receive renewal reminders
- **So that** I don't miss my renewal deadline

**Acceptance Criteria:**
- ✅ Reminders sent at: 180, 90, 30, and 7 days before renewal
- ✅ Reminder title indicates urgency level
- ✅ Reminder message includes renewal date and days remaining
- ✅ Reminders include rate comparison if available
- ✅ Reminders not duplicated (deduplication logic)
- ✅ Reminders appear in notifications center

**Story 13: Enhanced Reminder Content**
- **As a** homeowner
- **I want to** receive contextual renewal reminders
- **So that** I have actionable information to make decisions

**Acceptance Criteria:**
- ✅ Reminder includes current rate and market rate comparison
- ✅ Message indicates if market rates are higher/lower
- ✅ Guidance provided based on urgency level (180/90/30/7 days)
- ✅ Estimated penalty included in reminder
- ✅ Reminder metadata includes structured data for UI display
- ✅ Reminders escalate appropriately (more urgent messaging closer to deadline)

### Epic: Renewal Analytics

**Story 14: Renewal Analytics Dashboard**
- **As a** homeowner
- **I want to** view comprehensive renewal analytics
- **So that** I can understand my renewal performance over time

**Acceptance Criteria:**
- ✅ Performance metrics displayed: total renewals, average rate change, total savings
- ✅ Rate comparison chart/graph shows rate trends
- ✅ Last renewal details displayed
- ✅ Analytics update when new renewals recorded
- ✅ Empty state if insufficient data
- ✅ Analytics section integrated into renewal tab

---

## Technical Implementation Notes

### API Endpoints

**Renewal Status:**
- `GET /api/mortgages/:id/renewal-status` - Get renewal status and information
  - Returns: `RenewalInfo` (daysUntilRenewal, renewalDate, status, currentRate, estimatedPenalty)

**Renewal History:**
- `GET /api/mortgages/:id/renewal-history` - Get renewal history entries
  - Returns: `RenewalHistoryEntry[]`
- `POST /api/mortgages/:id/renewal-history` - Record renewal decision
  - Body: `RecordRenewalDecisionRequest` (termId, renewalDate, previousRate, newRate, decisionType, lenderName?, estimatedSavings?, notes?)
  - Returns: `RenewalHistoryEntry`

**Renewal Analytics:**
- `GET /api/mortgages/:id/renewal-analytics` - Get performance metrics and rate comparison
  - Returns: `RenewalAnalyticsResponse` (performance: RenewalPerformance, rateComparison: RenewalRateComparison)
- `GET /api/mortgages/:id/renewal-rate-comparison` - Get rate comparison only
  - Returns: `RenewalRateComparison`

**Renewal Recommendations:**
- `GET /api/mortgages/:id/renewal-recommendation` - Get automated renewal recommendation
  - Returns: `RenewalRecommendationResponse` (recommendation, reasoning, confidence, stayWithCurrentLender?, switchLender?, refinance?)

**Renewal Workflow:**
- `POST /api/mortgages/:id/renewal-workflow/start` - Initialize renewal workflow
  - Returns: `RenewalWorkflowResponse` (mortgage, currentTerm, renewalStatus, recommendation?)
- `GET /api/mortgages/:id/renewal-options` - Get stay vs switch comparison
  - Returns: `RenewalOptionsResponse` (stayWithCurrentLender, switchLender)
- `POST /api/mortgages/:id/renewal-negotiations` - Track rate negotiation
  - Body: `RenewalNegotiationRequest` (termId, negotiationDate, offeredRate?, negotiatedRate?, status, notes?)
  - Returns: `RenewalNegotiationEntry`
- `GET /api/mortgages/:id/renewal-negotiations` - Get negotiation history
  - Returns: `RenewalNegotiationEntry[]`

### Database Schema

**Renewal History Table:**
```sql
CREATE TABLE renewal_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  mortgage_id VARCHAR NOT NULL REFERENCES mortgages(id) ON DELETE CASCADE,
  term_id VARCHAR NOT NULL REFERENCES mortgage_terms(id) ON DELETE CASCADE,
  renewal_date DATE NOT NULL,
  previous_rate DECIMAL(5,3) NOT NULL,
  new_rate DECIMAL(5,3) NOT NULL,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('stayed', 'switched', 'refinanced')),
  lender_name TEXT,
  estimated_savings DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IDX_renewal_history_mortgage ON renewal_history(mortgage_id);
CREATE INDEX IDX_renewal_history_term ON renewal_history(term_id);
CREATE INDEX IDX_renewal_history_date ON renewal_history(renewal_date);
```

**Renewal Negotiations Table:**
```sql
CREATE TABLE renewal_negotiations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  mortgage_id VARCHAR NOT NULL REFERENCES mortgages(id) ON DELETE CASCADE,
  term_id VARCHAR NOT NULL REFERENCES mortgage_terms(id) ON DELETE CASCADE,
  negotiation_date DATE NOT NULL,
  offered_rate DECIMAL(5,3),
  negotiated_rate DECIMAL(5,3),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'counter_offered')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IDX_renewal_negotiations_mortgage ON renewal_negotiations(mortgage_id);
CREATE INDEX IDX_renewal_negotiations_term ON renewal_negotiations(term_id);
CREATE INDEX IDX_renewal_negotiations_date ON renewal_negotiations(negotiation_date);
```

### Service Layer

**RenewalService:**
- `getRenewalStatus(mortgageId): Promise<RenewalInfo | null>`
- `getRenewalHistory(mortgageId): Promise<RenewalHistoryEntry[]>`
- `recordRenewalDecision(mortgageId, termId, renewalDate, previousRate, newRate, decisionType, lenderName?, estimatedSavings?, notes?): Promise<RenewalHistoryEntry>`
- `compareRenewalRates(mortgageId): Promise<RenewalRateComparison>`
- `calculateRenewalPerformance(mortgageId): Promise<RenewalPerformance>`

**RenewalRecommendationService:**
- `generateRecommendation(mortgageId): Promise<RenewalRecommendation | null>`
  - Fetches market rates
  - Compares to current rate
  - Analyzes refinancing opportunity
  - Calculates break-even periods
  - Generates recommendation with confidence

**RenewalWorkflowService:**
- `startRenewalWorkflow(mortgageId, userId): Promise<RenewalWorkflowResponse | undefined>`
- `trackNegotiation(mortgageId, userId, input): Promise<RenewalNegotiation | undefined>`
- `compareRenewalOptions(mortgageId, userId): Promise<RenewalOptions | undefined>`
- `getNegotiationHistory(mortgageId, userId): Promise<RenewalNegotiation[] | undefined>`

### Scheduled Jobs

**Renewal Reminder Job (`renewal-reminder-job.ts`):**
- Schedule: Daily at 9 AM (configurable via `RENEWAL_REMINDER_SCHEDULE`)
- Function: `checkRenewalsAndSendReminders(services: ApplicationServices)`
- Logic:
  1. Fetch all mortgages
  2. For each mortgage, calculate renewal status
  3. Check if reminder should be sent (180/90/30/7 days)
  4. Verify reminder not already sent (deduplication)
  5. Fetch market rate for comparison (optional)
  6. Create notification with enhanced message
  7. Log results (sent, skipped, errors)

### Frontend Components

**RenewalTab:**
- Main tab component for renewal-related content
- Displays renewal status card
- Shows rate comparison
- Includes renewal history section
- Provides term renewal dialog trigger

**RenewalWorkflowWizard:**
- Multi-step wizard component
- Tabs: Overview, Compare Options, Negotiations
- Integrates renewal recommendation display
- Handles negotiation tracking form
- Shows comparison card with recommendation

**RenewalHistorySection:**
- Displays renewal history table
- Shows performance metrics dashboard
- Includes rate comparison visualization
- Handles empty states

**RenewalComparisonCard:**
- Side-by-side comparison display
- Shows recommendation with confidence badge
- Displays stay vs switch vs refinance options
- Highlights break-even periods
- Visual indicators for best option

**RenewalCard (from Dashboard):**
- Summary card showing renewal status
- Displays days until renewal
- Status badge (urgent/soon/upcoming/safe)
- Links to renewal workflow

### Data Flow

**Renewal Status Flow:**
1. User opens renewal tab
2. Frontend calls `GET /api/mortgages/:id/renewal-status`
3. Backend: `RenewalService.getRenewalStatus()`
   - Fetches mortgage and active term
   - Calculates days until renewal
   - Determines status category
   - Calculates current rate
   - Estimates penalty
4. Returns `RenewalInfo` to frontend
5. Frontend displays status card

**Renewal Recommendation Flow:**
1. User opens renewal workflow wizard
2. Frontend calls `GET /api/mortgages/:id/renewal-recommendation`
3. Backend: `RenewalRecommendationService.generateRecommendation()`
   - Fetches market rate for term type/length
   - Compares to current rate
   - Analyzes refinancing opportunity
   - Calculates break-even periods
   - Generates recommendation with confidence
4. Returns `RenewalRecommendation` to frontend
5. Frontend displays recommendation card with reasoning

**Renewal History Recording Flow:**
1. User completes term renewal via term creation dialog
2. Backend creates new term
3. `RenewalTab` component's `onSuccess` callback triggers
4. Frontend calls `POST /api/mortgages/:id/renewal-history`
5. Backend: `RenewalService.recordRenewalDecision()`
   - Extracts previous rate from previous term
   - Extracts new rate from new term
   - Determines decision type (defaults to "stayed")
   - Creates renewal history entry
6. Returns `RenewalHistoryEntry` to frontend
7. Frontend invalidates renewal-related queries
8. Renewal history section updates automatically

**Renewal Reminder Flow:**
1. Scheduled job runs daily at 9 AM
2. `checkRenewalsAndSendReminders()` function executes
3. For each mortgage:
   - Calculate renewal status
   - Check if reminder interval matches (180/90/30/7)
   - Verify reminder not already sent
   - Fetch market rate (optional)
   - Generate reminder message with escalation
   - Create notification with metadata
4. Notifications appear in user's notification center
5. Users can click notification to navigate to renewal workflow

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Renewal Status Edge Cases:**

1. **No Active Term:**
   - Mortgage exists but no terms found
   - Return `null` for renewal status
   - Frontend shows "No active term" message

2. **Past Renewal Date:**
   - Term end date in the past (overdue renewal)
   - `daysUntilRenewal` is negative
   - Status should be "urgent" with negative days displayed
   - System should still calculate status for overdue renewals

3. **Far Future Renewal:**
   - Term end date >365 days away
   - Status is "safe"
   - No reminders sent (beyond reminder intervals)

4. **Multiple Terms:**
   - Multiple terms for same mortgage
   - Active term identified by most recent start date
   - Only one active term should exist at a time

5. **Missing Current Balance:**
   - `mortgage.currentBalance` not updated
   - Use last known balance or original amount as fallback
   - Penalty estimate may be less accurate

**Renewal History Edge Cases:**

1. **First Renewal:**
   - No previous renewal history exists
   - Rate comparison returns current rate only (no previous rate)
   - Performance metrics show zero values

2. **Invalid Rate Values:**
   - Rate stored as percentage (0-100) vs decimal (0-1)
   - System converts consistently (store as decimal, display as percentage)
   - Validation ensures rates within valid range

3. **Missing Term Link:**
   - `termId` points to non-existent term
   - Foreign key constraint prevents this
   - Handle gracefully if term deleted (cascade delete)

4. **Decision Type Mismatch:**
   - Decision type doesn't match actual action (e.g., "switched" but lender name same)
   - Validation warning (not enforced)
   - Allow user to correct manually

**Renewal Recommendation Edge Cases:**

1. **Market Rate Unavailable:**
   - Market rate service returns null
   - Fallback to current rate for comparison
   - Recommendation may be less accurate
   - Confidence level reduced to "low"

2. **Break-Even Calculation Edge Cases:**
   - Monthly savings = 0 (no benefit)
   - Break-even = Infinity (display as "N/A" or "Never")
   - Total costs = 0 (break-even = 0 months)
   - Negative monthly savings (new payment higher) = Infinity break-even

3. **Refinancing Service Unavailable:**
   - Refinancing analysis returns null
   - Recommendation focuses on stay vs switch only
   - Refinance option not included in recommendation

4. **Insufficient Data:**
   - Mortgage or term data missing
   - Return `null` recommendation
   - Frontend shows "Unable to generate recommendation" message

**Renewal Reminder Edge Cases:**

1. **Duplicate Reminders:**
   - Job runs multiple times same day
   - Deduplication checks last 2 days for same interval
   - Prevents duplicate notifications

2. **Market Rate Fetch Failure:**
   - Market rate service throws error
   - Job continues without market rate
   - Reminder message excludes rate comparison
   - Error logged but doesn't fail job

3. **Mortgage Without User:**
   - Mortgage exists but user deleted
   - Skip reminder (user lookup fails)
   - Log warning, continue with next mortgage

4. **Notification Creation Failure:**
   - Notification service throws error
   - Log error, continue with next mortgage
   - Don't fail entire job for single failure

**Renewal Workflow Edge Cases:**

1. **Unauthorized Access:**
   - User tries to access another user's mortgage
   - Return 404 (don't reveal mortgage exists)
   - All endpoints verify mortgage ownership

2. **Term Creation Failure:**
   - Term creation fails during renewal workflow
   - Renewal history not recorded (transaction rollback if applicable)
   - User can retry renewal

3. **Concurrent Renewals:**
   - Multiple renewal workflows started simultaneously
   - Only one should succeed (database constraints)
   - Handle race conditions gracefully

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid input data (missing required fields, invalid values)
- **401 Unauthorized:** User not authenticated
- **403 Forbidden:** User doesn't own mortgage (returned as 404 for security)
- **404 Not Found:** Mortgage or term not found
- **500 Internal Server Error:** Unexpected server error
- **503 Service Unavailable:** Renewal recommendation service not available

**Frontend Error Handling:**

- Display user-friendly error messages
- Retry failed API calls (with exponential backoff)
- Show loading states during API calls
- Handle network errors gracefully
- Log errors for debugging

**Scheduled Job Error Handling:**

- Individual mortgage processing errors don't fail entire job
- Log errors with context (mortgage ID, error message)
- Continue processing remaining mortgages
- Send alert if job fails entirely (fatal error)

---

## Testing Considerations

### Unit Tests

**RenewalService Tests:**
- `getRenewalStatus()`: Calculate status correctly for all scenarios (urgent/soon/upcoming/safe)
- `getRenewalHistory()`: Return history sorted by date (most recent first)
- `recordRenewalDecision()`: Create history entry with correct data transformation
- `compareRenewalRates()`: Calculate rate change correctly (absolute and percentage)
- `calculateRenewalPerformance()`: Calculate metrics correctly (total renewals, average rate change, total savings)

**RenewalRecommendationService Tests:**
- `generateRecommendation()`: Correct recommendation logic for all scenarios
- Break-even calculations: Handle edge cases (zero savings, zero costs, negative savings)
- Confidence scoring: Assign correct confidence levels
- Market rate fallback: Handle null market rates gracefully

**RenewalWorkflowService Tests:**
- `startRenewalWorkflow()`: Return workflow data with all required fields
- `trackNegotiation()`: Create negotiation entry with correct validation
- `compareRenewalOptions()`: Calculate stay vs switch options correctly
- Authorization: Verify user owns mortgage

**Renewal Reminder Job Tests:**
- `shouldSendReminder()`: Return true only for reminder intervals (180/90/30/7)
- `hasReminderBeenSent()`: Correctly detect duplicate reminders
- `getReminderMessage()`: Generate appropriate messages for each interval
- `getReminderTitle()`: Generate appropriate titles with escalation
- `checkRenewalsAndSendReminders()`: Process all mortgages, handle errors gracefully

### Integration Tests

**Renewal Status Endpoint:**
- Fetch renewal status for mortgage with active term
- Verify status calculation matches expected values
- Test edge cases: no term, past renewal, far future renewal

**Renewal History Endpoint:**
- Create renewal history entry via API
- Fetch renewal history and verify entry exists
- Verify history sorted correctly
- Test performance analytics calculation

**Renewal Recommendation Endpoint:**
- Generate recommendation for various scenarios (stay/switch/refinance)
- Verify recommendation logic matches business rules
- Test with missing market rate data
- Test with insufficient mortgage data

**Renewal Workflow Endpoint:**
- Start renewal workflow and verify all data returned
- Track negotiation and verify entry created
- Compare renewal options and verify calculations
- Test authorization (unauthorized access returns 404)

**Renewal Reminder Job Integration:**
- Run job with test mortgages at various renewal intervals
- Verify reminders sent only at correct intervals
- Verify deduplication prevents duplicate reminders
- Verify reminder metadata includes all required fields

### End-to-End Tests

**Renewal Workflow E2E:**
1. User navigates to renewal tab
2. Views renewal status and recommendation
3. Opens renewal workflow wizard
4. Reviews comparison of stay vs switch options
5. Tracks rate negotiation with lender
6. Completes term renewal
7. Verifies renewal history entry created automatically
8. Views renewal history and analytics

**Renewal Reminder E2E:**
1. Create test mortgage with term ending in 30 days
2. Run renewal reminder job
3. Verify reminder notification created
4. Verify reminder includes rate comparison
5. User clicks notification
6. Navigates to renewal workflow
7. Verify reminder metadata accessible

---

## Future Enhancements

### Known Limitations

1. **Decision Type Detection:**
   - Currently defaults to "stayed" when recording renewal
   - Could be enhanced to detect lender changes automatically
   - Could integrate with mortgage lender field to determine "switched"

2. **Estimated Savings Calculation:**
   - Currently optional and manual
   - Could be automated based on rate difference and term length
   - Could integrate with payment calculation service

3. **Rate Negotiation Tracking:**
   - Basic tracking implemented
   - Could add rate lock expiration tracking
   - Could add automated reminder for rate lock expiration
   - Could track multiple lender quotes for comparison

4. **Renewal Reminder Timing:**
   - Fixed intervals (180/90/30/7 days)
   - Could be user-configurable per mortgage
   - Could add "opt-out" option for specific mortgages

5. **Recommendation Accuracy:**
   - Market rates may not be perfectly accurate
   - Could integrate with multiple rate sources
   - Could add user feedback mechanism to improve recommendations

### Potential Improvements

**Enhanced Analytics:**
- Renewal trend analysis (rate trends over multiple renewals)
- Comparison to market benchmarks (how user rates compare to market averages)
- Renewal decision effectiveness metrics (did switching actually save money?)
- Predictive analytics (recommendations based on historical patterns)

**Advanced Workflow Features:**
- Rate lock tracking and expiration reminders
- Multiple lender quote comparison tool
- Renewal decision checklist (tasks to complete before renewal)
- Document storage (store renewal offers, agreements)

**Integration Enhancements:**
- Email notifications for renewal reminders (in addition to in-app)
- Calendar integration (add renewal date to user's calendar)
- Export renewal history to PDF/CSV
- Share renewal recommendations with financial advisor

**Market Intelligence:**
- Historical market rate trends
- Rate predictions (future rate forecasts)
- Best time to renew analysis (seasonal trends)
- Lender-specific rate insights

**User Experience:**
- Mobile-optimized renewal workflow
- Simplified renewal decision wizard for first-time users
- Renewal decision templates (pre-configured scenarios)
- Renewal decision simulator (what-if analysis)

---

**End of Feature Specification**

