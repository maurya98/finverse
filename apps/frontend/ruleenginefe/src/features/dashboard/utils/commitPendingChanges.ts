import type { FileTreeNode } from "../hooks/useBranchTree";
import type { PendingChange } from "./pendingChanges";
import {
  createBlob,
  createTree,
  createCommit,
  getBranchByName,
  updateBranchHead,
  isApiError,
} from "../services/api";

type PathEntry = { type: "file" | "folder"; blobId?: string | null; content?: unknown };

function pathSegments(path: string): string[] {
  return path ? path.split("/").filter(Boolean) : [];
}

function pathParent(path: string): string {
  const segs = pathSegments(path);
  segs.pop();
  return segs.join("/");
}

function pathBaseName(path: string): string {
  const segs = pathSegments(path);
  return segs[segs.length - 1] ?? "";
}

/** Build path -> entry from server tree. */
function serverTreeToMap(nodes: FileTreeNode[], parentPath = ""): Map<string, PathEntry> {
  const map = new Map<string, PathEntry>();
  for (const n of nodes) {
    const path = parentPath ? `${parentPath}/${n.name}` : n.name;
    map.set(path, {
      type: n.type,
      blobId: n.type === "file" ? n.blobId ?? null : undefined,
    });
    if (n.children?.length) {
      for (const [p, e] of serverTreeToMap(n.children, path)) {
        map.set(p, e);
      }
    }
  }
  return map;
}

/** Apply pending changes and deletedPaths to path map. Produces path -> { type, blobId?, content? }. */
function applyPendingToMap(
  map: Map<string, PathEntry>,
  pending: PendingChange[],
  deletedPaths: string[] = []
): Map<string, PathEntry> {
  const result = new Map(map);

  for (const delPath of deletedPaths) {
    for (const path of Array.from(result.keys())) {
      if (path === delPath || path.startsWith(delPath + "/")) result.delete(path);
    }
  }
  for (const c of pending) {
    if (c.op === "delete") {
      for (const path of Array.from(result.keys())) {
        if (path === c.path || path.startsWith(c.path + "/")) result.delete(path);
      }
    }
  }

  for (const c of pending) {
    if (c.op === "move") {
      const entry = result.get(c.path);
      if (!entry) continue;
      const toMove = Array.from(result.entries()).filter(
        ([p]) => p === c.path || p.startsWith(c.path + "/")
      );
      for (const [p] of toMove) result.delete(p);
      for (const [p, e] of toMove) {
        const newPath = p === c.path ? c.newPath : c.newPath + p.slice(c.path.length);
        result.set(newPath, e);
      }
    }
  }

  for (const c of pending) {
    if (c.op === "add") {
      if (result.has(c.path)) continue;
      const parentPath = pathParent(c.path);
      if (parentPath) {
        let acc = "";
        for (const seg of pathSegments(parentPath)) {
          const p = acc ? `${acc}/${seg}` : seg;
          if (!result.has(p)) result.set(p, { type: "folder" });
          acc = p;
        }
      }
      if (c.type === "file") {
        result.set(c.path, { type: "file", content: c.content });
      } else {
        result.set(c.path, { type: "folder" });
      }
    } else if (c.op === "edit") {
      const e = result.get(c.path);
      if (e && e.type === "file") {
        result.set(c.path, { type: "file", content: c.content });
      }
    }
  }

  return result;
}

export type CommitPendingResult =
  | { success: true; commitId: string }
  | { success: false; message: string };

/**
 * Build merged tree from server tree + pending + deletedPaths, create all blobs/trees, and create one commit.
 */
export async function commitPendingChanges(
  repositoryId: string,
  branchName: string,
  authorId: string,
  message: string,
  serverTree: FileTreeNode[],
  pending: PendingChange[],
  deletedPaths: string[] = []
): Promise<CommitPendingResult> {
  if (pending.length === 0 && deletedPaths.length === 0) {
    return { success: false, message: "No pending changes to commit" };
  }

  const pathMap = serverTreeToMap(serverTree);
  const merged = applyPendingToMap(pathMap, pending, deletedPaths);

  const branchRes = await getBranchByName(repositoryId, branchName);
  if (isApiError(branchRes) || !branchRes.data) {
    return { success: false, message: "Branch not found" };
  }
  const branch = branchRes.data;

  const pathToBlobId = new Map<string, string>();

  const filePaths = Array.from(merged.entries())
    .filter(([, e]) => e.type === "file")
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [path, entry] of filePaths) {
    if (entry.blobId) {
      pathToBlobId.set(path, entry.blobId);
    } else if (entry.content !== undefined) {
      const content =
        typeof entry.content === "object" && entry.content !== null
          ? JSON.parse(JSON.stringify(entry.content))
          : entry.content;
      const blobRes = await createBlob(repositoryId, content);
      if (isApiError(blobRes) || !blobRes.data) {
        return {
          success: false,
          message: blobRes.success === false ? (blobRes as { message: string }).message : "Failed to create blob",
        };
      }
      pathToBlobId.set(path, blobRes.data.id);
    }
  }

  const allPaths = Array.from(merged.keys());
  const dirPaths = new Set<string>();
  dirPaths.add("");
  for (const path of allPaths) {
    const parent = pathParent(path);
    if (parent !== path) dirPaths.add(parent);
  }
  const sortedDirs = Array.from(dirPaths).sort(
    (a, b) => pathSegments(b).length - pathSegments(a).length
  );

  const createdTreeIds = new Map<string, string>();

  for (const dirPath of sortedDirs) {
    const childPaths = allPaths.filter((p) => pathParent(p) === dirPath);
    const entries: Array<{ name: string; type: "BLOB" | "TREE"; blobId?: string; childTreeId?: string }> = [];
    for (const path of childPaths.sort((a, b) => pathBaseName(a).localeCompare(pathBaseName(b)))) {
      const name = pathBaseName(path);
      const entry = merged.get(path)!;
      if (entry.type === "file") {
        const blobId = pathToBlobId.get(path);
        if (blobId) entries.push({ name, type: "BLOB", blobId });
      } else {
        const childTreeId = createdTreeIds.get(path);
        if (childTreeId) entries.push({ name, type: "TREE", childTreeId });
      }
    }
    const treeRes = await createTree(repositoryId, entries);
    if (isApiError(treeRes) || !treeRes.data) {
      return {
        success: false,
        message: treeRes.success === false ? (treeRes as { message: string }).message : "Failed to create tree",
      };
    }
    createdTreeIds.set(dirPath, treeRes.data.id);
  }

  const rootTreeId = createdTreeIds.get("");
  if (!rootTreeId) {
    return { success: false, message: "Failed to build root tree" };
  }

  const commitRes = await createCommit({
    repositoryId,
    treeId: rootTreeId,
    authorId,
    message: message.trim() || "Update",
    parentCommitId: branch.headCommitId,
  });
  if (isApiError(commitRes) || !commitRes.data) {
    return {
      success: false,
      message: commitRes.success === false ? (commitRes as { message: string }).message : "Failed to create commit",
    };
  }

  const headRes = await updateBranchHead(branch.id, commitRes.data.id);
  if (isApiError(headRes)) {
    return { success: false, message: headRes.message };
  }

  return { success: true, commitId: commitRes.data.id };
}
