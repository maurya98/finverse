import { prisma } from "../../databases/client.js";

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
}
