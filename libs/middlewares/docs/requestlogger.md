# Request Logger — Live and Search APIs

The request logger middleware writes HTTP request/response logs to Postgres. This document describes the **log viewing APIs**: a live log stream and a search/filter endpoint.

## Prerequisites

- **Database**: Postgres must be configured for the request logger. Set one of:
  - `LOG_PG_URL` — Postgres connection string for logs
  - `DB_URL` — Fallback connection string (shared with app DB if needed)
- **Table**: The middleware creates `request_logs` (or the table/schema from `LOG_PG_TABLE` / `LOG_PG_SCHEMA`) on first write.

Optional env (same as the writer):

| Variable        | Default       | Description              |
|----------------|---------------|--------------------------|
| `LOG_PG_TABLE` | `request_logs`| Table name               |
| `LOG_PG_SCHEMA`| `public`      | Schema (non‑public: `schema.table`) |

## Setup

1. Use the request logger middleware so logs are written to Postgres (e.g. with `appName`).
2. Mount the log routes on your Express app (e.g. under `/api/logs`).

```ts
import { requestLoggerMiddleware, requestLoggerRoutes } from "@finverse/middlewares";

app.use(requestLoggerMiddleware({ appName: "my-service" }));
app.use("/api/logs", requestLoggerRoutes());
```

If `LOG_PG_URL` or `DB_URL` is not set, the log APIs respond with **503** and do not connect to the DB.

---

## Live logs — Server-Sent Events

Stream new logs as they are written to the database.

**Endpoint:** `GET /api/logs/live` (or `GET /live` relative to where you mounted the router)

**Response:** `Content-Type: text/event-stream`. Each event is a single line of JSON in the form `data: {...}\n\n`.

### Query parameters

| Parameter      | Type   | Default | Description                                      |
|----------------|--------|---------|--------------------------------------------------|
| `pollInterval` | number | 2000    | Polling interval in ms (min 1000, max 30000).   |
| `since`       | string | epoch  | ISO 8601 timestamp; only logs after this time. |

### Event payload

Each `data` payload is a log row:

```json
{
  "id": 123,
  "timestamp": "2025-02-20T10:00:00.000Z",
  "application": "my-service",
  "method": "GET",
  "url": "/api/health",
  "status_code": 200,
  "duration_ms": 5,
  "payload_json": { "method": "GET", "url": "/api/health", "headers": {}, ... }
}
```

On poll errors the server may send an `event: error` message; the stream continues until the client disconnects.

### Example (browser)

```js
const es = new EventSource("/api/logs/live?pollInterval=2000");
es.onmessage = (e) => console.log(JSON.parse(e.data));
```

### Example (curl)

```bash
curl -N "http://localhost:3000/api/logs/live?since=2025-02-20T00:00:00Z"
```

---

## Search and filter logs

Query stored logs with optional filters and pagination.

**Endpoint:** `GET /api/logs` (or `GET /` relative to where you mounted the router)

**Response:** JSON: `{ "data": [ ... ], "total"?: number }`.

### Query parameters

All parameters are optional. Combine them to narrow results.

| Parameter      | Type   | Description                                                |
|----------------|--------|------------------------------------------------------------|
| `from`         | string | Start of time range (inclusive), ISO 8601.                |
| `to`           | string | End of time range (inclusive), ISO 8601.                   |
| `application`  | string | Substring match on `application` (case‑insensitive).      |
| `method`       | string | Exact HTTP method (e.g. `GET`, `POST`).                   |
| `url`          | string | Substring match on `url` (case‑insensitive).              |
| `statusCode`   | number | Exact response status code (e.g. 200, 404).               |
| `q`            | string | Substring match inside `payload_json` (case‑insensitive).  |
| `limit`        | number | Page size (default 50, max 200).                          |
| `offset`       | number | Pagination offset (default 0).                            |
| `count`        | flag   | If `true` or `1`, include total matching count in response.|

### Response shape

- **`data`**: Array of log objects. Each has:
  - `id`, `timestamp`, `application`, `method`, `url`, `status_code`, `duration_ms`, `payload_json`
- **`total`**: Present only when `count=true` (or `count=1`), total number of rows matching the filters (ignoring `limit`/`offset`).

### Example requests

```bash
# Last 50 logs (default)
curl "http://localhost:3000/api/logs"

# Logs in date range with total count
curl "http://localhost:3000/api/logs?from=2025-02-20T00:00:00Z&to=2025-02-20T23:59:59Z&count=true"

# Filter by application and method
curl "http://localhost:3000/api/logs?application=ruleenginebe&method=POST"

# Search for a string in the full payload (e.g. body, headers, URL)
curl "http://localhost:3000/api/logs?q=error&limit=20"

# By status code and URL substring
curl "http://localhost:3000/api/logs?statusCode=500&url=/api"
```

---

## Security

- Logs can contain sensitive or personal data (even with the middleware’s masking). **Protect these endpoints** (e.g. auth middleware, IP allowlist, or enable only in non‑production).
- Mount the router only where appropriate (e.g. `/api/logs` behind your auth), and do not expose it publicly without access control.

---

## Errors

| Status | When |
|--------|------|
| **503** | Log DB not configured (`LOG_PG_URL` / `DB_URL` unset). Body includes `error` and `hint`. |
| **500** | Search failed (e.g. DB error). Body includes `error` and `message`. |
