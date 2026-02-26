import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRepoAccess, setRepositoryIdFromTreeId } from "../middlewares/repo-access.middleware";
import { TreeService } from "../../modules/vcs-engine/tree.service";
import {
  createTreeSchema,
  addTreeEntrySchema,
  listTreesQuerySchema,
} from "../validations/tree.validator";

export class TreesController {
  public router: Router;
  private treeService: TreeService;

  constructor() {
    this.router = Router();
    this.treeService = new TreeService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", requireAuth, requireRepoAccess("CONTRIBUTOR"), validateBody(createTreeSchema), this.create.bind(this));
    this.router.get("/list", requireAuth, requireRepoAccess("VIEWER"), this.list.bind(this));
    this.router.get("/:id", requireAuth, setRepositoryIdFromTreeId, requireRepoAccess("VIEWER"), this.getById.bind(this));
    this.router.post("/:id/entries", requireAuth, setRepositoryIdFromTreeId, requireRepoAccess("CONTRIBUTOR"), validateBody(addTreeEntrySchema), this.addEntry.bind(this));
    this.router.delete("/:id/entries/:entryId", requireAuth, setRepositoryIdFromTreeId, requireRepoAccess("CONTRIBUTOR"), this.removeEntry.bind(this));
    this.router.patch("/:id/entries/:entryId", requireAuth, setRepositoryIdFromTreeId, requireRepoAccess("CONTRIBUTOR"), this.updateEntry.bind(this));
  }

  private async create(req: Request, res: Response): Promise<Response> {
    try {
      const { repositoryId, entries } = req.body as { repositoryId: string; entries?: Array<{ name: string; type: "BLOB" | "TREE"; blobId?: string; childTreeId?: string }> };
      const tree = await this.treeService.create(repositoryId, entries ?? []);
      return sendSuccess(res, tree, 201, "Tree created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create tree";
      return sendError(res, message, 500);
    }
  }

  private async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const tree = await this.treeService.findById(id);
      if (!tree) return sendError(res, "Tree not found", 404);
      return sendSuccess(res, tree);
    } catch {
      return sendError(res, "Failed to get tree", 500);
    }
  }

  private async list(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = listTreesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "Invalid query", 400, parsed.error.errors.map((e) => ({ path: e.path.join("."), message: e.message })));
      }
      const { repositoryId, skip, take } = parsed.data;
      const trees = await this.treeService.listByRepository(repositoryId, skip ?? 0, take ?? 50);
      return sendSuccess(res, trees);
    } catch {
      return sendError(res, "Failed to list trees", 500);
    }
  }

  private async addEntry(req: Request, res: Response): Promise<Response> {
    try {
      const treeId = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const entry = req.body as { name: string; type: "BLOB" | "TREE"; blobId?: string; childTreeId?: string };
      const tree = await this.treeService.addEntry(treeId, entry);
      if (!tree) return sendError(res, "Tree not found", 404);
      return sendSuccess(res, tree, 200, "Entry added");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add entry";
      return sendError(res, message, 500);
    }
  }

  private async removeEntry(req: Request, res: Response): Promise<Response> {
    try {
      const treeId = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const entryId = typeof req.params.entryId === "string" ? req.params.entryId : req.params.entryId?.[0] ?? "";
      const tree = await this.treeService.removeEntry(treeId, entryId);
      if (!tree) return sendError(res, "Tree or entry not found", 404);
      return sendSuccess(res, tree, 200, "Entry removed");
    } catch {
      return sendError(res, "Failed to remove entry", 500);
    }
  }

  private async updateEntry(req: Request, res: Response): Promise<Response> {
    try {
      const treeId = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const entryId = typeof req.params.entryId === "string" ? req.params.entryId : req.params.entryId?.[0] ?? "";
      const body = req.body as { name?: string; blobId?: string | null; childTreeId?: string | null };
      const tree = await this.treeService.updateEntry(treeId, entryId, body);
      if (!tree) return sendError(res, "Tree or entry not found", 404);
      return sendSuccess(res, tree, 200, "Entry updated");
    } catch {
      return sendError(res, "Failed to update entry", 500);
    }
  }
}
