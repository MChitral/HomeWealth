# Critical Gaps Implementation Plan

**Date:** December 2025  
**Owner:** Development Team  
**Purpose:** Detailed implementation plan for critical feature gaps  
**Timeline:** Q1-Q2 2026 (14-20 weeks total)

---

## Executive Summary

This plan covers the implementation of 5 critical features identified in the gap analysis:

1. **Market Rate Service for IRD** (2 weeks) - CRITICAL
2. **Penalty Calculator UI** (2 weeks) - HIGH
3. **Alert & Notification System** (6-8 weeks) - HIGH
4. **Renewal Reminders** (4-6 weeks) - HIGH
5. **Trigger Rate Alerts** (3-4 weeks) - HIGH

**Total Estimated Effort:** 17-22 weeks  
**Recommended Approach:** Phased implementation with Phase 1 (weeks 1-7) and Phase 2 (weeks 8-22)

---

## Phase 1: Foundation (Weeks 1-7)

### Goal: Complete critical renewal decision support features

**Dependencies:** None (can start immediately)  
**Deliverables:** Market rate service, penalty calculator UI, blend-and-extend UI

---

## Feature 1: Market Rate Service for IRD

**Priority:** CRITICAL  
**Effort:** 2 weeks  
**Dependencies:** None  
**Blocks:** Penalty Calculator UI, Accurate IRD calculations

### Overview

Create a service to fetch and store current market mortgage rates for accurate IRD penalty calculations. Currently, IRD always returns 0 because market rate is hardcoded to current rate.

### Technical Requirements

#### 1.1 Market Rate Data Source Research (Days 1-2)

**Tasks:**
- Research available market rate data sources
- Evaluate API options (Ratehub, RateSpy, Bank of Canada)
- Assess data quality and update frequency
- Determine cost and licensing requirements
- Select primary and fallback data sources

**Deliverables:**
- Market rate data source evaluation document
- Selected data source(s) with justification
- API documentation and access credentials

**Acceptance Criteria:**
- At least one reliable data source identified
- Update frequency meets requirements (daily minimum)
- Cost is acceptable for MVP
- Data includes fixed and variable rates by term length

**Research Targets:**
- **Bank of Canada:** Posted rates (official, free, but may not be current market)
- **Ratehub.ca:** Market rates (may require API access or scraping)
- **RateSpy.com:** Market rates (may require API access)
- **Mortgage broker rate sheets:** Manual entry option
- **Lender websites:** Posted rates (scraping option)

#### 1.2 Market Rate Data Model (Day 3)

**Tasks:**
- Design database schema for market rates
- Create Drizzle schema definition
- Add migration for market_rates table

**Schema Design:**
```typescript
// shared/schema.ts
export const marketRates = pgTable("market_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rateType: text("rate_type").notNull(), // "fixed" | "variable-changing" | "variable-fixed"
  termYears: integer("term_years").notNull(), // 1, 2, 3, 4, 5, 7, 10
  rate: decimal("rate", { precision: 5, scale: 3 }).notNull(), // e.g., 5.490
  source: text("source").notNull(), // "bank_of_canada" | "ratehub" | "manual"
  effectiveDate: date("effective_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_market_rates_type_term").on(table.rateType, table.termYears),
  index("IDX_market_rates_effective_date").on(table.effectiveDate),
]);
```

**Deliverables:**
- Database schema definition
- Migration file
- TypeScript types

**Acceptance Criteria:**
- Schema supports multiple rate types and term lengths
- Indexes support efficient queries
- Historical rate tracking enabled

#### 1.3 Market Rate Service Implementation (Days 4-7)

**Tasks:**
- Create market rate service class
- Implement data fetching logic
- Add rate storage and retrieval
- Create API endpoint for rate queries
- Add error handling and fallbacks

**Service Structure:**
```typescript
// server/src/application/services/market-rate.service.ts
export class MarketRateService {
  // Fetch current market rate for a given term type and length
  async getMarketRate(
    rateType: "fixed" | "variable-changing" | "variable-fixed",
    termYears: number
  ): Promise<number | null>
  
  // Fetch and store latest rates from data source
  async fetchAndStoreLatestRates(): Promise<void>
  
  // Get historical market rates
  async getHistoricalRates(
    rateType: string,
    termYears: number,
    startDate: Date,
    endDate: Date
  ): Promise<MarketRate[]>
}
```

