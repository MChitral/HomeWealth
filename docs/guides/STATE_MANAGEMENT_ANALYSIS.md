# State Management Analysis

**Date:** 2024  
**Focus:** Comprehensive evaluation of state management patterns  
**Based on:** React Engineer best practices

---

## Executive Summary

Your state management architecture shows **good foundational decisions** but has several **critical anti-patterns** that are impacting maintainability and scalability. The good news: You're using the right tools (TanStack Query for server state, Context for cross-cutting concerns). The bad news: Form state is being managed manually when you have React Hook Form installed but unused, and some state hooks are becoming monolithic.

**Overall Grade: B-**

**Key Findings:**
- ✅ Server state: Correctly using TanStack Query
- ✅ Global state: Appropriate use of Context for mortgage selection
- ❌ Form state: React Hook Form installed but NOT used - manual useState everywhere
- ⚠️ State hooks: Excessive useState usage (70+ in one hook)
- ⚠️ Query config: Problematic defaults (`staleTime: Infinity`, `retry: false`)

---

## 1. Server State Management (TanStack Query)

### Current Implementation ✅

**Strengths:**
```typescript
// ✅ Good: Centralized query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: Infinity,  // ⚠️ ISSUE
      retry: false,         // ⚠️ ISSUE
    },
  },
});
```

**Pattern Usage:**
- ✅ Consistent use of React Query for all server state
- ✅ Proper query key factories
- ✅ Typed API functions
- ✅ Query invalidation after mutations

**Issues:**

1. **`staleTime: Infinity` - Critical Problem**
   ```typescript
   // Current: Data NEVER becomes stale
   staleTime: Infinity
   
   // Problem: 
   // - No automatic refetching when data might be outdated
   // - User sees stale data after mutations in other tabs
   // - Poor user experience
   ```

2. **`retry: false` - No Resilience**
   ```typescript
   // Current: Single network hiccup = failure
   retry: false
   
   // Problem:
   // - No resilience to temporary network issues
   // - Poor user experience on unstable connections
   ```

3. **No Hierarchical Query Keys**
   ```typescript
   // Current: Flat query keys
   export const dashboardQueryKeys = {
     scenarios: () => ["/api/scenarios/with-projections"] as const,
   };
   
   // Better: Hierarchical for smart invalidation
   export const mortgageQueryKeys = {
     all: ['mortgages'] as const,
     lists: () => [...mortgageQueryKeys.all, 'list'] as const,
     details: () => [...mortgageQueryKeys.all, 'detail'] as const,
     detail: (id: string) => [...mortgageQueryKeys.details(), id] as const,
     payments: (id: string) => [...mortgageQueryKeys.detail(id), 'payments'] as const,
   };
   ```

**Recommendations:**

```typescript
// Improved query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      
      // ✅ Reasonable stale time based on data type
      staleTime: 5 * 60 * 1000, // 5 minutes for most data
      
      // ✅ Keep data in cache longer
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // ✅ Smart retry logic
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        // Retry up to 3 times for network errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // ✅ Don't refetch on window focus (good for this app)
      refetchOnWindowFocus: false,
      
      // ✅ Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // ✅ Retry mutations once on network errors
      retry: 1,
    },
  },
});
```

**Data-Specific Stale Times:**
```typescript
// For relatively static data (like scenarios)
useQuery({
  queryKey: dashboardQueryKeys.scenarios(),
  queryFn: dashboardApi.fetchScenarios,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// For dynamic data (like prime rates)
useQuery({
  queryKey: primeRateQueryKeys.primeRate(),
  queryFn: primeRateApi.fetchPrimeRate,
  staleTime: 30 * 1000, // 30 seconds
  refetchInterval: 60 * 1000, // Auto-refetch every minute
});
```

---

## 2. Global/Shared State (React Context)

### Current Implementation ✅

**MortgageSelectionContext Analysis:**

```typescript
// ✅ Good: Single responsibility
// ✅ Good: Proper TypeScript typing
// ✅ Good: localStorage persistence
// ✅ Good: Error boundary in hook (throws if outside provider)

const MortgageSelectionContext = createContext<MortgageSelectionContextValue | undefined>(undefined);
```

**Strengths:**
- ✅ Appropriate use case (cross-cutting concern)
- ✅ Minimal, focused state
- ✅ Proper error handling in hook
- ✅ localStorage persistence

**Minor Issues:**

