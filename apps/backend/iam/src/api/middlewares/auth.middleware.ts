import { Request, Response, NextFunction } from "express";
import { logger } from "@finverse/logger";
import { AuthService } from "../../services";
import { PermissionType, hasPermission } from "../../utils/permissions";
import "../../types/express";

const authService = AuthService.getInstance();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from cookies (preferred) or Authorization header (Bearer)
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.authToken;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    
    // Prefer cookie token over bearer token for cookie-based auth
    const token = cookieToken || bearerToken;

    // Debug logging
    logger.debug({ 
      hasAuthHeader: !!authHeader,
      hasCookieToken: !!cookieToken,
      hasBearerToken: !!bearerToken,
      cookiesObject: req.cookies ? Object.keys(req.cookies) : [],
      tokenSource: cookieToken ? 'cookie' : bearerToken ? 'bearer' : 'none',
      preferredToken: cookieToken ? 'cookie (preferred)' : bearerToken ? 'bearer (fallback)' : 'none'
    }, "Auth middleware - token extraction");

    if (!token) {
      logger.warn({ 
        cookies: req.cookies,
        authHeader 
      }, "No authentication token provided");
      res.status(401).json({ error: "Unauthorized: Missing token" });
      return;
    }

    // Validate session (checks cache first, then database)
    const { user, session } = await authService.validateSession(token);
    req.user = user;
    req.sessionToken = session.token;

    logger.debug({ userId: user.id }, "User authenticated and session validated");

    next();
  } catch (error) {
    logger.error({ 
      error, 
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    }, "Authentication middleware failed");
    res.status(401).json({
      error: "Unauthorized: Invalid or expired token",
    });
  }
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies?.authToken;

    logger.debug({
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenSource: authHeader?.startsWith("Bearer ") ? 'bearer' : req.cookies?.authToken ? 'cookie' : 'none'
    }, "Optional auth - checking for token");

    if (token) {
      authService.validateSession(token).then((result: any) => {
        req.user = result.user;
        req.sessionToken = result.session.token;
        logger.debug({ userId: result.user.id }, "Optional auth - user authenticated");
        next();
      });
    } else {
      logger.debug("Optional auth - no token found, continuing without auth");
      next();
    }
  } catch (error) {
    logger.warn({ error }, "Optional auth failed, continuing without auth");
    next();
  }
}

export function requirePermission(permission: PermissionType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    logger.debug({
      requiredPermission: permission,
      hasUser: !!req.user,
      userRole: req.user?.role
    }, "Permission check - starting");

    if (!req.user) {
      logger.warn("Permission check - Unauthorized: No user in request");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const hasRequiredPermission = hasPermission(req.user.role, permission);
    logger.debug({
      userRole: req.user.role,
      requiredPermission: permission,
      hasPermission: hasRequiredPermission
    }, "Permission check - evaluated");

    if (!hasRequiredPermission) {
      logger.warn(
        { userRole: req.user.role, requiredPermission: permission },
        "Permission check - Forbidden: Insufficient permissions"
      );
      res.status(403).json({
        error: "Forbidden: Insufficient permissions",
        required: permission,
        userRole: req.user.role,
      });
      return;
    }

    logger.debug("Permission check - passed");
    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    logger.debug({
      requiredRoles: roles,
      hasUser: !!req.user,
      userRole: req.user?.role
    }, "Role check - starting");

    if (!req.user) {
      logger.warn("Role check - Unauthorized: No user in request");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const hasRequiredRole = roles.includes(req.user.role);
    logger.debug({
      userRole: req.user.role,
      requiredRoles: roles,
      hasRole: hasRequiredRole
    }, "Role check - evaluated");

    if (!hasRequiredRole) {
      logger.warn(
        { userRole: req.user.role, requiredRoles: roles },
        "Role check - Forbidden: Invalid role"
      );
      res.status(403).json({
        error: "Forbidden: Invalid role",
        required: roles,
        userRole: req.user.role,
      });
      return;
    }

    logger.debug("Role check - passed");
    next();
  };
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.debug("Admin check - requiring ADMIN role");
  requireRole("ADMIN")(req, res, next);
}

export function requireMaintainer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.debug("Maintainer check - requiring ADMIN or MAINTAINER role");
  requireRole("ADMIN", "MAINTAINER")(req, res, next);
}

