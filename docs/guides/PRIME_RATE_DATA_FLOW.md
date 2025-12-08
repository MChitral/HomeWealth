# Prime Rate Data Flow

**Date:** 2025-01-27  
**Component:** Current Prime Rate Form Field

---

## Overview

The "Current Prime Rate (%)" field with "Bank of Canada rate as of 12/2/2025" is populated through a data flow from the Bank of Canada API to the React component.

---

## Data Flow Diagram

```
Bank of Canada API
       ↓
Backend API Endpoint (/api/prime-rate)
       ↓
Frontend API Client (mortgageApi.fetchPrimeRate)
       ↓
React Query Hook (usePrimeRate)
       ↓
Component Props (primeRateData)
       ↓
Form Field Display
```

---

## Step-by-Step Flow

### 1. Backend API Endpoint

**File:** `server/src/api/routes/prime-rate.routes.ts`

**Endpoint:** `GET /api/prime-rate`

**Process:**
```typescript
// Fetches from Bank of Canada API
const response = await fetch("https://www.bankofcanada.ca/valet/observations/V121796/json?recent=1");

// Extracts data from response
const data: BoCPrimeRateResponse = await response.json();
const latestObservation = data.observations[0];
const primeRate = parseFloat(latestObservation.V121796.v);  // e.g., 6.45
const effectiveDate = latestObservation.d;                   // e.g., "2025-12-02"

// Returns response
res.json({
  primeRate,        // 6.45
  effectiveDate,     // "2025-12-02"
  source: "Bank of Canada",
  lastUpdated: new Date().toISOString(),
});
```

**Response Structure:**
```typescript
{
  primeRate: number;      // e.g., 6.45
  effectiveDate: string;   // e.g., "2025-12-02"
  source: "Bank of Canada";
  lastUpdated: string;     // ISO timestamp
}
```

---

### 2. Frontend API Client

**File:** `client/src/features/mortgage-tracking/api/mortgage-api.ts`

**Function:**
```typescript
fetchPrimeRate: () => apiRequest<PrimeRateResponse>("GET", "/api/prime-rate")
```

**Type Definition:**
```typescript
export type PrimeRateResponse = {
  primeRate: number;
  effectiveDate: string;
  source: string;
  lastUpdated: string;
};
```

---

### 3. React Query Hook

**File:** `client/src/features/mortgage-tracking/hooks/use-prime-rate.ts`

**Hook Implementation:**
```typescript
export function usePrimeRate(initialPrime: string = DEFAULT_PRIME) {
  const {
    data: primeRateData,  // PrimeRateResponse | undefined
    isLoading,
    isFetching,
    refetch,
  } = useQuery<PrimeRateResponse>({
    queryKey: mortgageQueryKeys.primeRate(),
    queryFn: () => mortgageApi.fetchPrimeRate(),
    staleTime: 1000 * 60 * 30,  // Cache for 30 minutes
  });

  return {
    primeRate,
    setPrimeRate,
    primeRateData,        // Contains effectiveDate
    isPrimeRateLoading: isLoading && !primeRateData,
    isPrimeRateFetching: isFetching,
    refetchPrimeRate: refetch,
  };
}
```

**Key Points:**
- Uses React Query for caching and state management
- Caches data for 30 minutes (`staleTime`)
- Automatically refetches when cache expires
- Returns `primeRateData` which includes `effectiveDate`

---

### 4. Component Usage

**File:** `client/src/features/mortgage-tracking/components/create-mortgage-dialog.tsx`

**Props:**
```typescript
interface CreateMortgageDialogProps {
  primeRateData?: PrimeRateResponse;  // Contains effectiveDate
  onRefreshPrime: () => void;
  isPrimeRateLoading: boolean;
}
```

