import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  ownerId: z.string().uuid().optional(),
});

export const listWorkspacesQuerySchema = z.object({
  ownerId: z.string().uuid().optional(),
  skip: z.coerce.number().int().min(0).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateWorkspaceBody = z.infer<typeof createWorkspaceSchema>;
export type ListWorkspacesQuery = z.infer<typeof listWorkspacesQuerySchema>;