**Implementation Steps:**
1. Create service class with interface
2. Implement primary data source integration
3. Add fallback logic (if primary fails)
4. Implement rate storage (database)
5. Add rate retrieval with caching
6. Create scheduled job for daily updates
7. Add error handling and logging

**Deliverables:**
- Market rate service class
- Data source integration (primary)
- Database storage and retrieval
- API endpoint: `GET /api/market-rates`
- Scheduled job for daily updates

**Acceptance Criteria:**
- Service can fetch rates from selected data source
- Rates are stored in database with timestamps
- Service returns most recent rate for given criteria
- Fallback logic works if primary source fails
- Daily scheduled job updates rates automatically

#### 1.4 Integration with Penalty Calculations (Days 8-10)

**Tasks:**
- Update `renewal.service.ts` to use market rate service
- Replace hardcoded market rate with service call
- Update IRD calculation to use real market rates
- Add error handling for missing market rates
- Update tests

**Code Changes:**
```typescript
// server/src/application/services/renewal.service.ts
// BEFORE:
const marketRate = currentRate; // MVP simplification

// AFTER:
const marketRateService = new MarketRateService();
const marketRate = await marketRateService.getMarketRate(
  activeTerm.termType,
  activeTerm.termYears
) ?? currentRate; // Fallback to current rate if market rate unavailable
```

**Deliverables:**
- Updated renewal service
- Integration tests
- Updated penalty calculations

**Acceptance Criteria:**
- IRD calculations use real market rates
- Fallback to current rate if market rate unavailable
- Error handling prevents crashes
- Tests pass with real market rate data

### Testing Requirements

**Unit Tests:**
- Market rate service methods
- Rate fetching and storage
- Error handling and fallbacks

**Integration Tests:**
- Market rate service with database
- Renewal service with market rate service
- IRD calculation with real market rates

**Manual Testing:**
- Verify rates are fetched daily
- Verify IRD calculations are accurate
- Verify fallback behavior when rates unavailable

### Success Metrics

- Market rates updated daily automatically
- IRD calculations return non-zero values when appropriate
- Penalty estimates are accurate
- System handles missing market rates gracefully

---

## Feature 2: Penalty Calculator UI

**Priority:** HIGH  
**Effort:** 2 weeks  
**Dependencies:** Market Rate Service (can start in parallel, but needs integration)  
**Blocks:** None

### Overview

Create a standalone penalty calculator UI component that allows users to calculate mortgage penalties (IRD and 3-month interest) for early renewal or refinancing decisions.

### Technical Requirements

#### 2.1 Penalty Calculator Component Design (Days 1-2)

**Tasks:**
- Design UI mockup for penalty calculator
- Define component structure and props
- Plan integration points (standalone vs embedded)
- Design input fields and output display

**Component Structure:**
```typescript
// client/src/features/mortgage-tracking/components/penalty-calculator-dialog.tsx
interface PenaltyCalculatorProps {
  mortgageId?: string; // Optional: pre-fill from mortgage
  termId?: string; // Optional: pre-fill from term
  onClose: () => void;
}
```

**UI Elements:**
- Input fields:
  - Current mortgage balance
  - Current interest rate
  - Remaining months in term
  - Market rate (auto-filled from service, editable)
  - Term type (fixed/variable)
- Output display:
  - 3-month interest penalty
  - IRD penalty
  - Which penalty applies (greater of)
  - Total penalty amount
  - Break-even analysis (if applicable)

**Deliverables:**
- UI mockup/design
- Component structure definition
- Props interface

**Acceptance Criteria:**
- Design is clear and user-friendly
- All required inputs are present
- Output is clearly displayed
- Mobile-responsive design

#### 2.2 Penalty Calculator API Endpoint (Days 3-4)

**Tasks:**
- Create API endpoint for penalty calculation
- Accept input parameters
- Call penalty calculation functions
- Return calculated penalties
- Add validation

**API Endpoint:**
```typescript
// server/src/api/routes/mortgage.routes.ts
router.post("/mortgages/calculate-penalty", async (req, res) => {
  const {
    balance,
    currentRate,
    marketRate,
    remainingMonths,
    termType
  } = req.body;
  
  // Validate inputs
  // Calculate penalties
  // Return results
});
```

