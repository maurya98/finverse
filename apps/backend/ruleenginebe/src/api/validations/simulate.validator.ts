import { z } from "zod";

export const simulateBodySchema = z.object({
  content: z.unknown(),
  context: z.unknown(),
  repositoryId: z.string().uuid().optional(),
  branch: z.string().min(1).optional(),
  decisions: z.record(z.string(), z.unknown()).optional(),
});

export type SimulateBody = z.infer<typeof simulateBodySchema>;
