import { useState, useCallback, useEffect } from "react";
import {
  getBranchByName,
  getCommit,
  getTree,
  isApiError,
} from "../services/api";

export type FileTreeNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  blobId: string | null;
  childTreeId: string | null;
  /** Tree that contains this entry (for files: used when saving blob update) */
  parentTreeId?: string;
  children?: FileTreeNode[];
};

async function loadTreeRecursive(
  treeId: string,
  pathPrefix: string,
  getTreeFn: (id: string) => ReturnType<typeof getTree>
): Promise<FileTreeNode[]> {
  const res = await getTreeFn(treeId);
  if (isApiError(res) || !res.data) return [];
  const nodes: FileTreeNode[] = [];
  for (const entry of res.data.entries) {
    const path = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;
    if (entry.type === "BLOB") {
      nodes.push({
        id: entry.id,
        name: entry.name,
        type: "file",
        path,
        blobId: entry.blobId,
        childTreeId: null,
        parentTreeId: treeId,
      });
    } else {
      const children = await loadTreeRecursive(
        entry.childTreeId!,
        path,
        getTreeFn
      );
      nodes.push({
        id: entry.id,
        name: entry.name,
        type: "folder",
        path,
        blobId: null,
        childTreeId: entry.childTreeId,
        parentTreeId: treeId,
        children,
      });
    }
  }
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function useBranchTree(repositoryId: string | null, branchName: string | null) {
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [rootTreeId, setRootTreeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTreeFromCommitId = useCallback(async (commitId: string) => {
    setLoading(true);
    setError(null);
    try {
      const commitRes = await getCommit(commitId);
      if (isApiError(commitRes) || !commitRes.data) {
        setError(commitRes.success === false ? (commitRes as { message: string }).message : "Commit not found");
        setTree([]);
        setRootTreeId(null);
        return;
      }
      const treeId = commitRes.data.treeId;
      setRootTreeId(treeId);
      const nodes = await loadTreeRecursive(treeId, "", getTree);
      setTree(nodes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tree");
      setTree([]);
      setRootTreeId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    if (!repositoryId || !branchName) {
      setTree([]);
      setRootTreeId(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const branchRes = await getBranchByName(repositoryId, branchName);
      if (isApiError(branchRes)) {
        setError(branchRes.message);
        setTree([]);
        setRootTreeId(null);
        return;
      }
      const branch = branchRes.data!;
      if (!branch.headCommitId) {
        setTree([]);
        setRootTreeId(null);
        return;
      }
      await loadTreeFromCommitId(branch.headCommitId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tree");
      setTree([]);
      setRootTreeId(null);
    } finally {
      setLoading(false);
    }
  }, [repositoryId, branchName, loadTreeFromCommitId]);

  /** Reload tree from a specific commit (e.g. right after creating a commit). Use this to avoid stale branch head. */
  const reloadFromCommitId = useCallback(
    async (commitId: string) => {
      await loadTreeFromCommitId(commitId);
    },
    [loadTreeFromCommitId]
  );

  /** Optimistically add a folder (or file) to the root of the tree so the UI updates immediately. */
  const appendNodeToRoot = useCallback((node: FileTreeNode) => {
    setTree((prev) => {
      const next = [...prev, node];
      return next.sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tree, rootTreeId, loading, error, reload, reloadFromCommitId, appendNodeToRoot };
}
