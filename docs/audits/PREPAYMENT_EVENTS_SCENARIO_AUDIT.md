# Prepayment Events in Scenario Calculations - Audit

**Date:** 2025-01-27  
**Status:** ✅ Verified with Issues Found

---

## Question

Are prepayment events (annual recurring and one-time) properly taken into account when creating scenarios?

---

## Audit Results

### ✅ Frontend: Prepayment Events Are Collected

**Location:** `client/src/features/scenario-management/components/prepayment-events-card.tsx`

The UI allows users to add:
- **Annual (recurring every year)** prepayment events
  - Amount
  - Which Month (1-12, e.g., March for Tax Refund)
- **One-Time** prepayment events
  - Amount
  - Which Year (offset from mortgage start)

**Data Structure:**
```typescript
{
  eventType: "annual" | "one-time",
  amount: number,
  recurrenceMonth?: number, // 1-12 for annual events
  oneTimeYear?: number, // year offset for one-time events
  startPaymentNumber?: number
}
```

---

### ✅ Frontend: Prepayment Events Are Converted for API

**Location:** `client/src/features/scenario-management/hooks/use-scenario-editor-projections.ts`

The frontend converts prepayment events to API format:
```typescript
const apiPrepaymentEvents = prepaymentEvents.map((event) => {
  let startPaymentNumber = event.startPaymentNumber || 1;
  if (event.eventType === "one-time" && event.oneTimeYear) {
    startPaymentNumber = (event.oneTimeYear - 1) * 12 + 1; // ⚠️ ASSUMES MONTHLY
  }
  
  return {
    type: event.eventType as "annual" | "one-time",
    amount: Number(event.amount || 0),
    startPaymentNumber,
    recurrenceMonth: event.recurrenceMonth || undefined,
  };
});
```

---

### ✅ Backend: Prepayment Events Are Received and Processed

**Location:** `server/src/api/routes/mortgage.routes.ts`

1. **Schema accepts prepayment events** (lines 533-539)
2. **Events are converted** to calculation engine format (lines 646-654)
3. **Events are passed** to `generateAmortizationScheduleWithPayment` (line 665)

---

### ✅ Calculation Engine: Prepayment Events Are Applied

**Location:** `server/src/shared/calculations/mortgage.ts`

The calculation engine processes:
- **One-time events:** Applied at specified `startPaymentNumber` (line 580)
- **Annual events:** Applied when `recurrenceMonth` matches current month (lines 586-602)

---

## ⚠️ CRITICAL ISSUES FOUND

### Issue 1: Payment Frequency Hardcoded to Monthly

**Location:** `use-scenario-editor-projections.ts` (line 59)

```typescript
paymentFrequency: "monthly", // ⚠️ HARDCODED
```

**Problem:** The projection request always uses `"monthly"` regardless of the actual mortgage payment frequency.

**Impact:**
- For biweekly/weekly mortgages, projections use incorrect payment frequency
- Prepayment event timing calculations are wrong
- Interest calculations may be inaccurate

---

### Issue 2: One-Time Event Conversion Assumes Monthly

**Location:** `use-scenario-editor-projections.ts` (line 44)

```typescript
if (event.eventType === "one-time" && event.oneTimeYear) {
  startPaymentNumber = (event.oneTimeYear - 1) * 12 + 1; // ⚠️ ASSUMES 12 PAYMENTS/YEAR
}
```

**Problem:** Converts year to payment number assuming 12 payments/year (monthly).

**Example:**
- Biweekly mortgage: 26 payments/year
- User selects "Year 2" for one-time prepayment
- **Expected:** Payment 27 (start of 2nd year)
- **Actual:** Payment 13 (wrong - assumes monthly)

---

### Issue 3: Annual Event Month Matching Only Works for Monthly

**Location:** `mortgage.ts` (line 591)

```typescript
p.recurrenceMonth === currentMonth // ⚠️ ASSUMES MONTHLY PAYMENTS
```

**Problem:** Annual events check if `recurrenceMonth` matches the current payment's calendar month. This only works correctly for monthly payments.

**For non-monthly frequencies:**
- Biweekly: Payments occur every 2 weeks, not aligned to calendar months
- Weekly: Payments occur every week, not aligned to calendar months
- Annual prepayment may be applied at wrong time or not at all

---

## Recommendations

### 1. Use Actual Mortgage Payment Frequency

**Fix:** Pass the actual mortgage payment frequency to the projection request:

```typescript
// In use-scenario-editor-projections.ts
paymentFrequency: currentMortgageData.paymentFrequency || "monthly",
```

### 2. Fix One-Time Event Conversion

**Fix:** Account for actual payment frequency:

```typescript
import { getPaymentsPerYear } from "@/features/mortgage-tracking/utils/mortgage-math";

const paymentsPerYear = getPaymentsPerYear(paymentFrequency);
if (event.eventType === "one-time" && event.oneTimeYear) {
  startPaymentNumber = (event.oneTimeYear - 1) * paymentsPerYear + 1;
}
```

### 3. Fix Annual Event Month Matching

**Fix:** Convert `recurrenceMonth` to payment number range based on frequency:

```typescript
// For annual events, calculate which payment numbers correspond to the month
// For monthly: month 3 = payment 3, 15, 27, etc.
// For biweekly: month 3 ≈ payments 5-6, 31-32, 57-58, etc.
```

---

## Conclusion

✅ **Prepayment events ARE being taken into account** when creating scenarios.

❌ **However, there are critical issues:**
1. Payment frequency is hardcoded to "monthly"
2. One-time event conversion assumes monthly payments
3. Annual event month matching only works for monthly payments

**Impact:** Prepayment events may be applied at incorrect times for biweekly/weekly mortgages, leading to inaccurate projections.

---

## Related Files

- `client/src/features/scenario-management/components/prepayment-events-card.tsx` - UI component
- `client/src/features/scenario-management/hooks/use-scenario-editor-projections.ts` - API conversion (⚠️ ISSUES HERE)
- `server/src/api/routes/mortgage.routes.ts` - Projection endpoint
- `server/src/shared/calculations/mortgage.ts` - Calculation engine