**Deliverables:**
- API endpoint implementation
- Request/response types
- Validation logic
- Error handling

**Acceptance Criteria:**
- Endpoint accepts all required parameters
- Validation prevents invalid inputs
- Calculations are accurate
- Error messages are clear

#### 2.3 Penalty Calculator UI Component (Days 5-8)

**Tasks:**
- Create React component with form
- Add input fields with validation
- Integrate with API endpoint
- Display calculation results
- Add loading and error states
- Add pre-fill logic from mortgage/term

**Component Implementation:**
```typescript
// client/src/features/mortgage-tracking/components/penalty-calculator-dialog.tsx
export function PenaltyCalculatorDialog({ mortgageId, termId, onClose }: PenaltyCalculatorProps) {
  const form = useForm<PenaltyCalculatorForm>({
    resolver: zodResolver(penaltyCalculatorSchema),
  });
  
  const { data: marketRate } = useQuery({
    queryKey: ["/api/market-rates", form.watch("termType"), form.watch("termYears")],
    enabled: !!form.watch("termType"),
  });
  
  const mutation = useMutation({
    mutationFn: calculatePenalty,
    onSuccess: (data) => {
      // Display results
    },
  });
  
  // Component JSX
}
```

**Deliverables:**
- Penalty calculator dialog component
- Form validation
- API integration
- Results display
- Pre-fill logic

**Acceptance Criteria:**
- Component renders correctly
- Form validation works
- API calls succeed
- Results display accurately
- Pre-fill works from mortgage/term
- Error states handled gracefully

#### 2.4 Integration with Renewal Workflow (Days 9-10)

**Tasks:**
- Add "Calculate Penalty" button to renewal card
- Open penalty calculator from renewal context
- Pre-fill calculator with renewal data
- Add break-even analysis
- Update renewal card to show calculated penalty

**Integration Points:**
- Renewal card (`renewal-card.tsx`)
- Term renewal dialog (optional)
- Refinancing analysis (future)

**Deliverables:**
- Integration with renewal card
- Pre-fill functionality
- Break-even analysis display

**Acceptance Criteria:**
- Calculator opens from renewal card
- Data is pre-filled correctly
- Break-even analysis is displayed
- User can modify inputs and recalculate

### Testing Requirements

**Unit Tests:**
- Penalty calculation functions
- Form validation
- API endpoint

**Integration Tests:**
- Component with API
- Pre-fill logic
- Break-even calculations

**E2E Tests:**
- User opens calculator from renewal card
- User enters values and calculates penalty
- Results display correctly

### Success Metrics

- Users can calculate penalties accurately
- Calculator is accessible from renewal workflow
- Break-even analysis helps decision-making
- Component is responsive and user-friendly

---

## Feature 3: Blend-and-Extend UI

**Priority:** MEDIUM (included in Phase 1)  
**Effort:** 2-3 weeks  
**Dependencies:** Market Rate Service (for market rate input)  
**Blocks:** None

### Overview

Add blend-and-extend renewal option to the term renewal dialog with UI for market rate input, amortization extension, and comparison view.

### Technical Requirements

#### 3.1 Term Renewal Dialog Enhancement (Days 1-3)

**Tasks:**
- Add "Blend-and-Extend" option to renewal dialog
- Create tab or section for blend-and-extend
- Add market rate input field (with auto-fill from service)
- Add amortization extension selector
- Design comparison view layout

**UI Design:**
- Tabs: "New Term" | "Blend-and-Extend"
- Blend-and-extend form:
  - Market rate input (auto-filled, editable)
  - Extended amortization selector
  - Calculate button
- Comparison view:
  - Current payment
  - Blend-and-extend payment
  - Market rate payment
  - Savings per payment
  - Blended rate display

**Deliverables:**
- Updated term renewal dialog
- Blend-and-extend form component
- Comparison view component

**Acceptance Criteria:**
- Blend-and-extend option is visible
- Form inputs are clear
- Market rate auto-fills from service
- Comparison view is easy to understand

#### 3.2 Blend-and-Extend Calculation Integration (Days 4-6)

