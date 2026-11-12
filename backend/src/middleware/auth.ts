import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase.ts";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email?: string };
}

const verifyTokenSchema = z.object({
  token: z.string().min(1, "Missing token"),
});

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const parsed = verifyTokenSchema.safeParse({ token: authHeader.slice("Bearer ".length) });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid token format" });
  }

  try {
    const { data, error } = await supabase.auth.getUser(parsed.data.token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = { id: data.user.id, email: data.user.email ?? undefined };
    return next();
  } catch (error) {
    console.error("Auth verification error", error);
    return res.status(500).json({ error: "Auth verification failed" });
  }
}
