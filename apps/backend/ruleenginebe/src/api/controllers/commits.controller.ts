import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { CommitService } from "../../modules/vcs-engine/commit.service";
import { createCommitSchema, listCommitsQuerySchema } from "../validations/commit.validator";

export class CommitsController {
  public router: Router;
  private commitService: CommitService;

  constructor() {
    this.router = Router();
    this.commitService = new CommitService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", validateBody(createCommitSchema), this.create.bind(this));
    this.router.get("/list", this.list.bind(this));
    this.router.get("/:id", this.getById.bind(this));
  }

  private async create(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body as {
        repositoryId: string;
        treeId: string;
        parentCommitId?: string | null;
        mergeParentCommitId?: string | null;
        message?: string | null;
        authorId: string;
      };
      const commit = await this.commitService.create(body);
      return sendSuccess(res, commit, 201, "Commit created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create commit";
      return sendError(res, message, 500);
    }
  }

  private async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const commit = await this.commitService.findById(id);
      if (!commit) return sendError(res, "Commit not found", 404);
      return sendSuccess(res, commit);
    } catch {
      return sendError(res, "Failed to get commit", 500);
    }
  }

  private async list(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = listCommitsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "Invalid query", 400, parsed.error.errors.map((e) => ({ path: e.path.join("."), message: e.message })));
      }
      const { repositoryId, branch, skip, take } = parsed.data;
      const commits = branch
        ? await this.commitService.listByBranch(repositoryId, branch, skip ?? 0, take ?? 50)
        : await this.commitService.listByRepository(repositoryId, skip ?? 0, take ?? 50);
      return sendSuccess(res, commits);
    } catch {
      return sendError(res, "Failed to list commits", 500);
    }
  }
}
