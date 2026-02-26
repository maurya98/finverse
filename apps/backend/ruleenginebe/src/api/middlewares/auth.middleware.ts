import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../modules/auth/auth.service";

const authService = new AuthService();

export type AuthUser = { id: string; role: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      /** Set by requireRepoAccess: current user's role on the repository. */
      repoRole?: string;
      /** Set by a middleware (e.g. from branch/commit) for requireRepoAccess. */
      repositoryIdForAccess?: string;
    }
  }
}

/**
 * Require valid JWT. Sets req.user = { id: sub, role }.
 * Responds 401 if missing or invalid token.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const raw = req.headers.authorization;
  const token = raw?.startsWith("Bearer ") ? raw.slice(7) : null;
  if (!token) {
    res.status(401).json({ success: false, message: "Authorization required" });
    return;
  }
  const payload = authService.verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }
  req.user = { id: payload.sub, role: payload.role };
  next();
}

const ALLOWED_MERGE_ROLES = ["ADMIN", "MAINTAINER"];

/**
 * Require req.user.role to be ADMIN or MAINTAINER. Use after requireAuth.
 */
export function requireMergePermission(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authorization required" });
    return;
  }
  if (!ALLOWED_MERGE_ROLES.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      message: "Only maintainers or admins can approve and merge merge requests",
    });
    return;
  }
  next();
}
