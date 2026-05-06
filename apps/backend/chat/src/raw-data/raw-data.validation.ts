import { z } from "zod";
import type { Prisma } from "../generated/prisma/client";
import { jsonValueSchema } from "../utils/validations";

export const createRawDataSchema = z.object({
  rawData: jsonValueSchema.optional() as z.ZodType<Prisma.InputJsonValue | null | undefined>,
  createdDatetime: z.coerce.date().optional(),
  created: z.coerce.date().optional(),
});

export const updateRawDataSchema = createRawDataSchema.partial();
