import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getRepository,
  isApiError,
  listEngineLogs,
  type EngineLog,
} from "../services/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Autocomplete from "@mui/material/Autocomplete";
import { AppButton } from "../../../components/ui/AppButton";

const DEFAULT_PAGE_SIZE = 20;

type JsonNode = {
  path: string;
  label: string;
  displayValue: string;
  depth: number;
  hasChildren: boolean;
  children?: JsonNode[];
};

function stringifyPrimitive(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function buildJsonTree(
  value: unknown,
  parentPath = "(root)",
  depth = 0,
  label = "(root)"
): JsonNode {
  if (Array.isArray(value)) {
    const children = value.map((item, index) => {
      const nextPath = parentPath === "(root)" ? `[${index}]` : `${parentPath}[${index}]`;
      return buildJsonTree(item, nextPath, depth + 1, `[${index}]`);
    });
    return {
      path: parentPath,
      label,
      displayValue: `[array: ${value.length}]`,
      depth,
      hasChildren: children.length > 0,
      children,
    };
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const children = entries.map(([key, childValue]) => {
      const nextPath = parentPath === "(root)" ? key : `${parentPath}.${key}`;
      return buildJsonTree(childValue, nextPath, depth + 1, key);
    });
    return {
      path: parentPath,
      label,
      displayValue: "{object}",
      depth,
      hasChildren: children.length > 0,
      children,
    };
  }

  return {
    path: parentPath,
    label,
    displayValue: stringifyPrimitive(value),
    depth,
    hasChildren: false,
    children: [],
  };
}

function flattenVisibleNodes(
  node: JsonNode,
  expanded: Set<string>,
  includeRoot = true
): JsonNode[] {
  const rows: JsonNode[] = includeRoot ? [node] : [];
  if (!node.hasChildren || !expanded.has(node.path)) return rows;
  for (const child of node.children ?? []) {
    rows.push(...flattenVisibleNodes(child, expanded, true));
  }
  return rows;
}

function flattenAllNodes(node: JsonNode): JsonNode[] {
  const out: JsonNode[] = [node];
  for (const child of node.children ?? []) {
    out.push(...flattenAllNodes(child));
  }
  return out;
}

function getAncestorPaths(path: string): string[] {
  if (path === "(root)") return ["(root)"];
  const ancestors = ["(root)"];
  let current = path;
  while (current.includes(".") || current.includes("[")) {
    const dotIndex = current.lastIndexOf(".");
    const bracketIndex = current.lastIndexOf("[");
    const splitIndex = Math.max(dotIndex, bracketIndex);
    if (splitIndex <= 0) break;
    current = current.slice(0, splitIndex);
    ancestors.push(current);
  }
  return ancestors;
}

function JsonTreeTable({ title, value }: { title: string; value: unknown }) {
  const root = useMemo(() => buildJsonTree(value), [value]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["(root)"]));
  const [selectedKeyPath, setSelectedKeyPath] = useState<string | null>(null);

  useEffect(() => {
    setExpanded(new Set(["(root)"]));
    setSelectedKeyPath(null);
  }, [root]);

  const rows = useMemo(() => flattenVisibleNodes(root, expanded), [root, expanded]);
  const allNodes = useMemo(() => flattenAllNodes(root), [root]);
  const keyOptions = useMemo(
    () =>
      allNodes
        .filter((n) => n.path !== "(root)")
        .map((n) => ({
          label: n.label,
          path: n.path,
          display: `${n.label} (${n.path})`,
        })),
    [allNodes]
  );

  function toggle(path: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function handleKeySelect(path: string | null) {
    setSelectedKeyPath(path);
    if (!path) return;
    const ancestors = getAncestorPaths(path);
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const ancestor of ancestors) {
        next.add(ancestor);
      }
      return next;
    });
  }

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      <Autocomplete
        size="small"
        options={keyOptions}
        value={keyOptions.find((opt) => opt.path === selectedKeyPath) ?? null}
        onChange={(_, option) => handleKeySelect(option?.path ?? null)}
        getOptionLabel={(option) => option.display}
        renderInput={(params) => <TextField {...params} label="Search key" placeholder="Type key name..." />}
        sx={{ mb: 1.25 }}
        clearOnEscape
      />
      <Paper variant="outlined" sx={{ maxHeight: 420, overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "50%" }}>Key</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.path}
                hover
                selected={selectedKeyPath === row.path}
                sx={selectedKeyPath === row.path ? { bgcolor: "action.selected" } : undefined}
              >
                <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem", pl: 1 + row.depth * 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {row.hasChildren ? (
                      <IconButton
                        size="small"
                        onClick={() => toggle(row.path)}
                        sx={{ width: 18, height: 18, fontSize: "0.75rem" }}
                      >
                        {expanded.has(row.path) ? "▾" : "▸"}
                      </IconButton>
                    ) : (
                      <Box sx={{ width: 18, height: 18 }} />
                    )}
                    <span>{row.label}</span>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {row.displayValue}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export function RepositoryEngineLogsPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const [repoName, setRepoName] = useState<string>("");
  const [logs, setLogs] = useState<EngineLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userIdInput, setUserIdInput] = useState("");
  const [appliedUserId, setAppliedUserId] = useState<string | undefined>(undefined);
  const [skip, setSkip] = useState(0);
  const [selectedLog, setSelectedLog] = useState<EngineLog | null>(null);

  const validationError = useMemo(() => {
    const trimmed = userIdInput.trim();
    if (!trimmed) return null;
    return /^\d+$/.test(trimmed) ? null : "userId must contain digits only";
  }, [userIdInput]);

  const loadLogs = useCallback(async () => {
    if (!repositoryId) return;
    setLoading(true);
    setError(null);

    const [repoRes, logsRes] = await Promise.all([
      getRepository(repositoryId),
      listEngineLogs(repositoryId, {
        userId: appliedUserId,
        skip,
        take: DEFAULT_PAGE_SIZE,
      }),
    ]);

    if (!isApiError(repoRes) && repoRes.data) {
      setRepoName(repoRes.data.name);
    }

    setLoading(false);
    if (isApiError(logsRes)) {
      setError(logsRes.message);
      setLogs([]);
      return;
    }
    setLogs(logsRes.data ?? []);
  }, [repositoryId, appliedUserId, skip]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function applyFilters() {
    if (validationError) return;
    setSkip(0);
    const trimmed = userIdInput.trim();
    setAppliedUserId(trimmed || undefined);
  }

  function resetFilters() {
    setUserIdInput("");
    setAppliedUserId(undefined);
    setSkip(0);
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Engine logs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Repository: <strong>{repoName || repositoryId}</strong>. Search by optional user id.
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
          <TextField
            size="small"
            label="User ID"
            placeholder="e.g. 123"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            error={!!validationError}
            helperText={validationError ?? " "}
          />
          <AppButton variant="primary" size="small" onClick={applyFilters} disabled={!!validationError || loading}>
            Search
          </AppButton>
          <AppButton variant="secondary" size="small" onClick={resetFilters} disabled={loading}>
            Reset
          </AppButton>
          <AppButton variant="secondary" size="small" onClick={loadLogs} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </AppButton>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Created At</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Execution Time</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No logs found for this repository{appliedUserId ? ` and userId ${appliedUserId}` : ""}.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                <TableCell>{log.userId}</TableCell>
                <TableCell>{log.executionTime} ms</TableCell>
                <TableCell>
                  <AppButton
                    variant="secondary"
                    size="small"
                    onClick={() => setSelectedLog(log)}
                  >
                    View details
                  </AppButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        <AppButton
          variant="secondary"
          size="small"
          disabled={skip === 0 || loading}
          onClick={() => setSkip((prev) => Math.max(0, prev - DEFAULT_PAGE_SIZE))}
        >
          Previous
        </AppButton>
        <AppButton
          variant="secondary"
          size="small"
          disabled={logs.length < DEFAULT_PAGE_SIZE || loading}
          onClick={() => setSkip((prev) => prev + DEFAULT_PAGE_SIZE)}
        >
          Next
        </AppButton>
      </Box>

      <Dialog
        open={selectedLog != null}
        onClose={() => setSelectedLog(null)}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { minHeight: "70vh", maxHeight: "90vh" } }}
      >
        <DialogTitle>
          Engine Log Details
          {selectedLog ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Log #{selectedLog.id} | User {selectedLog.userId} | {new Date(selectedLog.createdAt).toLocaleString()} | {selectedLog.executionTime} ms
            </Typography>
          ) : null}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 2 }}>
          {selectedLog && (
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
              <JsonTreeTable title="Request Body (JSONB)" value={selectedLog.requestBody} />
              <JsonTreeTable title="Response Body (JSONB)" value={selectedLog.responseBody} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
