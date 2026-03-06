import { logger } from "@finverse/logger";
import { sendError, sendSuccess } from "@finverse/utils";
import { Request, Response, Router } from "express";
import { UserService } from "../../services";
import {
  authMiddleware,
  requireMaintainer,
  requireAdmin,
} from "../middlewares";
import { Role } from "../../databases/generated/prisma";

export class UserController {
  public router: Router;
  private userService: UserService;

  constructor() {
    this.router = Router();
    this.userService = UserService.getInstance();
    this.initRoutes();
  }

  private getStringQuery(value: string | string[] | undefined): string | undefined {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
    return undefined;
  }

  private getNumberQuery(value: string | string[] | undefined, defaultValue: number): number {
    const str = this.getStringQuery(value);
    return str ? parseInt(str) : defaultValue;
  }

  private initRoutes(): void {
    // Bulk routes - ADMIN only
    this.router.post("/bulk/create", authMiddleware, requireAdmin, this.bulkCreateUsers.bind(this));
    this.router.patch("/bulk/update", authMiddleware, requireAdmin, this.bulkUpdateUsers.bind(this));
    this.router.delete("/bulk/delete", authMiddleware, requireAdmin, this.bulkDeleteUsers.bind(this));

    // Single item routes - Creator/Write operations require ADMIN or MAINTAINER
    this.router.post("/", authMiddleware, requireMaintainer, this.createUser.bind(this));
    
    // Read operations - All authenticated users
    this.router.get("/", authMiddleware, this.getAllUsers.bind(this));
    this.router.get("/role/:role", authMiddleware, this.getUsersByRole.bind(this));
    this.router.get("/search", authMiddleware, this.searchUsers.bind(this));
    this.router.get("/:id", authMiddleware, this.getUserById.bind(this));
    
    // Update operations - ADMIN and MAINTAINER
    this.router.patch("/:id", authMiddleware, requireMaintainer, this.updateUser.bind(this));
    
    // Sensitive operations - ADMIN only
    this.router.patch("/:id/toggle-status", authMiddleware, requireAdmin, this.toggleUserStatus.bind(this));
    this.router.delete("/:id", authMiddleware, requireAdmin, this.deleteUser.bind(this));
  }

