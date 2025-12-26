# Notifications & Alerts Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

The Notifications & Alerts system provides proactive monitoring and timely alerts to help homeowners manage their mortgages effectively. Key benefits:

- **Proactive Management:** Early warnings for important mortgage events (renewals, trigger rates, prepayment limits)
- **Opportunity Identification:** Alerts for beneficial actions (recast opportunities, credit limit increases)
- **User Engagement:** Regular notifications drive user return and feature adoption
- **Financial Optimization:** Timely alerts enable users to take advantage of opportunities and avoid penalties

### Market Context

**Notification Best Practices:**

- **Renewal Reminders:** Industry standard is 90-180 days before renewal date
- **Trigger Rate Alerts:** Critical for variable-fixed mortgages (balance can increase)
- **Prepayment Limits:** Alerts help users maximize prepayment room before reset
- **Email + In-App:** Dual-channel delivery for maximum reach

**Industry Statistics:**

- 60% of homeowners miss renewal deadlines without reminders
- Average savings from timely renewal action: $500-$2,000 over 5-year term
- Trigger rate alerts prevent negative amortization surprises
- Prepayment limit alerts help maximize annual prepayment room usage

**Strategic Importance:**

- User retention driver (regular touchpoints)
- Risk mitigation (prevents costly mistakes)
- Feature discovery (alerts lead to feature usage)
- Competitive differentiation (comprehensive alert system)

---

## Domain Overview

### Notification Types

1. **Renewal Reminders:**
   - Triggered at configurable days before renewal (default: 180, 90, 30, 7 days)
   - Includes current rate, market rate comparison, estimated penalty
   - Escalation reminders as deadline approaches

2. **Trigger Rate Alerts:**
   - For variable-fixed-payment mortgages
   - Alert types: approaching, close, hit
   - Includes current rate, trigger rate, balance impact

3. **Rate Change Notifications:**
   - When prime rate changes (for variable mortgages)
   - Payment amount change (for variable-changing mortgages)

4. **Penalty Alerts:**
   - When penalty is calculated
   - Warning before taking action that triggers penalty

5. **Prepayment Limit Alerts:**
   - At 80%, 90%, and 100% of annual limit
   - Helps users maximize prepayment room

6. **Payment Due Reminders:**
   - Configurable days before payment due date
   - Helps prevent missed payments

7. **HELOC Credit Limit Increase:**
   - When property value update increases HELOC credit limit
   - Shows previous limit, new limit, increase amount

8. **HELOC Draw Period Transition:**
   - When HELOC draw period ends
   - Payment type change notification

9. **Recast Opportunity:**
   - When large prepayment creates recast opportunity
   - Shows potential payment reduction

10. **Blend-and-Extend Available:**
    - When blend-and-extend option becomes available
    - Shows potential benefits

### Notification Channels

1. **In-App Notifications:**
   - Displayed in notification center
   - Unread count badge
   - Mark as read / mark all as read
   - Delete notification

2. **Email Notifications:**
   - Sent based on user preferences
   - Type-specific email templates
   - HTML formatted emails
   - Email sent tracking

### Notification Preferences

1. **Global Settings:**
   - Email enabled/disabled
   - In-app enabled/disabled

2. **Type-Specific Settings:**
   - Renewal reminders (on/off, reminder days)
   - Trigger rate alerts (on/off, threshold)
   - Rate change alerts (on/off)
   - Penalty alerts (on/off)
   - Blend-and-extend alerts (on/off)
   - Prepayment limit alerts (on/off)
   - Payment due reminders (on/off, reminder days)

---

## Feature Requirements

### Data Models

#### notifications Table

```typescript
{
  id: string (UUID, primary key)
  userId: string (foreign key → users.id)
  type: NotificationType (not null)
  title: string (not null)
  message: string (not null)
  metadata: jsonb (optional, stores type-specific data)
  read: boolean (default false)
  emailSent: boolean (default false)
  createdAt: timestamp (default now)
}
```

#### notification_preferences Table

