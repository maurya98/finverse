/**
 * Read-only Postgres client for request logs. Uses same env as pg-writer (LOG_PG_URL/DB_URL).
 * Separate client so long-running reads do not block the writer.
 */

import { Client } from "pg";
import * as path from "path";
import { config } from "dotenv";

const packageRoot = path.resolve(__dirname, "..", "..");
config({ path: path.join(packageRoot, ".env") });

export interface RequestLogRow {
  id: number;
  timestamp: string;
  application: string | null;
  method: string;
  url: string;
  status_code: number;
  duration_ms: number;
  payload_json: Record<string, unknown>;
}

export interface LogFilters {
  from?: string;
  to?: string;
  application?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  q?: string;
}

export interface LogPagination {
  limit?: number;
  offset?: number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const LIVE_POLL_LIMIT = 100;

let readClient: Client | null = null;

/** Escape special chars for use in SQL LIKE (%, _, \). */
function escapeLike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function getConnectionUrl(): string | null {
  return process.env.DB_URL ?? process.env.LOG_PG_URL ?? null;
}

function getTableName(): string {
  const table = process.env.LOG_PG_TABLE ?? "request_logs";
  const schema = process.env.LOG_PG_SCHEMA ?? "public";
  return schema === "public" ? table : `${schema}.${table}`;
}

async function ensureReadClient(): Promise<Client | null> {
  const url = getConnectionUrl();
  if (!url) return null;
  if (readClient) return readClient;
  try {
    const c = new Client({ connectionString: url });
    await c.connect();
    readClient = c;
    return c;
  } catch {
    return null;
  }
}

/**
 * Check if the log DB is configured (without connecting).
 */
export function isLogDbConfigured(): boolean {
  return getConnectionUrl() != null;
}

/**
 * Fetch logs with optional filters and pagination.
 */
export async function getLogs(
  filters: LogFilters = {},
  pagination: LogPagination = {}
): Promise<{ rows: RequestLogRow[]; total?: number }> {
  const client = await ensureReadClient();
  if (!client) {
    return { rows: [] };
  }

  const table = getTableName();
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (filters.from) {
    conditions.push(`timestamp >= $${paramIndex}::timestamptz`);
    values.push(filters.from);
    paramIndex++;
  }
  if (filters.to) {
    conditions.push(`timestamp <= $${paramIndex}::timestamptz`);
    values.push(filters.to);
    paramIndex++;
  }
  if (filters.application != null && filters.application !== "") {
    conditions.push(`application ILIKE $${paramIndex}`);
    values.push(`%${filters.application}%`);
    paramIndex++;
  }
  if (filters.method != null && filters.method !== "") {
    conditions.push(`method = $${paramIndex}`);
    values.push(filters.method);
    paramIndex++;
  }
  if (filters.url != null && filters.url !== "") {
    conditions.push(`url ILIKE $${paramIndex}`);
    values.push(`%${filters.url}%`);
    paramIndex++;
  }
  if (filters.statusCode != null && !Number.isNaN(Number(filters.statusCode))) {
    conditions.push(`status_code = $${paramIndex}`);
    values.push(Number(filters.statusCode));
    paramIndex++;
  }
  if (filters.q != null && filters.q !== "") {
    conditions.push(`payload_json::text ILIKE $${paramIndex}`);
    values.push(`%${escapeLike(filters.q)}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(
    Math.max(1, Number(pagination.limit) || DEFAULT_LIMIT),
    MAX_LIMIT
  );
  const offset = Math.max(0, Number(pagination.offset) || 0);

  values.push(limit, offset);
  const limitParam = paramIndex++;
  const offsetParam = paramIndex++;

  const selectSql = `
    SELECT id, timestamp, application, method, url, status_code, duration_ms, payload_json
    FROM ${table}
    ${whereClause}
    ORDER BY timestamp DESC, id DESC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  try {
    const result = await client.query(selectSql, values);
    const rows = (result.rows as RequestLogRow[]) ?? [];
    return { rows };
  } catch {
    return { rows: [] };
  }
}

/**
 * Fetch logs with optional total count (for pagination metadata).
 */
export async function getLogsWithCount(
  filters: LogFilters = {},
  pagination: LogPagination = {},
  includeCount = false
): Promise<{ rows: RequestLogRow[]; total?: number }> {
  const out = await getLogs(filters, pagination);
  if (!includeCount || out.rows.length === 0) {
    return out;
  }

  const client = await ensureReadClient();
  if (!client) return out;

  const table = getTableName();
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (filters.from) {
    conditions.push(`timestamp >= $${paramIndex}::timestamptz`);
    values.push(filters.from);
    paramIndex++;
  }
  if (filters.to) {
    conditions.push(`timestamp <= $${paramIndex}::timestamptz`);
    values.push(filters.to);
    paramIndex++;
  }
  if (filters.application != null && filters.application !== "") {
    conditions.push(`application ILIKE $${paramIndex}`);
    values.push(`%${filters.application}%`);
    paramIndex++;
  }
  if (filters.method != null && filters.method !== "") {
    conditions.push(`method = $${paramIndex}`);
    values.push(filters.method);
    paramIndex++;
  }
  if (filters.url != null && filters.url !== "") {
    conditions.push(`url ILIKE $${paramIndex}`);
    values.push(`%${filters.url}%`);
    paramIndex++;
  }
  if (filters.statusCode != null && !Number.isNaN(Number(filters.statusCode))) {
    conditions.push(`status_code = $${paramIndex}`);
    values.push(Number(filters.statusCode));
    paramIndex++;
  }
  if (filters.q != null && filters.q !== "") {
    conditions.push(`payload_json::text ILIKE $${paramIndex}`);
    values.push(`%${escapeLike(filters.q)}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  try {
    const countResult = await client.query(
      `SELECT COUNT(*)::int AS total FROM ${table} ${whereClause}`,
      values
    );
    const total = countResult.rows[0]?.total ?? 0;
    return { ...out, total };
  } catch {
    return out;
  }
}

/**
 * Fetch logs after a given timestamp (for live stream). Ordered by timestamp ascending so
 * events are in chronological order for the stream.
 */
export async function getLogsAfter(
  afterTimestamp: string,
  limit = LIVE_POLL_LIMIT
): Promise<RequestLogRow[]> {
  const client = await ensureReadClient();
  if (!client) return [];

  const table = getTableName();
  const safeLimit = Math.min(Math.max(1, limit), LIVE_POLL_LIMIT);

  try {
    const result = await client.query(
      `SELECT id, timestamp, application, method, url, status_code, duration_ms, payload_json
       FROM ${table}
       WHERE timestamp > $1::timestamptz
       ORDER BY timestamp ASC, id ASC
       LIMIT $2`,
      [afterTimestamp, safeLimit]
    );
    return (result.rows as RequestLogRow[]) ?? [];
  } catch {
    return [];
  }
}
