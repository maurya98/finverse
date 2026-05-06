import type { z } from "zod";
import type {
  createDashboardSchema,
  updateDashboardSchema,
} from "../dashboard/dashboard.validation";

export type CreateDashboardInput = z.infer<typeof createDashboardSchema>;
export type UpdateDashboardInput = z.infer<typeof updateDashboardSchema>;
export type DashboardListInput = {
  page?: number;
  limit?: number;
};
