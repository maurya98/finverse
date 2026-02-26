import { prisma } from "../../databases/client";

const REPO_MANAGER_ROLES = ["ADMIN", "MAINTAINER"] as const;
const ROLE_ORDER: Record<string, number> = { VIEWER: 0, CONTRIBUTOR: 1, MAINTAINER: 2, ADMIN: 3 };

export type RepositoryMemberWithUser = {
  id: string;
  repositoryId: string;
  userId: string;
  role: string;
  userEmail: string | null;
  userName: string | null;
};

export class RepositoryMembersService {
  async listByRepository(repositoryId: string): Promise<RepositoryMemberWithUser[]> {
    const members = await prisma.repositoryMember.findMany({
      where: { repositoryId },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { userId: "asc" },
    });
    return members.map((m) => ({
      id: m.id,
      repositoryId: m.repositoryId,
      userId: m.userId,
      role: m.role,
      userEmail: m.user.email,
      userName: m.user.name,
    }));
  }

  async getMember(repositoryId: string, userId: string): Promise<{ role: string } | null> {
    const member = await prisma.repositoryMember.findUnique({
      where: { repositoryId_userId: { repositoryId, userId } },
      select: { role: true },
    });
    return member ? { role: member.role } : null;
  }

  /** Returns a map of repositoryId -> role for the given user in the given repositories. */
  async getRolesForUserInRepositories(userId: string, repositoryIds: string[]): Promise<Record<string, string>> {
    if (repositoryIds.length === 0) return {};
    const members = await prisma.repositoryMember.findMany({
      where: { userId, repositoryId: { in: repositoryIds } },
      select: { repositoryId: true, role: true },
    });
    return Object.fromEntries(members.map((m) => [m.repositoryId, m.role]));
  }

  async add(
    repositoryId: string,
    userId: string,
    role: string,
    _invitedBy?: string
  ): Promise<RepositoryMemberWithUser> {
    const member = await prisma.repositoryMember.create({
      data: { repositoryId, userId, role: role as "ADMIN" | "MAINTAINER" | "CONTRIBUTOR" | "VIEWER" },
      include: { user: { select: { email: true, name: true } } },
    });
    return {
      id: member.id,
      repositoryId: member.repositoryId,
      userId: member.userId,
      role: member.role,
      userEmail: member.user.email,
      userName: member.user.name,
    };
  }

  async updateRole(repositoryId: string, userId: string, role: string): Promise<RepositoryMemberWithUser> {
    const member = await prisma.repositoryMember.update({
      where: { repositoryId_userId: { repositoryId, userId } },
      data: { role: role as "ADMIN" | "MAINTAINER" | "CONTRIBUTOR" | "VIEWER" },
      include: { user: { select: { email: true, name: true } } },
    });
    return {
      id: member.id,
      repositoryId: member.repositoryId,
      userId: member.userId,
      role: member.role,
      userEmail: member.user.email,
      userName: member.user.name,
    };
  }

  async remove(repositoryId: string, userId: string): Promise<boolean> {
    const result = await prisma.repositoryMember.deleteMany({
      where: { repositoryId, userId },
    });
    return result.count > 0;
  }

  async countAdmins(repositoryId: string): Promise<number> {
    return prisma.repositoryMember.count({
      where: { repositoryId, role: "ADMIN" },
    });
  }

  /** Caller must have at least this role on the repo. */
  static canManageMembers(role: string): boolean {
    return REPO_MANAGER_ROLES.includes(role as (typeof REPO_MANAGER_ROLES)[number]);
  }

  /** True if roleA has at least the same power as roleB (for minRole checks). */
  static hasAtLeastRole(role: string, minRole: string): boolean {
    return (ROLE_ORDER[role] ?? -1) >= (ROLE_ORDER[minRole] ?? -1);
  }
}
