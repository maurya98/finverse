import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRepoAccess, setRepositoryIdFromCommitId } from "../middlewares/repo-access.middleware";
import { CommitService } from "../../modules/vcs-engine/commit.service";
import { DiffService } from "../../modules/vcs-engine/diff.service";
import { BlobService } from "../../modules/vcs-engine/blob.service";
import { createCommitSchema, listCommitsQuerySchema } from "../validations/commit.validator";

export class CommitsController {
  public router: Router;
  private commitService: CommitService;
  private diffService: DiffService;
  private blobService: BlobService;

  constructor() {
    this.router = Router();
    this.commitService = new CommitService();
    this.diffService = new DiffService();
    this.blobService = new BlobService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", requireAuth, requireRepoAccess("CONTRIBUTOR"), validateBody(createCommitSchema), this.create.bind(this));
    this.router.get("/list", requireAuth, requireRepoAccess("VIEWER"), this.list.bind(this));
    this.router.get("/:id/diff", requireAuth, setRepositoryIdFromCommitId, requireRepoAccess("VIEWER"), this.getDiff.bind(this));
    this.router.get("/:id", requireAuth, setRepositoryIdFromCommitId, requireRepoAccess("VIEWER"), this.getById.bind(this));
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

  /**
   * GET /commits/:id/diff — diff this commit against its parent.
   * Query: includeContent=true to include blob content for line-by-line diff view.
   */
  private async getDiff(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const includeContent = req.query.includeContent === "true";
      const diff = await this.diffService.diffCommitWithParent(id);
      if (diff === null) return sendError(res, "Commit not found", 404);

      if (includeContent) {
        const added = await Promise.all(
          diff.added.map(async (a) => {
            const blob = await this.blobService.findById(a.blobId);
            return { ...a, content: blob?.content ?? null };
          })
        );
        const removed = await Promise.all(
          diff.removed.map(async (r) => {
            const blob = await this.blobService.findById(r.blobId);
            return { ...r, content: blob?.content ?? null };
          })
        );
        const modified = await Promise.all(
          diff.modified.map(async (m) => {
            const [baseBlob, targetBlob] = await Promise.all([
              this.blobService.findById(m.base.blobId),
              this.blobService.findById(m.target.blobId),
            ]);
            return {
              ...m,
              base: { ...m.base, content: baseBlob?.content ?? null },
              target: { ...m.target, content: targetBlob?.content ?? null },
            };
          })
        );
        return sendSuccess(res, { added, removed, modified });
      }

      return sendSuccess(res, diff);
    } catch {
      return sendError(res, "Failed to get commit diff", 500);
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
