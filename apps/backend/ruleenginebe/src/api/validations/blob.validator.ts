import { z } from "zod";

/** Body for creating a blob: repositoryId + arbitrary JSON content. */
export const createBlobSchema = z.object({
  repositoryId: z.string().uuid(),
  content: z.unknown(),
});

/** Query for listing blobs: repositoryId required, optional skip/take. */
export const listBlobsQuerySchema = z.object({
  repositoryId: z.string().uuid(),
  skip: z.coerce.number().int().min(0).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateBlobBody = z.infer<typeof createBlobSchema>;
export type ListBlobsQuery = z.infer<typeof listBlobsQuerySchema>;
