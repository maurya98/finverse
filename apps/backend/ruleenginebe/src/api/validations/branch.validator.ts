import { z } from "zod";

export const createBranchSchema = z.object({
  repositoryId: z.string().uuid(),
  name: z.string().min(1),
  createdBy: z.string().uuid(),
  headCommitId: z.string().uuid().optional().nullable(),
});

export const updateBranchHeadSchema = z.object({
  headCommitId: z.string().uuid().nullable(),
});

export const listBranchesQuerySchema = z.object({
  repositoryId: z.string().uuid(),
  skip: z.coerce.number().int().min(0).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateBranchBody = z.infer<typeof createBranchSchema>;
export type UpdateBranchHeadBody = z.infer<typeof updateBranchHeadSchema>;
export type ListBranchesQuery = z.infer<typeof listBranchesQuerySchema>;
