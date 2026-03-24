import { z } from "zod";

export const listEngineLogsQuerySchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, "userId must be a positive integer")
    .optional(),
  skip: z.coerce.number().int().min(0).optional(),
  take: z.coerce.number().int().min(1).max(200).optional(),
});

export type ListEngineLogsQuery = z.infer<typeof listEngineLogsQuerySchema>;
