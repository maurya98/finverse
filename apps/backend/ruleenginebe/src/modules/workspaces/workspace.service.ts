import { prisma } from "../../databases/client";

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
    return { id: ws.id, name: ws.name, ownerId: ws.ownerId, createdAt: ws.createdAt };
  }

  async findById(id: string): Promise<WorkspaceOut | null> {
    const ws = await prisma.workspace.findUnique({ where: { id } });
    return ws ? { id: ws.id, name: ws.name, ownerId: ws.ownerId, createdAt: ws.createdAt } : null;
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

  /** Delete a workspace and all its repositories (and their branches, commits, files, etc.). */
  async delete(id: string): Promise<boolean> {
    const ws = await prisma.workspace.findUnique({ where: { id } });
    if (!ws) return false;

    const repos = await prisma.repository.findMany({ where: { workspaceId: id }, select: { id: true } });
    const { RepositoryService } = await import("../repositories/repository.service.js");
    const repoService = new RepositoryService();
    for (const r of repos) {
      await repoService.delete(r.id);
    }
    await prisma.workspace.delete({ where: { id } });
    return true;
  }
}
