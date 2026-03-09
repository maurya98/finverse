import { createAuthMiddleware } from "@finverse/middlewares";
import { SitePlatformAuthService } from "../services";

/**
 * Auth middleware instance for Site Platform
 * 
 * This creates authentication and authorization middleware
 * that validates sessions via the IAM service
 */
const authService = new SitePlatformAuthService();

export const {
  authMiddleware,
  optionalAuth,
  requirePermission,
  requireRole,
  requireAdmin,
  requireMaintainer,
  hasPermission,
} = createAuthMiddleware({
  authService,
  cookieName: "authToken",
  enableDebugLogs: process.env.NODE_ENV === "development",
  rolePermissions: {
    ADMIN: [
      "USER_READ",
      "USER_WRITE",
      "USER_DELETE",
      "SERVICE_READ",
      "SERVICE_WRITE",
      "SERVICE_DELETE",
      "APPLICATION_READ",
      "APPLICATION_WRITE",
      "APPLICATION_DELETE",
      "ROUTE_READ",
      "ROUTE_WRITE",
      "ROUTE_DELETE",
      "PERMISSION_READ",
      "PERMISSION_WRITE",
      "PERMISSION_DELETE",
      "ADMIN_ACCESS",
    ],
    MAINTAINER: [
      "SERVICE_READ",
      "SERVICE_WRITE",
      "APPLICATION_READ",
      "APPLICATION_WRITE",
      "ROUTE_READ",
      "ROUTE_WRITE",
      "PERMISSION_READ",
      "MAINTAINER_ACCESS",
    ],
    USER: [
      "SERVICE_READ",
      "APPLICATION_READ",
      "ROUTE_READ",
      "PERMISSION_READ",
    ],
  },
});

