import { z } from "zod";

export const createDashboardSchema = z.object({
  botNumber: z.coerce.bigint().optional(),
  botName: z.string().max(255).optional(),
  userName: z.string().max(255).optional(),
  userNumber: z.coerce.bigint().optional(),
  userMessage: z.string().optional(),
  customerReply: z.string().optional(),
  intentCategory: z.string().max(255).optional(),
  source: z.string().max(255).optional(),
  createdDatetime: z.coerce.date().optional(),
  created: z.coerce.date().optional(),
  status: z.coerce.boolean().optional().default(true),
  accountType: z.string().max(100).optional(),
  userEmail: z.string().email().max(255).optional(),
  campaignId: z.string().max(100).optional(),
  callCenterAssign: z.coerce.boolean().optional(),
  dontSendNotCampign: z.coerce.boolean().optional(),
  rating: z.coerce.number().int().optional(),
  feedback: z.string().optional(),
  dlrStatus: z.string().max(100).optional(),
});

export const updateDashboardSchema = createDashboardSchema.partial();
