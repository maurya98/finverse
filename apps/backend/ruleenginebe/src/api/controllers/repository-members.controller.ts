import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRepoAccess } from "../middlewares/repo-access.middleware";
import { RepositoryMembersService } from "../../modules/repository-members/repository-members.service";
import {
  addRepositoryMemberSchema,
  updateRepositoryMemberRoleSchema,
} from "../validations/repository-members.validator";

export class RepositoryMembersController {
  public router: Router;
  private membersService: RepositoryMembersService;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.membersService = new RepositoryMembersService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get(
      "/:repositoryId/members/me",
      requireAuth,
      this.getMe.bind(this)
    );
    this.router.get(
      "/:repositoryId/members",
      requireAuth,
      requireRepoAccess("VIEWER"),
      this.list.bind(this)
    );
    this.router.post(
      "/:repositoryId/members",
      requireAuth,
      requireRepoAccess("MAINTAINER"),
      validateBody(addRepositoryMemberSchema),
      this.add.bind(this)
    );
    this.router.patch(
      "/:repositoryId/members/:userId",
      requireAuth,
      requireRepoAccess("MAINTAINER"),
      validateBody(updateRepositoryMemberRoleSchema),
      this.updateRole.bind(this)
    );
    this.router.delete(
      "/:repositoryId/members/:userId",
      requireAuth,
      requireRepoAccess("MAINTAINER"),
      this.remove.bind(this)
    );
  }

  private async list(req: Request, res: Response): Promise<Response> {
    try {
      const repositoryId = req.params.repositoryId as string;
      const list = await this.membersService.listByRepository(repositoryId);
      return sendSuccess(res, list);
    } catch {
      return sendError(res, "Failed to list repository members", 500);
    }
  }

  private async getMe(req: Request, res: Response): Promise<Response> {
    try {
      const repositoryId = req.params.repositoryId as string;
      const userId = req.user!.id;
      const member = await this.membersService.getMember(repositoryId, userId);
      if (!member) return sendError(res, "You are not a member of this repository", 404);
      return sendSuccess(res, { role: member.role });
    } catch {
      return sendError(res, "Failed to get your role", 500);
    }
  }

  private async add(req: Request, res: Response): Promise<Response> {
    try {
      const repositoryId = req.params.repositoryId as string;
      const { userId, role } = req.body as { userId: string; role: string };
      const existing = await this.membersService.getMember(repositoryId, userId);
      if (existing) {
        return sendError(res, "User is already a member of this repository", 409);
      }
      const member = await this.membersService.add(repositoryId, userId, role, req.user!.id);
      return sendSuccess(res, member, 201, "Member added");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add member";
      if (message.includes("Foreign key") || message.includes("user")) {
        return sendError(res, "User not found", 404);
      }
      return sendError(res, message, 500);
    }
  }

  private async updateRole(req: Request, res: Response): Promise<Response> {
    try {
      const repositoryId = req.params.repositoryId as string;
      const userId = req.params.userId as string;
      const { role } = req.body as { role: string };
      const adminCount = await this.membersService.countAdmins(repositoryId);
      const current = await this.membersService.getMember(repositoryId, userId);
      if (!current) return sendError(res, "Member not found", 404);
      if (current.role === "ADMIN" && adminCount <= 1 && role !== "ADMIN") {
        return sendError(res, "Cannot demote the last admin", 400);
      }
      const member = await this.membersService.updateRole(repositoryId, userId, role);
      return sendSuccess(res, member, 200, "Role updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update role";
      if (message.includes("Record to update not found")) {
        return sendError(res, "Member not found", 404);
      }
      return sendError(res, message, 500);
    }
  }

  private async remove(req: Request, res: Response): Promise<Response> {
    try {
      const repositoryId = req.params.repositoryId as string;
      const userId = req.params.userId as string;
      const adminCount = await this.membersService.countAdmins(repositoryId);
      const current = await this.membersService.getMember(repositoryId, userId);
      if (!current) return sendError(res, "Member not found", 404);
      if (current.role === "ADMIN" && adminCount <= 1) {
        return sendError(res, "Cannot remove the last admin", 400);
      }
      const removed = await this.membersService.remove(repositoryId, userId);
      if (!removed) return sendError(res, "Member not found", 404);
      return sendSuccess(res, undefined, 200, "Member removed");
    } catch {
      return sendError(res, "Failed to remove member", 500);
    }
  }
}
