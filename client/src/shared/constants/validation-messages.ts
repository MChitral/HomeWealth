/**
 * Standardized validation error messages
 * Use these constants for consistent error messaging across the application
 */

export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_NUMBER: "Must be a valid number",
  POSITIVE_NUMBER: "Must be a positive number",
  NON_NEGATIVE_NUMBER: "Must be zero or greater",
  INVALID_EMAIL: "Must be a valid email address",
  INVALID_DATE: "Must be a valid date (YYYY-MM-DD)",
  FUTURE_DATE: "Must be a future date",
  PAST_DATE: "Must be a past date",
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  NUMBER_RANGE: (min: number, max: number) => `Must be between ${min} and ${max}`,
  PERCENTAGE: "Must be between 0 and 100",
  INTEREST_RATE: (max: number = 20) => `Must be between 0 and ${max}%`,
  LESS_THAN: (fieldName: string) => `Must be less than ${fieldName}`,
  GREATER_THAN: (fieldName: string) => `Must be greater than ${fieldName}`,
} as const;