  private async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        return sendError(res, "Missing required fields: email, password, name", 400);
      }

      const user = await this.userService.createUser({
        email,
        password,
        name,
        role: role || Role.USER,
      });

      logger.info({ userId: user.id, email }, "User created");
      return sendSuccess(res, user);
    } catch (error) {
      logger.error({ error }, "Create user failed");
      const message = (error as Error).message || "Failed to create user";
      return sendError(res, message, 400);
    }
  }

  private async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id as string);
      return sendSuccess(res, user);
    } catch (error) {
      logger.error({ error }, "Get user failed");
      return sendError(res, "User not found", 404);
    }
  }

  private async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const page = this.getNumberQuery(req.query.page as string | string[] | undefined, 1);
      const limit = this.getNumberQuery(req.query.limit as string | string[] | undefined, 10);
      const search = this.getStringQuery(req.query.search as string | string[] | undefined);
      const role = this.getStringQuery(req.query.role as string | string[] | undefined) as Role | undefined;
      const isActiveStr = this.getStringQuery(req.query.isActive as string | string[] | undefined);
      const isActive = isActiveStr ? isActiveStr === "true" : undefined;
      const sortBy = this.getStringQuery(req.query.sortBy as string | string[] | undefined) || "createdAt";
      const sortOrderStr = this.getStringQuery(req.query.sortOrder as string | string[] | undefined) || "desc";
      const sortOrder = (sortOrderStr === "asc" ? "asc" : "desc") as "asc" | "desc";

      const result = await this.userService.getAllUsers({
        page,
        limit,
        search,
        role,
        isActive,
        sortBy,
        sortOrder,
      });

      return sendSuccess(res, result);
    } catch (error) {
      logger.error({ error }, "Get all users failed");
      return sendError(res, "Failed to fetch users", 500);
    }
  }

  private async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { email, name, password, role, isActive } = req.body;

      const user = await this.userService.updateUser(id as string, {
        email,
        name,
        password,
        role,
        isActive,
      });

      logger.info({ userId: id }, "User updated");
      return sendSuccess(res, user);
    } catch (error) {
      logger.error({ error }, "Update user failed");
      const message = (error as Error).message || "Failed to update user";
      return sendError(res, message, 400);
    }
  }

  private async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id as string);

      logger.info({ userId: id }, "User deleted");
      return sendSuccess(res, { message: "User deleted successfully" });
    } catch (error) {
      logger.error({ error }, "Delete user failed");
      return sendError(res, "Failed to delete user", 400);
    }
  }

  private async bulkCreateUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = req.body as Array<{ email: string; password: string; name: string; role?: Role }>;

      if (!Array.isArray(users)) {
        return sendError(res, "Request body must be an array of users", 400);
      }

      const results = await this.userService.bulkCreateUsers(users);

      logger.info({ count: results.length }, "Bulk create users");
      return sendSuccess(res, results);
    } catch (error) {
      logger.error({ error }, "Bulk create users failed");
      return sendError(res, "Failed to bulk create users", 400);
    }
  }

  private async bulkUpdateUsers(req: Request, res: Response): Promise<Response> {
    try {
      const updates = req.body as Array<{ id: string; data: Record<string, unknown> }>;

      if (!Array.isArray(updates)) {
        return sendError(res, "Request body must be an array of updates", 400);
      }

      const results = await this.userService.bulkUpdateUsers(updates);

      logger.info({ count: results.length }, "Bulk update users");
      return sendSuccess(res, results);
    } catch (error) {
      logger.error({ error }, "Bulk update users failed");
      return sendError(res, "Failed to bulk update users", 400);
    }
  }

  private async bulkDeleteUsers(req: Request, res: Response): Promise<Response> {
    try {
      const userIds: string[] = req.body.ids;

      if (!Array.isArray(userIds)) {
        return sendError(res, "Request body must have ids array", 400);
      }

      const results = await this.userService.bulkDeleteUsers(userIds);

      logger.info({ count: results.length }, "Bulk delete users");
      return sendSuccess(res, results);
    } catch (error) {
      logger.error({ error }, "Bulk delete users failed");
      return sendError(res, "Failed to bulk delete users", 400);
    }
  }

  private async toggleUserStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await this.userService.toggleUserStatus(id as string);

      logger.info({ userId: id, newStatus: user.isActive }, "User status toggled");
      return sendSuccess(res, user);
    } catch (error) {
      logger.error({ error }, "Toggle user status failed");
      return sendError(res, "Failed to toggle user status", 400);
    }
  }

  private async getUsersByRole(req: Request, res: Response): Promise<Response> {
    try {
      const { role } = req.params;
      const page = this.getNumberQuery(req.query.page as string | string[] | undefined, 1);
      const limit = this.getNumberQuery(req.query.limit as string | string[] | undefined, 10);

      const result = await this.userService.getUsersByRole(role as Role, {
        page,
        limit,
      });

      return sendSuccess(res, result);
    } catch (error) {
      logger.error({ error }, "Get users by role failed");
      return sendError(res, "Failed to fetch users by role", 500);
    }
  }

  private async searchUsers(req: Request, res: Response): Promise<Response> {
    try {
      const queryParam = this.getStringQuery(req.query.q as string | string[] | undefined);
      const page = this.getNumberQuery(req.query.page as string | string[] | undefined, 1);
      const limit = this.getNumberQuery(req.query.limit as string | string[] | undefined, 10);

      if (!queryParam) {
        return sendError(res, "Search query is required", 400);
      }

      const result = await this.userService.searchUsers(queryParam, {
        page,
        limit,
      });

      return sendSuccess(res, result);
    } catch (error) {
      logger.error({ error }, "Search users failed");
      return sendError(res, "Failed to search users", 500);
    }
  }
}

export default UserController;
