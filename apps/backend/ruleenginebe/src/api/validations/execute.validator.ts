import { z } from "zod";

export const executeBodySchema = z.object({
  repositoryId: z.string().uuid(),
  context: z.unknown(),
  branch: z.string().min(1).optional(),
});

export type ExecuteBody = z.infer<typeof executeBodySchema>;
