# HELOC Page Strategic Planning Hub - Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Problem Statement

The current HELOC page is a basic account management interface that only allows users to add, edit, and delete HELOC accounts. It lacks strategic value and fails to demonstrate the connection between HELOC credit limits and mortgage prepayments—the core value proposition for HELOC planning.

**Current State Issues:**
- No visible mortgage linking functionality in UI
- No transaction tracking (borrowing/repayments)
- No credit limit projections or forward-looking planning
- No integration with prepayment planning
- No interest cost analysis
- No strategic insights or actionable guidance
- Redundant with mortgage HELOC section (confusing UX)

### Business Value

Transforming the HELOC page into a strategic planning hub will:

- **Enable Strategic Decision-Making:** Users can see how mortgage prepayments increase borrowing capacity
- **Support Advanced Strategies:** Foundation for Smith Maneuver and tax-optimization planning
- **Differentiate Product:** Most mortgage tools don't offer comprehensive HELOC strategy planning
- **Increase User Engagement:** Move from passive account viewing to active strategic planning
- **Improve User Retention:** Users with HELOCs will find ongoing value in planning tools

### Strategic Positioning

- **Primary Hub:** HELOC page becomes the central location for all HELOC-related planning
- **Integration Point:** Seamlessly connects mortgage prepayments with HELOC credit room
- **Planning Tool:** Enables scenario modeling and forward-looking projections
- **Foundation Feature:** Prerequisite for advanced strategies (Smith Maneuver, investment leverage)

---

## Vision Statement

**The HELOC page should be a strategic financial planning hub that helps users:**

1. **Understand their borrowing capacity** - See current credit limits and how they change over time
2. **Plan strategically** - Model how mortgage prepayments increase credit room
3. **Track activity** - Record borrowings, repayments, and interest costs
4. **Make informed decisions** - Compare scenarios and understand trade-offs
5. **Connect the dots** - See the relationship between mortgage payments and HELOC credit limits

**Key Question the Page Should Answer:**
*"How can I strategically use my HELOC to maximize my financial position, and how do my mortgage prepayments affect my borrowing capacity?"*

---

## Current State Analysis

### What Exists Today

**HELOC Page (`/heloc`):**
- Basic account list (grid of cards)
- Account details: balance, credit limit, utilization, interest rate
- Add/edit/delete accounts
- No mortgage linking UI (though `mortgageId` exists in schema)
- No transaction tracking
- No projections or planning

**Mortgage HELOC Section:**
- Shows credit limit impact when planning prepayments
- Displays linked HELOC accounts
- Shows credit room increase from prepayments
- **Problem:** This creates confusion - where should users manage HELOCs?

### Gap Analysis

| Feature | Current State | Required State | Priority |
|---------|--------------|---------------|----------|
| Mortgage Linking UI | Hidden in schema only | Visible dropdown, clear indicators | **HIGH** |
| Transaction Tracking | Not implemented | Full CRUD for borrowings/repayments | **HIGH** |
| Credit Limit Projections | Not available | Forward-looking projections | **HIGH** |
| Prepayment Integration | Only in mortgage section | Integrated into HELOC page | **HIGH** |
| Interest Cost Analysis | Not tracked | Track and project interest | **MEDIUM** |
| Strategic Insights | None | Actionable guidance | **MEDIUM** |
| Transaction History | Not available | Detailed history with filters | **MEDIUM** |
| Scenario Modeling | Not available | Compare strategies | **LOW** |

---

## Feature Requirements

### 1. Enhanced Account Management

**1.1 Mortgage Linking UI**

**Requirements:**
- Dropdown in create/edit dialogs to select linked mortgage
- Visual indicator on account cards showing linked mortgage
- "Link Mortgage" button on unlinked accounts
- Display mortgage balance used in credit limit calculation
- Show credit limit formula breakdown: `(Home Value × Max LTV) - Mortgage Balance`

**Acceptance Criteria:**
- [ ] User can link HELOC to mortgage during account creation
- [ ] User can link/unlink mortgage from existing HELOC account
- [ ] Linked mortgage is clearly displayed on account card
- [ ] Credit limit automatically recalculates when linked mortgage balance changes
- [ ] Formula breakdown is visible and understandable

**1.2 Credit Limit Calculation Display**

**Requirements:**
- Show current credit limit calculation breakdown
- Display: Home Value, Max LTV, Mortgage Balance, Calculated Limit
- Show available credit (limit - balance)
- Visual indicator of credit utilization
- Historical credit limit changes (if tracked)

