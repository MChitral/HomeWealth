import type { Request, Response } from "express";

const DEV_USER_ID = "dev-user-001";

export function requireUser(_req: Request, _res: Response): Express.User | null {
  return { id: DEV_USER_ID } as any;
}