1. **No Error Handling for localStorage**
   ```typescript
   // Current: Could throw in private browsing mode
   localStorage.setItem(STORAGE_KEY, selectedMortgageId);
   
   // Better: Handle errors gracefully
   try {
     localStorage.setItem(STORAGE_KEY, selectedMortgageId);
   } catch (error) {
     console.warn('Failed to persist mortgage selection:', error);
     // App continues to work without persistence
   }
   ```

2. **Potential Race Condition**
   ```typescript
   // Current: Two separate useEffect hooks
   useEffect(() => {
     // Persist to localStorage
   }, [selectedMortgageId]);
   
   useEffect(() => {
     // Auto-select first mortgage
   }, [mortgages, selectedMortgageId]);
   
   // Better: Combine or use useLayoutEffect for sync
   ```

**Assessment:** ✅ Context is used correctly here. No need for Redux/Zustand for this use case.

---

## 3. Form State Management - CRITICAL ISSUE ⚠️

### The Problem

You have **React Hook Form installed** with all the UI components ready, but **you're not using it**. Instead, you're managing all form state manually with `useState`.

**Evidence:**
```bash
# React Hook Form is installed
"react-hook-form": "^7.55.0"

# Form components exist
client/src/shared/ui/form.tsx  # ✅ Ready to use

# BUT: No usage found in features
grep "useForm\|register\|control=" → 0 results in features/
```

### Current Anti-Pattern

**Example from `use-mortgage-tracking-state.ts`:**

```typescript
// ❌ ANTI-PATTERN: 70+ useState calls for form state
const [createPropertyPrice, setCreatePropertyPrice] = useState("");
const [createDownPayment, setCreateDownPayment] = useState("");
const [createStartDate, setCreateStartDate] = useState("");
const [createAmortization, setCreateAmortization] = useState("25");
const [createFrequency, setCreateFrequency] = useState("monthly");
const [createTermType, setCreateTermType] = useState("variable-fixed");
// ... 60+ more useState calls

// ❌ Manual validation
const propertyPriceError =
  !Number.isFinite(propertyPrice) || propertyPrice <= 0
    ? "Property price must be a valid number greater than zero"
    : "";

// ❌ Manual form state management
const isFormValid =
  createPropertyPrice &&
  createDownPayment &&
  createStartDate &&
  // ... complex validation logic
```

**Another Example from `use-cash-flow-state.ts`:**

```typescript
// ❌ 15+ useState calls for a single form
const [monthlyIncome, setMonthlyIncome] = useState<number>(DEFAULTS.monthlyIncome);
const [extraPaycheques, setExtraPaycheques] = useState<number>(DEFAULTS.extraPaycheques);
const [annualBonus, setAnnualBonus] = useState<number>(DEFAULTS.annualBonus);
// ... 12 more useState calls

// ❌ Manual sync with server data
useEffect(() => {
  if (!cashFlow) return;
  setMonthlyIncome(cashFlow.monthlyIncome != null ? Number(cashFlow.monthlyIncome) : DEFAULTS.monthlyIncome);
  // ... 12 more manual setters
}, [cashFlow]);
```

### Why This Is A Problem

1. **Boilerplate Explosion**
   - 70+ useState calls in one hook
   - Manual validation logic scattered everywhere
   - Manual form state sync with server data

2. **Performance Issues**
   - Every field change triggers re-render
   - No built-in debouncing
   - Unnecessary re-renders

3. **Error-Prone**
   - Easy to forget validation
   - Manual state sync can get out of sync
   - No type safety for form data

4. **Maintainability**
   - Hard to understand form structure
   - Difficult to add/remove fields
   - Validation logic duplicated

### The Solution: Use React Hook Form

**Before (Current - 150+ lines):**

```typescript
// ❌ Manual state management
const [propertyPrice, setPropertyPrice] = useState("");
const [downPayment, setDownPayment] = useState("");
// ... 10+ more fields

const propertyPriceError = /* manual validation */;
const isFormValid = /* complex logic */;

useEffect(() => {
  // Manual sync with server data
}, [serverData]);
```

**After (Improved - 50 lines):**

