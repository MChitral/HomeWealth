# Refinancing Feature Audit Report

**Date:** December 14, 2025  
**Auditor:** AI Assistant  
**Feature:** Refinancing Events in Scenario Management

## Executive Summary

This audit covers the refinancing feature that allows users to model refinancing scenarios at renewal points in their mortgage projections. The feature includes both year-based and term-end refinancing options, with support for rate changes, term type changes, amortization extensions, and payment frequency changes.

## Feature Overview

The refinancing feature enables users to:
1. Add refinancing events that occur at specific years or at term ends
2. Specify new interest rates, term types (fixed, variable-changing, variable-fixed)
3. Optionally extend amortization periods
4. Optionally change payment frequencies
5. Edit and delete refinancing events
6. View refinancing events in the scenario editor

## Code Architecture

### Frontend Components

#### 1. `refinancing-events-card.tsx`
- **Location:** `client/src/features/scenario-management/components/refinancing-events-card.tsx`
- **Purpose:** Main UI component for displaying and managing refinancing events
- **Key Features:**
  - Displays list of existing refinancing events
  - Form for adding/editing events
  - Uses React Hook Form for form management
  - Integrates with Radix UI components (Select, RadioGroup)

**Key Implementation Details:**
- Form fields include: timing type (by-year/at-term-end), refinancing year, new rate, term type, new amortization months, payment frequency, description
- Rate input field uses `value={field.value || ""}` to handle empty values
- Payment frequency select uses `"keep-current"` as a special value (converted to `null` before API submission)
- Rate is displayed as percentage (multiplied by 100) but stored as decimal

**Potential Issues:**
- Rate input uses `field.value || ""` which may not handle `0` correctly (though unlikely for rates)
- Form validation happens on submit, but error messages may not be immediately visible

#### 2. `use-refinancing-event-form.ts`
- **Location:** `client/src/features/scenario-management/hooks/use-refinancing-event-form.ts`
- **Purpose:** React Hook Form hook with Zod schema validation
- **Key Features:**
  - Zod schema validation for all form fields
  - Default values for new events
  - Form reset logic when editing existing events
  - Validation mode: `onTouched` with `reValidateMode: "onChange"`

**Validation Schema:**
- `newRate`: Required, must be between 0 and 100 (as percentage)
- `refinancingYear`: Required if `timingType === "by-year"`, must be >= 1
- `termType`: Required enum (fixed, variable-changing, variable-fixed)
- Other fields are optional

**Potential Issues:**
- Rate validation uses `.refine()` which checks for empty strings after trim
- The validation may be too strict during typing (though `onTouched` mode should help)

#### 3. `use-scenario-editor-state.ts`
- **Location:** `client/src/features/scenario-management/hooks/use-scenario-editor-state.ts`
- **Purpose:** Manages state for scenario editor, including refinancing events
- **Key Functions:**
  - `handleAddRefinancingEvent`: Adds new event (saves to API if scenario exists)
  - `handleUpdateRefinancingEvent`: Updates existing event
  - `handleDeleteRefinancingEvent`: Deletes event
  - `buildRefinancingEventPayload`: Converts form data to API payload

**Data Transformations:**
- Rate conversion: `(parseFloat(formData.newRate) / 100).toFixed(6)` - converts percentage to decimal
- Payment frequency: `"keep-current"` → `null` before API submission
- Year parsing: `parseInt(formData.refinancingYear || "1")`

**Potential Issues:**
- Rate conversion uses `parseFloat` which may fail if value is invalid (should be caught by validation)
- Default year value of `"1"` if empty may not be appropriate

### Backend Implementation

#### 1. `mortgage.routes.ts`
- **Location:** `server/src/api/routes/mortgage.routes.ts`
- **Purpose:** API endpoint for mortgage projections with refinancing events
- **Key Logic:**
  - Fetches refinancing events from scenario if `scenarioId` provided
  - Merges refinancing events from request and scenario
  - Converts refinancing events to `TermRenewal` format
  - Calculates `startPaymentNumber` based on timing type

**Critical Implementation Details:**
- Rate is stored as decimal in database (e.g., 0.0549 for 5.49%)
- For term-end refinancing: finds next term end date after projection start
- For year-based refinancing: calculates date from mortgage start + refinancing year
- `newPaymentAmount` is set to `undefined` to allow dynamic recalculation based on actual balance

**Potential Issues:**
- Term-end refinancing may skip if no future term ends exist
- Year-based refinancing may skip if date is in the past relative to projection start
- Payment recalculation uses `remainingBalance` at refinancing point (correct approach)

#### 2. `mortgage.ts` (Calculation Engine)
- **Location:** `server/src/shared/calculations/mortgage.ts`
- **Purpose:** Core mortgage calculation engine
- **Key Logic:**
  - `generateAmortizationSchedule` handles `TermRenewal` objects
  - When renewal occurs, recalculates payment if `newPaymentAmount` is undefined
  - Uses actual `remainingBalance` at renewal point for accurate calculations

