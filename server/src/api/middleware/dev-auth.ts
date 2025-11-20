import type { Request, Response, NextFunction } from "express";

export function devAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    (req as unknown as { user: Express.User }).user = {
      id: "dev-user-123",
      username: "devuser",
    };
  }
  next();
}