**Tasks:**
- Integrate existing API endpoint
- Call blend-and-extend calculation
- Display results in comparison view
- Handle errors gracefully
- Add loading states

**Integration:**
```typescript
// Use existing API: POST /api/mortgage-terms/:id/blend-and-extend
const mutation = useMutation({
  mutationFn: async (data) => {
    return apiRequest("POST", `/api/mortgage-terms/${termId}/blend-and-extend`, {
      newMarketRate: data.marketRate,
      extendedAmortizationMonths: data.extendedAmort,
    });
  },
});
```

**Deliverables:**
- API integration
- Results display
- Error handling

**Acceptance Criteria:**
- Calculation works correctly
- Results display accurately
- Errors are handled
- Loading states are shown

#### 3.3 Comparison and Selection (Days 7-9)

**Tasks:**
- Add side-by-side comparison
- Allow user to select blend-and-extend option
- Create new term with blended rate
- Update term creation flow

**Deliverables:**
- Comparison view
- Selection logic
- Term creation with blend-and-extend

**Acceptance Criteria:**
- Comparison is clear
- User can select blend-and-extend
- New term is created correctly
- Workflow is intuitive

### Testing Requirements

**Unit Tests:**
- Form validation
- Calculation integration
- Comparison logic

**Integration Tests:**
- API calls
- Term creation with blend-and-extend

**E2E Tests:**
- User opens renewal dialog
- User selects blend-and-extend
- User enters market rate and amortization
- User views comparison
- User creates new term with blend-and-extend

### Success Metrics

- Users can easily access blend-and-extend option
- Calculations are accurate
- Comparison helps decision-making
- Term creation works correctly

---

## Phase 2: Monitoring Foundation (Weeks 8-22)

### Goal: Build alert system and proactive monitoring features

**Dependencies:** Phase 1 complete (market rate service needed for some alerts)  
**Deliverables:** Alert system, renewal reminders, trigger rate alerts

---

## Feature 4: Alert & Notification System

**Priority:** HIGH (Strategic)  
**Effort:** 6-8 weeks  
**Dependencies:** None (can start in parallel with Phase 1)  
**Blocks:** Renewal Reminders, Trigger Rate Alerts

### Overview

Build the foundation for all monitoring features: email notifications, in-app notification center, user preferences, and alert scheduling.

### Technical Requirements

#### 4.1 Email Service Integration (Week 1)

**Tasks:**
- Research and select email service (SendGrid, Resend, etc.)
- Set up email service account
- Install email service SDK
- Create email service wrapper
- Test email delivery

**Email Service Selection Criteria:**
- Cost-effective for MVP
- Good deliverability
- Easy integration
- Template support
- Analytics

**Implementation:**
```typescript
// server/src/infrastructure/email/email.service.ts
export class EmailService {
  async sendEmail(to: string, subject: string, template: string, data: object): Promise<void>
  async sendRenewalReminder(user: User, renewalInfo: RenewalInfo): Promise<void>
  async sendTriggerRateAlert(user: User, alert: TriggerRateAlert): Promise<void>
  // ... other email types
}
```

**Deliverables:**
- Email service integration
- Email service wrapper class
- Test emails working

**Acceptance Criteria:**
- Emails can be sent successfully
- Templates are supported
- Delivery is reliable
- Error handling works

#### 4.2 Notification Data Model (Week 1)

**Tasks:**
- Design notification database schema
- Create Drizzle schema
- Add migration
- Define notification types