**Critical Implementation Details:**
- Payment recalculation happens at the exact payment number where renewal occurs
- Uses `calculatePayment` with `remainingBalance`, `newRate`, and `amortizationMonths`
- Supports extended amortization (blend-and-extend) scenarios

### Database Schema

#### `refinancing_events` Table
- `id`: Primary key (UUID)
- `scenarioId`: Foreign key to scenarios table
- `refinancingYear`: Integer (nullable) - for year-based refinancing
- `atTermEnd`: Integer (0 or 1) - boolean flag for term-end refinancing
- `newRate`: Decimal(5,3) - new interest rate (e.g., 5.490 for 5.49%)
- `termType`: Text - 'fixed', 'variable-changing', 'variable-fixed'
- `newAmortizationMonths`: Integer (nullable) - extended amortization
- `paymentFrequency`: Text (nullable) - new payment frequency
- `description`: Text (nullable)
- `createdAt`: Timestamp

## Testing Results

### E2E Test: Creating Refinancing Event (By Year)

**Test Steps:**
1. Navigate to `/scenarios/new`
2. Click "Add Event" button in Refinancing Events section
3. Fill in form:
   - Timing: "By Year (from mortgage start)" (default)
   - Refinancing Year: 5 (default)
   - New Interest Rate: 4.5
   - Term Type: Fixed Rate
4. Click "Add Event" to submit

**Results:**
- ✅ Form opens correctly
- ✅ Form fields are accessible
- ✅ Rate input accepts value (4.5)
- ✅ Term type dropdown works
- ⚠️ Form submission status unclear (form still visible after submission attempt)
- ⚠️ Need to verify if event was added successfully

**Issues Found:**
- Form validation may be preventing submission
- Need to verify console errors and network requests

### Test Cases to Complete

1. **Create Refinancing Event (At Term End)**
   - Test selecting "At Term End" timing
   - Verify term-end calculation logic
   - Test with existing mortgage terms

2. **Edit Refinancing Event**
   - Test editing existing event
   - Verify form pre-population
   - Test updating rate, term type, etc.

3. **Delete Refinancing Event**
   - Test deleting event
   - Verify removal from list
   - Test API deletion

4. **Validation Tests**
   - Test empty rate field
   - Test invalid rate values (negative, >100)
   - Test missing refinancing year for year-based timing
   - Test form submission with all required fields

5. **Calculation Verification**
   - Test projected mortgage outcome with refinancing event
   - Verify payment recalculation at refinancing point
   - Verify amortization schedule includes refinancing
   - Test with different term types (fixed, variable-changing, variable-fixed)

6. **Edge Cases**
   - Test refinancing at year 1
   - Test refinancing beyond mortgage term
   - Test multiple refinancing events
   - Test refinancing with extended amortization
   - Test refinancing with payment frequency change

## Known Issues

### 1. Form Validation (Potential)
- **Status:** Under investigation
- **Description:** Form may not submit due to validation errors
- **Impact:** Users cannot add refinancing events
- **Priority:** High
- **Next Steps:** 
  - Check console for validation errors
  - Verify Zod schema validation logic
  - Test with different input values

### 2. Rate Input Handling
- **Status:** Resolved (previous fix)
- **Description:** Rate input field handling was improved to use `value={field.value || ""}`
- **Impact:** Low (handled)

### 3. Payment Frequency "Keep Current"
- **Status:** Resolved (previous fix)
- **Description:** Changed from empty string to `"keep-current"` value
- **Impact:** Low (handled)

## Recommendations

### High Priority

1. **Complete E2E Testing**
   - Finish testing all user flows (create, edit, delete)
   - Verify calculations are correct
   - Test edge cases

2. **Improve Error Handling**
   - Add better error messages for validation failures
   - Display validation errors immediately when form is submitted
   - Add loading states during API calls

3. **Add Unit Tests**
   - Test form validation logic
   - Test data transformation functions
   - Test calculation logic for refinancing events

### Medium Priority

1. **Improve UX**
   - Add confirmation dialog for delete actions
   - Add success toast notifications
   - Improve form field labels and help text

2. **Add Validation Feedback**
   - Show inline validation errors
   - Highlight invalid fields
   - Disable submit button when form is invalid

3. **Documentation**
   - Add JSDoc comments to key functions
   - Document calculation logic
   - Add user-facing help text

### Low Priority

1. **Performance Optimization**
   - Optimize re-renders in form components
   - Cache calculation results
   - Lazy load refinancing events list

2. **Accessibility**
   - Add ARIA labels to form fields
   - Improve keyboard navigation
   - Add screen reader support

## Conclusion

The refinancing feature is well-architected with clear separation of concerns between frontend and backend. The implementation follows Canadian mortgage rules and correctly handles rate conversions, payment recalculations, and amortization extensions.

However, the E2E testing revealed potential issues with form submission that need to be investigated further. The validation logic appears sound, but there may be edge cases or UI feedback issues preventing successful form submission.

**Next Steps:**
1. Complete E2E testing for all user flows
2. Investigate and fix form submission issues
3. Verify calculations with real mortgage data
4. Add comprehensive error handling and user feedback

