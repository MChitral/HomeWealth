# Mortgage Subsystem Audit – Open Findings

**Date:** November 29, 2025  
**Scope:** Backend calculation engine, REST APIs, shared schemas, and frontend mortgage tooling (`client/src/features/mortgage-tracking`, `server/src/shared/calculations/mortgage.ts`, related routes/services).  
**Goal:** Capture correctness gaps that must be resolved to align behaviour with Canadian mortgage conventions and product requirements.

---

## Findings & Fix Tracking

| ID | Severity | Area | Status |
| --- | --- | --- | --- |
| F1 | Critical | Calculation engine / projections | Open |
| F2 | Major | Compliance / payments & scenarios | Open |
| F3 | Major | Scenario planner vs spec | Open |
| F4 | Major | API validation | Open |
| F5 | Major | Schema validation | Open |
| F6 | Moderate | Projection accuracy | Open |
| F7 | Moderate | Frontend UX (multi-mortgage) | Open |
| F8 | Moderate | Rate sourcing parity | Open |

---

### F1 – Term & Variable-Rate Data Not Applied in Amortization
- **Details:** The amortization/projection endpoints ignore stored term data and prime/spread inputs. `/api/mortgages/projection` always passes a single `annualRate` and an empty `termRenewals` array into `generateAmortizationSchedule*`, so VRM changes, rate resets, and new payment amounts never affect backend math.
- **Evidence:** `server/src/api/routes/mortgage.routes.ts` lines around the projection route call `generateAmortizationScheduleWithPayment(..., prepayments, [], 360);`.
- **Impact:** Any variable-rate or renewed term behaves like a static fixed-rate mortgage, producing inaccurate payoff dates, balances, and trigger detection.
- **Next Actions:** Load the user’s term history, derive effective rates per term (for VRM: current prime + locked spread), build `termRenewals`, and update payment amounts for VRM-changing loans. Ensure historical payment ingestion also records the effective rate derived server-side.

### F2 – Annual Prepayment Limits Never Enforced
- **Details:** `annualPrepaymentLimitPercent` is persisted and `isWithinPrepaymentLimit` exists, but no API or UI path calls it when logging payments, creating scenarios, or running projections.
- **Impact:** Users can model or record prepayments far beyond lender allowances, undermining compliance and making interest-savings figures unrealistic.
- **Next Actions:**  
  1. When logging payments (single or bulk), calculate year-to-date prepayments per mortgage and block/flag entries exceeding the limit.  
  2. During scenario/projection generation, clamp auto-prepayments to the allowable annual amount and surface warnings in the UI.  
  3. Add automated tests around the helper to cover 10–20% lender caps.

### F3 – Scenario “Monthly Prepayment %” Applied to Payment Amount, Not Surplus
- **Details:** Product spec states the slider allocates surplus cash (`cashFlow`), yet `generatePrepayments` pushes the percentage into a `monthly-percent` event that multiplies the scheduled payment amount inside the amortization engine.
- **Impact:** Scenario comparisons assume far less (or more) cash is available for prepayments than the financial plan allows, skewing payoff timelines and investment splits.
- **Next Actions:** Convert surplus dollars into explicit fixed extra payments (or adjust the calculation engine to treat `monthly-percent` as “percent of surplus”) so scenario modelling honours cash-flow constraints. Update docs/tests once aligned.

### F4 – Payment Logging Relies on Client-Supplied Math
- **Details:** The API accepts `principalPaid`, `interestPaid`, `effectiveRate`, `remainingBalance`, and trigger flags from the frontend without recalculating or validating relationships.
- **Impact:** A UI or CSV error can corrupt amortization history, causing downstream projections to inherit bogus balances or rates.
- **Next Actions:** Recompute principal/interest splits server-side using the shared calculation helpers, or at minimum validate:  
  - `regularPaymentAmount + prepaymentAmount === paymentAmount`  
  - `principalPaid + interestPaid === paymentAmount`  
  - `remainingBalance` equals previous balance minus total principal  
  - `effectiveRate` matches prime + spread for VRMs.  
  Reject inconsistent payloads and log audit events.