**Schema Design:**
```typescript
// shared/schema.ts
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "renewal_reminder" | "trigger_rate_alert" | "rate_change" | etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: integer("read").notNull().default(0), // boolean
  emailSent: integer("email_sent").notNull().default(0), // boolean
  metadata: jsonb("metadata"), // Additional data (renewal date, trigger rate, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_notifications_user_read").on(table.userId, table.read),
  index("IDX_notifications_created_at").on(table.createdAt),
]);

export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  emailEnabled: integer("email_enabled").notNull().default(1),
  inAppEnabled: integer("in_app_enabled").notNull().default(1),
  renewalReminders: integer("renewal_reminders").notNull().default(1),
  triggerRateAlerts: integer("trigger_rate_alerts").notNull().default(1),
  rateChangeAlerts: integer("rate_change_alerts").notNull().default(1),
  // ... other preferences
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Deliverables:**
- Database schema
- Migration file
- TypeScript types

**Acceptance Criteria:**
- Schema supports all notification types
- User preferences are stored
- Indexes support efficient queries

#### 4.3 Notification Service (Week 2)

**Tasks:**
- Create notification service class
- Implement notification creation
- Add notification retrieval
- Implement read/unread logic
- Add notification deletion
- Integrate with email service

**Service Structure:**
```typescript
// server/src/application/services/notification.service.ts
export class NotificationService {
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: object
  ): Promise<Notification>
  
  async getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>
  
  async markAsRead(notificationId: string, userId: string): Promise<void>
  
  async sendEmailNotification(notification: Notification): Promise<void>
  
  async shouldSendEmail(userId: string, type: NotificationType): Promise<boolean>
}
```

**Deliverables:**
- Notification service class
- Email integration
- Preference checking

**Acceptance Criteria:**
- Notifications can be created
- Email sending respects preferences
- Notifications can be retrieved
- Read/unread logic works

#### 4.4 Notification Queue System (Week 2-3)

**Tasks:**
- Design notification queue
- Implement queue storage (database table)
- Create queue processor
- Add retry logic
- Add error handling

**Queue Design:**
- Store pending notifications in database
- Process queue with scheduled job
- Retry failed emails
- Log failures

**Deliverables:**
- Queue system
- Queue processor
- Retry logic

**Acceptance Criteria:**
- Notifications are queued
- Queue is processed reliably
- Failed notifications are retried
- Errors are logged

#### 4.5 In-App Notification Center UI (Week 3-4)

**Tasks:**
- Design notification center UI
- Create notification list component
- Add unread count badge
- Implement mark as read
- Add notification filtering
- Add notification deletion

**UI Components:**
```typescript
// client/src/shared/components/notification-center.tsx
export function NotificationCenter() {
  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
  });
  
  const unreadCount = notifications?.filter(n => !n.read).length;
  
  // Component JSX
}
```

**Deliverables:**
- Notification center component
- Notification list
- Unread count badge
- Mark as read functionality

**Acceptance Criteria:**
- Notification center is accessible
- Notifications display correctly
- Unread count is accurate
- Mark as read works
- Filtering works

#### 4.6 User Preferences UI (Week 4)

**Tasks:**
- Create notification preferences page
- Add preference toggles
- Save preferences to database
- Update preferences service

**UI Components:**
- Preferences page/section
- Toggle switches for each preference
- Save button
- Success/error feedback

**Deliverables:**
- Preferences UI
- Preferences API
- Save functionality

**Acceptance Criteria:**
- Preferences can be viewed
- Preferences can be updated
- Changes are saved
- Email/in-app toggles work

#### 4.7 Alert Scheduling Infrastructure (Week 5-6)

**Tasks:**
- Design alert scheduling system
- Create scheduled jobs framework
- Implement job registration
- Add job execution logic
- Add job monitoring

**Scheduling System:**
```typescript
// server/src/infrastructure/jobs/alert-scheduler.ts
export class AlertScheduler {
  registerJob(name: string, schedule: string, handler: () => Promise<void>): void
  start(): void
  stop(): void
}
```

**Deliverables:**
- Scheduling framework
- Job registration system
- Job execution

**Acceptance Criteria:**
- Jobs can be registered
- Jobs run on schedule
- Jobs can be monitored
- Errors are handled

#### 4.8 Testing and Documentation (Week 7-8)

**Tasks:**
- Write unit tests
- Write integration tests
- Test email delivery
- Test notification flow
- Document API endpoints
- Create user guide

**Deliverables:**
- Test suite
- API documentation
- User guide

**Acceptance Criteria:**
- All tests pass
- Documentation is complete
- System is production-ready

### Testing Requirements

**Unit Tests:**
- Notification service methods
- Email service
- Preference checking
- Queue processing

**Integration Tests:**
- Notification creation and retrieval
- Email sending
- Preference updates
- Queue processing

**E2E Tests:**
- User receives notification
- User views notification center
- User marks notification as read
- User updates preferences

### Success Metrics

- Notifications are created and stored
- Emails are sent successfully
- Notification center is functional
- User preferences are respected
- System is reliable and scalable

---

## Feature 5: Renewal Reminders

**Priority:** HIGH  
**Effort:** 4-6 weeks  
**Dependencies:** Alert & Notification System (Feature 4)  
**Blocks:** None

### Overview

Implement automated renewal reminders that alert users at 6 months, 3 months, 1 month, and 1 week before term renewal.

### Technical Requirements

#### 5.1 Renewal Check Scheduled Job (Week 1)

**Tasks:**
- Create scheduled job for renewal checks
- Query all active mortgages
- Calculate days until renewal
- Determine which reminders to send
- Create notifications

**Job Implementation:**
```typescript
// server/src/infrastructure/jobs/renewal-reminder-job.ts
export async function checkRenewalsAndSendReminders() {
  const mortgages = await getActiveMortgages();
  
  for (const mortgage of mortgages) {
    const renewalInfo = await renewalService.getRenewalStatus(mortgage.id);
    if (!renewalInfo) continue;
    
    const daysUntil = renewalInfo.daysUntilRenewal;
    
    // Check if reminder should be sent
    if (shouldSendReminder(daysUntil)) {
      await sendRenewalReminder(mortgage.userId, renewalInfo);
    }
  }
}

