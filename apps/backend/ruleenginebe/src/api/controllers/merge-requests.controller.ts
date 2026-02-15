import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { MergeRequestService } from "../../modules/vcs-engine/merge.service";
import { DiffService } from "../../modules/vcs-engine/diff.service";
import {
  createMergeRequestSchema,
  updateMergeRequestStatusSchema,
  mergeMergeRequestSchema,
  addMergeRequestCommentSchema,
  listMergeRequestsQuerySchema,
} from "../validations/merge-request.validator";

export class MergeRequestsController {
  public router: Router;
  private mergeRequestService: MergeRequestService;
  private diffService: DiffService;

  constructor() {
    this.router = Router();
    this.mergeRequestService = new MergeRequestService();
    this.diffService = new DiffService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", validateBody(createMergeRequestSchema), this.create.bind(this));
    this.router.get("/list", this.list.bind(this));
    this.router.get("/diff", this.diffBranches.bind(this));
    this.router.get("/diff/commits", this.diffCommits.bind(this));
    this.router.get("/:id", this.getById.bind(this));
    this.router.get("/:id/diff", this.getMrDiff.bind(this));
    this.router.patch("/:id/status", validateBody(updateMergeRequestStatusSchema), this.updateStatus.bind(this));
    this.router.post("/:id/merge", validateBody(mergeMergeRequestSchema), this.merge.bind(this));
    this.router.get("/:id/comments", this.listComments.bind(this));
    this.router.post("/:id/comments", validateBody(addMergeRequestCommentSchema), this.addComment.bind(this));
  }

  private async create(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body as {
        repositoryId: string;
        sourceBranchId: string;
        targetBranchId: string;
        title: string;
        description?: string | null;
        createdBy: string;
      };
      const mr = await this.mergeRequestService.create(body);
      return sendSuccess(res, mr, 201, "Merge request created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create merge request";
      return sendError(res, message, 500);
    }
  }

  private async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const mr = await this.mergeRequestService.findById(id);
      if (!mr) return sendError(res, "Merge request not found", 404);
      return sendSuccess(res, mr);
    } catch {
      return sendError(res, "Failed to get merge request", 500);
    }
  }

  private async list(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = listMergeRequestsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "Invalid query", 400, parsed.error.errors.map((e) => ({ path: e.path.join("."), message: e.message })));
      }
      const { repositoryId, status, skip, take } = parsed.data;
      const list = status
        ? await this.mergeRequestService.listByStatus(repositoryId, status, skip ?? 0, take ?? 50)
        : await this.mergeRequestService.listByRepository(repositoryId, skip ?? 0, take ?? 50);
      return sendSuccess(res, list);
    } catch {
      return sendError(res, "Failed to list merge requests", 500);
    }
  }

  /**
   * GET /diff/commits?baseCommitId=&targetCommitId=
   * Returns diff between two commits.
   */
  private async diffCommits(req: Request, res: Response): Promise<Response> {
    try {
      const baseCommitId = req.query.baseCommitId as string;
      const targetCommitId = req.query.targetCommitId as string;
      if (!baseCommitId || !targetCommitId) {
        return sendError(res, "baseCommitId and targetCommitId are required", 400);
      }
      const diff = await this.diffService.diffCommits(baseCommitId, targetCommitId);
      if (diff === null) {
        return sendError(res, "One or both commits not found", 404);
      }
      return sendSuccess(res, diff);
    } catch {
      return sendError(res, "Failed to compute diff", 500);
    }
  }

  /**
   * GET /diff?repositoryId=&baseBranch=&targetBranch=
   * Returns diff between two branch heads.
   */
  private async diffBranches(req: Request, res: Response): Promise<Response> {
    try {
      const repositoryId = req.query.repositoryId as string;
      const baseBranch = req.query.baseBranch as string;
      const targetBranch = req.query.targetBranch as string;
      if (!repositoryId || !baseBranch || !targetBranch) {
        return sendError(res, "repositoryId, baseBranch, and targetBranch are required", 400);
      }
      const diff = await this.diffService.diffBranches(repositoryId, baseBranch, targetBranch);
      if (diff === null) {
        return sendError(res, "One or both branches not found or have no head commit", 404);
      }
      return sendSuccess(res, diff);
    } catch {
      return sendError(res, "Failed to compute diff", 500);
    }
  }

  /**
   * GET /merge-requests/:id/diff
   * Returns diff for this MR (target branch -> source branch).
   */
  private async getMrDiff(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const branchNames = await this.mergeRequestService.getBranchNamesForDiff(id);
      if (!branchNames) return sendError(res, "Merge request or branches not found", 404);
      const diff = await this.diffService.diffBranches(
        branchNames.repositoryId,
        branchNames.targetBranchName,
        branchNames.sourceBranchName
      );
      if (diff === null) {
        return sendError(res, "One or both branches have no head commit", 404);
      }
      return sendSuccess(res, diff);
    } catch {
      return sendError(res, "Failed to compute diff", 500);
    }
  }

  private async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const { status } = req.body as { status: "OPEN" | "MERGED" | "CLOSED" };
      const mr = await this.mergeRequestService.updateStatus(id, status);
      if (!mr) return sendError(res, "Merge request not found", 404);
      return sendSuccess(res, mr, 200, "Status updated");
    } catch {
      return sendError(res, "Failed to update status", 500);
    }
  }

  private async merge(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const { mergedBy, mergedCommitId } = req.body as { mergedBy: string; mergedCommitId: string };
      const mr = await this.mergeRequestService.merge(id, mergedBy, mergedCommitId);
      if (!mr) {
        return sendError(
          res,
          "Merge request not found or already merged/closed",
          400
        );
      }
      return sendSuccess(res, mr, 200, "Merge request merged");
    } catch {
      return sendError(res, "Failed to merge", 500);
    }
  }

  private async listComments(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const skip = Math.max(0, Number(req.query.skip) || 0);
      const take = Math.min(100, Math.max(1, Number(req.query.take) || 50));
      const comments = await this.mergeRequestService.listComments(id, skip, take);
      return sendSuccess(res, comments);
    } catch {
      return sendError(res, "Failed to list comments", 500);
    }
  }

  private async addComment(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const { userId, comment } = req.body as { userId: string; comment: string };
      const c = await this.mergeRequestService.addComment(id, userId, comment);
      if (!c) return sendError(res, "Merge request not found", 404);
      return sendSuccess(res, c, 201, "Comment added");
    } catch {
      return sendError(res, "Failed to add comment", 500);
    }
  }
}
