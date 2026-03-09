import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import { WorkspaceService } from "../../modules/workspaces/workspace.service";
import { createWorkspaceSchema, listWorkspacesQuerySchema } from "../validations/workspace.validator";

export class WorkspacesController {
  public router: Router;
  private workspaceService: WorkspaceService;

  constructor() {
    this.router = Router();
    this.workspaceService = new WorkspaceService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", requireAuth, validateBody(createWorkspaceSchema), this.create.bind(this));
    this.router.get("/list", requireAuth, this.list.bind(this));
    this.router.get("/:id", requireAuth, this.getById.bind(this));
    this.router.delete("/:id", requireAuth, this.delete.bind(this));
  }

  private async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.body as { name: string; ownerId: string };
      const ownerId = req.user!.id;
      const ws = await this.workspaceService.create(name, ownerId);
      return sendSuccess(res, ws, 201, "Workspace created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create workspace";
      return sendError(res, message, 500);
    }
  }

  private async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const ws = await this.workspaceService.findById(id);
      if (!ws) return sendError(res, "Workspace not found", 404);
      const hasAccess = await this.workspaceService.hasAccess(id, req.user!.id);
      if (!hasAccess) {
        return sendError(res, "You do not have access to this workspace", 403);
      }
      return sendSuccess(res, ws);
    } catch {
      return sendError(res, "Failed to get workspace", 500);
    }
  }

  private async list(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = listWorkspacesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "Invalid query", 400, parsed.error.errors.map((e) => ({ path: e.path.join("."), message: e.message })));
      }
      const { skip, take, all } = parsed.data;
      const userId = req.user!.id;
      const isAdmin = req.user!.role === "ADMIN";
      const list = all && isAdmin
        ? await this.workspaceService.listAll(skip ?? 0, take ?? 50)
        : await this.workspaceService.listForUser(userId, skip ?? 0, take ?? 50);
      return sendSuccess(res, list);
    } catch {
      return sendError(res, "Failed to list workspaces", 500);
    }
  }

  private async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const ws = await this.workspaceService.findById(id);
      if (!ws) return sendError(res, "Workspace not found", 404);
      if (ws.ownerId !== req.user!.id) {
        return sendError(res, "Only the workspace owner can delete it", 403);
      }
      const deleted = await this.workspaceService.delete(id);
      if (!deleted) return sendError(res, "Workspace not found", 404);
      return sendSuccess(res, undefined, 200, "Workspace deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete workspace";
      return sendError(res, message, 500);
    }
  }
}
