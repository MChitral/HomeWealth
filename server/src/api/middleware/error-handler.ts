import type { Request, Response, NextFunction } from "express";
import { sanitizeError } from "@server-shared/utils/error-sanitizer";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || err?.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === "development";
  
  const sanitized = sanitizeError(err, isDevelopment);
  
  res.status(status).json({
    error: sanitized.message,
    ...(sanitized.details && { details: sanitized.details }),
  });
  
  // Always log full error details server-side for debugging
  if (status >= 500) {
    console.error("Server Error:", err);
  } else if (isDevelopment) {
    // In development, also log client errors for debugging
    console.warn("Client Error:", err);
  }
}

