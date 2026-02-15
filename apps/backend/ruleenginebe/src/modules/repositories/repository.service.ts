import { prisma } from "../../databases/client";

export type RepositoryOut = {
  id: string;
  name: string;
  workspaceId: string;
  isPrivate: boolean;
  defaultBranch: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class RepositoryService {
  async create(
    name: string,
    workspaceId: string,
    createdBy: string,
    defaultBranch = "main"
  ): Promise<RepositoryOut> {
    const repo = await prisma.repository.create({
      data: {
        name,
        workspaceId,
        createdBy,
        defaultBranch,
      },
    });
    await prisma.branch.create({
      data: {
        repositoryId: repo.id,
        name: defaultBranch,
        createdBy,
        headCommitId: null,
      },
    });
    return this.toOut(repo);
  }

  async findById(id: string): Promise<RepositoryOut | null> {
    const repo = await prisma.repository.findUnique({ where: { id } });
    return repo ? this.toOut(repo) : null;
  }

  async listByWorkspace(workspaceId: string, skip = 0, take = 50): Promise<RepositoryOut[]> {
    const list = await prisma.repository.findMany({
      where: { workspaceId },
      skip,
      take,
      orderBy: { updatedAt: "desc" },
    });
    return list.map((r) => this.toOut(r));
  }

  /** Delete a repository and all its VCS data (branches, commits, trees, blobs, merge requests). */
  async delete(id: string): Promise<boolean> {
    const repo = await prisma.repository.findUnique({ where: { id } });
    if (!repo) return false;

    await prisma.$transaction(async (tx) => {
      await tx.branch.updateMany({ where: { repositoryId: id }, data: { headCommitId: null } });
      await tx.mergeRequest.deleteMany({ where: { repositoryId: id } });
      await tx.branch.deleteMany({ where: { repositoryId: id } });
      await tx.commit.deleteMany({ where: { repositoryId: id } });
      await tx.treeEntry.deleteMany({ where: { tree: { repositoryId: id } } });
      await tx.tree.deleteMany({ where: { repositoryId: id } });
      await tx.blob.deleteMany({ where: { repositoryId: id } });
      await tx.repositoryMember.deleteMany({ where: { repositoryId: id } });
      await tx.repository.delete({ where: { id } });
    });
    return true;
  }

  private toOut(r: {
    id: string;
    name: string;
    workspaceId: string;
    isPrivate: boolean;
    defaultBranch: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }): RepositoryOut {
    return {
      id: r.id,
      name: r.name,
      workspaceId: r.workspaceId,
      isPrivate: r.isPrivate,
      defaultBranch: r.defaultBranch,
      createdBy: r.createdBy,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