### F5 – Term Schema Allows Invalid Combinations
- **Details:** `insertMortgageTermSchema` marks both `fixedRate` and `lockedSpread` optional with no refinement. A term can be created with neither (or both) populated, leaving downstream calculations without a usable rate source.
- **Impact:** Projection engine falls back to arbitrary defaults (`Number(latestTerm?.fixedRate || latestTerm?.lockedSpread || 5.0)`), violating accuracy requirements.
- **Next Actions:** Add Zod refinements enforcing:  
  - `fixed` terms require `fixedRate` and forbid `lockedSpread`.  
  - `variable-*` terms require `lockedSpread` (plus store the prime snapshot).  
  Provide clear validation messages in the UI.

### F6 – Projection Start Date Hard-Coded to 30 Days
- **Details:** When historical payments exist, projections resume from `lastPaymentDate + 30 days` regardless of payment frequency.
- **Impact:** Weekly, semi-monthly, and accelerated schedules drift out of sync, shifting amortization trajectories by multiple payments over time.
- **Next Actions:** Advance the start date using `getPaymentsPerYear` (e.g., add 14 days for biweekly, 7 for weekly, 15 for semi-monthly) or reuse the calendar logic in the amortization engine’s `advancePaymentDate`.

### F7 – Frontend Only Surfaces First Mortgage
- **Details:** `useMortgageData` selects `mortgages?.[0]`, so additional mortgages (supported by the backend) cannot be inspected or managed through the UI.
- **Impact:** Users cannot differentiate multiple properties; projections and payment logging always tie to the first record, risking misuse.
- **Next Actions:** Introduce a mortgage picker (list or sidebar) and scope terms/payments queries to the selected ID. Update mutation hooks to respect the active mortgage context.

### F8 – Prime-Rate Integration Stops at UI Prefill
- **Details:** `/api/prime-rate` populates fields in the React forms, but the value is never persisted with terms or consumed by backend calculations. Effective rates are whatever the user typed.
- **Impact:** Variable-rate projections remain detached from authoritative Bank of Canada data, forcing manual entry and inviting drift.
- **Next Actions:** Capture the prime rate (and source timestamp) whenever a VRM term is created/updated, store it alongside the term, and have the server derive `effectiveRate` = `prime + spread` for all calculations. Consider a nightly job to update active VRM terms when prime changes.

---

## Recommended Implementation Order
1. **Engine/Data Correctness (F1, F5, F6):** Term validation + renewal wiring + frequency-aware projection start dates.
2. **Compliance Guards (F2, F4):** Enforce prepayment limits and server-side payment math.
3. **Scenario Alignment (F3) & Prime Sourcing (F8):** Ensure projections reflect actual surplus allocations and live rates.
4. **UX Enhancements (F7):** Enable multi-mortgage management once backend data is trustworthy.

Each fix should ship with automated tests (unit for helpers, integration for API endpoints) and, where relevant, regression scenarios covering Canadian mortgage edge cases (accelerated schedules, trigger-rate transitions, annual-prepayment caps).

---

## Tracking
- Update this document as issues move to “In Progress” / “Done”.
- Link corresponding tickets/PRs next to each finding ID once created.
- Reference this audit in design docs to keep mortgage features aligned with OSFI/CMHC guidance.

---

## Frontend UX Audit (Mortgage Feature)

| ID | Severity | Area | Status |
| --- | --- | --- | --- |
| UX1 | Major | Onboarding (Create / Renew Term) | Open |
| UX2 | Major | Payment Logging Dialog | Open |
| UX3 | Moderate | Backfill Flow | Open |
| UX4 | Moderate | Variable-Rate Inputs & Prime Sync | Open |

