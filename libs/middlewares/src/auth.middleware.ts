import { Request, Response, NextFunction } from "express";
import { logger } from "@finverse/logger";
import {
  AuthMiddlewareConfig,
  AuthenticatedRequest,
  PermissionType,
  RolePermissionsMap,
} from "./auth.types";

/**
 * Default role permissions mapping
 */
const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMap = {
  ADMIN: ["USER_READ", "USER_WRITE", "USER_DELETE", "ADMIN_ACCESS", "MAINTAINER_ACCESS"],
  MAINTAINER: ["USER_READ", "USER_WRITE", "MAINTAINER_ACCESS"],
  USER: ["USER_READ"],
};

/**
 * Create authentication middleware factory
 */
export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  const {
    authService,
    cookieName = "authToken",
    rolePermissions = DEFAULT_ROLE_PERMISSIONS,
    enableDebugLogs = false,
  } = config;

  /**
   * Check if a role has a specific permission
   */
  function hasPermission(role: string, permission: PermissionType): boolean {
    const permissions = rolePermissions[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Main authentication middleware
   * Validates session token from cookies or Authorization header
   */
  async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;

      // Get token from cookies (preferred) or Authorization header (Bearer)
      const authHeader = req.headers.authorization;
      const cookieToken = req.cookies?.[cookieName];
      const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      // Prefer cookie token over bearer token for cookie-based auth
      const token = cookieToken || bearerToken;

      // Debug logging
      if (enableDebugLogs) {
        logger.debug(
          {
            hasAuthHeader: !!authHeader,
            hasCookieToken: !!cookieToken,
            hasBearerToken: !!bearerToken,
            cookiesObject: req.cookies ? Object.keys(req.cookies) : [],
            tokenSource: cookieToken
              ? "cookie"
              : bearerToken
              ? "bearer"
              : "none",
            preferredToken: cookieToken
              ? "cookie (preferred)"
              : bearerToken
              ? "bearer (fallback)"
              : "none",
          },
          "Auth middleware - token extraction"
        );
      }

      if (!token) {
        if (enableDebugLogs) {
          logger.warn(
            {
              cookies: req.cookies,
              authHeader,
            },
            "Auth middleware - no authentication token provided"
          );
        }
        res.status(401).json({ error: "Unauthorized: Missing token" });
        return;
      }

      // Validate session
      const { user, session } = await authService.validateSession(token);
      authReq.user = user;
      authReq.sessionToken = session.token;

      if (enableDebugLogs) {
        logger.debug(
          { userId: user.id, role: user.role },
          "Auth middleware - user authenticated and session validated"
        );
      }

      next();
    } catch (error) {
      if (enableDebugLogs) {
        logger.error(
          {
            error,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            errorStack: error instanceof Error ? error.stack : undefined,
          },
          "Auth middleware - authentication failed"
        );
      }
      res.status(401).json({
        error: "Unauthorized: Invalid or expired token",
      });
    }
  }

  /**
   * Optional authentication middleware
   * Attempts to authenticate but doesn't fail if no token is provided
   */
  function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const authReq = req as AuthenticatedRequest;

    try {
      const authHeader = req.headers.authorization;
      const token =
        authHeader?.startsWith("Bearer ")
          ? authHeader.slice(7)
          : req.cookies?.[cookieName];

      if (enableDebugLogs) {
        logger.debug(
          {
            hasAuthHeader: !!authHeader,
            hasToken: !!token,
            tokenSource: authHeader?.startsWith("Bearer ")
              ? "bearer"
              : req.cookies?.[cookieName]
              ? "cookie"
              : "none",
          },
          "Optional auth - checking for token"
        );
      }

      if (token) {
        authService
          .validateSession(token)
          .then((result) => {
            authReq.user = result.user;
            authReq.sessionToken = result.session.token;
            if (enableDebugLogs) {
              logger.debug(
                { userId: result.user.id },
                "Optional auth - user authenticated"
              );
            }
            next();
          })
          .catch((error) => {
            if (enableDebugLogs) {
              logger.warn(
                { error },
                "Optional auth - token validation failed, continuing without auth"
              );
            }
            next();
          });
      } else {
        if (enableDebugLogs) {
          logger.debug("Optional auth - no token found, continuing without auth");
        }
        next();
      }
    } catch (error) {
      if (enableDebugLogs) {
        logger.warn({ error }, "Optional auth - failed, continuing without auth");
      }
      next();
    }
  }

  /**
   * Require specific permission middleware
   */
  function requirePermission(permission: PermissionType) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const authReq = req as AuthenticatedRequest;

      if (enableDebugLogs) {
        logger.debug(
          {
            requiredPermission: permission,
            hasUser: !!authReq.user,
            userRole: authReq.user?.role,
          },
          "Permission check - starting"
        );
      }

      if (!authReq.user) {
        if (enableDebugLogs) {
          logger.warn("Permission check - Unauthorized: No user in request");
        }
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const hasRequiredPermission = hasPermission(authReq.user.role, permission);

      if (enableDebugLogs) {
        logger.debug(
          {
            userRole: authReq.user.role,
            requiredPermission: permission,
            hasPermission: hasRequiredPermission,
          },
          "Permission check - evaluated"
        );
      }

      if (!hasRequiredPermission) {
        if (enableDebugLogs) {
          logger.warn(
            { userRole: authReq.user.role, requiredPermission: permission },
            "Permission check - Forbidden: Insufficient permissions"
          );
        }
        res.status(403).json({
          error: "Forbidden: Insufficient permissions",
          required: permission,
          userRole: authReq.user.role,
        });
        return;
      }

      if (enableDebugLogs) {
        logger.debug("Permission check - passed");
      }
      next();
    };
  }

  /**
   * Require specific role(s) middleware
   */
  function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const authReq = req as AuthenticatedRequest;

      if (enableDebugLogs) {
        logger.debug(
          {
            requiredRoles: roles,
            hasUser: !!authReq.user,
            userRole: authReq.user?.role,
          },
          "Role check - starting"
        );
      }

      if (!authReq.user) {
        if (enableDebugLogs) {
          logger.warn("Role check - Unauthorized: No user in request");
        }
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const hasRequiredRole = roles.includes(authReq.user.role);

      if (enableDebugLogs) {
        logger.debug(
          {
            userRole: authReq.user.role,
            requiredRoles: roles,
            hasRole: hasRequiredRole,
          },
          "Role check - evaluated"
        );
      }

      if (!hasRequiredRole) {
        if (enableDebugLogs) {
          logger.warn(
            { userRole: authReq.user.role, requiredRoles: roles },
            "Role check - Forbidden: Invalid role"
          );
        }
        res.status(403).json({
          error: "Forbidden: Invalid role",
          required: roles,
          userRole: authReq.user.role,
        });
        return;
      }

      if (enableDebugLogs) {
        logger.debug("Role check - passed");
      }
      next();
    };
  }

  /**
   * Require ADMIN role middleware
   */
  function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (enableDebugLogs) {
      logger.debug("Admin check - requiring ADMIN role");
    }
    requireRole("ADMIN")(req, res, next);
  }

  /**
   * Require ADMIN or MAINTAINER role middleware
   */
  function requireMaintainer(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (enableDebugLogs) {
      logger.debug("Maintainer check - requiring ADMIN or MAINTAINER role");
    }
    requireRole("ADMIN", "MAINTAINER")(req, res, next);
  }

  return {
    authMiddleware,
    optionalAuth,
    requirePermission,
    requireRole,
    requireAdmin,
    requireMaintainer,
    hasPermission,
  };
}
