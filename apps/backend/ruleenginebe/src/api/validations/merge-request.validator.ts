import { z } from "zod";

const mergeRequestStatusEnum = z.enum(["OPEN", "MERGED", "CLOSED"]);

export const createMergeRequestSchema = z.object({
  repositoryId: z.string().uuid(),
  sourceBranchId: z.string().uuid(),
  targetBranchId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  createdBy: z.string().uuid(),
});

export const updateMergeRequestStatusSchema = z.object({
  status: mergeRequestStatusEnum,
});

export const mergeMergeRequestSchema = z.object({
  mergedBy: z.string().uuid().optional(),
  mergedCommitId: z.string().uuid(),
});

export const addMergeRequestCommentSchema = z.object({
  userId: z.string().uuid(),
  comment: z.string().min(1),
});

export const listMergeRequestsQuerySchema = z.object({
  repositoryId: z.string().uuid(),
  status: mergeRequestStatusEnum.optional(),
  skip: z.coerce.number().int().min(0).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
});

/** Query for diff between two commits. */
export const diffCommitsQuerySchema = z.object({
  baseCommitId: z.string().uuid(),
  targetCommitId: z.string().uuid(),
});

/** Query for diff between two branch heads. */
export const diffBranchesQuerySchema = z.object({
  repositoryId: z.string().uuid(),
  baseBranch: z.string().min(1),
  targetBranch: z.string().min(1),
});

export type CreateMergeRequestBody = z.infer<typeof createMergeRequestSchema>;
export type UpdateMergeRequestStatusBody = z.infer<typeof updateMergeRequestStatusSchema>;
export type MergeMergeRequestBody = z.infer<typeof mergeMergeRequestSchema>;
export type AddMergeRequestCommentBody = z.infer<typeof addMergeRequestCommentSchema>;
export type ListMergeRequestsQuery = z.infer<typeof listMergeRequestsQuerySchema>;
export type DiffCommitsQuery = z.infer<typeof diffCommitsQuerySchema>;
export type DiffBranchesQuery = z.infer<typeof diffBranchesQuerySchema>;
