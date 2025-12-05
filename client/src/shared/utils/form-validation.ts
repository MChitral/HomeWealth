/**
 * Common form validation utilities
 * Provides reusable validation functions and error message formatting
 */

export type ValidationRule<T = any> = {
  validate: (value: T) => boolean;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * Validates that a value is not empty
 */
export function required(value: string | number | null | undefined): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, error: "This field is required" };
  }
  return { isValid: true };
}

/**
 * Validates that a number is positive
 */
export function positiveNumber(value: number | string | null | undefined): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, error: "This field is required" };
  }
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num) || num <= 0) {
    return { isValid: false, error: "Must be a positive number" };
  }
  return { isValid: true };
}

/**
 * Validates that a number is non-negative (zero or positive)
 */
export function nonNegativeNumber(value: number | string | null | undefined): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, error: "This field is required" };
  }
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num) || num < 0) {
    return { isValid: false, error: "Must be zero or greater" };
  }
  return { isValid: true };
}

/**
 * Validates that a number is within a range
 */
export function numberRange(
  value: number | string | null | undefined,
  min: number,
  max: number
): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, error: "This field is required" };
  }
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) {
    return { isValid: false, error: "Must be a valid number" };
  }
  if (num < min || num > max) {
    return { isValid: false, error: `Must be between ${min} and ${max}` };
  }
  return { isValid: true };
}

/**
 * Validates that a string has minimum length
 */
export function minLength(value: string | null | undefined, min: number): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, error: "This field is required" };
  }
  if (value.length < min) {
    return { isValid: false, error: `Must be at least ${min} characters` };
  }
  return { isValid: true };
}

/**
 * Validates that a string has maximum length
 */
export function maxLength(value: string | null | undefined, max: number): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: true }; // maxLength doesn't require the field
  }
  if (value.length > max) {
    return { isValid: false, error: `Must be no more than ${max} characters` };
  }
  return { isValid: true };
}

/**
 * Validates email format
 */
export function email(value: string | null | undefined): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, error: "This field is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { isValid: false, error: "Must be a valid email address" };
  }
  return { isValid: true };
}

/**
 * Validates that a value is a valid date string (YYYY-MM-DD)
 */
export function date(value: string | null | undefined): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, error: "This field is required" };
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return { isValid: false, error: "Must be a valid date (YYYY-MM-DD)" };
  }
  const dateObj = new Date(value);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: "Must be a valid date" };
  }
  return { isValid: true };
}

/**
 * Validates that a date is in the future
 */
export function futureDate(value: string | null | undefined): ValidationResult {
  const dateResult = date(value);
  if (!dateResult.isValid) {
    return dateResult;
  }
  const dateObj = new Date(value!);
  if (dateObj <= new Date()) {
    return { isValid: false, error: "Must be a future date" };
  }
  return { isValid: true };
}

/**
 * Validates that a date is in the past
 */
export function pastDate(value: string | null | undefined): ValidationResult {
  const dateResult = date(value);
  if (!dateResult.isValid) {
    return dateResult;
  }
  const dateObj = new Date(value!);
  if (dateObj >= new Date()) {
    return { isValid: false, error: "Must be a past date" };
  }
  return { isValid: true };
}

/**
 * Validates percentage (0-100)
 */
export function percentage(value: number | string | null | undefined): ValidationResult {
  return numberRange(value, 0, 100);
}

/**
 * Validates interest rate (0-100, typically 0-20 for mortgages)
 */
export function interestRate(value: number | string | null | undefined, max: number = 20): ValidationResult {
  return numberRange(value, 0, max);
}

/**
 * Validates that value A is less than value B
 */
export function lessThan(
  valueA: number | string | null | undefined,
  valueB: number | string | null | undefined,
  fieldName: string = "value"
): ValidationResult {
  if (valueA === null || valueA === undefined || valueB === null || valueB === undefined) {
    return { isValid: true }; // Let required validation handle empty values
  }
  const numA = typeof valueA === "string" ? parseFloat(valueA) : valueA;
  const numB = typeof valueB === "string" ? parseFloat(valueB) : valueB;
  if (!Number.isFinite(numA) || !Number.isFinite(numB)) {
    return { isValid: true }; // Let number validation handle invalid numbers
  }
  if (numA >= numB) {
    return { isValid: false, error: `Must be less than ${fieldName}` };
  }
  return { isValid: true };
}

/**
 * Validates that value A is greater than value B
 */
export function greaterThan(
  valueA: number | string | null | undefined,
  valueB: number | string | null | undefined,
  fieldName: string = "value"
): ValidationResult {
  if (valueA === null || valueA === undefined || valueB === null || valueB === undefined) {
    return { isValid: true }; // Let required validation handle empty values
  }
  const numA = typeof valueA === "string" ? parseFloat(valueA) : valueA;
  const numB = typeof valueB === "string" ? parseFloat(valueB) : valueB;
  if (!Number.isFinite(numA) || !Number.isFinite(numB)) {
    return { isValid: true }; // Let number validation handle invalid numbers
  }
  if (numA <= numB) {
    return { isValid: false, error: `Must be greater than ${fieldName}` };
  }
  return { isValid: true };
}

/**
 * Combines multiple validation rules
 */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
  for (const result of results) {
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
}