**Acceptance Criteria:**
- [ ] Credit limit calculation is transparent and visible
- [ ] All inputs (home value, LTV, mortgage balance) are displayed
- [ ] Available credit is prominently shown
- [ ] Credit utilization percentage is clear
- [ ] Users understand how credit limit is calculated

### 2. Transaction Tracking

**2.1 Record Borrowings**

**Requirements:**
- "Borrow" button/action on account cards
- Form to record: amount, date, purpose/description (optional)
- Validation: amount cannot exceed available credit
- Update balance and available credit after borrowing
- Record transaction in history

**Acceptance Criteria:**
- [ ] User can record HELOC borrowing transaction
- [ ] System validates borrowing amount ≤ available credit
- [ ] Balance and available credit update immediately
- [ ] Transaction appears in history
- [ ] User can optionally add description/purpose

**2.2 Record Repayments**

**Requirements:**
- "Make Payment" button/action
- Form to record: amount, date, payment type (interest-only, principal, full)
- Calculate minimum payment (interest-only)
- Update balance and available credit after payment
- Track interest costs separately

**Acceptance Criteria:**
- [ ] User can record HELOC payment
- [ ] System calculates minimum interest-only payment
- [ ] User can pay interest-only, principal, or full balance
- [ ] Balance and available credit update correctly
- [ ] Interest costs are tracked separately

**2.3 Transaction History**

**Requirements:**
- Transaction list/table for each account
- Columns: Date, Type, Amount, Balance After, Available Credit After
- Filter by transaction type (borrowing, repayment, interest)
- Sort by date (newest first)
- Search functionality
- Export to CSV option

**Acceptance Criteria:**
- [ ] All transactions are displayed in chronological order
- [ ] Users can filter by transaction type
- [ ] Users can search transactions
- [ ] Transaction details are complete and accurate
- [ ] Export functionality works correctly

### 3. Credit Room Projections

**3.1 Prepayment Impact Integration**

**Requirements:**
- Show credit room increase from planned mortgage prepayments
- Display current vs. projected credit limit
- Visual chart showing credit limit growth over time
- Integration with prepayment planning tools
- Scenario comparison: different prepayment amounts

**Acceptance Criteria:**
- [ ] Credit limit projections are accurate
- [ ] Users can see impact of different prepayment scenarios
- [ ] Visualizations are clear and understandable
- [ ] Projections update when mortgage balance changes
- [ ] Integration with prepayment planning is seamless

**3.2 Forward-Looking Projections**

**Requirements:**
- Project credit limit over next 1, 3, 5 years
- Based on current mortgage payment schedule
- Account for planned prepayments
- Show credit room growth trajectory
- Visual timeline/chart

**Acceptance Criteria:**
- [ ] Projections are based on realistic assumptions
- [ ] Users can adjust projection parameters
- [ ] Visualizations are intuitive
- [ ] Projections update when mortgage details change
- [ ] Users understand projection assumptions

### 4. Interest Cost Analysis

**4.1 Interest Tracking**

**Requirements:**
- Track interest costs by month/year
- Calculate interest based on Prime + spread
- Show interest rate history
- Project future interest costs
- Total interest paid over time

**Acceptance Criteria:**
- [ ] Interest calculations are accurate
- [ ] Interest costs are tracked correctly
- [ ] Historical interest data is available
- [ ] Future interest projections are reasonable
- [ ] Interest rate changes are reflected

**4.2 Interest Cost Visualization**

**Requirements:**
- Chart showing interest costs over time
- Monthly/yearly interest breakdown
- Comparison: interest costs vs. credit room gained
- Tax deduction calculator (for investment HELOC)

**Acceptance Criteria:**
- [ ] Charts are clear and informative
- [ ] Users can understand interest cost trends
- [ ] Tax implications are explained (if applicable)
- [ ] Comparisons are meaningful

### 5. Strategic Insights & Guidance

**5.1 Actionable Insights**

**Requirements:**
- Credit room increase opportunities (from prepayments)
- Interest cost optimization suggestions
- Borrowing capacity alerts
- Strategic recommendations based on user's situation

**Acceptance Criteria:**
- [ ] Insights are relevant and actionable
- [ ] Recommendations are personalized
- [ ] Alerts are timely and useful
- [ ] Users understand the reasoning behind insights

**5.2 Educational Content**

