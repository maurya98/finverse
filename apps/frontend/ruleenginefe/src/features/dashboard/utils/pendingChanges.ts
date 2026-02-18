/**
 * Pending file-system operations for a repo/branch.
 * Stored in localStorage under key: repo-pending-${repositoryId}-${branchName}
 *
 * Operations mirror a real file system:
 * - add: new file or folder
 * - edit: change file content
 * - delete: remove file or folder (path stored in deletedPaths; no op in pending array)
 * - move: move/rename file or folder (rename = move to same parent with new name)
 *
 * We always replace the full stored state on write; never append.
 */

// ---- Path utilities (normalized: no trailing slash, single segment names) ----

export function pathSegments(path: string): string[] {
  return path ? path.replace(/\/+/g, "/").split("/").filter(Boolean) : [];
}

export function pathParent(path: string): string {
  const segs = pathSegments(path);
  segs.pop();
  return segs.join("/");
}

export function pathBaseName(path: string): string {
  const segs = pathSegments(path);
  return segs[segs.length - 1] ?? "";
}

/** Normalize path: no leading/trailing slashes, no repeated slashes. */
export function normalizePath(path: string): string {
  return pathSegments(path).join("/");
}

/** True if `child` is exactly `path` or under `path/` (path must be folder for "under"). */
export function isUnderPath(child: string, path: string, pathIsFolder: boolean): boolean {
  if (child === path) return true;
  if (!pathIsFolder) return false;
  const prefix = path + "/";
  return child.startsWith(prefix);
}

/** True if path is the same or under prefix (prefix treated as folder). */
export function isSameOrUnder(path: string, prefix: string): boolean {
  if (path === prefix) return true;
  return path.startsWith(prefix + "/");
}

// ---- Pending change types ----

export type PendingAddFile = {
  op: "add";
  path: string;
  type: "file";
  content: unknown;
};

export type PendingAddFolder = {
  op: "add";
  path: string;
  type: "folder";
};

export type PendingEdit = {
  op: "edit";
  path: string;
  content: unknown;
};

export type PendingDelete = {
  op: "delete";
  path: string;
};

export type PendingMove = {
  op: "move";
  path: string;
  newPath: string;
};

export type PendingChange =
  | PendingAddFile
  | PendingAddFolder
  | PendingEdit
  | PendingDelete
  | PendingMove;

// ---- Storage ----

export const PENDING_STORAGE_PREFIX = "repo-pending-";

const STORAGE_PREFIX = PENDING_STORAGE_PREFIX;

function storageKey(repositoryId: string, branchName: string): string {
  return `${STORAGE_PREFIX}${repositoryId}-${branchName}`;
}

export function getPendingStorageKey(repositoryId: string, branchName: string): string {
  return storageKey(repositoryId, branchName);
}

/** Stored value: legacy array or v1 object with pending + deletedPaths. */
type StoredPending = PendingChange[] | { v: 1; p: PendingChange[]; d: string[] };

export function parseStored(raw: string): { pending: PendingChange[]; deletedPaths: string[] } {
  try {
    const parsed = JSON.parse(raw) as StoredPending;
    if (Array.isArray(parsed)) {
      const pending = parsed.filter((c) => c.op !== "delete") as PendingChange[];
      const deletedPaths = parsed
        .filter((c): c is PendingDelete => c.op === "delete")
        .map((c) => normalizePath(c.path));
      return { pending: pending.map(normalizePendingPath), deletedPaths };
    }
    if (parsed && typeof parsed === "object" && parsed.v === 1 && Array.isArray(parsed.p)) {
      return {
        pending: parsed.p.map(normalizePendingPath),
        deletedPaths: Array.isArray(parsed.d) ? parsed.d.map(normalizePath) : [],
      };
    }
  } catch {
    // fallthrough
  }
  return { pending: [], deletedPaths: [] };
}

function normalizePendingPath(c: PendingChange): PendingChange {
  if (c.op === "add") return { ...c, path: normalizePath(c.path) };
  if (c.op === "edit") return { ...c, path: normalizePath(c.path) };
  if (c.op === "delete") return { ...c, path: normalizePath(c.path) };
  if (c.op === "move") return { ...c, path: normalizePath(c.path), newPath: normalizePath(c.newPath) };
  return c;
}

