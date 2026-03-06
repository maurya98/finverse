import { Request, Response, NextFunction } from "express";
import { logger } from "@finverse/logger";

export type PermissionType = "READ" | "WRITE" | "UPDATE" | "DELETE";

// Permission matrix for roles
export const rolePermissions: Record<string, PermissionType[]> = {
  ADMIN: ["READ", "WRITE", "UPDATE", "DELETE"],
  MAINTAINER: ["READ", "WRITE", "UPDATE"],
  USER: ["READ"],
};

export function hasPermission(
  userRole: string,
  requiredPermission: PermissionType
): boolean {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(requiredPermission);
}

export function checkPermission(requiredPermission: PermissionType) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn("Unauthorized: No user in request");
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!hasPermission(req.user.role, requiredPermission)) {
      logger.warn(
        { userRole: req.user.role, requiredPermission },
        "Forbidden: Insufficient permissions"
      );
      return res.status(403).json({
        error: "Forbidden: Insufficient permissions",
        required: requiredPermission,
        userRole: req.user.role,
      });
    }

    next();
  };
}
