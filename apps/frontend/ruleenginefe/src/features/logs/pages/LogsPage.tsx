import { useState, useEffect, useCallback, useRef } from "react";
import {
  searchLogs,
  getLiveLogsUrl,
  type RequestLogEntry,
  type LogSearchFilters,
  type LogsApiError,
} from "../services/logsApi";
import Skeleton from "@mui/material/Skeleton";
import "./LogsPage.css";

type ViewMode = "live" | "search";

function isLogsApiError(r: { data?: RequestLogEntry[]; error?: string }): r is LogsApiError {
  return "error" in r && typeof (r as LogsApiError).error === "string";
}

function LogRow({ log: row, onSelect }: { log: RequestLogEntry; onSelect: () => void }) {
  const statusClass =
    row.status_code >= 500 ? "status-5xx" : row.status_code >= 400 ? "status-4xx" : "status-2xx";
  return (
    <tr className="logs-table-row" onClick={onSelect}>
      <td className="logs-cell logs-cell-time">{new Date(row.timestamp).toLocaleString()}</td>
      <td className="logs-cell logs-cell-app">{row.application ?? "—"}</td>
      <td className={`logs-cell logs-cell-method ${statusClass}`}>{row.method}</td>
      <td className="logs-cell logs-cell-url" title={row.url}>
        {row.url}
      </td>
      <td className={`logs-cell logs-cell-status ${statusClass}`}>{row.status_code}</td>
      <td className="logs-cell logs-cell-duration">{row.duration_ms} ms</td>
    </tr>
  );
}

