import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { SimulateService } from "../../modules/simulate/simulate.service";
import { BlobService, BranchService, CommitService, TreeService } from "../../modules/vcs-engine/index";
import { simulateBodySchema } from "../validations/simulate.validator";

export class SimulateController {
  public router: Router;
  private simulateService: SimulateService;

  constructor() {
    this.router = Router();
    this.simulateService = new SimulateService(
      new BlobService(),
      new BranchService(),
      new CommitService(),
      new TreeService()
    );
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", validateBody(simulateBodySchema), this.simulate.bind(this));
  }

  private async simulate(req: Request, res: Response): Promise<Response> {
    try {
      const { content, context, repositoryId, branch, decisions } = req.body as {
        content: unknown;
        context: unknown;
        repositoryId?: string;
        branch?: string;
        decisions?: Record<string, unknown>;
      };
      const output = await this.simulateService.simulate({
        content,
        context: context ?? {},
        repositoryId,
        branch,
        decisions,
      });
      return sendSuccess(res, output);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Simulation failed";
      return sendError(res, message, 500);
    }
  }
}
