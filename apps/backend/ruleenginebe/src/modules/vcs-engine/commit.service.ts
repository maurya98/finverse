import { prisma } from "../../databases/client";

export type CommitWithRelations = {
  id: string;
  repositoryId: string;
  treeId: string;
  parentCommitId: string | null;
  mergeParentCommitId: string | null;
  message: string | null;
  authorId: string;
  authorName: string | null;
  createdAt: Date;
};

export type CreateCommitInput = {
  repositoryId: string;
  treeId: string;
  parentCommitId?: string | null;
  mergeParentCommitId?: string | null;
  message?: string | null;
  authorId: string;
};

export class CommitService {
  async create(input: CreateCommitInput): Promise<CommitWithRelations> {
    const created = await prisma.commit.create({
      data: {
        repositoryId: input.repositoryId,
        treeId: input.treeId,
        parentCommitId: input.parentCommitId ?? undefined,
        mergeParentCommitId: input.mergeParentCommitId ?? undefined,
        message: input.message ?? null,
        authorId: input.authorId,
      },
    });
    const commit = await prisma.commit.findUnique({
      where: { id: created.id },
      include: { author: { select: { name: true } } },
    });
    return toCommit(commit!);
  }

  async findById(id: string): Promise<CommitWithRelations | null> {
    const commit = await prisma.commit.findUnique({
      where: { id },
      include: { tree: true, author: { select: { name: true } } },
    });
    return commit ? toCommit(commit) : null;
  }

  async listByRepository(
    repositoryId: string,
    skip = 0,
    take = 50
  ): Promise<CommitWithRelations[]> {
    const commits = await prisma.commit.findMany({
      where: { repositoryId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
    return commits.map(toCommit);
  }

  async listByBranch(
    repositoryId: string,
    branchName: string,
    skip = 0,
    take = 50
  ): Promise<CommitWithRelations[]> {
    const branch = await prisma.branch.findUnique({
      where: {
        repositoryId_name: { repositoryId, name: branchName },
      },
      include: { headCommit: true },
    });
    if (!branch?.headCommitId) return [];
    const commits: CommitWithRelations[] = [];
    let currentId: string | null = branch.headCommitId;
    let collected = 0;
    while (currentId && collected < take) {
      const raw: {
        id: string;
        repositoryId: string;
        treeId: string;
        parentCommitId: string | null;
        mergeParentCommitId: string | null;
        message: string | null;
        authorId: string;
        createdAt: Date;
        author: { name: string | null };
      } | null = await prisma.commit.findUnique({
        where: { id: currentId },
        select: {
          id: true,
          repositoryId: true,
          treeId: true,
          parentCommitId: true,
          mergeParentCommitId: true,
          message: true,
          authorId: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      });
      if (!raw || raw.repositoryId !== repositoryId) break;
      if (collected >= skip) commits.push(toCommit(raw));
      collected++;
      currentId = raw.parentCommitId;
    }
    return commits;
  }
}

function toCommit(c: {
  id: string;
  repositoryId: string;
  treeId: string;
  parentCommitId: string | null;
  mergeParentCommitId: string | null;
  message: string | null;
  authorId: string;
  createdAt: Date;
  author?: { name: string | null } | null;
}): CommitWithRelations {
  return {
    id: c.id,
    repositoryId: c.repositoryId,
    treeId: c.treeId,
    parentCommitId: c.parentCommitId,
    mergeParentCommitId: c.mergeParentCommitId,
    message: c.message,
    authorId: c.authorId,
    authorName: c.author?.name ?? null,
    createdAt: c.createdAt,
  };
}
