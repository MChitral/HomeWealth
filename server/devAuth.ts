import type { Request, Response, NextFunction } from "express";

// Simple development auth middleware
// TODO: Replace with proper Replit Auth in production
export function devAuth(req: Request, res: Response, next: NextFunction) {
  // Mock user for development
  if (!req.user) {
    (req as any).user = {
      id: "dev-user-123",
      username: "devuser",
    };
  }
  next();
}

export const isAuthenticated = devAuth;
