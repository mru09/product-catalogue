import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export interface AuthRequest extends Request {
  userId?: string;
}
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ message: "Please log in" });
  try {
    const payload = jwt.verify(
      header.slice(7),
      env.jwtSecret,
    ) as jwt.JwtPayload;
    if (typeof payload.userId !== "string") throw new Error("Invalid token");
    req.userId = payload.userId;
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Session expired. Please log in again." });
  }
}
