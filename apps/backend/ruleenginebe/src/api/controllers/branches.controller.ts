import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRepoAccess, setRepositoryIdFromBranchId } from "../middlewares/repo-access.middleware";
import { BranchService } from "../../modules/vcs-engine/branch.service";
import {
  createBranchSchema,
  updateBranchHeadSchema,
  listBranchesQuerySchema,
} from "../validations/branch.validator";

export class BranchesController {
  public router: Router;
  private branchService: BranchService;

  constructor() {
    this.router = Router();
    this.branchService = new BranchService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", requireAuth, requireRepoAccess("CONTRIBUTOR"), validateBody(createBranchSchema), this.create.bind(this));
    this.router.get("/list", requireAuth, requireRepoAccess("VIEWER"), this.list.bind(this));
    this.router.get("/by-name", requireAuth, requireRepoAccess("VIEWER"), this.getByName.bind(this));
    this.router.get("/:id", requireAuth, setRepositoryIdFromBranchId, requireRepoAccess("VIEWER"), this.getById.bind(this));
    this.router.patch("/:id/head", requireAuth, setRepositoryIdFromBranchId, requireRepoAccess("CONTRIBUTOR"), validateBody(updateBranchHeadSchema), this.updateHead.bind(this));
    this.router.delete("/:id", requireAuth, setRepositoryIdFromBranchId, requireRepoAccess("CONTRIBUTOR"), this.delete.bind(this));
  }

  private async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const deleted = await this.branchService.delete(id);
      if (!deleted) return sendError(res, "Branch not found", 404);
      return sendSuccess(res, undefined, 200, "Branch deleted");
    } catch {
      return sendError(res, "Failed to delete branch", 500);
    }
  }

  private async create(req: Request, res: Response): Promise<Response> {
    try {
      const { repositoryId, name, createdBy, headCommitId } = req.body as {
        repositoryId: string;
        name: string;
        createdBy: string;
        headCommitId?: string | null;
      };
      const branch = await this.branchService.create(repositoryId, name, createdBy, headCommitId);
      return sendSuccess(res, branch, 201, "Branch created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create branch";
      if (message.includes("Unique constraint")) {
        return sendError(res, "Branch with this name already exists", 409);
      }
      return sendError(res, message, 500);
    }
  }

  private async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const branch = await this.branchService.findById(id);
      if (!branch) return sendError(res, "Branch not found", 404);
      return sendSuccess(res, branch);
    } catch {
      return sendError(res, "Failed to get branch", 500);
    }
  }

  private async getByName(req: Request, res: Response): Promise<Response> {
    try {
      const repositoryId = req.query.repositoryId as string;
      const name = req.query.name as string;
      if (!repositoryId || !name) {
        return sendError(res, "repositoryId and name are required", 400);
      }
      const branch = await this.branchService.findByName(repositoryId, name);
      if (!branch) return sendError(res, "Branch not found", 404);
      return sendSuccess(res, branch);
    } catch {
      return sendError(res, "Failed to get branch", 500);
    }
  }

  private async list(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = listBranchesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "Invalid query", 400, parsed.error.errors.map((e) => ({ path: e.path.join("."), message: e.message })));
      }
      const { repositoryId, skip, take } = parsed.data;
      const branches = await this.branchService.listByRepository(repositoryId, skip ?? 0, take ?? 50);
      return sendSuccess(res, branches);
    } catch {
      return sendError(res, "Failed to list branches", 500);
    }
  }

  private async updateHead(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const { headCommitId } = req.body as { headCommitId: string | null };
      const branch = await this.branchService.updateHead(id, headCommitId);
      if (!branch) return sendError(res, "Branch not found", 404);
      return sendSuccess(res, branch, 200, "Branch head updated");
    } catch {
      return sendError(res, "Failed to update branch head", 500);
    }
  }
}
