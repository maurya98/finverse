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

/** For PATCH users/me: update own profile (name) and/or change password. */
export const updateProfileSchema = z.object({
  name: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
}).refine(
  (data) => {
    if (data.newPassword && !data.currentPassword) return false;
    return true;
  },
  { message: "Current password is required to set a new password", path: ["currentPassword"] }
);

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;

export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