export function getPendingChanges(repositoryId: string, branchName: string): PendingChange[] {
  return getPendingState(repositoryId, branchName).pending;
}

export function getDeletedPaths(repositoryId: string, branchName: string): string[] {
  return getPendingState(repositoryId, branchName).deletedPaths;
}

export function getPendingState(
  repositoryId: string,
  branchName: string
): { pending: PendingChange[]; deletedPaths: string[] } {
  try {
    const key = storageKey(repositoryId, branchName);
    const raw = localStorage.getItem(key);
    if (!raw) return { pending: [], deletedPaths: [] };
    return parseStored(raw);
  } catch {
    return { pending: [], deletedPaths: [] };
  }
}

/** Returns false if localStorage quota exceeded. */
export function setPendingChanges(
  repositoryId: string,
  branchName: string,
  changes: PendingChange[]
): boolean {
  const { deletedPaths } = getPendingState(repositoryId, branchName);
  return setPendingState(repositoryId, branchName, { pending: changes, deletedPaths });
}

export function setPendingState(
  repositoryId: string,
  branchName: string,
  state: { pending: PendingChange[]; deletedPaths: string[] }
): boolean {
  const key = storageKey(repositoryId, branchName);
  try {
    const payload = {
      v: 1,
      p: state.pending.map(normalizePendingPath),
      d: state.deletedPaths.map(normalizePath),
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (e) {
    if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22)) {
      return false;
    }
    throw e;
  }
}

export function clearPendingChanges(repositoryId: string, branchName: string): void {
  localStorage.removeItem(storageKey(repositoryId, branchName));
}

// ---- Deleted paths ----

/** Add path to deletedPaths; remove any existing entries that are under this path (when path is a folder). */
export function addToDeletedPaths(
  deletedPaths: string[],
  path: string,
  isFolder: boolean
): string[] {
  const normalized = normalizePath(path);
  const under = (p: string) =>
    p !== normalized && isFolder && isSameOrUnder(p, normalized);
  return [normalized, ...deletedPaths.filter((p) => !under(normalizePath(p)))];
}

// ---- Mutations ----

/** Append one change and persist. Returns [newPending, success]. */
export function addPendingChange(
  repositoryId: string,
  branchName: string,
  change: PendingChange
): [PendingChange[], boolean] {
  const prev = getPendingChanges(repositoryId, branchName);
  const normalized = normalizePendingPath(change);
  const next = [...prev, normalized];
  const ok = setPendingChanges(repositoryId, branchName, next);
  return [next, ok];
}

export function replacePendingChanges(
  repositoryId: string,
  branchName: string,
  changes: PendingChange[]
): boolean {
  return setPendingChanges(repositoryId, branchName, changes);
}

/**
 * Remove a path (and its children if folder) from the pending array only.
 * Does not add a delete op; use addToDeletedPaths for deletedPaths.
 */
export function removePathFromPending(
  pending: PendingChange[],
  path: string,
  isFolder: boolean
): PendingChange[] {
  return filterPendingByPath(pending, path, isFolder);
}

/**
 * New pending array with any changes that touch the given path (or paths under it for a folder) removed.
 */
export function filterPendingByPath(
  pending: PendingChange[],
  path: string,
  isFolder: boolean
): PendingChange[] {
  const norm = normalizePath(path);
  const touches = (p: string) => isUnderPath(p, norm, true) || (p === norm && !isFolder);
  const touchesNew = (p: string) => isUnderPath(p, norm, true);

  return pending.filter((c) => {
    if (c.op === "add") return !touches(c.path);
    if (c.op === "edit") return !touches(c.path);
    if (c.op === "move") return !touches(c.path) && !touchesNew(c.newPath);
    if (c.op === "delete") return !touches(c.path);
    return true;
  });
}

/**
 * Update all paths in pending when a folder is renamed (oldPath -> newPath).
 * Paths under oldPath are rewritten to be under newPath.
 */
