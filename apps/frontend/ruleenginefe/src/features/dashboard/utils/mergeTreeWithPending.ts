import type { FileTreeNode } from "../hooks/useBranchTree";
import type { PendingChange } from "./pendingChanges";

const PENDING_FILE_PREFIX = "pending-file-";
const PENDING_FOLDER_PREFIX = "pending-folder-";

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

/** Build flat map path -> node from tree (recursive). */
function treeToMap(nodes: FileTreeNode[], parentPath = ""): Map<string, FileTreeNode> {
  const map = new Map<string, FileTreeNode>();
  for (const n of nodes) {
    const path = parentPath ? `${parentPath}/${n.name}` : n.name;
    map.set(path, { ...n, path });
    if (n.children?.length) {
      for (const [p, node] of treeToMap(n.children, path)) {
        map.set(p, node);
      }
    }
  }
  return map;
}

/** Build tree from flat map (root paths = no slash or single segment that has no parent in map as second level). */
function mapToTree(map: Map<string, FileTreeNode>, parentPath = ""): FileTreeNode[] {
  const nodes: FileTreeNode[] = [];
  const seen = new Set<string>();
  for (const [path, node] of map) {
    const parent = pathParent(path);
    if (parent !== parentPath) continue;
    const name = pathBaseName(path);
    if (!name) continue;
    const children = mapToTree(map, path);
    nodes.push({
      ...node,
      name,
      path,
      children: children.length ? children : undefined,
    });
    seen.add(path);
  }
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function deepCloneNode(n: FileTreeNode): FileTreeNode {
  return {
    ...n,
    children: n.children?.map(deepCloneNode),
  };
}

/** Merge server tree with pending changes and return the display tree. */
export function mergeTreeWithPending(
  serverTree: FileTreeNode[],
  pending: PendingChange[],
  deletedPaths: string[] = []
): FileTreeNode[] {
  const map = new Map<string, FileTreeNode>();
  for (const [path, node] of treeToMap(serverTree)) {
    map.set(path, deepCloneNode(node));
  }

  // Apply deletes from deletedPaths (and legacy delete ops in pending)
  for (const delPath of deletedPaths) {
    for (const path of Array.from(map.keys())) {
      if (path === delPath || path.startsWith(delPath + "/")) {
        map.delete(path);
      }
    }
  }
  for (const c of pending) {
    if (c.op !== "delete") continue;
    for (const path of Array.from(map.keys())) {
      if (path === c.path || path.startsWith(c.path + "/")) {
        map.delete(path);
      }
    }
  }

  // Apply adds before moves so that pending-added nodes exist in the map when we process moves
  for (const c of pending) {
    if (c.op !== "add") continue;
    const path = c.path;
    if (map.has(path)) continue; // already exists (e.g. from server)
    const parentPath = pathParent(path);
    const name = pathBaseName(path);
    if (parentPath) {
      if (!map.has(parentPath)) {
        const segs = pathSegments(parentPath);
        let acc = "";
        for (const seg of segs) {
          const p = acc ? `${acc}/${seg}` : seg;
          if (!map.has(p)) {
            map.set(p, {
              id: `${PENDING_FOLDER_PREFIX}${p}`,
              name: seg,
              type: "folder",
              path: p,
              blobId: null,
              childTreeId: null,
              children: [],
            });
          }
          acc = p;
        }
      }
    }
    if (c.type === "file") {
      map.set(path, {
        id: `${PENDING_FILE_PREFIX}${path}`,
        name,
        type: "file",
        path,
        blobId: null,
        childTreeId: null,
        children: undefined,
      });
    } else {
      map.set(path, {
        id: `${PENDING_FOLDER_PREFIX}${path}`,
        name,
        type: "folder",
        path,
        blobId: null,
        childTreeId: null,
        children: [],
      });
    }
  }

  // Apply moves: remove from old path, add at new path (with updated path on node and descendants)
  for (const c of pending) {
    if (c.op !== "move") continue;
    const node = map.get(c.path);
    if (!node) continue;
    const moved = deepCloneNode(node);
    const oldPrefix = c.path.endsWith("/") ? c.path : c.path + "/";
    const updatePaths = (n: FileTreeNode): FileTreeNode => {
      const newPath = n.path.startsWith(oldPrefix)
        ? c.newPath + n.path.slice(c.path.length)
        : n.path === c.path
          ? c.newPath
          : n.path;
      const out: FileTreeNode = {
        ...n,
        path: newPath,
        name: pathBaseName(newPath),
        children: n.children?.map(updatePaths),
      };
      return out;
    };
    const updated = updatePaths(moved);
    map.delete(c.path);
    for (const path of Array.from(map.keys())) {
      if (path.startsWith(c.path + "/")) map.delete(path);
    }
    const addToMap = (n: FileTreeNode) => {
      map.set(n.path, n);
      n.children?.forEach(addToMap);
    };
    addToMap(updated);
  }

  return mapToTree(map, "");
}

/** Get content for a path from pending (add or edit). Returns undefined if no pending content. */
export function getPendingContent(
  path: string,
  pending: PendingChange[]
): unknown | undefined {
  for (let i = pending.length - 1; i >= 0; i--) {
    const c = pending[i];
    if (c.op === "edit" && c.path === path) return c.content;
    if (c.op === "add" && c.type === "file" && c.path === path) return c.content;
  }
  return undefined;
}

/** True if path is deleted (in deletedPaths or delete op in pending). */
export function isPathDeleted(
  path: string,
  pending: PendingChange[],
  deletedPaths: string[] = []
): boolean {
  if (deletedPaths.some((d) => path === d || path.startsWith(d + "/"))) return true;
  return pending.some(
    (c) => c.op === "delete" && (path === c.path || path.startsWith(c.path + "/"))
  );
}

/** True if path is a pending (virtual) node. */
export function isPendingPath(path: string, pending: PendingChange[]): boolean {
  return pending.some(
    (c) =>
      (c.op === "add" && c.path === path) ||
      (c.op === "add" && path.startsWith(c.path + "/"))
  );
}