function shouldSendReminder(daysUntil: number): boolean {
  return daysUntil === 180 || daysUntil === 90 || daysUntil === 30 || daysUntil === 7;
}
```

**Deliverables:**
- Scheduled job
- Renewal check logic
- Reminder determination logic

**Acceptance Criteria:**
- Job runs daily
- Renewals are checked correctly
- Reminders are sent at correct intervals
- No duplicate reminders

#### 5.2 Renewal Reminder Email Templates (Week 1-2)

**Tasks:**
- Design email templates
- Create HTML templates
- Add dynamic data insertion
- Test email rendering
- Add unsubscribe link

**Email Template:**
- Subject: "Your mortgage renewal is approaching"
- Content:
  - Days until renewal
  - Current rate
  - Estimated penalty
  - Action items
  - Link to renewal planning

**Deliverables:**
- Email templates
- Template rendering logic
- Test emails

**Acceptance Criteria:**
- Templates render correctly
- Dynamic data is inserted
- Emails are readable
- Unsubscribe works

#### 5.3 Renewal Rate Comparison Tool (Week 2-3)

**Tasks:**
- Create rate comparison component
- Fetch current market rates
- Compare with user's current rate
- Display comparison
- Add to renewal reminder email

**Comparison Display:**
- Current rate vs market rate
- Potential savings
- Rate trend
- Recommendation

**Deliverables:**
- Rate comparison component
- Market rate integration
- Comparison logic

**Acceptance Criteria:**
- Comparison is accurate
- Market rates are current
- Display is clear
- Recommendations are helpful

#### 5.4 Renewal Decision Support UI (Week 3-4)

**Tasks:**
- Create renewal planning page
- Display renewal information
- Add rate comparison
- Add penalty calculator integration
- Add renewal options (new term, blend-and-extend)
- Add decision workflow

**UI Components:**
- Renewal overview card
- Rate comparison section
- Penalty calculator
- Renewal options
- Action buttons

**Deliverables:**
- Renewal planning page
- Decision support UI
- Workflow integration

**Acceptance Criteria:**
- Page displays all renewal info
- Rate comparison is visible
- Penalty calculator accessible
- Renewal options are clear
- Workflow is intuitive

#### 5.5 Testing and Refinement (Week 5-6)

**Tasks:**
- Test reminder scheduling
- Test email delivery
- Test rate comparison
- Test decision support UI
- Refine based on feedback

**Deliverables:**
- Test suite
- Refined implementation
- Documentation

**Acceptance Criteria:**
- All reminders sent correctly
- Emails are delivered
- UI is functional
- System is production-ready

### Testing Requirements

**Unit Tests:**
- Renewal check logic
- Reminder determination
- Rate comparison
- Email template rendering

**Integration Tests:**
- Scheduled job execution
- Notification creation
- Email sending
- Rate comparison API

**E2E Tests:**
- User receives renewal reminder
- User views renewal planning page
- User compares rates
- User calculates penalty
- User makes renewal decision

### Success Metrics

- Reminders sent at correct intervals
- Emails are delivered successfully
- Rate comparison is accurate
- Users find decision support helpful
- Renewal workflow is complete

---

## Feature 6: Trigger Rate Alerts

**Priority:** HIGH  
**Effort:** 3-4 weeks  
**Dependencies:** Alert & Notification System (Feature 4)  
**Blocks:** None

### Overview

Implement daily monitoring of trigger rates for VRM-Fixed Payment mortgages with proactive alerts when approaching or hitting trigger rate.

### Technical Requirements

#### 6.1 Trigger Rate Check Scheduled Job (Week 1)

**Tasks:**
- Create scheduled job for daily trigger rate checks
- Query all VRM-Fixed Payment mortgages
- Calculate current trigger rate
- Calculate distance to trigger rate
- Determine if alert should be sent

**Job Implementation:**
```typescript
// server/src/infrastructure/jobs/trigger-rate-monitor-job.ts
export async function checkTriggerRatesAndSendAlerts() {
  const vrms = await getVRMFixedPaymentMortgages();
  
  for (const vrm of vrms) {
    const triggerRate = calculateTriggerRate(
      vrm.paymentAmount,
      vrm.currentBalance,
      vrm.paymentFrequency
    );
    
    const currentRate = getCurrentEffectiveRate(vrm);
    const distanceToTrigger = currentRate - triggerRate;
    
    if (shouldSendAlert(distanceToTrigger, vrm.userId)) {
      await sendTriggerRateAlert(vrm.userId, {
        currentRate,
        triggerRate,
        distanceToTrigger,
        balance: vrm.currentBalance,
      });
    }
  }
}

