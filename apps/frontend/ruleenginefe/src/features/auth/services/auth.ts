/**
 * Auth helpers: persist token and user after login, clear on logout.
 * Role for ACL is read from the JWT token only (decode client-side); revalidate token before privileged actions.
 */

const TOKEN_KEY = "ruleengine_token";
const USER_KEY = "ruleengine_user";

export type StoredUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export function setAuth(token: string, user: StoredUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/** Decode JWT payload without verification (backend verifies on each request). Returns null if token is invalid. */
export function decodeTokenPayload(
  token: string
): { sub: string; role: string; exp?: number } | null {
  const trimmed = token?.trim();
  if (!trimmed || typeof atob !== "function") return null;
  try {
    const parts = trimmed.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    const payload = JSON.parse(json) as { sub?: string; role?: string; exp?: number };
    if (payload?.sub != null && payload?.role != null) {
      return { sub: payload.sub, role: payload.role, exp: payload.exp };
    }
  } catch {
    // invalid base64 or JSON
  }
  return null;
}

/** True if payload has exp and it is in the past (exp is seconds since epoch). */
export function isTokenExpired(payload: { exp?: number }): boolean {
  if (payload.exp == null) return false;
  return payload.exp * 1000 < Date.now();
}

/**
 * Get the current user's role from the JWT token only. Returns null if no token, invalid, or expired.
 * Use this for ACL (create/delete workspace, create repo) instead of getUser().role.
 */
export function getTokenRole(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeTokenPayload(token);
  if (!payload || isTokenExpired(payload)) return null;
  return payload.role;
}

/**
 * Revalidate token before a privileged action (create/delete workspace or repo).
 * If token is missing, invalid, or expired: clears auth and returns { valid: false }.
 * Otherwise returns { valid: true, userId, role } from the token.
 */
export function revalidateToken(): {
  valid: boolean;
  userId?: string;
  role?: string;
} {
  const token = getToken();
  if (!token) {
    clearAuth();
    return { valid: false };
  }
  const payload = decodeTokenPayload(token);
  if (!payload || isTokenExpired(payload)) {
    clearAuth();
    return { valid: false };
  }
  return { valid: true, userId: payload.sub, role: payload.role };
}

/** Roles that may create/delete workspaces and create repositories (global user role from token). */
export const PRIVILEGED_GLOBAL_ROLES = ["ADMIN", "MAINTAINER"] as const;

export function canPerformPrivilegedActions(role: string | null): boolean {
  return role != null && (PRIVILEGED_GLOBAL_ROLES as readonly string[]).includes(role);
}
