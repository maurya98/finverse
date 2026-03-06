import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthMiddleware } from "../src/auth.middleware";
import type { Request, Response, NextFunction } from "express";
import type {
  IAuthService,
  SessionValidationResult,
  AuthUser,
  AuthSession,
} from "../src/auth.types";

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    cookies: {},
    ...overrides,
  } as Request;
}

function createMockRes(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

function createMockNext(): NextFunction {
  return vi.fn();
}

function createMockAuthService(
  mockValidateSession?: (token: string) => Promise<SessionValidationResult>
): IAuthService {
  return {
    validateSession:
      mockValidateSession ||
      vi.fn().mockResolvedValue({
        user: {
          id: "user-123",
          email: "test@example.com",
          role: "USER",
          name: "Test User",
        } as AuthUser,
        session: {
          id: "session-123",
          token: "valid-token",
          userId: "user-123",
          expiresAt: new Date(Date.now() + 3600000),
        } as AuthSession,
      }),
  };
}

describe("createAuthMiddleware", () => {
  describe("authMiddleware", () => {
    it("should authenticate user with valid cookie token", async () => {
      const authService = createMockAuthService();
      const { authMiddleware } = createAuthMiddleware({ authService });

      const req = createMockReq({
        cookies: { authToken: "valid-token" },
      });
      const res = createMockRes();
      const next = createMockNext();

      await authMiddleware(req, res, next);

      expect(authService.validateSession).toHaveBeenCalledWith("valid-token");
      expect((req as any).user).toBeDefined();
      expect((req as any).user.id).toBe("user-123");
      expect((req as any).sessionToken).toBe("valid-token");
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should authenticate user with valid Bearer token", async () => {
      const authService = createMockAuthService();
      const { authMiddleware } = createAuthMiddleware({ authService });

      const req = createMockReq({
        headers: { authorization: "Bearer valid-bearer-token" },
      });
      const res = createMockRes();
      const next = createMockNext();

      await authMiddleware(req, res, next);

      expect(authService.validateSession).toHaveBeenCalledWith(
        "valid-bearer-token"
      );
      expect((req as any).user).toBeDefined();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should prefer cookie token over Bearer token", async () => {
      const authService = createMockAuthService();
      const { authMiddleware } = createAuthMiddleware({ authService });

      const req = createMockReq({
        headers: { authorization: "Bearer bearer-token" },
        cookies: { authToken: "cookie-token" },
      });
      const res = createMockRes();
      const next = createMockNext();

      await authMiddleware(req, res, next);

      expect(authService.validateSession).toHaveBeenCalledWith("cookie-token");
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 401 if no token is provided", async () => {
      const authService = createMockAuthService();
      const { authMiddleware } = createAuthMiddleware({ authService });

      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized: Missing token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token validation fails", async () => {
      const authService = createMockAuthService(async () => {
        throw new Error("Invalid token");
      });
      const { authMiddleware } = createAuthMiddleware({ authService });

      const req = createMockReq({
        cookies: { authToken: "invalid-token" },
      });
      const res = createMockRes();
      const next = createMockNext();

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized: Invalid or expired token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should use custom cookie name if provided", async () => {
      const authService = createMockAuthService();
      const { authMiddleware } = createAuthMiddleware({
        authService,
        cookieName: "customToken",
      });

      const req = createMockReq({
        cookies: { customToken: "valid-token" },
      });
      const res = createMockRes();
      const next = createMockNext();

      await authMiddleware(req, res, next);

      expect(authService.validateSession).toHaveBeenCalledWith("valid-token");
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe("optionalAuth", () => {
    it("should authenticate user if token is provided", async () => {
      const authService = createMockAuthService();
      const { optionalAuth } = createAuthMiddleware({ authService });

      const req = createMockReq({
        cookies: { authToken: "valid-token" },
      });
      const res = createMockRes();
      const next = createMockNext();

      optionalAuth(req, res, next);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect((req as any).user).toBeDefined();
    });

    it("should continue without authentication if no token", () => {
      const authService = createMockAuthService();
      const { optionalAuth } = createAuthMiddleware({ authService });

      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should continue without authentication if token validation fails", async () => {
      const authService = createMockAuthService(async () => {
        throw new Error("Invalid token");
      });
      const { optionalAuth } = createAuthMiddleware({ authService });

      const req = createMockReq({
        cookies: { authToken: "invalid-token" },
      });
      const res = createMockRes();
      const next = createMockNext();

      optionalAuth(req, res, next);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect((req as any).user).toBeUndefined();
    });
  });

  describe("requirePermission", () => {
    it("should allow user with required permission", () => {
      const authService = createMockAuthService();
      const { requirePermission } = createAuthMiddleware({
        authService,
        rolePermissions: {
          ADMIN: ["USER_READ", "USER_WRITE"],
        },
      });

      const req = createMockReq();
      (req as any).user = {
        id: "user-123",
        email: "admin@example.com",
        role: "ADMIN",
      };
      const res = createMockRes();
      const next = createMockNext();

      requirePermission("USER_READ")(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 403 if user lacks required permission", () => {
      const authService = createMockAuthService();
      const { requirePermission } = createAuthMiddleware({
        authService,
        rolePermissions: {
          USER: ["USER_READ"],
        },
      });

      const req = createMockReq();
      (req as any).user = {
        id: "user-123",
        email: "user@example.com",
        role: "USER",
      };
      const res = createMockRes();
      const next = createMockNext();

      requirePermission("USER_WRITE")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Forbidden: Insufficient permissions",
        required: "USER_WRITE",
        userRole: "USER",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if no user in request", () => {
      const authService = createMockAuthService();
      const { requirePermission } = createAuthMiddleware({ authService });

      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      requirePermission("USER_READ")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("requireRole", () => {
    it("should allow user with required role", () => {
      const authService = createMockAuthService();
      const { requireRole } = createAuthMiddleware({ authService });

      const req = createMockReq();
      (req as any).user = {
        id: "user-123",
        email: "admin@example.com",
        role: "ADMIN",
      };
      const res = createMockRes();
      const next = createMockNext();

      requireRole("ADMIN", "MAINTAINER")(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 403 if user lacks required role", () => {
      const authService = createMockAuthService();
      const { requireRole } = createAuthMiddleware({ authService });

      const req = createMockReq();
      (req as any).user = {
        id: "user-123",
        email: "user@example.com",
        role: "USER",
      };
      const res = createMockRes();
      const next = createMockNext();

      requireRole("ADMIN")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Forbidden: Invalid role",
        required: ["ADMIN"],
        userRole: "USER",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if no user in request", () => {
      const authService = createMockAuthService();
      const { requireRole } = createAuthMiddleware({ authService });

      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      requireRole("ADMIN")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("requireAdmin", () => {
    it("should allow ADMIN user", () => {
      const authService = createMockAuthService();
      const { requireAdmin } = createAuthMiddleware({ authService });

      const req = createMockReq();
      (req as any).user = {
        id: "user-123",
        email: "admin@example.com",
        role: "ADMIN",
      };
      const res = createMockRes();
      const next = createMockNext();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should reject non-ADMIN user", () => {
      const authService = createMockAuthService();
      const { requireAdmin } = createAuthMiddleware({ authService });

      const req = createMockReq();
      (req as any).user = {
        id: "user-123",
        email: "user@example.com",
        role: "USER",
      };
      const res = createMockRes();
      const next = createMockNext();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("requireMaintainer", () => {
    it("should allow ADMIN user", () => {
      const authService = createMockAuthService();
      const { requireMaintainer } = createAuthMiddleware({ authService });

      const req = createMockReq();
      (req as any).user = {
        id: "user-123",
        email: "admin@example.com",
        role: "ADMIN",
      };
      const res = createMockRes();
      const next = createMockNext();

      requireMaintainer(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should allow MAINTAINER user", () => {
      const authService = createMockAuthService();
      const { requireMaintainer } = createAuthMiddleware({ authService });

      const req = createMockReq();
      (req as any).user = {
        id: "user-123",
        email: "maintainer@example.com",
        role: "MAINTAINER",
      };
      const res = createMockRes();
      const next = createMockNext();

      requireMaintainer(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should reject USER role", () => {
      const authService = createMockAuthService();
      const { requireMaintainer } = createAuthMiddleware({ authService });

      const req = createMockReq();
      (req as any).user = {
        id: "user-123",
        email: "user@example.com",
        role: "USER",
      };
      const res = createMockRes();
      const next = createMockNext();

      requireMaintainer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("hasPermission", () => {
    it("should correctly check permissions", () => {
      const authService = createMockAuthService();
      const { hasPermission } = createAuthMiddleware({
        authService,
        rolePermissions: {
          ADMIN: ["USER_READ", "USER_WRITE", "USER_DELETE"],
          USER: ["USER_READ"],
        },
      });

      expect(hasPermission("ADMIN", "USER_WRITE")).toBe(true);
      expect(hasPermission("USER", "USER_READ")).toBe(true);
      expect(hasPermission("USER", "USER_WRITE")).toBe(false);
      expect(hasPermission("UNKNOWN", "USER_READ")).toBe(false);
    });
  });
});
