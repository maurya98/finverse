/**
 * Auth API: login (calls backend and persists via auth.ts), logout (clears storage).
 */

import { setAuth, clearAuth, type StoredUser } from "./auth";

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (url && typeof url === "string") return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

export type LoginBody = { email: string; password: string };

export type LoginResponse =
  | { success: true; data?: { token: string; user: StoredUser }; message?: string }
  | { success: false; message: string; errors?: Array<{ path?: string; message: string }> };

export async function login(body: LoginBody): Promise<LoginResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as LoginResponse;
  if (json.success && json.data?.token && json.data?.user) {
    setAuth(json.data.token, json.data.user);
  }
  if (!res.ok && json.success !== false) {
    return { success: false, message: "Login failed" };
  }
  return json;
}

export function logout(): void {
  clearAuth();
}
