import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRepoAccess } from "../middlewares/repo-access.middleware";
import { SimulateService } from "../../modules/simulate/simulate.service";
import { RepositoryService } from "../../modules/repositories/repository.service";
import { BlobService, BranchService, CommitService, TreeService } from "../../modules/vcs-engine/index";
import { executeBodySchema } from "../validations/execute.validator";

export class ExecuteController {
  public router: Router;
  private simulateService: SimulateService;

  constructor() {
    this.router = Router();
    this.simulateService = new SimulateService(
      new BlobService(),
      new BranchService(),
      new CommitService(),
      new TreeService(),
      new RepositoryService()
    );
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", requireAuth, requireRepoAccess("VIEWER"), validateBody(executeBodySchema), this.execute.bind(this));
  }

  private async execute(req: Request, res: Response): Promise<Response> {
    try {
      const { repositoryId, context, branch } = req.body as {
        repositoryId: string;
        context: unknown;
        branch?: string;
      };
      const output = await this.simulateService.executeIndex(
        repositoryId,
        context ?? {},
        branch ?? "main"
      );
      return sendSuccess(res, output);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Execute failed";
      if (
        message.includes("not found") ||
        message.includes("has no commits")
      ) {
        return sendError(res, message, 404);
      }
      return sendError(res, message, 500);
    }
  }
}
