import { useState, useCallback, useMemo } from "react";
import type { ValidationResult } from "@/shared/utils/form-validation";

/**
 * Generic form field state with validation
 */
export interface FormFieldState<T> {
  value: T;
  error?: string;
  touched: boolean;
}

/**
 * Options for form field validation
 */
export interface FormFieldOptions<T> {
  initialValue: T;
  validate?: (value: T) => ValidationResult;
  required?: boolean;
}

/**
 * Hook for managing a single form field with validation
 */
export function useFormField<T>(options: FormFieldOptions<T>) {
  const { initialValue, validate } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [touched, setTouched] = useState(false);

  const validationResult = useMemo(() => {
    if (!validate) return { isValid: true };
    return validate(value);
  }, [value, validate]);

  const error = touched && !validationResult.isValid ? validationResult.error : undefined;

  const setValueAndTouch = useCallback((newValue: T) => {
    setValue(newValue);
    setTouched(true);
  }, []);

  const setTouchedOnly = useCallback(() => {
    setTouched(true);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    setValue: setValueAndTouch,
    error,
    touched,
    setTouched: setTouchedOnly,
    isValid: validationResult.isValid,
    reset,
  };
}

/**
 * Hook for managing multiple form fields with validation
 * Note: This is a convenience wrapper. For better performance and flexibility,
 * use individual useFormField hooks for each field.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function useFormFields<T extends Record<string, any>>(_fields: {
  [K in keyof T]: FormFieldOptions<T[K]>;
}) {
  // This hook is a pattern example. In practice, call useFormField for each field individually
  // This avoids Rules of Hooks violations and provides better TypeScript inference

  // For now, return a helper that suggests using individual hooks
  // In a real implementation, you'd structure your component to call useFormField for each field
  return {
    // This is a placeholder - actual implementation should use individual hooks
    // Example usage:
    // const nameField = useFormField({ initialValue: '', validate: required });
    // const emailField = useFormField({ initialValue: '', validate: email });
    // Then combine them manually or use a form library like React Hook Form
  };
}
