import type { User } from "../types/index";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";
export function getToken() {
  return localStorage.getItem("token") || "";
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await response
    .json()
    .catch(() => ({ message: "Invalid server response" }));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data as T;
}
export async function login(email: string, password: string) {
  return api<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