```typescript
// ✅ React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createMortgageSchema = z.object({
  propertyPrice: z.string().refine(
    (val) => Number(val) > 0,
    "Property price must be greater than zero"
  ),
  downPayment: z.string(),
  // ... more fields
}).refine(
  (data) => Number(data.downPayment) <= Number(data.propertyPrice),
  {
    message: "Down payment cannot exceed property price",
    path: ["downPayment"],
  }
);

type CreateMortgageFormData = z.infer<typeof createMortgageSchema>;

export function useMortgageForm(initialData?: Mortgage) {
  const form = useForm<CreateMortgageFormData>({
    resolver: zodResolver(createMortgageSchema),
    defaultValues: {
      propertyPrice: initialData?.propertyPrice?.toString() ?? "",
      downPayment: initialData?.downPayment?.toString() ?? "",
      // ... more defaults
    },
  });

  // ✅ Auto-sync with server data
  useEffect(() => {
    if (initialData) {
      form.reset({
        propertyPrice: initialData.propertyPrice?.toString() ?? "",
        // ... map all fields
      });
    }
  }, [initialData, form]);

  return form;
}

// In component:
const form = useMortgageForm(mortgage);
const { register, handleSubmit, formState: { errors, isValid } } = form;
```

**Benefits:**
- ✅ 70+ useState calls → 1 `useForm` hook
- ✅ Automatic validation with Zod
- ✅ Built-in error handling
- ✅ Type-safe form data
- ✅ Better performance (uncontrolled inputs)
- ✅ Less boilerplate

### Migration Strategy

**Phase 1: High-Impact Forms (Week 1)**
1. Migrate mortgage creation form
2. Migrate cash flow form
3. Migrate scenario editor form

**Phase 2: Medium-Impact Forms (Week 2)**
4. Migrate payment logging
5. Migrate term renewal
6. Migrate emergency fund form

**Phase 3: Small Forms (Week 3)**
7. Migrate remaining forms

---

## 4. Local UI State Management

### Current Patterns

**Good Examples:**
```typescript
// ✅ Simple, focused UI state
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [selectedHorizon, setSelectedHorizon] = useState<Horizon>(10);
const [filterYear, setFilterYear] = useState("all");
```

**Problematic Examples:**
```typescript
// ❌ Too much state in one hook
export function useMortgageTrackingState() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTermRenewalOpen, setIsTermRenewalOpen] = useState(false);
  const [isBackfillOpen, setIsBackfillOpen] = useState(false);
  // ... 70+ more useState calls
  
  // This hook does EVERYTHING:
  // - Form state
  // - UI state (dialogs, filters)
  // - Mutation logic
  // - Derived calculations
}
```

### Issues with Current Approach

1. **Massive State Hooks**
   - `use-mortgage-tracking-state.ts`: 707 lines, 70+ useState calls
   - `use-cash-flow-state.ts`: 155 lines, 15+ useState calls
   - `use-scenario-editor-state.ts`: 330+ lines, 15+ useState calls

2. **Mixed Concerns**
   - Form state mixed with UI state
   - Mutation logic mixed with state management
   - Calculations mixed with state

3. **Hard to Test**
   - Too many responsibilities
   - Difficult to isolate logic
   - Complex dependencies

### Recommended Refactoring

**Split `use-mortgage-tracking-state.ts` into:**

```typescript
// 1. UI State Hook (dialogs, filters)
export function useMortgageUIState() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTermRenewalOpen, setIsTermRenewalOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("all");
  
  return {
    isDialogOpen,
    setIsDialogOpen,
    isTermRenewalOpen,
    setIsTermRenewalOpen,
    filterYear,
    setFilterYear,
  };
}

// 2. Form State Hook (using React Hook Form)
export function useMortgageForm(initialData?: Mortgage) {
  const form = useForm({ /* ... */ });
  return form;
}

// 3. Mutation Hook
export function useMortgageMutations() {
  const createPaymentMutation = useMutation({ /* ... */ });
  const createTermMutation = useMutation({ /* ... */ });
  
  return {
    createPaymentMutation,
    createTermMutation,
  };
}

// 4. Derived State Hook
export function useMortgageCalculations(mortgage, terms, payments) {
  const summaryStats = useMemo(() => {
    // Calculations
  }, [mortgage, terms, payments]);
  
  return { summaryStats };
}

// 5. Composed Hook (optional)
export function useMortgageTracking() {
  const uiState = useMortgageUIState();
  const form = useMortgageForm();
  const mutations = useMortgageMutations();
  const calculations = useMortgageCalculations(/* ... */);
  
  return {
    ...uiState,
    form,
    ...mutations,
    ...calculations,
  };
}
```

---

## 5. State Management Architecture Evaluation

### Current Architecture Map

