import { logger } from "@finverse/logger";
import { sendError, sendSuccess } from "@finverse/utils";
import { Request, Response, Router } from "express";
import { AuthService } from "../../services";
import { authMiddleware } from "../middlewares";
import { sessionConfig } from "../../auth/config";
import "../../types/express";

export class AuthController {
  public router: Router;
  private authService: AuthService;

  constructor() {
    this.router = Router();
    this.authService = AuthService.getInstance();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/sign-up", this.signUp.bind(this));
    this.router.post("/sign-in", this.signIn.bind(this));
    this.router.post("/sign-out", authMiddleware, this.signOut.bind(this));
    this.router.post("/me", authMiddleware, this.getMe.bind(this));
  }

  private async signUp(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return sendError(res, "Missing required fields: email, password, name", 400);
      }

      const result = await this.authService.signUp({ email, password, name });

      // Set http-only cookie with configurable expiration
      res.cookie("authToken", result.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: sessionConfig.expirationMs,
      });

      logger.info({ email }, "User signed up successfully");
      return sendSuccess(res, {
        user: result.user,
        sessionId: result.session.id,
        expiresAt: result.session.expiresAt,
      });
    } catch (error) {
      logger.error({ error }, "Sign up failed");
      const message = (error as Error).message || "Sign up failed";
      return sendError(res, message, 400);
    }
  }

  private async signIn(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, "Missing required fields: email, password", 400);
      }

      const result = await this.authService.login({ email, password });

      // Set http-only cookie with configurable expiration
      res.cookie("authToken", result.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: sessionConfig.expirationMs,
      });

      logger.info({ email }, "User signed in successfully");
      return sendSuccess(res, {
        user: result.user,
        sessionId: result.session.id,
        expiresAt: result.session.expiresAt,
      });
    } catch (error) {
      logger.error({ error }, "Sign in failed");
      const message = (error as Error).message || "Sign in failed";
      return sendError(res, message, 401);
    }
  }

  private async signOut(req: Request, res: Response): Promise<Response> {
    try {
      if (req.sessionToken) {
        const { prisma } = await import("../../databases/client");
        const session = await prisma.session.findUnique({
          where: { token: req.sessionToken },
        });

        if (session) {
          await this.authService.logout(session.id);
        }
      }

      // Clear cookie
      res.clearCookie("authToken");

      logger.info("User signed out successfully");
      return sendSuccess(res, { message: "Signed out successfully" });
    } catch (error) {
      logger.error({ error }, "Sign out failed");
      res.clearCookie("authToken");
      return sendSuccess(res, { message: "Signed out successfully" });
    }
  }

  private async getMe(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return sendError(res, "Unauthorized", 401);
      }

      return sendSuccess(res, {
        user: req.user,
        session: req.session,
      });
    } catch (error) {
      logger.error({ error }, "Get me failed");
      return sendError(res, "Failed to get user info", 500);
    }
  }
}

export default AuthController;