### UX1 – Mortgage Wizard Requires Manual Payment Math
- **Details:** Both the initial mortgage wizard and the renewal dialog ask the user to type the “Regular Payment Amount” without offering a calculator or calling the shared mortgage engine, even though all inputs (principal, rate, amortization, frequency) are already collected (`client/src/features/mortgage-tracking/mortgage-feature.tsx` lines `869-879`). This forces homeowners to run an external calculator and re-enter the result, and there is no guarantee that the typed payment actually amortizes the loan on schedule.
- **Impact:** High friction during onboarding and a high probability of inconsistent data between server-side projections (which assume calculated payments) and the UI (which stores user-entered guesses).
- **Next Actions:** Invoke the backend calculation engine (or a lightweight client helper) when the user enters loan terms, surface the computed payment, and allow optional overrides with guardrails. Include stress-test info (e.g., payment at +/- 1% rate) to align with Canadian underwriting expectations.

### UX2 – “Log Payment” Dialog Shows Fabricated Amortization
- **Details:** The “Auto-calculated (semi-annual compounding)” card shows static placeholder values (`$600/$1,500`) and the save handler persists a hard-coded 30%/70% principal-interest split regardless of balance or rate (`client/src/features/mortgage-tracking/mortgage-feature.tsx` lines `1369-1432`). The “New Balance” is simply previous balance minus 30% of the payment.
- **Impact:** Users believe the UI is performing actuarially correct math when it is not; logged histories become inaccurate the moment rates change or prepayments occur. This also undermines downstream projections.
- **Next Actions:** Replace the placeholder card with real calculations driven by the same amortization helpers the backend uses. Recompute principal, interest, trigger-rate flags, and remaining balance before posting to the API so the UI reflects actual Canadian mortgage math.

### UX3 – Backfill Flow Ignores Payment Frequency
- **Details:** The backfill dialog always iterates payments monthly using `Date.setMonth` and divides the annual rate by 12 (`client/src/features/mortgage-tracking/mortgage-feature.tsx` lines `1481-1634`). Mortgage frequency (bi-weekly, accelerated, etc.) is not referenced, so the generated schedule never matches the user’s actual cadence.
- **Impact:** Backfilled histories are inaccurate for any non-monthly mortgage, leading to incorrect cumulative interest and payoff timelines. Accelerated schedules in particular lose their extra payments entirely.
- **Next Actions:** Respect the active term’s `paymentFrequency` when generating payment dates and rates. Use the shared `advancePaymentDate` + `getPaymentsPerYear` helpers so weekly, bi-weekly, and accelerated cadences map correctly. Allow users to preview the generated calendar before submission.

### UX4 – Variable-Rate Inputs Require Manual Prime Management
- **Details:** Renewal and logging dialogs expose separate inputs for Prime and spread each time (`client/src/features/mortgage-tracking/mortgage-feature.tsx` lines `817-865` and `1265-1366`). Although `/api/prime-rate` is fetched, the user must keep the two fields in sync and nothing persists the prime snapshot per term.
- **Impact:** UX relies on user diligence for something we can fetch automatically, and mismatched Prime/Spread entries lead to misleading “Effective rate” banners throughout the feature.
- **Next Actions:** When the Bank of Canada fetch succeeds, auto-populate (and lock) the Prime value, show the source timestamp, and persist it with the term. For historical edits, show the stored Prime instead of an editable field, reducing error-prone data entry.

---

## Target Feature Set & UX Flow (Post-Fixes)

Once the above findings are resolved, the mortgage module should deliver the following end-to-end experience:

1. **Top-Level Navigation**
   - Mortgage selector surfaces every mortgage on file (address + balance + status). Selecting a mortgage scopes all subsequent data (terms, payments, projections).
   - Global alerts highlight overdue renewals, prepayment limit usage, or trigger-rate risk.

2. **Guided Onboarding**
   - Two-step wizard auto-computes regular payment from principal, amortization, rate, and frequency (with stress-test deltas ±200 bps).
   - Wizard previews lender prepayment allowances and default term length recommendations (3/5-year benchmarks).
   - Variable-rate setup pre-fills Prime (Bank of Canada API), locks spread, and displays effective rate + “next payment” details.

