import type { z } from "zod";
import type { createRawDataSchema, updateRawDataSchema } from "../raw-data/raw-data.validation";

export type CreateRawDataInput = z.infer<typeof createRawDataSchema>;
export type UpdateRawDataInput = z.infer<typeof updateRawDataSchema>;
export type RawDataListInput = {
  page?: number;
  limit?: number;
};
