import { Router, Request, Response } from "express";
import {
  isLogDbConfigured,
  getLogsAfter,
  getLogsWithCount,
  type LogFilters,
  type LogPagination,
} from "./pg-reader";

const DEFAULT_POLL_INTERVAL_MS = 2000;
const MAX_POLL_INTERVAL_MS = 30_000;

export function requestLoggerRoutes(): Router {
  const router = Router();

  router.get("/live", (req: Request, res: Response) => {
    if (!isLogDbConfigured()) {
      res.status(503).json({
        error: "Log database not configured",
        hint: "Set LOG_PG_URL or DB_URL to enable request log storage and APIs.",
      });
      return;
    }

    const pollIntervalMs = Math.min(
      Math.max(1000, Number(req.query.pollInterval) || DEFAULT_POLL_INTERVAL_MS),
      MAX_POLL_INTERVAL_MS
    );
    const sinceParam = typeof req.query.since === "string" ? req.query.since : undefined;
    let lastTimestamp = sinceParam && !Number.isNaN(Date.parse(sinceParam))
      ? sinceParam
      : new Date(0).toISOString();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const stop = () => {
      closed = true;
      if (timeoutId != null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const onClose = () => {
      stop();
    };
    res.on("close", onClose);
    res.on("abort", onClose);

    const poll = async () => {
      if (closed || res.writableEnded) return;
      try {
        const rows = await getLogsAfter(lastTimestamp);
        for (const row of rows) {
          if (closed || res.writableEnded) return;
          lastTimestamp = row.timestamp;
          const data = JSON.stringify({
            id: row.id,
            timestamp: row.timestamp,
            application: row.application,
            method: row.method,
            url: row.url,
            status_code: row.status_code,
            duration_ms: row.duration_ms,
            payload_json: row.payload_json,
          });
          res.write(`data: ${data}\n\n`);
          if (typeof res.flush === "function") res.flush();
        }
      } catch {
        if (!closed && !res.writableEnded) {
          res.write(`event: error\ndata: {"error":"poll failed"}\n\n`);
        }
      }
      if (!closed && !res.writableEnded) {
        timeoutId = setTimeout(poll, pollIntervalMs);
      }
    };

    poll();
  });

  router.get("/", async (req: Request, res: Response) => {
    if (!isLogDbConfigured()) {
      res.status(503).json({
        error: "Log database not configured",
        hint: "Set LOG_PG_URL or DB_URL to enable request log storage and APIs.",
      });
      return;
    }

    const filters: LogFilters = {
      from: typeof req.query.from === "string" ? req.query.from : undefined,
      to: typeof req.query.to === "string" ? req.query.to : undefined,
      application: typeof req.query.application === "string" ? req.query.application : undefined,
      method: typeof req.query.method === "string" ? req.query.method : undefined,
      url: typeof req.query.url === "string" ? req.query.url : undefined,
      statusCode:
        typeof req.query.statusCode === "string" && req.query.statusCode !== ""
          ? Number(req.query.statusCode)
          : undefined,
      q: typeof req.query.q === "string" ? req.query.q : undefined,
    };

    const pagination: LogPagination = {
      limit:
        typeof req.query.limit === "string" && req.query.limit !== ""
          ? Number(req.query.limit)
          : undefined,
      offset:
        typeof req.query.offset === "string" && req.query.offset !== ""
          ? Number(req.query.offset)
          : undefined,
    };

    const includeCount = req.query.count === "true" || req.query.count === "1";

    try {
      const { rows, total } = await getLogsWithCount(filters, pagination, includeCount);
      const data = rows.map((row) => ({
        id: row.id,
        timestamp: row.timestamp,
        application: row.application,
        method: row.method,
        url: row.url,
        status_code: row.status_code,
        duration_ms: row.duration_ms,
        payload_json: row.payload_json,
      }));
      const payload: { data: typeof data; total?: number } = { data };
      if (includeCount && total !== undefined) payload.total = total;
      res.json(payload);
    } catch (err) {
      res.status(500).json({
        error: "Failed to fetch logs",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  return router;
}
