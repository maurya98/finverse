import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { BlobService } from "../../modules/vcs-engine/blob.service.js";
import { createBlobSchema, listBlobsQuerySchema } from "../validations/blob.validator.js";

export class BlobsController {
  public router: Router;
  private blobService: BlobService;

  constructor() {
    this.router = Router();
    this.blobService = new BlobService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", validateBody(createBlobSchema), this.create.bind(this));
    this.router.get("/by-hash", this.getByHash.bind(this));
    this.router.get("/list", this.list.bind(this));
    this.router.get("/:id", this.getById.bind(this));
  }

  private async create(req: Request, res: Response): Promise<Response> {
    try {
      const { repositoryId, content } = req.body as { repositoryId: string; content: unknown };
      const blob = await this.blobService.create(repositoryId, content);
      return sendSuccess(res, blob, 201, "Blob created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create blob";
      return sendError(res, message, 500);
    }
  }

  private async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const blob = await this.blobService.findById(id);
      if (!blob) return sendError(res, "Blob not found", 404);
      return sendSuccess(res, blob);
    } catch {
      return sendError(res, "Failed to get blob", 500);
    }
  }

  private async getByHash(req: Request, res: Response): Promise<Response> {
    try {
      const repositoryId = req.query.repositoryId as string;
      const contentHash = req.query.contentHash as string;
      if (!repositoryId || !contentHash) {
        return sendError(res, "repositoryId and contentHash are required", 400);
      }
      const blob = await this.blobService.findByRepositoryAndHash(repositoryId, contentHash);
      if (!blob) return sendError(res, "Blob not found", 404);
      return sendSuccess(res, blob);
    } catch {
      return sendError(res, "Failed to get blob", 500);
    }
  }

  private async list(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = listBlobsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "Invalid query", 400, parsed.error.errors.map((e) => ({ path: e.path.join("."), message: e.message })));
      }
      const { repositoryId, skip, take } = parsed.data;
      const blobs = await this.blobService.listByRepository(repositoryId, skip ?? 0, take ?? 50);
      return sendSuccess(res, blobs);
    } catch {
      return sendError(res, "Failed to list blobs", 500);
    }
  }
}