export function LogsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("search");
  const [liveLogs, setLiveLogs] = useState<RequestLogEntry[]>([]);
  const [liveConnected, setLiveConnected] = useState(false);
  const [searchResult, setSearchResult] = useState<RequestLogEntry[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogSearchFilters>({
    limit: 50,
    offset: 0,
    count: true,
  });
  const [selectedLog, setSelectedLog] = useState<RequestLogEntry | null>(null);
  const liveRef = useRef<EventSource | null>(null);
  const liveContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchSearch = useCallback(async () => {
    setSearchLoading(true);
    setSearchError(null);
    const res = await searchLogs(filters);
    setSearchLoading(false);
    if (isLogsApiError(res)) {
      setSearchError(res.error + (res.message ? `: ${res.message}` : ""));
      return;
    }
    setSearchResult(res.data);
    setTotal(res.total ?? null);
  }, [filters]);

  useEffect(() => {
    if (viewMode === "search") {
      fetchSearch();
    }
  }, [viewMode, fetchSearch]);

  useEffect(() => {
    if (viewMode !== "live") return;
    setLiveConnected(true);
    const url = getLiveLogsUrl({ pollInterval: 2000 });
    const es = new EventSource(url);
    liveRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as RequestLogEntry;
        setLiveLogs((prev) => [data, ...prev].slice(0, 500));
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setLiveConnected(false);
    };

    return () => {
      es.close();
      liveRef.current = null;
    };
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "live" && liveContainerRef.current) {
      liveContainerRef.current.scrollTop = 0;
    }
  }, [liveLogs, viewMode]);

  const setFilter = (key: keyof LogSearchFilters, value: string | number | boolean | undefined) => {
    setFilters((f) => {
      const next = { ...f, [key]: value === "" || value === undefined ? undefined : value };
      if (key === "limit" || key === "offset") return next;
      return { ...next, offset: 0 };
    });
  };

  const logs = viewMode === "live" ? liveLogs : searchResult;

  return (
    <div className="logs-page">
      <div className="logs-tabs">
        <button
          type="button"
          className={viewMode === "search" ? "active" : ""}
          onClick={() => setViewMode("search")}
        >
          Search & filter
        </button>
        <button
          type="button"
          className={viewMode === "live" ? "active" : ""}
          onClick={() => setViewMode("live")}
        >
          Live {viewMode === "live" && (liveConnected ? "●" : "○")}
        </button>
      </div>

      {viewMode === "search" && (
        <div className="logs-filters">
          <div className="logs-filters-row">
            <label>
              From (ISO)
              <input
                type="text"
                placeholder="e.g. 2025-02-20T00:00:00Z"
                value={filters.from ?? ""}
                onChange={(e) => setFilter("from", e.target.value)}
              />
            </label>
            <label>
              To (ISO)
              <input
                type="text"
                placeholder="e.g. 2025-02-20T23:59:59Z"
                value={filters.to ?? ""}
                onChange={(e) => setFilter("to", e.target.value)}
              />
            </label>
            <label>
              Application
              <input
                type="text"
                placeholder="e.g. ruleenginebe"
                value={filters.application ?? ""}
                onChange={(e) => setFilter("application", e.target.value)}
              />
            </label>
            <label>
              Method
              <select
                value={filters.method ?? ""}
                onChange={(e) => setFilter("method", e.target.value || undefined)}
              >
                <option value="">Any</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </label>
            <label>
              Status
              <input
                type="number"
                placeholder="e.g. 200"
                value={filters.statusCode ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilter("statusCode", v === "" ? undefined : Number(v));
                }}
              />
            </label>
            <label>
              URL contains
              <input
                type="text"
                placeholder="e.g. /api"
                value={filters.url ?? ""}
                onChange={(e) => setFilter("url", e.target.value)}
              />
            </label>
            <label>
              Payload search (q)
              <input
                type="text"
                placeholder="Search in payload"
                value={filters.q ?? ""}
                onChange={(e) => setFilter("q", e.target.value)}
              />
            </label>
          </div>
          <div className="logs-filters-actions">
            <label>
              Limit
              <select
                className="logs-select-limit"
                value={filters.limit ?? 50}
                onChange={(e) => setFilter("limit", Number(e.target.value))}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </label>
            <button type="button" onClick={() => fetchSearch()} disabled={searchLoading}>
              {searchLoading ? "Loading…" : "Search"}
            </button>
            {total != null && <span className="logs-total">Total: {total}</span>}
          </div>
        </div>
      )}

      {viewMode === "live" && (
        <div className="logs-live-bar">
          <span className={liveConnected ? "logs-live-dot connected" : "logs-live-dot"}>
            {liveConnected ? "●" : "○"} {liveConnected ? "Live" : "Reconnecting…"}
          </span>
          <span className="logs-live-hint">Last 500 entries, newest first</span>
        </div>
      )}

      {searchError && <div className="logs-error" role="alert">{searchError}</div>}

      <div className="logs-table-wrap" ref={liveContainerRef}>
        <table className="logs-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Application</th>
              <th>Method</th>
              <th>URL</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {viewMode === "search" && searchLoading && (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} style={{ padding: 8 }}>
                      <Skeleton variant="text" width="100%" height={24} />
                    </td>
                  </tr>
                ))}
              </>
            )}
            {!searchLoading && logs.length === 0 && (
              <tr>
                <td colSpan={6} className="logs-empty">
                  {viewMode === "live" ? "Waiting for new logs…" : "No logs match the filters."}
                </td>
              </tr>
            )}
            {!searchLoading && logs.map((log) => (
              <LogRow key={`${log.id}-${log.timestamp}`} log={log} onSelect={() => setSelectedLog(log)} />
            ))}
          </tbody>
        </table>
      </div>

      {viewMode === "search" && (filters.limit ?? 0) > 0 && total != null && total > (filters.limit ?? 50) && (
        <div className="logs-pagination">
          <button
            type="button"
            disabled={(filters.offset ?? 0) <= 0}
            onClick={() => setFilter("offset", Math.max(0, (filters.offset ?? 0) - (filters.limit ?? 50)))}
          >
            Previous
          </button>
          <span>
            {(filters.offset ?? 0) + 1} – {Math.min((filters.offset ?? 0) + (filters.limit ?? 50), total)} of {total}
          </span>
          <button
            type="button"
            disabled={(filters.offset ?? 0) + (filters.limit ?? 50) >= total}
            onClick={() => setFilter("offset", (filters.offset ?? 0) + (filters.limit ?? 50))}
          >
            Next
          </button>
        </div>
      )}

      {selectedLog && (
        <div
          className="logs-modal-backdrop"
          onClick={() => setSelectedLog(null)}
          role="presentation"
        >
          <div className="logs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logs-modal-header">
              <h3>Log #{selectedLog.id}</h3>
              <button type="button" className="logs-modal-close" onClick={() => setSelectedLog(null)}>
                ×
              </button>
            </div>
            <div className="logs-modal-body">
              <p className="logs-modal-meta">
                {selectedLog.timestamp} · {selectedLog.method} {selectedLog.url} · {selectedLog.status_code} · {selectedLog.duration_ms} ms
              </p>
              <pre className="logs-modal-payload">
                {JSON.stringify(selectedLog.payload_json, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
