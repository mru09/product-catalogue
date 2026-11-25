import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: resolve(backendDirectory, ".env") });

function readPort(value: string | undefined, fallback: number): number {
  const parsed = Number(value?.trim() || fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid port value: ${value}`);
  }
  return parsed;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === "") return fallback;
  if (value.trim().toLowerCase() === "true") return true;
  if (value.trim().toLowerCase() === "false") return false;
  throw new Error(`Expected "true" or "false", received: ${value}`);
}

export const env = {
  port: readPort(process.env.PORT, 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/catalogue",
  jwtSecret: process.env.JWT_SECRET ?? "change-this-development-secret",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: readPort(process.env.SMTP_PORT, 587),
  smtpSecure: readBoolean(process.env.SMTP_SECURE, false),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development"
};
