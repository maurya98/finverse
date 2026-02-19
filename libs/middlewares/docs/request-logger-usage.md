# Request logger – how to use and see logs

## 1. Use the middleware (you already have this)

In your app (e.g. ruleenginebe):

```ts
import { requestLoggerMiddleware } from "@finverse/middlewares";

app.use(requestLoggerMiddleware({ appName: "ruleenginebe" }));
```

Optional: `appName` is added to each log so you can tell which service wrote it.

---

## 2. Where logs go

| Destination | When | How to see |
|------------|------|------------|
| **Console (stdout)** | Always | Terminal where you run the app, or your log aggregator. In dev, output is pretty-printed (pino-pretty). |
| **PostgreSQL** | Only when `LOG_PG_URL` or `DB_URL` is set | Query the `request_logs` table (see below). |

---

## 3. Enable Postgres logging (no code changes)

Set one of these in the environment (e.g. `.env` in the app root or in your deployment config):

```bash
# Option A – dedicated log DB URL
LOG_PG_URL=postgresql://user:password@localhost:5432/yourdb

# Option B – reuse your app DB URL (e.g. ruleenginebe already has DB_URL)
DB_URL=postgresql://user:password@localhost:5432/yourdb
```

Optional:

```bash
LOG_PG_TABLE=request_logs   # default
LOG_PG_SCHEMA=public        # default
```

Restart the app. The middleware will create the table if it doesn’t exist and start writing request logs there.

---

## 4. See logs in the console

- **Development:** Run the app (e.g. `pnpm run dev`). Each request will print a log line in the terminal (method, url, statusCode, durationMs, etc.).
- **Production:** Logs are JSON lines on stdout; capture them with your normal logging pipeline (e.g. Docker, Kubernetes, Datadog, CloudWatch).

---

## 5. See logs in Postgres

Connect to your database and query the table:

```sql
-- Last 50 request logs (newest first)
SELECT id, timestamp, application, method, url, status_code, duration_ms, payload_json
FROM request_logs
ORDER BY timestamp DESC
LIMIT 50;

-- By date
SELECT * FROM request_logs
WHERE timestamp::date = CURRENT_DATE
ORDER BY timestamp DESC;

-- By status code (e.g. errors)
SELECT * FROM request_logs
WHERE status_code >= 400
ORDER BY timestamp DESC
LIMIT 100;

-- Full payload (JSONB)
SELECT id, timestamp, method, url, payload_json->'responseBody' AS response_body
FROM request_logs
WHERE id = 123;
```

Table columns:

| Column         | Type        | Description                    |
|----------------|-------------|--------------------------------|
| `id`           | BIGSERIAL   | Auto-increment primary key     |
| `timestamp`    | TIMESTAMPTZ | Request finish time           |
| `application`  | TEXT        | From `appName` in middleware  |
| `method`       | TEXT        | GET, POST, etc.               |
| `url`          | TEXT        | Request path (and query)      |
| `status_code`  | INT         | HTTP status                   |
| `duration_ms`  | INT         | Response time in ms            |
| `payload_json` | JSONB       | Full log (headers, body, etc.)|

---

## 6. Quick checklist

- [ ] Middleware is mounted: `app.use(requestLoggerMiddleware({ appName: "..." }))`
- [ ] To see logs in **console**: just run the app; logs go to stdout
- [ ] To see logs in **Postgres**: set `LOG_PG_URL` or `DB_URL`, restart, then query `request_logs`
