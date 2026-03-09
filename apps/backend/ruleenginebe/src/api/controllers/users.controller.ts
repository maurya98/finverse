import { Request, Response, Router } from "express";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import { UserService } from "../../modules/users/user.service";
import { createUserSchema, updateUserSchema, updateProfileSchema } from "../validations/user.validator";

export class UsersController {
  public router: Router;
  private userService: UserService;

  constructor() {
    this.router = Router();
    this.userService = new UserService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get("/me", requireAuth, this.getMe.bind(this));
    this.router.patch("/me", requireAuth, validateBody(updateProfileSchema), this.updateMe.bind(this));
    this.router.get("/", requireAuth, requireAdmin, this.list.bind(this));
    this.router.get("/:id", requireAuth, this.getById.bind(this));
    this.router.post("/", requireAuth, requireAdmin, validateBody(createUserSchema), this.create.bind(this));
    this.router.patch("/:id", requireAuth, requireAdmin, validateBody(updateUserSchema), this.update.bind(this));
    this.router.delete("/:id", requireAuth, requireAdmin, this.delete.bind(this));
  }

  private async getMe(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.user!.id;
      const user = await this.userService.findById(id);
      if (!user) {
        return sendError(res, "User not found", 404);
      }
      return sendSuccess(res, user);
    } catch {
      return sendError(res, "Failed to get profile", 500);
    }
  }

  private async updateMe(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.user!.id;
      const user = await this.userService.updateProfile(id, req.body);
      if (!user) {
        return sendError(res, "User not found", 404);
      }
      return sendSuccess(res, user, 200, "Profile updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      if (message === "Current password is incorrect" || message === "Current password is required to change password") {
        return sendError(res, message, 400);
      }
      return sendError(res, "Failed to update profile", 500);
    }
  }

  private async list(req: Request, res: Response): Promise<Response> {
    try {
      const skip = Math.max(0, Number(req.query.skip) || 0);
      const take = Math.min(100, Math.max(1, Number(req.query.take) || 50));
      const users = await this.userService.findAll(skip, take);
      return sendSuccess(res, users);
    } catch {
      return sendError(res, "Failed to list users", 500);
    }
  }

  private async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const user = await this.userService.findById(id);
      if (!user) {
        return sendError(res, "User not found", 404);
      }
      return sendSuccess(res, user);
    } catch {
      return sendError(res, "Failed to get user", 500);
    }
  }

  private async create(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.userService.create(req.body);
      return sendSuccess(res, user, 201, "User created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      if (message === "User with this email already exists") {
        return sendError(res, message, 409);
      }
      return sendError(res, "Failed to create user", 500);
    }
  }

  private async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const user = await this.userService.update(id, req.body);
      if (!user) {
        return sendError(res, "User not found", 404);
      }
      return sendSuccess(res, user, 200, "User updated");
    } catch {
      return sendError(res, "Failed to update user", 500);
    }
  }

  private async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
      const deleted = await this.userService.delete(id);
      if (!deleted) {
        return sendError(res, "User not found", 404);
      }
      return sendSuccess(res, undefined, 200, "User deleted");
    } catch {
      return sendError(res, "Failed to delete user", 500);
    }
  }
}
