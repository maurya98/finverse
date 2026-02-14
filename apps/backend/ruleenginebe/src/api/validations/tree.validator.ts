import { z } from "zod";

const treeEntrySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["BLOB", "TREE"]),
  blobId: z.string().uuid().optional(),
  childTreeId: z.string().uuid().optional(),
});

export const createTreeSchema = z.object({
  repositoryId: z.string().uuid(),
  entries: z.array(treeEntrySchema).optional().default([]),
});

export const addTreeEntrySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["BLOB", "TREE"]),
  blobId: z.string().uuid().optional(),
  childTreeId: z.string().uuid().optional(),
});

export const listTreesQuerySchema = z.object({
  repositoryId: z.string().uuid(),
  skip: z.coerce.number().int().min(0).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateTreeBody = z.infer<typeof createTreeSchema>;
export type AddTreeEntryBody = z.infer<typeof addTreeEntrySchema>;
export type ListTreesQuery = z.infer<typeof listTreesQuerySchema>;