export function updatePathsForFolderRename(
  pending: PendingChange[],
  oldFolderPath: string,
  newFolderPath: string
): PendingChange[] {
  const oldP = normalizePath(oldFolderPath);
  const newP = normalizePath(newFolderPath);
  const prefix = oldP + "/";

  const replace = (p: string): string => {
    if (p === oldP) return newP;
    if (p.startsWith(prefix)) return newP + p.slice(oldP.length);
    return p;
  };

  return pending.map((c) => {
    if (c.op === "add") return { ...c, path: replace(c.path) };
    if (c.op === "edit") return { ...c, path: replace(c.path) };
    if (c.op === "move") return { ...c, path: replace(c.path), newPath: replace(c.newPath) };
    if (c.op === "delete") return { ...c, path: replace(c.path) };
    return c;
  });
}

export function updateDeletedPathsForFolderRename(
  deletedPaths: string[],
  oldFolderPath: string,
  newFolderPath: string
): string[] {
  const oldP = normalizePath(oldFolderPath);
  const newP = normalizePath(newFolderPath);
  const prefix = oldP + "/";

  return deletedPaths.map((p) => {
    const norm = normalizePath(p);
    if (norm === oldP) return newP;
    if (norm.startsWith(prefix)) return newP + norm.slice(oldP.length);
    return norm;
  });
}

// ---- Cross-key updates ----

export function setPendingStateByKey(
  key: string,
  state: { pending: PendingChange[]; deletedPaths: string[] }
): boolean {
  try {
    const payload = {
      v: 1,
      p: state.pending.map(normalizePendingPath),
      d: state.deletedPaths.map(normalizePath),
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (e) {
    if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22)) {
      return false;
    }
    throw e;
  }
}

/**
 * Remove path (and children if folder) from pending and add to deletedPaths for the current key,
 * then sync all other repo-pending-* keys: remove touching changes and add path to their deletedPaths.
 */
export function removePathFromAllPendingKeys(
  path: string,
  isFolder: boolean,
  currentKey: string,
  nextPending: PendingChange[],
  nextDeletedPaths: string[]
): void {
  setPendingStateByKey(currentKey, { pending: nextPending, deletedPaths: nextDeletedPaths });

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(PENDING_STORAGE_PREFIX) || key === currentKey) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const { pending, deletedPaths } = parseStored(raw);
      const filtered = filterPendingByPath(pending, path, isFolder);
      const newDeleted = addToDeletedPaths(deletedPaths, path, isFolder);
      if (
        filtered.length !== pending.length ||
        newDeleted.length !== deletedPaths.length
      ) {
        setPendingStateByKey(key, { pending: filtered, deletedPaths: newDeleted });
      }
    } catch {
      // skip invalid keys
    }
  }
}

export function setPendingChangesByKey(key: string, changes: PendingChange[]): boolean {
  try {
    const raw = localStorage.getItem(key);
    const { deletedPaths } = raw ? parseStored(raw) : { deletedPaths: [] as string[] };
    return setPendingStateByKey(key, { pending: changes, deletedPaths });
  } catch (e) {
    if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22)) {
      return false;
    }
    throw e;
  }
}

// ---- Helpers for UI / tree ----

/** Resolve a display path to a unique name under parentPath if a sibling with the same name exists. */
export function resolveUniqueName(
  existingPaths: string[],
  parentPath: string,
  baseName: string
): string {
  const prefix = parentPath ? parentPath + "/" : "";
  const candidate = prefix + baseName;
  const names = new Set(
    existingPaths
      .filter((p) => isSameOrUnder(p, parentPath) && pathParent(p) === parentPath)
      .map(pathBaseName)
  );
  if (!names.has(baseName)) return candidate;
  const ext = baseName.includes(".") ? baseName.slice(baseName.lastIndexOf(".")) : "";
  const nameWithoutExt = ext ? baseName.slice(0, -ext.length) : baseName;
  let n = 1;
  while (names.has(nameWithoutExt + " (" + n + ")" + ext)) n++;
  return prefix + nameWithoutExt + " (" + n + ")" + ext;
}
