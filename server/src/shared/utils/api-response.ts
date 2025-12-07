import type { Response } from "express";
import { sanitizeError } from "./error-sanitizer";

/**
 * Standardized API error response helper
 * Ensures all error responses follow the same format across all routes
 */
export function sendError(
  res: Response,
  status: number,
  message: string,
  error?: unknown,
): void {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (error) {
    const sanitized = sanitizeError(error, isDevelopment);
    res.status(status).json({
      error: sanitized.message || message,
      ...(sanitized.details && { details: sanitized.details }),
    });
  } else {
    res.status(status).json({ error: message });
  }
}

/**
 * Standardized API success response helper
 * For consistent success responses
 */
export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json(data);
}

