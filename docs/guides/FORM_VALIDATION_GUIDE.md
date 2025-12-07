# Form Validation Guide

This guide explains how to use the standardized form validation utilities and patterns in the application.

## Overview

The form validation system provides:
- **Reusable validation functions** for common patterns (required, numbers, dates, etc.)
- **Form field hooks** for managing field state and validation
- **Standardized error messages** for consistent UX
- **Type-safe validation** with TypeScript

## Validation Utilities

Located in `client/src/shared/utils/form-validation.ts`

### Common Validators

```typescript
import { required, positiveNumber, email, date, percentage } from "@/shared/utils/form-validation";

// Required field
const result = required(value);
// Returns: { isValid: boolean, error?: string }

// Positive number
const result = positiveNumber(value);

// Email format
const result = email(value);

// Date (YYYY-MM-DD)
const result = date(value);

// Percentage (0-100)
const result = percentage(value);
```

### Combining Validators

```typescript
import { combineValidations, required, minLength, maxLength } from "@/shared/utils/form-validation";

const validateName = (value: string) => 
  combineValidations(
    required(value),
    minLength(value, 3),
    maxLength(value, 50)
  );
```

## Form Field Hook

Located in `client/src/shared/hooks/use-form-validation.ts`

### Basic Usage

```typescript
import { useFormField } from "@/shared/hooks/use-form-validation";
import { required, positiveNumber } from "@/shared/utils/form-validation";

function MyForm() {
  const nameField = useFormField({
    initialValue: "",
    validate: required,
  });

  const ageField = useFormField({
    initialValue: 0,
    validate: positiveNumber,
  });

  return (
    <form>
      <div>
        <label>Name</label>
        <input
          value={nameField.value}
          onChange={(e) => nameField.setValue(e.target.value)}
          onBlur={() => nameField.setTouched()}
        />
        {nameField.error && <span className="error">{nameField.error}</span>}
      </div>
      
      <div>
        <label>Age</label>
        <input
          type="number"
          value={ageField.value}
          onChange={(e) => ageField.setValue(Number(e.target.value) || 0)}
          onBlur={() => ageField.setTouched()}
        />
        {ageField.error && <span className="error">{ageField.error}</span>}
      </div>
    </form>
  );
}
```

### Form Field Hook API

```typescript
interface FormFieldState<T> {
  value: T;              // Current field value
  setValue: (value: T) => void;  // Update value and mark as touched
  error?: string;       // Error message (only shown if touched)
  touched: boolean;      // Whether field has been interacted with
  setTouched: () => void;  // Mark field as touched
  isValid: boolean;     // Whether field passes validation
  reset: () => void;    // Reset to initial value
}
```

## Standardized Error Messages

Located in `client/src/shared/constants/validation-messages.ts`

```typescript
import { VALIDATION_MESSAGES } from "@/shared/constants/validation-messages";

// Use constants for consistent messaging
const error = VALIDATION_MESSAGES.REQUIRED;
const rangeError = VALIDATION_MESSAGES.NUMBER_RANGE(0, 100);
```

## Integration with FormField Component

Use the shared `FormField` component for consistent styling:

```typescript
import { FormField } from "@/shared/components/forms";
import { useFormField } from "@/shared/hooks/use-form-validation";
import { required } from "@/shared/utils/form-validation";

function MyForm() {
  const nameField = useFormField({
    initialValue: "",
    validate: required,
  });

  return (
    <FormField
      label="Name"
      error={nameField.error}
      required
    >
      <Input
        value={nameField.value}
        onChange={(e) => nameField.setValue(e.target.value)}
        onBlur={() => nameField.setTouched()}
      />
    </FormField>
  );
}
```

## Migration Pattern

### Before (Manual State Management)

```typescript
const [name, setName] = useState("");
const [nameError, setNameError] = useState("");

const handleNameChange = (value: string) => {
  setName(value);
  if (!value) {
    setNameError("This field is required");
  } else {
    setNameError("");
  }
};
```

### After (Using Form Validation)

```typescript
const nameField = useFormField({
  initialValue: "",
  validate: required,
});

// Error handling is automatic
// Just use: nameField.setValue(value)
```

## Best Practices

1. **Validate on blur, not on change** - Better UX, less aggressive
   ```typescript
   <input
     value={field.value}
     onChange={(e) => field.setValue(e.target.value)}
     onBlur={() => field.setTouched()}  // Show errors after user leaves field
   />
   ```

2. **Show errors only when touched** - The hook handles this automatically
   ```typescript
   {field.error && <span>{field.error}</span>}
   ```

3. **Combine validators for complex rules**
   ```typescript
   const validate = (value: string) => 
     combineValidations(
       required(value),
       minLength(value, 3),
       maxLength(value, 50)
     );
   ```

4. **Use FormField component for consistency**
   ```typescript
   <FormField label="Name" error={field.error} required>
     <Input {...inputProps} />
   </FormField>
   ```

5. **Check form validity before submit**
   ```typescript
   const handleSubmit = () => {
     // Touch all fields
     nameField.setTouched();
     emailField.setTouched();
     
     // Check validity
     if (nameField.isValid && emailField.isValid) {
       // Submit
     }
   };
   ```

## Future: React Hook Form Integration

For complex forms, consider migrating to React Hook Form:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

This provides:
- Better performance (fewer re-renders)
- Built-in validation with Zod
- Better TypeScript inference
- Form state management

## Available Validators

- `required` - Field must not be empty
- `positiveNumber` - Must be a positive number
- `nonNegativeNumber` - Must be zero or positive
- `numberRange(min, max)` - Number within range
- `minLength(value, min)` - String minimum length
- `maxLength(value, max)` - String maximum length
- `email` - Valid email format
- `date` - Valid date (YYYY-MM-DD)
- `futureDate` - Date in the future
- `pastDate` - Date in the past
- `percentage` - Percentage (0-100)
- `interestRate(value, max)` - Interest rate validation
- `lessThan(a, b, fieldName)` - Value A < Value B
- `greaterThan(a, b, fieldName)` - Value A > Value B
- `combineValidations(...results)` - Combine multiple validators