function shouldSendAlert(distanceToTrigger: number, userId: string): boolean {
  // Check user's alert preferences
  // Check if alert already sent recently
  // Determine alert threshold (1%, 0.5%, hit)
  return distanceToTrigger <= 0.01 || distanceToTrigger <= 0.005 || distanceToTrigger <= 0;
}
```

**Deliverables:**
- Scheduled job
- Trigger rate calculation
- Alert determination logic

**Acceptance Criteria:**
- Job runs daily
- Trigger rates calculated correctly
- Alerts sent at appropriate thresholds
- No duplicate alerts

#### 6.2 Trigger Rate Alert Email Templates (Week 1-2)

**Tasks:**
- Design alert email templates
- Create templates for different thresholds
- Add impact analysis
- Add recommendations
- Test email rendering

**Email Templates:**
- **Approaching (1%):** Warning that trigger rate is approaching
- **Close (0.5%):** Urgent warning
- **Hit:** Alert that trigger rate has been hit, negative amortization starting

**Content:**
- Current rate vs trigger rate
- Distance to trigger rate
- Impact if hit (balance increase)
- Recommendations (prepayment, etc.)

**Deliverables:**
- Email templates
- Template rendering
- Test emails

**Acceptance Criteria:**
- Templates are clear and actionable
- Impact is explained
- Recommendations are helpful
- Emails are delivered

#### 6.3 Impact Analysis Calculations (Week 2)

**Tasks:**
- Calculate balance increase if trigger rate hit
- Project negative amortization
- Calculate monthly balance increase
- Add to alert data

**Calculations:**
- Monthly balance increase = (currentRate - triggerRate) × balance × (1/12)
- Projected balance at term end
- Total negative amortization

**Deliverables:**
- Impact calculation functions
- Projection logic
- Integration with alerts

**Acceptance Criteria:**
- Calculations are accurate
- Impact is clearly communicated
- Projections are helpful

#### 6.4 Trigger Rate Alert UI (Week 2-3)

**Tasks:**
- Create trigger rate alert component
- Display current status
- Show distance to trigger rate
- Display impact analysis
- Add historical tracking

**UI Components:**
- Trigger rate status card
- Distance to trigger rate indicator
- Impact analysis section
- Historical chart
- Alert history

**Deliverables:**
- Trigger rate alert UI
- Status display
- Impact visualization
- Historical tracking

**Acceptance Criteria:**
- Status is clearly displayed
- Distance to trigger is visible
- Impact is understandable
- Historical data is available

#### 6.5 Testing and Refinement (Week 3-4)

**Tasks:**
- Test daily monitoring
- Test alert thresholds
- Test email delivery
- Test impact calculations
- Refine based on feedback

**Deliverables:**
- Test suite
- Refined implementation
- Documentation

**Acceptance Criteria:**
- Monitoring works correctly
- Alerts sent at right times
- Calculations are accurate
- System is production-ready

### Testing Requirements

**Unit Tests:**
- Trigger rate calculations
- Alert determination
- Impact calculations
- Email template rendering

**Integration Tests:**
- Scheduled job execution
- Alert creation
- Email sending
- Impact calculations

**E2E Tests:**
- User receives trigger rate alert
- User views trigger rate status
- User sees impact analysis
- User takes action (prepayment)

### Success Metrics

- Alerts sent at appropriate thresholds
- Emails are delivered successfully
- Impact analysis is accurate
- Users find alerts helpful
- System prevents negative amortization surprises

---

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-7)

| Week | Feature | Tasks | Deliverable |
|------|---------|-------|-------------|
| 1 | Market Rate Service | Research, schema, service | Market rate service |
| 2 | Market Rate Service | Integration, testing | Complete service |
| 3 | Penalty Calculator UI | Design, API, component | Calculator UI |
| 4 | Penalty Calculator UI | Integration, testing | Complete calculator |
| 5-6 | Blend-and-Extend UI | Dialog enhancement, integration | Complete UI |
| 7 | Phase 1 Testing | Integration testing, bug fixes | Phase 1 complete |

### Phase 2: Monitoring Foundation (Weeks 8-22)

| Week | Feature | Tasks | Deliverable |
|------|---------|-------|-------------|
| 8-9 | Alert System | Email service, data model | Foundation |
| 10-11 | Alert System | Notification service, queue | Core system |
| 12-13 | Alert System | UI, preferences, scheduling | Complete system |
| 14-15 | Alert System | Testing, documentation | Production ready |
| 16-17 | Renewal Reminders | Job, templates, comparison | Reminders working |
| 18-19 | Renewal Reminders | Decision support, testing | Complete |
| 20-21 | Trigger Rate Alerts | Job, templates, impact | Alerts working |
| 22 | Trigger Rate Alerts | UI, testing, refinement | Complete |

---

## Risk Mitigation

### Technical Risks

**Risk:** Market rate data source unavailable or unreliable  
**Mitigation:** 
- Research multiple sources
- Implement fallback logic
- Allow manual rate entry
- Cache rates for reliability

**Risk:** Email delivery issues  
**Mitigation:**
- Use reputable email service
- Implement retry logic
- Monitor delivery rates
- Add fallback notification methods

**Risk:** Scheduled jobs fail  
**Mitigation:**
- Add error handling
- Implement job monitoring
- Add alerting for job failures
- Log all job executions

### Timeline Risks

**Risk:** Features take longer than estimated  
**Mitigation:**
- Build in buffer time
- Prioritize critical features
- Defer non-critical enhancements
- Regular progress reviews

**Risk:** Dependencies delay start  
**Mitigation:**
- Start independent features in parallel
- Identify critical path early
- Have fallback plans
- Regular dependency checks

---

## Success Criteria

### Phase 1 Complete When:
- ✅ Market rate service fetches and stores rates daily
- ✅ IRD calculations use real market rates
- ✅ Penalty calculator UI is functional
- ✅ Blend-and-extend UI is integrated
- ✅ All tests pass
- ✅ Documentation is complete

### Phase 2 Complete When:
- ✅ Alert system is operational
- ✅ Renewal reminders sent automatically
- ✅ Trigger rate alerts sent daily
- ✅ Notification center is functional
- ✅ User preferences work
- ✅ All tests pass
- ✅ Documentation is complete

---

## Next Steps

1. **Review and Approve Plan** - Stakeholder review
2. **Set Up Development Environment** - Prepare for implementation
3. **Start Phase 1** - Begin with Market Rate Service
4. **Weekly Progress Reviews** - Track progress and adjust
5. **Phase 1 Demo** - Demo completed features
6. **Start Phase 2** - Begin Alert System
7. **Phase 2 Demo** - Demo monitoring features
8. **Production Deployment** - Deploy to production

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Next Review:** Weekly during implementation