**Requirements:**
- Explain HELOC basics (for new users)
- Explain credit limit calculation
- Explain re-advanceable mortgages
- Link to Smith Maneuver resources (if applicable)
- Best practices and tips

**Acceptance Criteria:**
- [ ] Content is clear and accessible
- [ ] Educational content is contextual
- [ ] Users can find help when needed
- [ ] Content is accurate and up-to-date

---

## User Stories & Acceptance Criteria

### User Story 1: Link HELOC to Mortgage

**As a** homeowner with a HELOC  
**I want to** link my HELOC to my mortgage  
**So that** my credit limit automatically updates when I make mortgage prepayments

**Acceptance Criteria:**
- [ ] I can see a "Link Mortgage" option when creating/editing HELOC
- [ ] I can select my mortgage from a dropdown
- [ ] The linked mortgage is clearly displayed on my HELOC account card
- [ ] My credit limit recalculates automatically when mortgage balance changes
- [ ] I can unlink the mortgage if needed

### User Story 2: Record HELOC Borrowing

**As a** HELOC account holder  
**I want to** record when I borrow from my HELOC  
**So that** I can track my balance and available credit accurately

**Acceptance Criteria:**
- [ ] I can click "Borrow" on my HELOC account card
- [ ] I can enter the borrowing amount and date
- [ ] The system prevents me from borrowing more than available credit
- [ ] My balance and available credit update immediately
- [ ] The transaction appears in my transaction history

### User Story 3: Record HELOC Payment

**As a** HELOC account holder  
**I want to** record HELOC payments  
**So that** I can track my balance reduction and interest costs

**Acceptance Criteria:**
- [ ] I can click "Make Payment" on my HELOC account card
- [ ] The system shows me the minimum interest-only payment
- [ ] I can choose to pay interest-only, principal, or full balance
- [ ] My balance and available credit update correctly
- [ ] Interest costs are tracked separately

### User Story 4: See Credit Room Projections

**As a** homeowner planning mortgage prepayments  
**I want to** see how prepayments will increase my HELOC credit room  
**So that** I can make informed prepayment decisions

**Acceptance Criteria:**
- [ ] I can see projected credit limit increases from prepayments
- [ ] The projection shows current vs. future credit limits
- [ ] I can model different prepayment scenarios
- [ ] The projection is visually clear (chart/graph)
- [ ] The projection updates when I change prepayment amounts

### User Story 5: View Transaction History

**As a** HELOC account holder  
**I want to** see my HELOC transaction history  
**So that** I can track my borrowing and repayment activity

**Acceptance Criteria:**
- [ ] I can see all transactions for my HELOC account
- [ ] Transactions are sorted by date (newest first)
- [ ] I can filter by transaction type
- [ ] I can search transactions
- [ ] Transaction details include balance and available credit changes

### User Story 6: Understand Credit Limit Calculation

**As a** HELOC account holder  
**I want to** see how my credit limit is calculated  
**So that** I understand what affects my borrowing capacity

**Acceptance Criteria:**
- [ ] I can see the credit limit formula breakdown
- [ ] All inputs (home value, LTV, mortgage balance) are displayed
- [ ] I understand how each input affects the credit limit
- [ ] The calculation updates when inputs change
- [ ] The explanation is clear and educational

---

## UI/UX Requirements

### Page Layout

**Top Section - Summary Dashboard:**
- Total HELOC accounts count
- Combined credit limit
- Combined available credit
- Combined current balance
- Total interest costs (monthly/yearly)

**Main Section - Account Cards:**
- Enhanced account cards with:
  - Linked mortgage indicator
  - Credit limit calculation breakdown (expandable)
  - Quick actions: Borrow, Make Payment, View History
  - Credit utilization visualization
  - Recent transactions preview (last 3-5)

**Bottom Section - Strategic Planning:**
- Credit room projections widget
- Prepayment impact calculator
- Interest cost analysis
- Strategic insights panel

### Account Card Enhancements

**Current Card Shows:**
- Account name, lender
- Credit limit, balance, available credit
- Utilization percentage
- Interest rate, Max LTV
- Edit/Delete buttons

**Enhanced Card Should Also Show:**
- Linked mortgage name (with link to mortgage page)
- Credit limit formula breakdown (expandable section)
- Quick action buttons: Borrow, Make Payment, View History
- Recent transactions (last 3)
- Credit room projection (next 12 months)
- Interest cost (current month/year)

### Transaction Dialog/Form

