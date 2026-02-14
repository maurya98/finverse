import { z } from "zod";

export const createCommitSchema = z.object({
  repositoryId: z.string().uuid(),
  treeId: z.string().uuid(),
  parentCommitId: z.string().uuid().optional().nullable(),
  mergeParentCommitId: z.string().uuid().optional().nullable(),
  message: z.string().optional().nullable(),
  authorId: z.string().uuid(),
});

export const listCommitsQuerySchema = z.object({
  repositoryId: z.string().uuid(),
  branch: z.string().min(1).optional(),
  skip: z.coerce.number().int().min(0).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateCommitBody = z.infer<typeof createCommitSchema>;
export type ListCommitsQuery = z.infer<typeof listCommitsQuerySchema>;
