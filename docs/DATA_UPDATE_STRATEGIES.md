# Data Update Strategies

This document describes the strategies and approaches used for updating key data points in the HomeWealth application, including current balance, prime rate, and property value.

## Table of Contents

1. [Current Balance Updates](#current-balance-updates)
2. [Prime Rate Updates](#prime-rate-updates)
3. [Property Value Updates](#property-value-updates)
4. [Update Frequency](#update-frequency)
5. [Data Validation](#data-validation)
6. [Error Handling](#error-handling)

---

## Current Balance Updates

### Update Triggers

The current mortgage balance is updated in the following scenarios:

1. **Payment Recording**: When a regular payment is recorded
2. **Prepayment Recording**: When a prepayment is made
3. **Payment Correction**: When a payment entry is corrected
4. **Recast Event**: When a mortgage recast occurs
5. **Refinancing**: When a mortgage is refinanced
6. **Renewal**: When a mortgage term is renewed

### Calculation Method

The current balance is calculated based on the amortization schedule:

```
New Balance = Previous Balance - Principal Payment - Prepayment Amount
```

**Implementation**: `server/src/application/services/mortgage-payment.service.ts`

### Update Process

1. **Fetch Current Balance**: Retrieve from `mortgages.currentBalance`
2. **Calculate New Balance**: Apply payment/prepayment logic
3. **Validate**: Ensure balance doesn't go negative
4. **Update Database**: Persist new balance
5. **Log Event**: Record balance change event (if applicable)

### Validation Rules

- Balance cannot be negative
- Balance cannot exceed original mortgage amount
- Balance must be consistent with payment history

---

## Prime Rate Updates

### Update Sources

Prime rate updates come from:

1. **Bank of Canada**: Official BoC prime rate (primary source)
2. **Lender-Specific Rates**: Some lenders may have different prime rates
3. **Manual Entry**: Users can manually update prime rate

### Update Frequency

- **Automatic**: Daily check via cron job
- **Manual**: User-triggered updates
- **Event-Driven**: When variable rate mortgage terms are created/updated

### Update Process

1. **Fetch Latest Rate**: Query external API or user input
2. **Validate Rate**: Ensure rate is within reasonable bounds (e.g., 0% - 20%)
3. **Store History**: Record in `primeRateHistory` table
4. **Update Affected Terms**: Recalculate rates for variable rate mortgages
5. **Recalculate Payments**: Update payment amounts for "variable-changing" terms
6. **Send Notifications**: Alert users of significant rate changes

**Implementation**: `server/src/application/services/prime-rate-tracking.service.ts`

### Rate Change Detection

Significant rate changes trigger:
- Payment recalculation for variable-changing mortgages
- Trigger rate checks for variable-fixed mortgages
- Notification alerts (if enabled)

**Threshold**: Rate changes > 0.25% (25 basis points)

### Historical Tracking

All prime rate changes are stored with:
- Effective date
- Rate value
- Source (BoC, lender, manual)
- Notes (optional)

---

## Property Value Updates

### Update Sources

Property value can be updated from:

1. **User Input**: Manual entry by user
2. **Assessment**: Municipal property assessment
3. **Appraisal**: Professional property appraisal
4. **Estimate**: Automated estimate (e.g., from real estate APIs)

### Update Frequency

- **Manual**: User-triggered (no automatic updates)
- **Assessment**: Typically annual (municipal assessments)
- **Appraisal**: On-demand (user-initiated)

### Update Process

1. **Receive Update**: User input or external data source
2. **Validate Value**: Ensure value is positive and reasonable
3. **Store History**: Record in `propertyValueHistory` table
4. **Update Mortgage**: Update `mortgages.propertyPrice` if applicable
5. **Recalculate HELOC Limits**: Update HELOC credit limits based on new LTV
6. **Send Notifications**: Alert if HELOC credit limit increases

**Implementation**: `server/src/application/services/property-value.service.ts`

### HELOC Credit Limit Recalculation

When property value changes:

```
New Credit Limit = (New Property Value × LTV) - Outstanding Mortgage Balance
Previous Credit Limit = (Old Property Value × LTV) - Outstanding Mortgage Balance
Credit Limit Increase = New Credit Limit - Previous Credit Limit
```

If credit limit increases significantly (>$10,000), a notification is sent.

### Validation Rules

- Property value must be positive
- Property value should be within reasonable range (e.g., $50,000 - $50,000,000)
- Property value should not decrease by more than 50% without validation
- Property value should not increase by more than 200% without validation

---

## Update Frequency

### Scheduled Updates (Cron Jobs)

1. **Prime Rate Check**: Daily at 9:00 AM
   - Checks for new BoC prime rate
   - Updates affected mortgages

2. **Prepayment Limit Check**: Daily at 8:00 AM
   - Checks prepayment usage
   - Sends alerts at 80%, 90%, 100% thresholds

3. **Payment Due Reminders**: Daily at 7:00 AM
   - Checks upcoming payment due dates
   - Sends reminders based on user preferences

4. **Recast Opportunity Check**: Weekly (Monday at 9:00 AM)
   - Analyzes recent prepayments
   - Detects recast opportunities

5. **Renewal Reminders**: Daily at 8:00 AM
   - Checks mortgages approaching renewal
   - Sends reminders at 90, 60, 30 days before renewal

**Implementation**: `server/src/infrastructure/jobs/`

### Event-Driven Updates

Updates triggered by user actions:

- **Payment Recording**: Immediate balance update
- **Prepayment Recording**: Immediate balance and prepayment limit update
- **Property Value Update**: Immediate HELOC limit recalculation
- **Prime Rate Update**: Immediate variable rate mortgage updates

---

## Data Validation

### Balance Validation

```typescript
function validateBalance(balance: number, originalAmount: number): boolean {
  return balance >= 0 && balance <= originalAmount;
}
```

### Rate Validation

```typescript
function validateRate(rate: number): boolean {
  return rate >= 0 && rate <= 0.20; // 0% to 20%
}
```

### Property Value Validation

```typescript
function validatePropertyValue(value: number): boolean {
  return value >= 50000 && value <= 50000000; // $50k to $50M
}
```

### LTV Validation

```typescript
function validateLTV(mortgageAmount: number, propertyValue: number, isHighRatio: boolean): boolean {
  const ltv = mortgageAmount / propertyValue;
  const maxLtv = isHighRatio ? 0.95 : 0.80;
  return ltv <= maxLtv;
}
```

---

## Error Handling

### Update Failures

When an update fails:

1. **Log Error**: Record in application logs
2. **Retry Logic**: Automatic retry for transient failures (up to 3 attempts)
3. **User Notification**: Alert user if manual intervention required
4. **Rollback**: Revert to previous state if update is invalid

### Data Consistency

- **Transactions**: Use database transactions for multi-step updates
- **Validation**: Validate before and after updates
- **Audit Trail**: Log all significant data changes

### Recovery Strategies

1. **Automatic Recovery**: Retry failed updates
2. **Manual Recovery**: Admin tools for data correction
3. **Data Reconciliation**: Periodic checks for data consistency

---

## Best Practices

1. **Always Validate**: Validate all inputs before updating
2. **Store History**: Maintain historical records of all changes
3. **Use Transactions**: Group related updates in transactions
4. **Log Changes**: Log all significant data modifications
5. **Notify Users**: Alert users of important changes
6. **Handle Errors Gracefully**: Provide clear error messages
7. **Test Updates**: Test update logic thoroughly
8. **Monitor Performance**: Track update performance and optimize

---

## References

- **Implementation**: See `server/src/application/services/`
- **Cron Jobs**: See `server/src/infrastructure/jobs/`
- **Repositories**: See `server/src/infrastructure/repositories/`

