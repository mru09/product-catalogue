import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env.js";

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ message: "Route not found" });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  console.error(error);
  if (response.headersSent) {
    next(error);
    return;
  }
  const message =
    env.nodeEnv === "production"
      ? "Internal server error"
      : error instanceof Error
        ? error.message
        : String(error);
  response.status(500).json({ message });
};