```typescript
{
  id: string (UUID, primary key)
  userId: string (foreign key → users.id, unique)
  emailEnabled: boolean (default true)
  inAppEnabled: boolean (default true)
  renewalReminders: boolean (default true)
  renewalReminderDays: string (default "180,90,30,7") // comma-separated
  triggerRateAlerts: boolean (default true)
  triggerRateThreshold: decimal (default 0.5%) // percentage
  rateChangeAlerts: boolean (default true)
  penaltyAlerts: boolean (default true)
  blendExtendAlerts: boolean (default true)
  prepaymentLimitAlerts: boolean (default true)
  paymentDueReminders: boolean (default true)
  paymentDueReminderDays: integer? (default 3)
  updatedAt: timestamp (default now)
}
```

### Notification Service

**Methods:**
- `createNotification(userId, type, title, message, metadata?): Promise<Notification>`
- `getNotifications(userId, options?): Promise<Notification[]>`
- `getUnreadCount(userId): Promise<number>`
- `markAsRead(notificationId, userId): Promise<boolean>`
- `markAllAsRead(userId): Promise<number>`
- `deleteNotification(notificationId, userId): Promise<boolean>`
- `sendEmailNotification(notification): Promise<void>`
- `shouldSendEmail(userId, type): Promise<boolean>`
- `getPreferences(userId): Promise<NotificationPreferences>`
- `updatePreferences(userId, updates): Promise<NotificationPreferences>`

### Scheduled Jobs

1. **Renewal Reminder Job:**
   - Runs daily
   - Checks mortgages with renewals approaching
   - Sends reminders at configured days (180, 90, 30, 7)
   - Escalation reminders as deadline approaches

2. **Trigger Rate Alert Job:**
   - Runs daily
   - Checks all variable-fixed-payment mortgages
   - Determines alert type (approaching, close, hit)
   - Sends alerts based on distance to trigger rate

3. **Prepayment Limit Check Job:**
   - Runs daily
   - Checks prepayment usage for all mortgages
   - Sends alerts at 80%, 90%, 100% thresholds

4. **Payment Due Reminder Job:**
   - Runs daily
   - Checks upcoming payment dates
   - Sends reminders at configured days before due date

5. **Recast Opportunity Check Job:**
   - Runs daily
   - Checks for large prepayments
   - Identifies recast opportunities
   - Sends alerts

### Email Templates

1. **Renewal Reminder Email:**
   - Personalized greeting
   - Renewal date and days until
   - Current rate and market rate comparison
   - Estimated penalty
   - Call-to-action link

2. **Trigger Rate Alert Email:**
   - Personalized greeting
   - Mortgage name
   - Current rate vs trigger rate
   - Balance impact information
   - Call-to-action link

3. **Generic Email:**
   - HTML formatted
   - Title and message
   - Call-to-action link

---

## User Stories & Acceptance Criteria

### US-1: View Notifications

**As a** homeowner  
**I want to** view my notifications  
**So that** I can stay informed about important mortgage events

**Acceptance Criteria:**
- ✅ Notification center displays all notifications
- ✅ Unread notifications highlighted
- ✅ Notifications sorted by date (newest first)
- ✅ Unread count badge displayed
- ✅ Notification details visible (title, message, date)
- ✅ Filter by read/unread (optional)

### US-2: Mark Notification as Read

**As a** homeowner  
**I want to** mark notifications as read  
**So that** I can track what I've already seen

**Acceptance Criteria:**
- ✅ Mark individual notification as read
- ✅ Mark all notifications as read
- ✅ Unread count updates after marking as read
- ✅ Read notifications visually distinguished

### US-3: Receive Renewal Reminder

**As a** homeowner  
**I want to** receive renewal reminders  
**So that** I don't miss renewal deadlines

**Acceptance Criteria:**
- ✅ Reminder sent at configured days before renewal (180, 90, 30, 7)
- ✅ Reminder includes renewal date and days until
- ✅ Reminder includes current rate and market rate comparison
- ✅ Reminder includes estimated penalty
- ✅ Reminder sent via in-app and email (based on preferences)

### US-4: Receive Trigger Rate Alert

**As a** homeowner  
**I want to** receive trigger rate alerts  
**So that** I know when my variable-fixed mortgage is at risk

**Acceptance Criteria:**
- ✅ Alert sent when approaching trigger rate (based on threshold)
- ✅ Alert sent when close to trigger rate
- ✅ Alert sent when trigger rate hit
- ✅ Alert includes current rate, trigger rate, balance impact
- ✅ Alert sent via in-app and email (based on preferences)

