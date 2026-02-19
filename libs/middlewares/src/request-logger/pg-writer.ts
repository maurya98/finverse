/**
 * In-process Postgres writer for request logs. Uses env config only; no app-level setup.
 * Set LOG_PG_URL or DB_URL to enable. Runs in main thread (no worker).
 */

import { Client } from "pg";
import "dotenv/config";
const connectionString = process.env.DB_URL;
if (!connectionString) {
  throw new Error("DB_URL environment variable is not set");
}
const QUEUE_MAX = 10_000;
const BATCH_SIZE = 50;
const FLUSH_MS = 2_000;

export interface RequestLogPayload {
  application?: string;
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  [key: string]: unknown;
}

const queue: RequestLogPayload[] = [];
let client: Client | null = null;
let consumerScheduled = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function getConnectionUrl(): string | null {
  return connectionString ?? null;
}

function getTableName(): string {
  const table = process.env.LOG_PG_TABLE ?? "request_logs";
  const schema = process.env.LOG_PG_SCHEMA ?? "public";
  return schema === "public" ? table : `${schema}.${table}`;
}

async function ensureClient(): Promise<Client | null> {
  const url = getConnectionUrl();
  if (!url) return null;
  if (client) return client;
  try {
    const c = new Client({ connectionString: url });
    await c.connect();
    client = c;
    await ensureTable(c);
    return c;
  } catch (err) {
    if (typeof process !== "undefined" && process.emit) {
      process.emit("warning", err as Error);
    }
    return null;
  }
}

async function ensureTable(c: Client): Promise<void> {
  const table = getTableName();
  const schema = process.env.LOG_PG_SCHEMA ?? "public";
  if (schema !== "public") {
    await c.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`).catch(() => {});
  }
  await c.query(`
    CREATE TABLE IF NOT EXISTS ${table} (
      id BIGSERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL,
      application TEXT,
      method TEXT NOT NULL,
      url TEXT NOT NULL,
      status_code INT NOT NULL,
      duration_ms INT NOT NULL,
      payload_json JSONB NOT NULL
    )
  `).catch(() => {});
}

async function drain(): Promise<void> {
  const c = await ensureClient();
  if (!c || queue.length === 0) return;
  const table = getTableName();
  const batch: RequestLogPayload[] = [];
  while (batch.length < BATCH_SIZE && queue.length > 0) {
    const item = queue.shift();
    if (item) batch.push(item);
  }
  if (batch.length === 0) return;
  try {
    const values = batch.flatMap((row) => [
      row.timestamp,
      row.application ?? null,
      row.method,
      row.url,
      row.statusCode,
      row.durationMs,
      JSON.stringify(row),
    ]);
    const placeholders = batch
      .map((_, i) => {
        const j = i * 7;
        return `($${j + 1}::timestamptz, $${j + 2}, $${j + 3}, $${j + 4}, $${j + 5}, $${j + 6}, $${j + 7}::jsonb)`;
      })
      .join(", ");
    await c.query(
      `INSERT INTO ${table} (timestamp, application, method, url, status_code, duration_ms, payload_json) VALUES ${placeholders}`,
      values
    );
  } catch (err) {
    if (typeof process !== "undefined" && process.emit) {
      process.emit("warning", err as Error);
    }
    batch.forEach((item) => queue.unshift(item));
  }
  if (queue.length > 0) scheduleDrain();
}

function scheduleDrain(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    drain().catch(() => {});
  }, FLUSH_MS);
}

function startConsumer(): void {
  if (consumerScheduled) return;
  consumerScheduled = true;
  drain().catch(() => {});
}

/**
 * Push a request log payload to the Postgres queue. No-op if LOG_PG_URL/DB_URL is not set.
 * Consumer runs in main thread and batch-inserts; does not block the request.
 */
export function pushLogToPg(payload: RequestLogPayload): void {
  console.log("pushLogToPg", JSON.stringify(getConnectionUrl(), null, 2));
  if (!getConnectionUrl()) return;
  if (queue.length >= QUEUE_MAX) queue.shift();
  queue.push(payload);
  startConsumer();
  scheduleDrain();
}
