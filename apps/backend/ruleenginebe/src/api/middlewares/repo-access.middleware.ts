import { Request, Response, NextFunction } from "express";
import { RepositoryMembersService } from "../../modules/repository-members/repository-members.service";

const membersService = new RepositoryMembersService();

export type RepoAccessSource = "params" | "body" | "query";

/**
 * Require the authenticated user to have at least minRole on the repository.
 * Reads repositoryId from req.repositoryIdForAccess (set by a previous middleware), req.params.repositoryId, req.params.id, req.body.repositoryId, or req.query.repositoryId.
 * Sets req.repoRole on success. Use after requireAuth.
 */
export function requireRepoAccess(minRole: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authorization required" });
      return;
    }
    const repositoryId =
      (req as Request & { repositoryIdForAccess?: string }).repositoryIdForAccess ||
      (req.params as Record<string, string>).repositoryId ||
      (req.params as Record<string, string>).id ||
      (req.body as Record<string, string>)?.repositoryId ||
      (req.query as Record<string, string>)?.repositoryId;
    if (!repositoryId) {
      res.status(400).json({ success: false, message: "repositoryId is required" });
      return;
    }
    const member = await membersService.getMember(repositoryId, req.user.id);
    if (!member) {
      res.status(403).json({ success: false, message: "You do not have access to this repository" });
      return;
    }
    if (!RepositoryMembersService.hasAtLeastRole(member.role, minRole)) {
      res.status(403).json({
        success: false,
        message: `This action requires repository role ${minRole} or higher`,
      });
      return;
    }
    req.repoRole = member.role;
    next();
  };
}

/**
 * Resolve repositoryId from a merge request id and check that the user has at least minRole.
 * Use in merge-request handlers where the route param is MR id. Returns repositoryId and role, or null if forbidden/not found.
 */
export async function getRepoAccessFromMergeRequestId(
  mergeRequestId: string,
  userId: string,
  minRole: string
): Promise<{ repositoryId: string; role: string } | null> {
  const { prisma } = await import("../../databases/client");
  const mr = await prisma.mergeRequest.findUnique({
    where: { id: mergeRequestId },
    select: { repositoryId: true },
  });
  if (!mr) return null;
  const member = await membersService.getMember(mr.repositoryId, userId);
  if (!member || !RepositoryMembersService.hasAtLeastRole(member.role, minRole)) return null;
  return { repositoryId: mr.repositoryId, role: member.role };
}

/**
 * Load branch by params.id and set req.repositoryIdForAccess. Use before requireRepoAccess on branch :id routes.
 * Sends 404 if branch not found.
 */
export async function setRepositoryIdFromBranchId(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = (req.params as Record<string, string>).id;
  if (!id) {
    res.status(400).json({ success: false, message: "Branch id is required" });
    return;
  }
  try {
    const { prisma } = await import("../../databases/client");
    const branch = await prisma.branch.findUnique({ where: { id }, select: { repositoryId: true } });
    if (!branch) {
      res.status(404).json({ success: false, message: "Branch not found" });
      return;
    }
    (req as Request & { repositoryIdForAccess?: string }).repositoryIdForAccess = branch.repositoryId;
    next();
  } catch {
    res.status(500).json({ success: false, message: "Failed to load branch" });
  }
}

async function setRepositoryIdFromResource(
  req: Request,
  res: Response,
  next: NextFunction,
  findOne: (id: string) => Promise<{ repositoryId: string } | null>,
  paramKey: string,
  notFoundMessage: string
): Promise<void> {
  const id = (req.params as Record<string, string>)[paramKey];
  if (!id) {
    res.status(400).json({ success: false, message: "Resource id is required" });
    return;
  }
  try {
    const row = await findOne(id);
    if (!row) {
      res.status(404).json({ success: false, message: notFoundMessage });
      return;
    }
    (req as Request & { repositoryIdForAccess?: string }).repositoryIdForAccess = row.repositoryId;
    next();
  } catch {
    res.status(500).json({ success: false, message: "Failed to load resource" });
  }
}

export async function setRepositoryIdFromTreeId(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { prisma } = await import("../../databases/client");
  await setRepositoryIdFromResource(
    req,
    res,
    next,
    (id) => prisma.tree.findUnique({ where: { id }, select: { repositoryId: true } }),
    "id",
    "Tree not found"
  );
}

export async function setRepositoryIdFromCommitId(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { prisma } = await import("../../databases/client");
  await setRepositoryIdFromResource(
    req,
    res,
    next,
    (id) => prisma.commit.findUnique({ where: { id }, select: { repositoryId: true } }),
    "id",
    "Commit not found"
  );
}

export async function setRepositoryIdFromBlobId(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { prisma } = await import("../../databases/client");
  await setRepositoryIdFromResource(
    req,
    res,
    next,
    (id) => prisma.blob.findUnique({ where: { id }, select: { repositoryId: true } }),
    "id",
    "Blob not found"
  );
}

export async function setRepositoryIdFromMergeRequestId(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = (req.params as Record<string, string>).id;
  if (!id) {
    res.status(400).json({ success: false, message: "Merge request id is required" });
    return;
  }
  try {
    const { prisma } = await import("../../databases/client");
    const mr = await prisma.mergeRequest.findUnique({ where: { id }, select: { repositoryId: true } });
    if (!mr) {
      res.status(404).json({ success: false, message: "Merge request not found" });
      return;
    }
    (req as Request & { repositoryIdForAccess?: string }).repositoryIdForAccess = mr.repositoryId;
    next();
  } catch {
    res.status(500).json({ success: false, message: "Failed to load merge request" });
  }
}
