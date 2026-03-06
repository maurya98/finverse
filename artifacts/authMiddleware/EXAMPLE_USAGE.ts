/**
 * Example: Using @finverse/middlewares auth in your application
 * 
 * This file demonstrates how to integrate the reusable auth middleware
 * from @finverse/middlewares into your Express application.
 */

import express from "express";
import {
  createAuthMiddleware,
  type IAuthService,
  type SessionValidationResult,
} from "@finverse/middlewares";

// ============================================================================
// Step 1: Implement IAuthService interface
// ============================================================================

class MyAuthService implements IAuthService {
  async validateSession(token: string): Promise<SessionValidationResult> {
    // Example: Query your database for the session
    // const session = await prisma.session.findUnique({ 
    //   where: { token },
    //   include: { user: true }
    // });
    
    // Example: Check cache first for performance
    // const cachedSession = await redis.get(`session:${token}`);
    
    // Validate session is not expired
    // if (!session || session.expiresAt < new Date()) {
    //   throw new Error("Invalid or expired session");
    // }
    
    // Return user and session information
    return {
      user: {
        id: "user-id",
        email: "user@example.com",
        role: "ADMIN",
        name: "John Doe",
      },
      session: {
        id: "session-id",
        token: token,
        userId: "user-id",
        expiresAt: new Date(Date.now() + 3600000),
      },
    };
  }
}

// ============================================================================
// Step 2: Create auth middleware instance
// ============================================================================

const authService = new MyAuthService();

const {
  authMiddleware,
  optionalAuth,
  requirePermission,
  requireRole,
  requireAdmin,
  requireMaintainer,
  hasPermission,
} = createAuthMiddleware({
  authService,
  cookieName: "authToken", // Match your cookie name
  enableDebugLogs: process.env.NODE_ENV === "development",
  rolePermissions: {
    ADMIN: [
      "USER_READ",
      "USER_WRITE",
      "USER_DELETE",
      "ADMIN_ACCESS",
      "MAINTAINER_ACCESS",
    ],
    MAINTAINER: ["USER_READ", "USER_WRITE", "MAINTAINER_ACCESS"],
    USER: ["USER_READ"],
  },
});

// ============================================================================
// Step 3: Use in your Express routes
// ============================================================================

const app = express();
const router = express.Router();

// Public endpoint - no authentication required
router.get("/public", (req, res) => {
  res.json({ message: "This is public" });
});

// Protected endpoint - requires authentication
router.get("/profile", authMiddleware, (req, res) => {
  const { user } = req;
  res.json({
    message: "Your profile",
    user: {
      id: user!.id,
      email: user!.email,
      role: user!.role,
    },
  });
});

// Optional authentication - works with or without token
router.get("/dashboard", optionalAuth, (req, res) => {
  const { user } = req;
  if (user) {
    res.json({
      message: `Welcome back, ${user.name}!`,
      authenticated: true,
    });
  } else {
    res.json({
      message: "Welcome, guest!",
      authenticated: false,
    });
  }
});

// Role-based access - only ADMIN can access
router.get("/admin/dashboard", authMiddleware, requireAdmin, (req, res) => {
  res.json({ message: "Admin dashboard" });
});

// Role-based access - ADMIN or MAINTAINER can access
router.post("/users", authMiddleware, requireMaintainer, (req, res) => {
  res.json({ message: "User created" });
});

// Custom role requirement - multiple roles
router.delete(
  "/users/:id",
  authMiddleware,
  requireRole("ADMIN", "SUPER_ADMIN"),
  (req, res) => {
    res.json({ message: "User deleted" });
  }
);

// Permission-based access
router.post(
  "/posts",
  authMiddleware,
  requirePermission("POST_WRITE"),
  (req, res) => {
    res.json({ message: "Post created" });
  }
);

// Multiple middleware - auth + role + permission
router.patch(
  "/settings",
  authMiddleware,
  requireRole("ADMIN"),
  requirePermission("ADMIN_ACCESS"),
  (req, res) => {
    res.json({ message: "Settings updated" });
  }
);

// Custom logic with hasPermission utility
router.post("/actions", authMiddleware, (req, res) => {
  const { user } = req;
  const { action } = req.body;

  // Check permissions programmatically
  if (action === "delete" && !hasPermission(user!.role, "USER_DELETE")) {
    return res.status(403).json({
      error: "You don't have permission to delete",
    });
  }

  res.json({ message: "Action performed" });
});

// ============================================================================
// Step 4: Mount routes and start server
// ============================================================================

app.use("/api", router);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ============================================================================
// TypeScript Type Augmentation (Optional)
// ============================================================================

// Extend Express Request type globally
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name?: string | null;
      };
      sessionToken?: string;
    }
  }
}

export {};
