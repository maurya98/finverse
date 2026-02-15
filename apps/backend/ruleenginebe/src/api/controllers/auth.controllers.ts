import { Request, Response, Router } from "express";
import { loginSchema } from "../validations/auth.validator";
import { validateBody } from "@finverse/utils";
import { sendSuccess, sendError } from "@finverse/utils";
import { AuthService } from "../../modules/auth/auth.service";

export class AuthController {
  public router: Router;
  private authService: AuthService;

  constructor() {
    this.router = Router();
    this.authService = new AuthService();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/login", validateBody(loginSchema), this.login.bind(this));
    this.router.post("/logout", this.logout.bind(this));
  }

  private async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      return sendSuccess(res, result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message === "Invalid email or password") {
        return sendError(res, message, 401);
      }
      return sendError(res, "Login failed", 500);
    }
  }

  private async logout(req: Request, res: Response): Promise<Response> {
    try {
      const token =
        req.body?.token ??
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.slice(7)
          : null);
      await this.authService.logout(token ?? "");
      return sendSuccess(res, undefined, 200, "Logged out successfully");
    } catch {
      return sendError(res, "Logout failed", 500);
    }
  }
}