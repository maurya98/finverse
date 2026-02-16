/**
 * Pending changes are stored in localStorage and applied in a single commit.
 * Key: repo-pending-${repositoryId}-${branchName}
 */

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

const STORAGE_PREFIX = "repo-pending-";

function storageKey(repositoryId: string, branchName: string): string {
  return `${STORAGE_PREFIX}${repositoryId}-${branchName}`;
}

export function getPendingChanges(
  repositoryId: string,
  branchName: string
): PendingChange[] {
  try {
    const key = storageKey(repositoryId, branchName);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingChange[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Returns false if localStorage quota was exceeded; changes are not persisted in that case. */
export function setPendingChanges(
  repositoryId: string,
  branchName: string,
  changes: PendingChange[]
): boolean {
  const key = storageKey(repositoryId, branchName);
  try {
    localStorage.setItem(key, JSON.stringify(changes));
    return true;
  } catch (e) {
    if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22)) {
      return false;
    }
    throw e;
  }
}

export function clearPendingChanges(
  repositoryId: string,
  branchName: string
): void {
  const key = storageKey(repositoryId, branchName);
  localStorage.removeItem(key);
}

/** Returns the new pending array; second element is false if localStorage quota was exceeded. */
export function addPendingChange(
  repositoryId: string,
  branchName: string,
  change: PendingChange
): [PendingChange[], boolean] {
  const prev = getPendingChanges(repositoryId, branchName);
  const next = [...prev, change];
  const ok = setPendingChanges(repositoryId, branchName, next);
  return [next, ok];
}

/** Returns false if localStorage quota was exceeded. */
export function replacePendingChanges(
  repositoryId: string,
  branchName: string,
  changes: PendingChange[]
): boolean {
  return setPendingChanges(repositoryId, branchName, changes);
}