3. **Term Timeline & Renewal Flow**
   - Timeline view of past and future terms (markers for fixed, VRM-changing, VRM-fixed). Selecting a term shows rate, payment, and remaining months.
   - Renewal dialog clones current mortgage data, fetches latest Prime, enforces term-specific validations, and recalculates payments using the shared engine.
   - After saving, the backend recomputes amortization; UI immediately updates payoff projections and trigger-rate thresholds.

4. **Payment Logging & Backfill**
   - “Log Payment” dialog pulls the latest balance, runs amortization math (semi-annual compounding, frequency-aware) and shows live principal/interest split before save.
   - Compliance module checks annual prepayment usage; UI flashes a warning if exceeding lender caps and offers to adjust.
   - Backfill workflow accepts frequency, start date, and # of payments, then previews the exact calendar (bi-weekly/weekly/accelerated included) with calculated interest before submission. Historical Prime values auto-populate from the Bank of Canada API.

5. **Analytics & Alerts**
   - Summary cards display cumulative principal vs interest, current effective rate, trigger-rate buffer (how far from payment=interest), and prepayment limit usage.
   - Charts illustrate payment mix over time and amortization trajectory incorporating recorded prepayments.
   - Scenario planner receives authoritative mortgage data (current balance, payment schedule, enforceable prepayment capacity) so comparisons remain consistent.

6. **Compliance & Audit Trail**
   - Every term, payment, and prepayment action stores the Prime snapshot, effective rate, and calculations performed, enabling auditors to trace results.
   - Download/export includes CSV + PDF with sufficient detail to satisfy lender or OSFI reviews.

### Reference UX Flow
1. **Create Mortgage → Auto Payment Calculation → Confirm → Create Initial Term (Prime fetched, spread locked).**
2. **Dashboard View:** Pick mortgage → See current term metrics, prepayment usage, and warnings.
3. **Log Payment:** UI computes splits, enforces limits, records automatically. Optionally attach documents/notes.
4. **Backfill or Import:** Preview schedule, confirm, let system fetch historical Prime and apply correct cadence.
5. **Renew Term:** Timeline prompt → launch dialog → new rate & payment computed → projections refresh.
6. **Scenario Planning:** Downstream features consume clean amortization data, showing accurate payoff and investment trade-offs.

This flow keeps the user anchored in accurate Canadian mortgage math while eliminating manual calculations, ensuring the frontend mirrors backend authority, and setting up clear checkpoints for compliance.

---

## Delivery Plan

### Phase 1 – Engine & Data Integrity (F1, F5, F6)
- Load full term history (with stored Prime snapshots) and feed `termRenewals` into the amortization/projection engine.
- Derive effective rates/payment amounts per term type; update `/projection` endpoint to reuse `advancePaymentDate`.
- Harden schemas with Zod refinements (fixed vs variable) and persist `primeRate` per term.

### Phase 2 – Compliance & API Guardrails (F2, F4)
- Enforce lender prepayment caps when logging payments or generating scenarios; return warnings the UI can display.
- Recompute principal/interest/effective rates server-side before saving payments; reject mismatches and log anomalies.

### Phase 3 – Scenario & Rate Alignment (F3, F8)
- Convert scenario “% surplus” inputs into fixed-dollar prepayments (or adjust engine interpretation) so projections match cash flow.
- Persist Prime at term creation, surface immutable values in the UI, and provide a mechanism to refresh active VRM terms when BoC updates.

### Phase 4 – Frontend UX Remediation (UX1–UX4, F7)
- Add a mortgage selector and thread the active ID through hooks/mutations.
- Embed payment calculators in the wizard/renewal dialogs, showing stress-test deltas and prepayment caps.
- Replace placeholder amortization cards in “Log Payment”/Backfill with real calculations that respect payment frequency and compliance checks.
- Lock Prime inputs to fetched values, display timestamps, and preview backfill calendars before submission.

### Cross-Cutting
- Expand automated test coverage (unit for helpers, integration for routes, UI for wizard/logging flows).
- Update this document as findings move to “In Progress”/“Done” and reference corresponding tickets/PRs.
- Keep product docs in sync so downstream teams understand the corrected UX and compliance posture.


