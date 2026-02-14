import { z } from "zod";

const userRoleEnum = z.enum(["ADMIN", "MAINTAINER", "DEVELOPER", "VIEWER"]);

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional().nullable(),
  role: userRoleEnum.optional(),
});

export const updateUserSchema = z.object({
  name: z.string().optional().nullable(),
  role: userRoleEnum.optional(),
});

export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
