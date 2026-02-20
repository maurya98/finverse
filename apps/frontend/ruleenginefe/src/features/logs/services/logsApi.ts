/**
 * API client for request logs (live stream + search).
 * Backend: GET /api/v1/logs (search), GET /api/v1/logs/live (SSE).
 */

import { getToken } from "../../auth/services/auth";

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (url && typeof url === "string") return url.replace(/\/$/, "");
  return "http://localhost:3000";
};

export type RequestLogEntry = {
  id: number;
  timestamp: string;
  application: string | null;
  method: string;
  url: string;
  status_code: number;
  duration_ms: number;
  payload_json: Record<string, unknown>;
};

export type LogSearchFilters = {
  from?: string;
  to?: string;
  application?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  q?: string;
  limit?: number;
  offset?: number;
  count?: boolean;
};

export type LogSearchResponse = {
  data: RequestLogEntry[];
  total?: number;
};

export type LogsApiError = {
  error: string;
  hint?: string;
  message?: string;
};

/** Build full URL for logs API (used for fetch and EventSource). */
export function getLogsBaseUrl(): string {
  return `${getBaseUrl()}/api/v1/logs`;
}

/** Fetch filtered logs. Uses auth header. */
export async function searchLogs(filters: LogSearchFilters): Promise<LogSearchResponse | LogsApiError> {
  const params = new URLSearchParams();
  if (filters.from != null) params.set("from", filters.from);
  if (filters.to != null) params.set("to", filters.to);
  if (filters.application != null) params.set("application", filters.application);
  if (filters.method != null) params.set("method", filters.method);
  if (filters.url != null) params.set("url", filters.url);
  if (filters.statusCode != null) params.set("statusCode", String(filters.statusCode));
  if (filters.q != null) params.set("q", filters.q);
  if (filters.limit != null) params.set("limit", String(filters.limit));
  if (filters.offset != null) params.set("offset", String(filters.offset));
  if (filters.count === true) params.set("count", "true");

  const token = getToken();
  const res = await fetch(`${getLogsBaseUrl()}?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = (await res.json()) as LogSearchResponse | LogsApiError;
  if (!res.ok) {
    return (json as LogsApiError) || { error: "Request failed" };
  }
  return json as LogSearchResponse;
}

/**
 * Build EventSource URL for live logs.
 * Note: EventSource does not support custom headers; ensure backend allows unauthenticated access
 * for /api/v1/logs/live or use cookie-based auth.
 */
export function getLiveLogsUrl(options?: { pollInterval?: number; since?: string }): string {
  const params = new URLSearchParams();
  if (options?.pollInterval != null) params.set("pollInterval", String(options.pollInterval));
  if (options?.since != null) params.set("since", options.since);
  const q = params.toString();
  return `${getLogsBaseUrl()}/live${q ? `?${q}` : ""}`;
}
