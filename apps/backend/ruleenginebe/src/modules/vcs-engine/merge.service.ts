import { prisma } from "../../databases/client.js";

export type MergeRequestStatus = "OPEN" | "MERGED" | "CLOSED";

export type MergeRequestWithBranches = {
  id: string;
  repositoryId: string;
  sourceBranchId: string;
  targetBranchId: string;
  title: string;
  description: string | null;
  status: MergeRequestStatus;
  createdBy: string;
  mergedBy: string | null;
  mergedCommitId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateMergeRequestInput = {
  repositoryId: string;
  sourceBranchId: string;
  targetBranchId: string;
  title: string;
  description?: string | null;
  createdBy: string;
};

export type MergeRequestCommentOut = {
  id: string;
  mergeRequestId: string;
  userId: string;
  comment: string;
  createdAt: Date;
};

export class MergeRequestService {
  async create(input: CreateMergeRequestInput): Promise<MergeRequestWithBranches> {
    const mr = await prisma.mergeRequest.create({
      data: {
        repositoryId: input.repositoryId,
        sourceBranchId: input.sourceBranchId,
        targetBranchId: input.targetBranchId,
        title: input.title,
        description: input.description ?? undefined,
        createdBy: input.createdBy,
      },
    });
    return toMergeRequest(mr);
  }

  async findById(id: string): Promise<MergeRequestWithBranches | null> {
    const mr = await prisma.mergeRequest.findUnique({
      where: { id },
      include: { sourceBranch: true, targetBranch: true },
    });
    return mr ? toMergeRequest(mr) : null;
  }

  async listByRepository(
    repositoryId: string,
    skip = 0,
    take = 50
  ): Promise<MergeRequestWithBranches[]> {
    const list = await prisma.mergeRequest.findMany({
      where: { repositoryId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
    return list.map(toMergeRequest);
  }

  async listByStatus(
    repositoryId: string,
    status: MergeRequestStatus,
    skip = 0,
    take = 50
  ): Promise<MergeRequestWithBranches[]> {
    const list = await prisma.mergeRequest.findMany({
      where: { repositoryId, status },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
    return list.map(toMergeRequest);
  }

  async updateStatus(
    id: string,
    status: MergeRequestStatus
  ): Promise<MergeRequestWithBranches | null> {
    const mr = await prisma.mergeRequest.findUnique({ where: { id } });
    if (!mr) return null;
    const updated = await prisma.mergeRequest.update({
      where: { id },
      data: { status },
    });
    return toMergeRequest(updated);
  }

  /**
   * Mark merge request as merged and record who merged it and which commit.
   */
  async merge(
    id: string,
    mergedBy: string,
    mergedCommitId: string
  ): Promise<MergeRequestWithBranches | null> {
    const mr = await prisma.mergeRequest.findUnique({ where: { id } });
    if (!mr) return null;
    if (mr.status !== "OPEN") {
      return null;
    }
    const updated = await prisma.mergeRequest.update({
      where: { id },
      data: {
        status: "MERGED",
        mergedBy,
        mergedCommitId,
      },
    });
    return toMergeRequest(updated);
  }

  async addComment(
    mergeRequestId: string,
    userId: string,
    comment: string
  ): Promise<MergeRequestCommentOut | null> {
    const mr = await prisma.mergeRequest.findUnique({
      where: { id: mergeRequestId },
    });
    if (!mr) return null;
    const c = await prisma.mergeRequestComment.create({
      data: { mergeRequestId, userId, comment },
    });
    return {
      id: c.id,
      mergeRequestId: c.mergeRequestId,
      userId: c.userId,
      comment: c.comment,
      createdAt: c.createdAt,
    };
  }

  /**
   * Get branch names and repository for an MR (for diff).
   */
  async getBranchNamesForDiff(
    mergeRequestId: string
  ): Promise<{ repositoryId: string; sourceBranchName: string; targetBranchName: string } | null> {
    const mr = await prisma.mergeRequest.findUnique({
      where: { id: mergeRequestId },
      include: {
        sourceBranch: { select: { name: true } },
        targetBranch: { select: { name: true } },
      },
    });
    if (!mr?.sourceBranch || !mr?.targetBranch) return null;
    return {
      repositoryId: mr.repositoryId,
      sourceBranchName: mr.sourceBranch.name,
      targetBranchName: mr.targetBranch.name,
    };
  }

  async listComments(
    mergeRequestId: string,
    skip = 0,
    take = 50
  ): Promise<MergeRequestCommentOut[]> {
    const list = await prisma.mergeRequestComment.findMany({
      where: { mergeRequestId },
      skip,
      take,
      orderBy: { createdAt: "asc" },
    });
    return list.map((c) => ({
      id: c.id,
      mergeRequestId: c.mergeRequestId,
      userId: c.userId,
      comment: c.comment,
      createdAt: c.createdAt,
    }));
  }
}

function toMergeRequest(mr: {
  id: string;
  repositoryId: string;
  sourceBranchId: string;
  targetBranchId: string;
  title: string;
  description: string | null;
  status: string;
  createdBy: string;
  mergedBy: string | null;
  mergedCommitId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MergeRequestWithBranches {
  return {
    id: mr.id,
    repositoryId: mr.repositoryId,
    sourceBranchId: mr.sourceBranchId,
    targetBranchId: mr.targetBranchId,
    title: mr.title,
    description: mr.description,
    status: mr.status as MergeRequestStatus,
    createdBy: mr.createdBy,
    mergedBy: mr.mergedBy,
    mergedCommitId: mr.mergedCommitId,
    createdAt: mr.createdAt,
    updatedAt: mr.updatedAt,
  };
}
