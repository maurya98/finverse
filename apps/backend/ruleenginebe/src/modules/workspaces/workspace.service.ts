import { prisma } from "../../databases/client";
import { RepositoryService } from "../repositories/repository.service";

export type WorkspaceOut = { 
  id: string; 
  name: string; 
  ownerId: string; 
  createdAt: Date; 
};

export class WorkspaceService {
  async create(name: string, ownerId: string): Promise<WorkspaceOut> {
    
    const ws = await prisma.workspace.create({
      data: { name, ownerId },
    });

    return { 
      id: ws.id, 
      name: ws.name, 
      ownerId: ws.ownerId, 
      createdAt: ws.createdAt 
    };
  }

  async findById(id: string): Promise<WorkspaceOut | null> {
    const ws = await prisma.workspace.findUnique({ 
      where: { id } 
    });
    return ws ? { id: ws.id, 
      name: ws.name,
      ownerId: ws.ownerId, 
      createdAt: ws.createdAt } : null;
  }

  async listByOwner(ownerId: string, skip = 0, take = 50): Promise<WorkspaceOut[]> {
    const list = await prisma.workspace.findMany({
      where: { ownerId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
    return list.map((ws) => ({ id: ws.id, name: ws.name, ownerId: ws.ownerId, createdAt: ws.createdAt }));
  }

  /**
   * List workspaces the user can access.
   * - Owner: always sees their workspaces.
   * - Non-owner: sees a workspace if they have access to any repo in it (at least one repo membership).
   * When they open the workspace, only repos they have access to are shown (see repository list filtering).
   */
  async listForUser(userId: string, skip = 0, take = 50): Promise<WorkspaceOut[]> {
    const ownedList = await prisma.workspace.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });
    const ownedIds = new Set(ownedList.map((w) => w.id));

    const fromRepoMembership = await prisma.repositoryMember.findMany({
      where: { userId },
      select: { repository: { select: { workspaceId: true } } },
    });
    const workspaceIdsFromMembership = [...new Set(fromRepoMembership.map((m) => m.repository.workspaceId))].filter(
      (id) => !ownedIds.has(id)
    );

    if (workspaceIdsFromMembership.length === 0 && ownedList.length === 0) {
      return [];
    }

    const combined: WorkspaceOut[] = ownedList.map((ws) => ({
      id: ws.id,
      name: ws.name,
      ownerId: ws.ownerId,
      createdAt: ws.createdAt,
    }));

    if (workspaceIdsFromMembership.length > 0) {
      const otherList = await prisma.workspace.findMany({
        where: { id: { in: workspaceIdsFromMembership } },
        orderBy: { createdAt: "desc" },
      });
      for (const ws of otherList) {
        combined.push({ id: ws.id, name: ws.name, ownerId: ws.ownerId, createdAt: ws.createdAt });
      }
      combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return combined.slice(skip, skip + take);
  }

  /** True if user can access workspace: owner or has at least one repo membership in the workspace. */
  async hasAccess(workspaceId: string, userId: string): Promise<boolean> {
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });
    if (!ws) return false;
    if (ws.ownerId === userId) return true;
    const member = await prisma.repositoryMember.findFirst({
      where: {
        userId,
        repository: { workspaceId },
      },
    });
    return !!member;
  }

  /** List all workspaces (for ADMIN only). */
  async listAll(skip = 0, take = 50): Promise<WorkspaceOut[]> {
    const list = await prisma.workspace.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
    return list.map((ws) => ({ id: ws.id, name: ws.name, ownerId: ws.ownerId, createdAt: ws.createdAt }));
  }

  /** Delete a workspace and all its repositories (and their branches, commits, files, etc.). */
  async delete(id: string): Promise<boolean> {
    const ws = await prisma.workspace.findUnique({ where: { id } });
    if (!ws) return false;
    const repos = await prisma.repository.findMany({ where: { workspaceId: id }, select: { id: true } });
    const repoService = new RepositoryService();
    for (const r of repos) {
      await repoService.delete(r.id);
    }
    await prisma.workspace.delete({ where: { id } });
    return true;
  }
}