**Borrowing Form:**
- Amount input (with available credit display)
- Date picker
- Purpose/description (optional)
- Preview: New balance, new available credit
- Validation: Cannot exceed available credit

**Payment Form:**
- Amount input
- Date picker
- Payment type selector: Interest-only, Principal, Full Balance
- Calculated minimum payment display
- Preview: New balance, new available credit, interest paid

### Credit Limit Projection Widget

**Components:**
- Current credit limit display
- Projected credit limit (1, 3, 5 years)
- Line chart showing credit limit growth
- Input: Planned prepayment amount/frequency
- Output: Credit room increase projection

### Visual Design Principles

- **Clear Hierarchy:** Most important info (available credit) is prominent
- **Visual Connections:** Use lines/colors to show mortgage-HELOC relationship
- **Action-Oriented:** Quick actions are easily accessible
- **Educational:** Tooltips and explanations for complex concepts
- **Responsive:** Works on mobile and desktop

---

## Technical Requirements

### Data Model Enhancements

**HELOC Transactions Table** (already exists):
- Ensure all required fields are present
- Add indexes for performance
- Support transaction type filtering

**Credit Limit History** (new table, optional):
```sql
heloc_credit_limit_history (
  id: VARCHAR (primary key)
  heloc_account_id: VARCHAR (foreign key)
  credit_limit: DECIMAL(12, 2)
  home_value: DECIMAL(12, 2)
  mortgage_balance: DECIMAL(12, 2)
  max_ltv: DECIMAL(5, 2)
  recorded_at: TIMESTAMP
)
```

### API Endpoints Required

**Transaction Management:**
- `POST /api/heloc/accounts/:id/transactions` - Create transaction
- `GET /api/heloc/accounts/:id/transactions` - List transactions
- `PUT /api/heloc/transactions/:id` - Update transaction
- `DELETE /api/heloc/transactions/:id` - Delete transaction

**Projections:**
- `GET /api/heloc/accounts/:id/projections` - Get credit limit projections
- `POST /api/heloc/accounts/:id/calculate-impact` - Calculate prepayment impact

**Mortgage Linking:**
- `PUT /api/heloc/accounts/:id/link-mortgage` - Link mortgage
- `DELETE /api/heloc/accounts/:id/link-mortgage` - Unlink mortgage

### Calculation Engine

**Credit Limit Recalculation:**
- Trigger on mortgage balance changes
- Real-time updates for linked HELOCs
- Historical tracking (optional)

**Interest Calculations:**
- Daily interest: `Balance × (Prime + Spread) / 365`
- Monthly interest: Sum of daily interest
- Compounding: Monthly

**Projections:**
- Based on current mortgage payment schedule
- Account for planned prepayments
- Consider home value changes (if tracked)
- Project credit limit over time

### Integration Points

**Mortgage Prepayment → HELOC Credit Limit:**
- Event-driven: Prepayment triggers credit limit recalculation
- Real-time: Updates occur immediately
- Notification: User sees credit limit increase

**Home Value Updates → Credit Limit:**
- Recalculate all linked HELOC credit limits
- Update available credit
- Display credit limit increase

**Prime Rate Changes → Interest Rate:**
- Update HELOC interest rates automatically
- Recalculate interest costs
- Display rate change notification

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)

**Priority: HIGH**

**Deliverables:**
1. Mortgage linking UI in create/edit dialogs
2. Linked mortgage display on account cards
3. Credit limit calculation breakdown display
4. Basic transaction recording (borrowing and payments)
5. Transaction history list

**Success Criteria:**
- Users can link HELOC to mortgage
- Users can record transactions
- Credit limits update automatically
- Transaction history is visible

### Phase 2: Planning & Projections (Weeks 4-5)

**Priority: HIGH**

**Deliverables:**
1. Credit room projection widget
2. Prepayment impact calculator integration
3. Forward-looking projections (1, 3, 5 years)
4. Visual charts/graphs for projections

**Success Criteria:**
- Users can see credit room projections
- Prepayment impact is clear
- Visualizations are intuitive
- Projections are accurate

### Phase 3: Analysis & Insights (Weeks 6-7)

**Priority: MEDIUM**

**Deliverables:**
1. Interest cost tracking and analysis
2. Interest cost visualization
3. Strategic insights panel
4. Educational content and tooltips

**Success Criteria:**
- Interest costs are tracked accurately
- Users understand interest implications
- Insights are actionable
- Educational content is helpful

### Phase 4: Polish & Enhancement (Week 8)

**Priority: LOW**

