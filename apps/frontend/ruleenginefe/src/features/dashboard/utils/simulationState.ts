import type { FileTreeNode } from "../hooks/useBranchTree";
import type { PendingChange } from "./pendingChanges";
import { getPendingContent } from "./mergeTreeWithPending";
import type { Blob } from "../services/api";
import { isApiError } from "../services/api";

/**
 * Collect all JSON file paths and their blobIds from the tree (recursive).
 */
function collectJsonFiles(
  nodes: FileTreeNode[],
  parentPath = ""
): Array<{ path: string; blobId: string | null }> {
  const out: Array<{ path: string; blobId: string | null }> = [];
  for (const n of nodes) {
    const path = parentPath ? `${parentPath}/${n.name}` : n.name;
    if (n.type === "file" && n.name.toLowerCase().endsWith(".json")) {
      out.push({ path, blobId: n.blobId });
    }
    if (n.children?.length) {
      out.push(...collectJsonFiles(n.children, path));
    }
  }
  return out;
}

export type GetBlobFn = (id: string) => Promise<{ success: true; data?: Blob } | { success: false; message: string }>;

/**
 * Build the decisions map for simulation from the current UI state (display tree + pending).
 * Uses pending content when available, otherwise fetches blob from API.
 * This ensures simulation runs against the exact state the user sees (including uncommitted changes),
 * not the backend repo state.
 */
export async function getDecisionsMapForSimulation(
  displayTree: FileTreeNode[],
  pending: PendingChange[],
  getBlobFn: GetBlobFn
): Promise<Record<string, unknown>> {
  const files = collectJsonFiles(displayTree);
  const decisions: Record<string, unknown> = {};
  for (const { path, blobId } of files) {
    const pendingContent = getPendingContent(path, pending);
    if (pendingContent !== undefined) {
      decisions[path] = pendingContent;
      continue;
    }
    if (!blobId) continue;
    const res = await getBlobFn(blobId);
    if (isApiError(res)) continue;
    if (res.success && res.data) decisions[path] = res.data.content;
  }
  return decisions;
}
