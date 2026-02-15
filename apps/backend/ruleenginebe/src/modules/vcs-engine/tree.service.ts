import { prisma } from "../../databases/client";

export type TreeEntryInput = {
  name: string;
  type: "BLOB" | "TREE";
  blobId?: string;
  childTreeId?: string;
};

export type TreeWithEntries = {
  id: string;
  repositoryId: string;
  createdAt: Date;
  entries: Array<{
    id: string;
    name: string;
    type: "BLOB" | "TREE";
    blobId: string | null;
    childTreeId: string | null;
  }>;
};

export class TreeService {
  async create(repositoryId: string, entries: TreeEntryInput[] = []): Promise<TreeWithEntries> {
    const tree = await prisma.tree.create({
      data: {
        repositoryId,
        entries: {
          create: entries.map((e) => ({
            name: e.name,
            type: e.type,
            blobId: e.blobId ?? undefined,
            childTreeId: e.childTreeId ?? undefined,
          })),
        },
      },
      include: { entries: true },
    });
    return toTreeWithEntries(tree);
  }

  async findById(id: string): Promise<TreeWithEntries | null> {
    const tree = await prisma.tree.findUnique({
      where: { id },
      include: { entries: true },
    });
    return tree ? toTreeWithEntries(tree) : null;
  }

  async addEntry(
    treeId: string,
    entry: TreeEntryInput
  ): Promise<TreeWithEntries | null> {
    const tree = await prisma.tree.findUnique({ where: { id: treeId } });
    if (!tree) return null;
    await prisma.treeEntry.create({
      data: {
        treeId,
        name: entry.name,
        type: entry.type,
        blobId: entry.blobId ?? undefined,
        childTreeId: entry.childTreeId ?? undefined,
      },
    });
    return this.findById(treeId);
  }

  async listByRepository(
    repositoryId: string,
    skip = 0,
    take = 50
  ): Promise<TreeWithEntries[]> {
    const trees = await prisma.tree.findMany({
      where: { repositoryId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { entries: true },
    });
    return trees.map(toTreeWithEntries);
  }

  async removeEntry(treeId: string, entryId: string): Promise<TreeWithEntries | null> {
    const entry = await prisma.treeEntry.findFirst({
      where: { id: entryId, treeId },
    });
    if (!entry) return null;
    await prisma.treeEntry.delete({ where: { id: entryId } });
    return this.findById(treeId);
  }

  async updateEntry(
    treeId: string,
    entryId: string,
    data: { name?: string; blobId?: string | null; childTreeId?: string | null }
  ): Promise<TreeWithEntries | null> {
    const entry = await prisma.treeEntry.findFirst({
      where: { id: entryId, treeId },
    });
    if (!entry) return null;
    await prisma.treeEntry.update({
      where: { id: entryId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.blobId !== undefined && { blobId: data.blobId }),
        ...(data.childTreeId !== undefined && { childTreeId: data.childTreeId }),
      },
    });
    return this.findById(treeId);
  }
}

function toTreeWithEntries(tree: {
  id: string;
  repositoryId: string;
  createdAt: Date;
  entries: Array<{
    id: string;
    name: string;
    type: "BLOB" | "TREE";
    blobId: string | null;
    childTreeId: string | null;
  }>;
}): TreeWithEntries {
  return {
    id: tree.id,
    repositoryId: tree.repositoryId,
    createdAt: tree.createdAt,
    entries: tree.entries.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      blobId: e.blobId,
      childTreeId: e.childTreeId,
    })),
  };
}
