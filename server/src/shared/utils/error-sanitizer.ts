import { z } from "zod";

/**
 * Sanitizes errors for client responses.
 * In development, shows detailed error information.
 * In production, only exposes safe, user-friendly messages.
 */
export function sanitizeError(
  error: unknown,
  isDevelopment: boolean
): {
  message: string;
  details?: unknown;
} {
  // Development mode: show full error details for debugging
  if (isDevelopment) {
    if (error instanceof z.ZodError) {
      return {
        message: "Validation failed",
        details: {
          errors: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
            code: e.code,
          })),
        },
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        details: {
          name: error.name,
          stack: error.stack,
        },
      };
    }

    return {
      message: "Unknown error occurred",
      details: error,
    };
  }

  // Production mode: only expose safe, user-friendly messages
  if (error instanceof z.ZodError) {
    // Return validation errors in a safe format
    return {
      message: "Validation failed",
      details: error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    };
  }

  if (error instanceof Error) {
    // List of safe error messages that can be exposed to users
    const safeErrorMessages = [
      "Mortgage not found",
      "Term not found",
      "Payment not found",
      "Scenario not found",
      "Invalid mortgage data",
      "Invalid term data",
      "Invalid payment data",
      "Invalid scenario data",
      "Invalid update data",
      "Invalid event data",
      "Forbidden",
      "Annual prepayment limit exceeded",
      "Maximum 60 payments can be created at once",
      "Payments array is required",
    ];

    // Check if error message contains any safe message
    const isSafeMessage = safeErrorMessages.some((safeMsg) => error.message.includes(safeMsg));

    if (isSafeMessage) {
      return { message: error.message };
    }

    // For unknown errors, return generic message
    return { message: "An error occurred. Please try again." };
  }

  // Fallback for unknown error types
  return { message: "An error occurred. Please try again." };
}
