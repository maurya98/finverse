import { prisma } from "../../databases/client";

export type BranchWithHead = {
  id: string;
  repositoryId: string;
  name: string;
  headCommitId: string | null;
  createdBy: string;
  createdAt: Date;
};

export class BranchService {
  async create(
    repositoryId: string,
    name: string,
    createdBy: string,
    headCommitId?: string | null
  ): Promise<BranchWithHead> {
    const branch = await prisma.branch.create({
      data: {
        repositoryId,
        name,
        createdBy,
        headCommitId: headCommitId ?? undefined,
      },
    });
    return toBranch(branch);
  }

  async findById(id: string): Promise<BranchWithHead | null> {
    const branch = await prisma.branch.findUnique({
      where: { id },
    });
    return branch ? toBranch(branch) : null;
  }

  async findByName(
    repositoryId: string,
    name: string
  ): Promise<BranchWithHead | null> {
    const branch = await prisma.branch.findUnique({
      where: { repositoryId_name: { repositoryId, name } },
    });
    return branch ? toBranch(branch) : null;
  }

  async listByRepository(
    repositoryId: string,
    skip = 0,
    take = 50
  ): Promise<BranchWithHead[]> {
    const branches = await prisma.branch.findMany({
      where: { repositoryId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
    return branches.map(toBranch);
  }

  async updateHead(
    id: string,
    headCommitId: string | null
  ): Promise<BranchWithHead | null> {
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) return null;
    const updated = await prisma.branch.update({
      where: { id },
      data: { headCommitId },
    });
    return toBranch(updated);
  }

  async delete(id: string): Promise<boolean> {
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) return false;
    await prisma.branch.delete({ where: { id } });
    return true;
  }
}

function toBranch(b: {
  id: string;
  repositoryId: string;
  name: string;
  headCommitId: string | null;
  createdBy: string;
  createdAt: Date;
}): BranchWithHead {
  return {
    id: b.id,
    repositoryId: b.repositoryId,
    name: b.name,
    headCommitId: b.headCommitId,
    createdBy: b.createdBy,
    createdAt: b.createdAt,
  };
}
