import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { env } from "../config/env.js";

const loginMessage = "Please log in";
const expiredMessage = "Session expired. Please log in again.";

export const requireAuth: RequestHandler = (request, response, next) => {
  const authorization = request.get("Authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    response.status(401).json({ message: loginMessage });
    return;
  }

  try {
    const payload = jwt.verify(match[1], env.jwtSecret);
    if (
      typeof payload === "string" ||
      typeof payload.userId !== "string" ||
      payload.userId.length === 0
    ) {
      response.status(401).json({ message: expiredMessage });
      return;
    }

    request.userId = payload.userId;
    next();
  } catch {
    response.status(401).json({ message: expiredMessage });
  }
};
