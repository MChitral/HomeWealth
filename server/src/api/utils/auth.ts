import type { Request, Response } from "express";

export function requireUser(req: Request, res: Response): Express.User | null {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return req.user;
}

