import { prisma } from "../../databases/client";

export type BlobRef = { blobId: string; contentHash: string };

export type DiffResult = {
  added: Array<{ path: string } & BlobRef>;
  removed: Array<{ path: string } & BlobRef>;
  modified: Array<{
    path: string;
    base: BlobRef;
    target: BlobRef;
  }>;
};

/**
 * Recursively collect all blob paths in a tree (path -> blobId + contentHash).
 * Paths use "/" for nesting (e.g. "rules/main.json", "config/settings.json").
 */
async function getTreeBlobPaths(
  treeId: string,
  prefix: string
): Promise<Map<string, BlobRef>> {
  const tree = await prisma.tree.findUnique({
    where: { id: treeId },
    include: {
      entries: {
        include: { blob: true },
      },
    },
  });
  if (!tree) return new Map();

  const out = new Map<string, BlobRef>();

  for (const e of tree.entries) {
    const path = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.type === "BLOB" && e.blobId && e.blob) {
      out.set(path, { blobId: e.blob.id, contentHash: e.blob.contentHash });
    } else if (e.type === "TREE" && e.childTreeId) {
      const nested = await getTreeBlobPaths(e.childTreeId, path);
      for (const [p, ref] of nested) {
        out.set(p, ref);
      }
    }
  }

  return out;
}

/**
 * Get the tree ID for a commit (by commit id).
 */
async function getCommitTreeId(commitId: string): Promise<string | null> {
  const commit = await prisma.commit.findUnique({
    where: { id: commitId },
    select: { treeId: true },
  });
  return commit?.treeId ?? null;
}

export class DiffService {
  /**
   * Diff two trees by id. Returns added, removed, and modified blob paths.
   */
  async diffTrees(
    baseTreeId: string,
    targetTreeId: string
  ): Promise<DiffResult> {
    const [basePaths, targetPaths] = await Promise.all([
      getTreeBlobPaths(baseTreeId, ""),
      getTreeBlobPaths(targetTreeId, ""),
    ]);

    const added: DiffResult["added"] = [];
    const removed: DiffResult["removed"] = [];
    const modified: DiffResult["modified"] = [];

    const allPaths = new Set([...basePaths.keys(), ...targetPaths.keys()]);

    for (const path of allPaths) {
      const baseRef = basePaths.get(path);
      const targetRef = targetPaths.get(path);
      if (!baseRef && targetRef) {
        added.push({ path, ...targetRef });
      } else if (baseRef && !targetRef) {
        removed.push({ path, ...baseRef });
      } else if (baseRef && targetRef && baseRef.contentHash !== targetRef.contentHash) {
        modified.push({ path, base: baseRef, target: targetRef });
      }
    }

    return { added, removed, modified };
  }

  /**
   * Diff two commits by comparing their trees.
   */
  async diffCommits(
    baseCommitId: string,
    targetCommitId: string
  ): Promise<DiffResult | null> {
    const [baseTreeId, targetTreeId] = await Promise.all([
      getCommitTreeId(baseCommitId),
      getCommitTreeId(targetCommitId),
    ]);
    if (!baseTreeId || !targetTreeId) return null;
    return this.diffTrees(baseTreeId, targetTreeId);
  }

  /**
   * Diff two branches by comparing their head commits' trees.
   */
  async diffBranches(
    repositoryId: string,
    baseBranchName: string,
    targetBranchName: string
  ): Promise<DiffResult | null> {
    const [baseBranch, targetBranch] = await Promise.all([
      prisma.branch.findUnique({
        where: { repositoryId_name: { repositoryId, name: baseBranchName } },
        select: { headCommitId: true },
      }),
      prisma.branch.findUnique({
        where: { repositoryId_name: { repositoryId, name: targetBranchName } },
        select: { headCommitId: true },
      }),
    ]);
    if (!baseBranch?.headCommitId || !targetBranch?.headCommitId) return null;
    return this.diffCommits(baseBranch.headCommitId, targetBranch.headCommitId);
  }
}