```
┌─────────────────────────────────────────────────────┐
│                  State Management                    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Server State (TanStack Query) ✅                    │
│  ├─ Scenarios                                        │
│  ├─ Mortgages                                        │
│  ├─ Payments                                         │
│  ├─ Cash Flow                                        │
│  └─ Emergency Fund                                   │
│                                                       │
│  Global State (Context) ✅                           │
│  └─ Mortgage Selection                               │
│                                                       │
│  Form State (Manual useState) ❌                     │
│  ├─ Mortgage Creation (70+ useState)                 │
│  ├─ Cash Flow (15+ useState)                         │
│  ├─ Scenario Editor (15+ useState)                   │
│  └─ Payment Logging (10+ useState)                   │
│                                                       │
│  UI State (useState) ⚠️                              │
│  ├─ Dialog open/close                                │
│  ├─ Filters                                          │
│  ├─ Selected items                                   │
│  └─ Wizard steps                                     │
│                                                       │
│  Derived State (useMemo) ✅                          │
│  ├─ Calculations                                     │
│  ├─ Sorted lists                                     │
│  └─ Chart data                                       │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### What's Working ✅

1. **Clear Separation of Server State**
   - All server state in TanStack Query
   - Consistent patterns across features
   - Proper cache invalidation

2. **Appropriate Global State**
   - Context used only for cross-cutting concerns
   - No overuse of global state
   - Good scope boundaries

3. **Derived State**
   - Proper use of `useMemo` for calculations
   - Good performance patterns

### What Needs Improvement ⚠️

1. **Form State Management**
   - React Hook Form installed but unused
   - Massive manual state management
   - Inconsistent validation patterns

2. **State Hook Complexity**
   - Hooks doing too much
   - Mixed concerns
   - Hard to test and maintain

3. **Query Configuration**
   - `staleTime: Infinity` prevents updates
   - No retry logic
   - Missing data-specific configurations

---

## 6. Recommendations by Priority

### High Priority 🔴

1. **Migrate Forms to React Hook Form**
   - **Impact:** Reduces code by 60-70%
   - **Effort:** 2-3 days
   - **Start with:** Mortgage creation form (biggest win)

2. **Fix Query Client Configuration**
   - **Impact:** Better data freshness and resilience
   - **Effort:** 2-4 hours
   - **Action:** Update staleTime, retry logic

3. **Refactor Large State Hooks**
   - **Impact:** Better maintainability and testability
   - **Effort:** 1-2 days per hook
   - **Start with:** `use-mortgage-tracking-state.ts`

### Medium Priority 🟡

4. **Implement Hierarchical Query Keys**
   - **Impact:** Smarter cache invalidation
   - **Effort:** 4-6 hours
   - **Benefit:** Better performance

5. **Add Form Validation Schemas**
   - **Impact:** Type-safe validation
   - **Effort:** 1 day
   - **Tool:** Zod (already installed)

### Low Priority 🟢

6. **Consider Zustand for Complex UI State**
   - **Only if:** You need to share complex UI state across many components
   - **Current:** Not needed - Context is sufficient

---

## 7. Code Examples

### Example: Migrating Mortgage Creation Form

**Before (Manual State - 200+ lines):**

```typescript
export function useMortgageTrackingState() {
  const [createPropertyPrice, setCreatePropertyPrice] = useState("");
  const [createDownPayment, setCreateDownPayment] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");
  // ... 10+ more fields
  
  const propertyPriceError = /* manual validation */;
  const isFormValid = /* complex logic */;
  
  // ... 150+ more lines
}
```

**After (React Hook Form - 80 lines):**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createMortgageSchema = z.object({
  propertyPrice: z.string()
    .refine((val) => Number(val) > 0, "Must be greater than zero"),
  downPayment: z.string()
    .refine((val) => Number(val) >= 0, "Must be zero or more"),
  startDate: z.string().min(1, "Required"),
  amortization: z.string().min(1, "Required"),
  frequency: z.enum(["monthly", "biweekly", "weekly"]),
  termType: z.enum(["fixed", "variable-fixed", "variable-changing"]),
  termYears: z.string(),
  fixedRate: z.string().optional(),
  spread: z.string().optional(),
  primeRate: z.string().optional(),
  paymentAmount: z.string().refine((val) => Number(val) > 0, "Required"),
}).refine(
  (data) => Number(data.downPayment) <= Number(data.propertyPrice),
  {
    message: "Down payment cannot exceed property price",
    path: ["downPayment"],
  }
).refine(
  (data) => {
    if (data.termType === "fixed") {
      return data.fixedRate && Number(data.fixedRate) > 0;
    }
    return data.spread !== undefined;
  },
  {
    message: "Rate or spread required based on term type",
    path: ["termType"],
  }
);

type CreateMortgageFormData = z.infer<typeof createMortgageSchema>;

export function useCreateMortgageForm(primeRate?: string) {
  const form = useForm<CreateMortgageFormData>({
    resolver: zodResolver(createMortgageSchema),
    defaultValues: {
      propertyPrice: "",
      downPayment: "",
      startDate: new Date().toISOString().split("T")[0],
      amortization: "25",
      frequency: "monthly",
      termType: "variable-fixed",
      termYears: "5",
      fixedRate: "",
      spread: "-0.80",
      primeRate: primeRate ?? "6.45",
      paymentAmount: "",
    },
    mode: "onChange", // Validate as user types
  });

  // Auto-update prime rate when it changes
  useEffect(() => {
    if (primeRate && form.getValues("termType") !== "fixed") {
      form.setValue("primeRate", primeRate);
    }
  }, [primeRate, form]);

  return form;
}
```

