import { z } from "zod";

export const createRepositorySchema = z.object({
  name: z.string().min(1),
  workspaceId: z.string().uuid(),
  createdBy: z.string().uuid().optional(),
  defaultBranch: z.string().min(1).optional(),
});

export const listRepositoriesQuerySchema = z.object({
  workspaceId: z.string().uuid(),
  skip: z.coerce.number().int().min(0).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateRepositoryBody = z.infer<typeof createRepositorySchema>;
export type ListRepositoriesQuery = z.infer<typeof listRepositoriesQuerySchema>;
