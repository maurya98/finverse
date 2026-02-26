import { z } from "zod";

const repositoryMemberRoleSchema = z.enum(["ADMIN", "MAINTAINER", "CONTRIBUTOR", "VIEWER"]);

export const addRepositoryMemberSchema = z.object({
  userId: z.string().uuid(),
  role: repositoryMemberRoleSchema,
});

export const updateRepositoryMemberRoleSchema = z.object({
  role: repositoryMemberRoleSchema,
});

export type AddRepositoryMemberBody = z.infer<typeof addRepositoryMemberSchema>;
export type UpdateRepositoryMemberRoleBody = z.infer<typeof updateRepositoryMemberRoleSchema>;