**Usage in Component:**

```typescript
function CreateMortgageDialog({ primeRateData }: Props) {
  const form = useCreateMortgageForm(primeRateData?.primeRate);
  const { register, handleSubmit, formState: { errors, isValid } } = form;
  const createMutation = useCreateMortgageMutation();

  const onSubmit = handleSubmit((data) => {
    createMutation.mutate({
      propertyPrice: data.propertyPrice,
      downPayment: data.downPayment,
      // ... map form data
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="propertyPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Price</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields... */}
      </form>
    </Form>
  );
}
```

**Benefits:**
- ✅ 70+ useState calls → 1 `useForm` hook
- ✅ Automatic validation
- ✅ Type-safe form data
- ✅ Less code to maintain
- ✅ Better performance

---

## 8. Testing Considerations

### Current State (Hard to Test)

```typescript
// ❌ Hard to test: Too many responsibilities
export function useMortgageTrackingState() {
  // Form state
  // UI state
  // Mutations
  // Calculations
  // Everything mixed together
}
```

### Improved State (Easy to Test)

```typescript
// ✅ Easy to test: Single responsibility
export function useMortgageForm(initialData?: Mortgage) {
  const form = useForm({ /* ... */ });
  return form;
}

// Test:
test('validates property price', () => {
  const { result } = renderHook(() => useMortgageForm());
  result.current.setValue('propertyPrice', '-100');
  expect(result.current.formState.errors.propertyPrice).toBeDefined();
});
```

---

## 9. Performance Implications

### Current Issues

1. **Too Many Re-renders**
   - Every form field change triggers re-render
   - No debouncing
   - Unnecessary calculations

2. **Large State Hooks**
   - All state updates trigger hook re-evaluation
   - Expensive calculations run on every render

### Improvements with React Hook Form

1. **Uncontrolled Inputs**
   - Form fields don't trigger re-renders
   - Better performance for large forms

2. **Focused Updates**
   - Only validation runs on field change
   - Calculations can be memoized separately

---

## 10. Migration Checklist

### Phase 1: Foundation (Week 1)

- [ ] Fix query client configuration (staleTime, retry)
- [ ] Implement hierarchical query keys
- [ ] Add error handling to localStorage operations

### Phase 2: Form Migration (Weeks 2-3)

- [ ] Create Zod schemas for all forms
- [ ] Migrate mortgage creation form
- [ ] Migrate cash flow form
- [ ] Migrate scenario editor form
- [ ] Migrate payment logging form
- [ ] Migrate remaining forms

### Phase 3: Refactoring (Week 4)

- [ ] Split `use-mortgage-tracking-state.ts`
- [ ] Split `use-cash-flow-state.ts`
- [ ] Split `use-scenario-editor-state.ts`
- [ ] Extract mutation hooks
- [ ] Extract calculation hooks

### Phase 4: Testing (Week 5)

- [ ] Add unit tests for form hooks
- [ ] Add unit tests for state hooks
- [ ] Add integration tests for forms

---

## Conclusion

Your state management shows **good architectural decisions** at the high level (server state, global state), but **critical anti-patterns** in implementation (manual form state, massive hooks). The biggest win would be migrating to React Hook Form, which you already have installed but aren't using. This alone would reduce code by 60-70% and improve maintainability significantly.

**Key Takeaways:**
1. ✅ Server state: Good patterns, just fix configuration
2. ✅ Global state: Appropriate use of Context
3. ❌ Form state: Migrate to React Hook Form immediately
4. ⚠️ State hooks: Split into focused, single-responsibility hooks

**Next Steps:**
1. Fix query client configuration (quick win - 2 hours)
2. Migrate one form to React Hook Form as proof of concept (1 day)
3. Refactor largest state hook into smaller pieces (2 days)

With these improvements, your state management will be production-ready and maintainable at scale.

---

**Analysis Completed:** 2024

