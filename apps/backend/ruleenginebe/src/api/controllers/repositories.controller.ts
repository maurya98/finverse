import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRepoAccess } from "../middlewares/repo-access.middleware";
import { RepositoryService } from "../../modules/repositories/repository.service";
import { WorkspaceService } from "../../modules/workspaces/workspace.service";
import { RepositoryMembersService } from "../../modules/repository-members/repository-members.service";
import { createRepositorySchema, listRepositoriesQuerySchema } from "../validations/repository.validator";

export class RepositoriesController {
  public router: Router;
  private repositoryService: RepositoryService;
  private workspaceService: WorkspaceService;
  private membersService: RepositoryMembersService;

  constructor() {
    this.router = Router();
    this.repositoryService = new RepositoryService();
    this.workspaceService = new WorkspaceService();
    this.membersService = new RepositoryMembersService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", requireAuth, validateBody(createRepositorySchema), this.create.bind(this));
    this.router.get("/list", requireAuth, this.list.bind(this));
    this.router.get("/:id", requireAuth, requireRepoAccess("VIEWER"), this.getById.bind(this));
    this.router.delete("/:id", requireAuth, requireRepoAccess("ADMIN"), this.delete.bind(this));
  }

  private async create(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body as { name: string; workspaceId: string; createdBy?: string; defaultBranch?: string };
      const workspace = await this.workspaceService.findById(body.workspaceId);
      if (!workspace) return sendError(res, "Workspace not found", 404);
      if (workspace.ownerId !== req.user!.id) {
        return sendError(res, "Only the workspace owner can create repositories", 403);
      }
      const createdBy = req.user!.id;
      const repo = await this.repositoryService.create(
        body.name,
        body.workspaceId,
        createdBy,
        body.defaultBranch ?? "main"
      );
      return sendSuccess(res, repo, 201, "Repository created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create repository";
      if (message.includes("Unique constraint") || message.includes("unique")) {
        return sendError(res, "Repository with this name already exists in the workspace", 409);
      }
      return sendError(res, message, 500);
    }
  }

  private async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const repo = await this.repositoryService.findById(id);
      if (!repo) return sendError(res, "Repository not found", 404);
      const data = repo as Record<string, unknown>;
      if (req.repoRole) data.currentUserRole = req.repoRole;
      return sendSuccess(res, data);
    } catch {
      return sendError(res, "Failed to get repository", 500);
    }
  }

  private async list(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = listRepositoriesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "Invalid query", 400, parsed.error.errors.map((e) => ({ path: e.path.join("."), message: e.message })));
      }
      const { workspaceId, skip, take } = parsed.data;
      const workspace = await this.workspaceService.findById(workspaceId);
      if (!workspace) return sendError(res, "Workspace not found", 404);
      if (workspace.ownerId !== req.user!.id) {
        return sendError(res, "You do not have access to this workspace", 403);
      }
      const list = await this.repositoryService.listByWorkspace(workspaceId, skip ?? 0, take ?? 50);
      const repoIds = list.map((r) => r.id);
      const rolesByRepo = await this.membersService.getRolesForUserInRepositories(req.user!.id, repoIds);
      const data = list.map((repo) => {
        const out = { ...repo } as Record<string, unknown>;
        const role = rolesByRepo[repo.id];
        if (role) out.currentUserRole = role;
        return out;
      });
      return sendSuccess(res, data);
    } catch {
      return sendError(res, "Failed to list repositories", 500);
    }
  }

  private async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const deleted = await this.repositoryService.delete(id);
      if (!deleted) return sendError(res, "Repository not found", 404);
      return sendSuccess(res, undefined, 200, "Repository deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete repository";
      return sendError(res, message, 500);
    }
  }
}
