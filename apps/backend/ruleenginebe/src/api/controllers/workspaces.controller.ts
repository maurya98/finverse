import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { WorkspaceService } from "../../modules/workspaces/workspace.service.js";
import { createWorkspaceSchema, listWorkspacesQuerySchema } from "../validations/workspace.validator.js";

export class WorkspacesController {
  public router: Router;
  private workspaceService: WorkspaceService;

  constructor() {
    this.router = Router();
    this.workspaceService = new WorkspaceService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", validateBody(createWorkspaceSchema), this.create.bind(this));
    this.router.get("/list", this.list.bind(this));
    this.router.get("/:id", this.getById.bind(this));
  }

  private async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, ownerId } = req.body as { name: string; ownerId: string };
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
      const { ownerId, skip, take } = parsed.data;
      const list = await this.workspaceService.listByOwner(ownerId, skip ?? 0, take ?? 50);
      return sendSuccess(res, list);
    } catch {
      return sendError(res, "Failed to list workspaces", 500);
    }
  }
}