### US-5: Configure Notification Preferences

**As a** homeowner  
**I want to** configure notification preferences  
**So that** I control what notifications I receive

**Acceptance Criteria:**
- ✅ Global email/in-app toggles
- ✅ Type-specific notification toggles
- ✅ Renewal reminder days configuration
- ✅ Trigger rate threshold configuration
- ✅ Payment due reminder days configuration
- ✅ Preferences saved and applied

---

## Technical Implementation Notes

### API Endpoints

#### GET /api/notifications

**Query Parameters:**
- `unreadOnly?: boolean`
- `limit?: number`
- `offset?: number`

**Response:**
```typescript
Array<Notification>
```

#### PATCH /api/notifications/:id/read

**Response:**
```typescript
{
  success: boolean
}
```

#### POST /api/notifications/mark-all-read

**Response:**
```typescript
{
  count: number
}
```

#### DELETE /api/notifications/:id

**Response:**
```typescript
{
  success: boolean
}
```

#### GET /api/notifications/preferences

**Response:**
```typescript
NotificationPreferences
```

#### PATCH /api/notifications/preferences

**Request Body:**
```typescript
Partial<UpdateNotificationPreferences>
```

**Response:**
```typescript
NotificationPreferences
```

### Frontend Components

#### NotificationCenter

**Features:**
- Notification list display
- Unread count badge
- Mark as read / mark all as read
- Delete notification
- Filter by read/unread
- Empty state

#### NotificationPreferences

**Features:**
- Global email/in-app toggles
- Type-specific notification toggles
- Renewal reminder days configuration
- Trigger rate threshold configuration
- Payment due reminder days configuration
- Save preferences button

---

## Edge Cases & Error Handling

### Edge Cases

1. **Email Sending Failure:**
   - Log error but don't fail notification creation
   - Retry mechanism for failed emails
   - Email sent flag updated only on success

2. **User Has No Email:**
   - Skip email sending
   - Only send in-app notification
   - Log warning

3. **Duplicate Notifications:**
   - Deduplication logic for scheduled jobs
   - Don't send same notification multiple times in short period

4. **Preference Not Set:**
   - Use defaults for new users
   - Create preferences record on first access

### Error Handling

1. **Notification Creation Errors:**
   - Log error
   - Return error response
   - Don't block user action that triggered notification

2. **Email Sending Errors:**
   - Log error
   - Continue with in-app notification
   - Don't fail notification creation

---

## Testing Considerations

### Unit Tests

1. **Notification Creation:**
   - Create notification with all types
   - Metadata storage and retrieval
   - Read/unread status

2. **Email Sending Logic:**
   - Email preference checking
   - Email template generation
   - Email sending tracking

3. **Preferences:**
   - Preference creation (defaults)
   - Preference updates
   - Preference retrieval

### Integration Tests

1. **Scheduled Jobs:**
   - Renewal reminder job
   - Trigger rate alert job
   - Prepayment limit check job
   - Payment due reminder job

2. **Notification Flow:**
   - Notification creation
   - Email sending
   - In-app notification display

### End-to-End Tests

1. **Receive Notification:**
   - User receives renewal reminder
   - Notification appears in notification center
   - Email sent (if enabled)

2. **Configure Preferences:**
   - User updates notification preferences
   - Preferences saved
   - Notifications respect new preferences

---

## Future Enhancements

### Phase 1: Advanced Notification Features

- **Push Notifications:** Mobile push notifications for critical alerts
- **SMS Notifications:** SMS option for urgent notifications
- **Notification Grouping:** Group related notifications
- **Notification Actions:** Quick actions from notification (e.g., "Renew Now")

### Phase 2: Smart Notifications

- **Notification Timing:** AI-based optimal send times
- **Notification Frequency:** Throttling to avoid notification fatigue
- **Personalization:** Personalized notification content based on user behavior

### Phase 3: Notification Analytics

- **Open Rates:** Track notification open rates
- **Click-Through Rates:** Track notification click-through rates
- **Engagement Metrics:** Analyze which notifications drive feature usage

---

**End of Notifications & Alerts Feature Specification**