**Form Field Rendering:**
```typescript
<FormItem className="space-y-2">
  <FormLabel htmlFor="prime-rate">
    Current Prime Rate (%)
  </FormLabel>
  <FormControl>
    <Input
      id="prime-rate"
      type="number"
      value={primeRateData?.primeRate || ""}
      readOnly
    />
  </FormControl>
  {primeRateData?.effectiveDate && (
    <p className="text-xs text-muted-foreground">
      Bank of Canada rate as of{" "}
      {new Date(primeRateData.effectiveDate).toLocaleDateString()}
      {/* Converts "2025-12-02" to "12/2/2025" */}
    </p>
  )}
</FormItem>
```

**Date Formatting:**
- `primeRateData.effectiveDate` is a string: `"2025-12-02"`
- `new Date(primeRateData.effectiveDate)` converts to Date object
- `.toLocaleDateString()` formats to locale-specific format: `"12/2/2025"`

---

## Where It's Used

The `primeRateData` is fetched and used in:

1. **Create Mortgage Dialog** (`create-mortgage-dialog.tsx`)
   - Step 2: Term Details
   - Shows current prime rate for variable rate mortgages

2. **Edit Term Dialog** (`edit-term-dialog.tsx`)
   - Shows current prime rate when editing variable rate terms

3. **Term Renewal Dialog** (`term-renewal-dialog.tsx`)
   - Shows current prime rate for renewals

4. **Mortgage Content** (`mortgage-content.tsx`)
   - Passes `primeRateData` to child components

---

## Hook Integration

**File:** `client/src/features/mortgage-tracking/hooks/use-mortgage-tracking-state.ts`

```typescript
const { 
  primeRate, 
  setPrimeRate, 
  primeRateData,      // Contains effectiveDate
  isPrimeRateLoading, 
  refetchPrimeRate 
} = usePrimeRate();
```

This hook is called at the top level of the mortgage tracking feature, and `primeRateData` is passed down to all components that need it.

---

## Refresh Mechanism

Users can manually refresh the prime rate by clicking the "Refresh" button:

```typescript
<Button
  onClick={onRefreshPrime}  // Calls refetchPrimeRate()
  disabled={isPrimeRateLoading}
>
  <RefreshCw className="h-3 w-3" />
  <span>Refresh</span>
</Button>
```

This triggers `refetch()` from React Query, which:
1. Makes a new API call to `/api/prime-rate`
2. Fetches latest data from Bank of Canada
3. Updates `primeRateData` with new `effectiveDate`
4. Component re-renders with updated date

---

## Date Format Details

**Backend Response:**
- Format: ISO date string `"2025-12-02"`

**Frontend Display:**
- Format: Locale-specific `"12/2/2025"` (US locale)
- Uses `toLocaleDateString()` which respects browser locale

**To Change Format:**
```typescript
// Custom format
{new Date(primeRateData.effectiveDate).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric'
})}

// Or use date-fns
import { format } from 'date-fns';
{format(new Date(primeRateData.effectiveDate), 'MM/dd/yyyy')}
```

---

## Error Handling

If the API call fails:
- React Query will show error state
- `primeRateData` will be `undefined`
- The date line won't render (due to `primeRateData?.effectiveDate` check)
- User can retry with Refresh button

---

## Caching Strategy

- **Stale Time:** 30 minutes
- **Cache Key:** `["prime-rate"]`
- **Automatic Refetch:** When cache expires
- **Manual Refetch:** Via Refresh button

This ensures:
- Fast UI (cached data)
- Reasonably fresh data (30 min cache)
- Manual refresh available

---

## Summary

The date "12/2/2025" comes from:
1. **Bank of Canada API** → Returns observation date `"2025-12-02"`
2. **Backend API** → Passes through as `effectiveDate`
3. **React Query** → Caches in `primeRateData.effectiveDate`
4. **Component** → Formats with `toLocaleDateString()` → `"12/2/2025"`

The entire flow is reactive and updates automatically when:
- Cache expires (30 minutes)
- User clicks Refresh button
- Component mounts (if no cache)

