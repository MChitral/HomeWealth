import type { Request, Response, NextFunction } from "express";
import { sanitizeError } from "@server-shared/utils/error-sanitizer";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status =
    err && typeof err === "object" && ("status" in err || "statusCode" in err)
      ? ("status" in err && typeof err.status === "number" ? err.status : undefined) ||
        ("statusCode" in err && typeof err.statusCode === "number" ? err.statusCode : undefined) ||
        500
      : 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  const sanitized = sanitizeError(err, isDevelopment);

  res.status(status).json({
    error: sanitized.message,
    ...(sanitized.details ? { details: sanitized.details } : {}),
  });

  // Always log full error details server-side for debugging
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error("Server Error:", err);
  } else if (isDevelopment) {
    // In development, also log client errors for debugging
    // eslint-disable-next-line no-console
    console.warn("Client Error:", err);
  }
}
