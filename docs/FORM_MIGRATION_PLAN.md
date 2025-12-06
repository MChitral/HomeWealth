# Form Migration to React Hook Form - Implementation Plan

## Overview

Migrating all manual form state management (70+ useState calls) to React Hook Form + Zod for type-safe validation.

## Forms to Migrate (Priority Order)

### 1. Cash Flow Form ✅ (Easiest - Start Here)
- **Current:** 15+ useState calls in `use-cash-flow-state.ts`
- **Complexity:** Low
- **Estimated Time:** 2-3 hours
- **Impact:** Good practice for pattern

### 2. Mortgage Creation Form 🔄 (Biggest Impact)
- **Current:** 70+ useState calls in `use-mortgage-tracking-state.ts`
- **Complexity:** High (wizard form, auto-calculations)
- **Estimated Time:** 4-6 hours
- **Impact:** Massive code reduction

### 3. Scenario Editor Form
- **Current:** 15+ useState calls in `use-scenario-editor-state.ts`
- **Complexity:** Medium
- **Estimated Time:** 3-4 hours

### 4. Term Renewal/Edit Forms
- **Current:** Multiple forms in mortgage tracking
- **Complexity:** Medium
- **Estimated Time:** 2-3 hours each

## Migration Strategy

### Step 1: Create Form Hook with Zod Schema
```typescript
// 1. Define Zod schema for validation
const formSchema = z.object({...});

// 2. Create hook using React Hook Form
export function useFormHook() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {...},
  });
  return form;
}
```

### Step 2: Update Component to Use Form Hook
```typescript
// Replace useState calls with:
const form = useFormHook();
const { register, control, formState: { errors } } = form;
```

### Step 3: Replace Manual Validation
```typescript
// Before: Manual validation
const propertyPriceError = /* complex logic */;

// After: Automatic via Zod schema
<FormField
  control={form.control}
  name="propertyPrice"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Property Price</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Auto-shows errors */}
    </FormItem>
  )}
/>
```

### Step 4: Update Submission Logic
```typescript
// Before: Manual validation + submission
const handleSubmit = () => {
  if (!isFormValid) return;
  // submit logic
};

// After: Form handles validation
const onSubmit = form.handleSubmit((data) => {
  // data is type-safe, already validated
  mutation.mutate(data);
});
```

## Benefits

1. **Code Reduction:** 70+ useState → 1 useForm hook
2. **Type Safety:** Zod schema provides runtime + compile-time validation
3. **Better Performance:** Uncontrolled inputs (no re-renders)
4. **Less Boilerplate:** No manual validation, error handling
5. **Easier Testing:** Form logic is isolated

## Implementation Status

- [x] Form hook structure created (`use-create-mortgage-form.ts`)
- [ ] Migrate CreateMortgageDialog component
- [ ] Update mortgage-feature.tsx integration
- [ ] Remove old useState code from use-mortgage-tracking-state.ts
- [ ] Test form validation and submission

## Next Steps

1. Complete mortgage creation form migration
2. Test thoroughly
3. Migrate cash flow form (simpler, good for validation)
4. Migrate remaining forms