**Deliverables:**
1. Transaction filtering and search
2. Export functionality
3. Multiple HELOC aggregation
4. Performance optimization
5. Mobile responsiveness improvements

**Success Criteria:**
- All features are polished
- Performance is good
- Mobile experience is excellent
- User feedback is positive

---

## Success Metrics

### User Adoption

**Primary Metrics:**
- Percentage of HELOC users who link accounts to mortgages
- Percentage of HELOC accounts with recorded transactions
- Average number of transactions per HELOC account per month
- Time spent on HELOC page (engagement)

**Target Goals:**
- 70% of HELOC accounts linked to mortgages within 1 month
- 50% of HELOC accounts have at least 1 transaction per month
- Average 5+ minutes per session on HELOC page
- 30% increase in HELOC page visits

### Feature Usage

**Usage Metrics:**
- Frequency of credit limit projection views
- Frequency of transaction recording
- Usage of prepayment impact calculator
- Usage of interest cost analysis

**Analysis:**
- Track which features are most used
- Identify user segments (active planners vs. passive viewers)
- Monitor integration usage (mortgage → HELOC)

### Strategic Value

**Success Indicators:**
- Users report making better prepayment decisions
- Users understand HELOC-mortgage relationship
- Users find strategic value in the page
- Page becomes primary HELOC management location

**Measurement:**
- User satisfaction surveys
- Feature usage analytics
- User feedback and support tickets
- Retention metrics for HELOC users

---

## Risk Considerations

### Technical Risks

**Data Accuracy:**
- Credit limit calculations depend on accurate mortgage balances
- Interest calculations must be precise
- Transaction tracking must be complete

**Mitigation:**
- Comprehensive testing of calculations
- Validation of all inputs
- Clear error messages
- Audit trail for transactions

### User Experience Risks

**Complexity:**
- HELOC concepts may be unfamiliar
- Too many features could overwhelm users
- Integration with mortgages adds complexity

**Mitigation:**
- Progressive disclosure (show advanced features on demand)
- Clear educational content
- Intuitive UI design
- User testing and feedback

### Product Risks

**Redundancy:**
- HELOC page vs. mortgage HELOC section confusion
- Duplicate functionality

**Mitigation:**
- Clear separation of concerns
- HELOC page = strategic planning hub
- Mortgage section = prepayment impact display
- Clear navigation and context

---

## Dependencies

### Prerequisites

**Required:**
- Mortgage tracking system (already implemented)
- HELOC account data model (already implemented)
- Prime rate tracking (already implemented)
- Payment tracking infrastructure (already implemented)

**Optional but Beneficial:**
- Property value tracking (for more accurate credit limits)
- Prepayment planning tools (for integration)

### Blocks Other Features

**Smith Maneuver Feature:**
- Requires transaction tracking (this feature)
- Requires credit limit projections (this feature)

**Advanced Tax Strategies:**
- Requires interest cost tracking (this feature)
- Requires transaction history (this feature)

---

## Future Enhancements

### Potential Additions

1. **Smith Maneuver Integration:**
   - Connect HELOC borrowing to investment tracking
   - Tax deduction calculator
   - Strategy optimization tools

2. **Multiple HELOC Aggregation:**
   - Combined credit limit view
   - Aggregate transaction history
   - Portfolio-level insights

3. **Lender Comparison:**
   - Compare HELOC offers
   - Rate comparison tools
   - Cost analysis

4. **Bank Integration:**
   - Automatic transaction import
   - Real-time balance sync
   - Transaction categorization

5. **Advanced Analytics:**
   - Usage patterns analysis
   - Optimal borrowing strategies
   - Credit utilization optimization

---

## Conclusion

Transforming the HELOC page from a basic account management interface into a strategic planning hub is essential for:

- **User Value:** Enables strategic decision-making and planning
- **Product Differentiation:** Sets the app apart from basic mortgage trackers
- **Foundation:** Enables advanced features like Smith Maneuver
- **User Retention:** Provides ongoing value and engagement

**Key Success Factors:**
- Clear mortgage-HELOC connection
- Accurate calculations and projections
- Intuitive user experience
- Actionable insights and guidance

**Strategic Value:**
- Moves from passive viewing to active planning
- Connects mortgage prepayments with HELOC strategy
- Enables sophisticated financial planning
- Supports advanced tax-optimization strategies

This transformation will position the HELOC page as a core strategic tool that users return to regularly for planning and decision-making, rather than a one-time account setup page.

