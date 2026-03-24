import { Request, Response, Router } from "express";
import { sendError, sendSuccess } from "@finverse/utils";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRepoAccess } from "../middlewares/repo-access.middleware";
import { listEngineLogsQuerySchema } from "../validations/engine-log.validator";
import { EngineLogService } from "../../modules/engine-logs/engine-log.service";

export class EngineLogsController {
  public router: Router;
  private engineLogService: EngineLogService;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.engineLogService = new EngineLogService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get(
      "/:repositoryId/engine-logs",
      requireAuth,
      requireRepoAccess("VIEWER"),
      this.list.bind(this)
    );
  }

  private async list(req: Request, res: Response): Promise<Response> {
    const repositoryId =
      typeof req.params.repositoryId === "string"
        ? req.params.repositoryId
        : req.params.repositoryId?.[0] ?? "";
    if (!repositoryId) return sendError(res, "repositoryId is required", 400);

    const parsed = listEngineLogsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(
        res,
        "Invalid query",
        400,
        parsed.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const { userId, skip, take } = parsed.data;
    try {
      const logs = await this.engineLogService.list({
        repositoryId,
        userId: userId != null ? BigInt(userId) : undefined,
        skip: skip ?? 0,
        take: take ?? 50,
      });
      return sendSuccess(res, logs);
    } catch {
      return sendError(res, "Failed to list engine logs", 500);
    }
  }
}
