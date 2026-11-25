import type { LoginResponse } from "../types";

export const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

interface ApiError {
  message?: unknown;
}

function isApiError(value: unknown): value is ApiError {
  return typeof value === "object" && value !== null;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers({
    "Content-Type": "application/json"
  });
  const token = typeof localStorage === "undefined" ? null : localStorage.getItem("token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  new Headers(options.headers).forEach((value, key) => headers.set(key, value));

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${apiBaseUrl}${normalizedPath}`, {
    ...options,
    headers
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = { message: "Invalid server response" };
  }

  if (!response.ok) {
    const message =
      isApiError(data) && typeof data.message === "string" && data.message
        ? data.message
        : "Request failed";
    throw new Error(message);
  }

  return data as T;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}
