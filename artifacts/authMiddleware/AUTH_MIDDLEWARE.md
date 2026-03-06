# Auth Middleware

A reusable authentication and authorization middleware for Express applications in the monorepo.

## Features

- ✅ Cookie-based and Bearer token authentication
- ✅ Cookie tokens preferred over Bearer tokens (configurable)
- ✅ Optional authentication middleware
- ✅ Role-based access control (RBAC)
- ✅ Permission-based access control
- ✅ Comprehensive debug logging
- ✅ Fully typed with TypeScript
- ✅ Extensive test coverage

## Installation

The middleware is part of the `@finverse/middlewares` package:

```bash
pnpm add @finverse/middlewares
```

## Usage

### 1. Create an Auth Service

First, implement the `IAuthService` interface in your application:

```typescript
import { IAuthService, SessionValidationResult } from "@finverse/middlewares";

class MyAuthService implements IAuthService {
  async validateSession(token: string): Promise<SessionValidationResult> {
    // Your session validation logic here
    // Query database, check cache, etc.
    
    const session = await this.findSessionByToken(token);
    const user = await this.findUserById(session.userId);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      session: {
        id: session.id,
        token: session.token,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
    };
  }
}
```

### 2. Create Auth Middleware Instance

```typescript
import { createAuthMiddleware } from "@finverse/middlewares";
import { myAuthService } from "./services/auth.service";

// Create middleware instance
const {
  authMiddleware,
  optionalAuth,
  requirePermission,
  requireRole,
  requireAdmin,
  requireMaintainer,
  hasPermission,
} = createAuthMiddleware({
  authService: myAuthService,
  cookieName: "authToken", // Optional, default: "authToken"
  enableDebugLogs: process.env.NODE_ENV === "development", // Optional
  rolePermissions: {
    // Optional custom permissions
    ADMIN: ["USER_READ", "USER_WRITE", "USER_DELETE", "ADMIN_ACCESS"],
    MAINTAINER: ["USER_READ", "USER_WRITE", "MAINTAINER_ACCESS"],
    USER: ["USER_READ"],
  },
});
```

### 3. Use in Routes

```typescript
import express from "express";

const router = express.Router();

// Public route (no auth required)
router.get("/public", (req, res) => {
  res.json({ message: "Public endpoint" });
});

// Protected route (requires authentication)
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Optional authentication
router.get("/optional", optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ message: "Authenticated", user: req.user });
  } else {
    res.json({ message: "Not authenticated" });
  }
});

// Role-based access
router.get("/admin/dashboard", authMiddleware, requireAdmin, (req, res) => {
  res.json({ message: "Admin dashboard" });
});

router.post("/users", authMiddleware, requireMaintainer, (req, res) => {
  // Only ADMIN or MAINTAINER can create users
  res.json({ message: "User created" });
});

router.delete("/users/:id", authMiddleware, requireRole("ADMIN"), (req, res) => {
  // Only ADMIN can delete users
  res.json({ message: "User deleted" });
});

// Permission-based access
router.post(
  "/posts",
  authMiddleware,
  requirePermission("POST_WRITE"),
  (req, res) => {
    res.json({ message: "Post created" });
  }
);
```

## API Reference

### `createAuthMiddleware(config)`

Creates an auth middleware instance with the specified configuration.

**Parameters:**
- `config.authService` (required): Implementation of `IAuthService`
- `config.cookieName` (optional): Cookie name for session token. Default: `"authToken"`
- `config.enableDebugLogs` (optional): Enable debug logging. Default: `false`
- `config.rolePermissions` (optional): Custom role-to-permissions mapping

**Returns:** Object containing middleware functions

### Middleware Functions

#### `authMiddleware`

Main authentication middleware. Validates session token from cookies (preferred) or Authorization header.

```typescript
router.get("/protected", authMiddleware, (req, res) => {
  console.log(req.user); // Authenticated user
  console.log(req.sessionToken); // Session token
});
```

#### `optionalAuth`

Attempts to authenticate but doesn't fail if no token is provided.

```typescript
router.get("/optional", optionalAuth, (req, res) => {
  if (req.user) {
    // User is authenticated
  } else {
    // User is not authenticated
  }
});
```

#### `requirePermission(permission: string)`

Requires the authenticated user to have a specific permission.

```typescript
router.post("/users", authMiddleware, requirePermission("USER_WRITE"), handler);
```

#### `requireRole(...roles: string[])`

Requires the authenticated user to have one of the specified roles.

```typescript
router.delete("/users/:id", authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), handler);
```

#### `requireAdmin`

Shorthand for requiring ADMIN role.

```typescript
router.get("/admin", authMiddleware, requireAdmin, handler);
```

#### `requireMaintainer`

Shorthand for requiring ADMIN or MAINTAINER role.

```typescript
router.post("/users", authMiddleware, requireMaintainer, handler);
```

#### `hasPermission(role: string, permission: string)`

Utility function to check if a role has a specific permission.

```typescript
if (hasPermission("USER", "USER_WRITE")) {
  // User role has USER_WRITE permission
}
```

## TypeScript Types

### `AuthUser`

```typescript
interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string | null;
}
```

### `AuthSession`

```typescript
interface AuthSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
}
```

### `AuthenticatedRequest`

```typescript
interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  sessionToken?: string;
}
```

## Token Priority

When both cookie and Bearer token are present:
1. **Cookie token** is preferred (default behavior)
2. **Bearer token** is used as fallback

This ensures cookie-based authentication works correctly even when clients accidentally send Bearer tokens.

## Debug Logging

Enable debug logs by setting `enableDebugLogs: true`:

```typescript
const middleware = createAuthMiddleware({
  authService,
  enableDebugLogs: process.env.NODE_ENV === "development",
});
```

Debug logs include:
- Token extraction details (source, type)
- Authentication success/failure
- Permission checks
- Role validation

## Error Responses

### 401 Unauthorized

Missing or invalid authentication token:

```json
{
  "error": "Unauthorized: Missing token"
}
```

```json
{
  "error": "Unauthorized: Invalid or expired token"
}
```

### 403 Forbidden

Insufficient permissions or invalid role:

```json
{
  "error": "Forbidden: Insufficient permissions",
  "required": "USER_WRITE",
  "userRole": "USER"
}
```

```json
{
  "error": "Forbidden: Invalid role",
  "required": ["ADMIN"],
  "userRole": "USER"
}
```

## Example: Complete Integration

```typescript
// services/auth.service.ts
import { IAuthService, SessionValidationResult } from "@finverse/middlewares";
import { prisma } from "../database/client";

export class AuthService implements IAuthService {
  async validateSession(token: string): Promise<SessionValidationResult> {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new Error("Invalid or expired session");
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name,
      },
      session: {
        id: session.id,
        token: session.token,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
    };
  }
}

export const authService = new AuthService();

// middleware/auth.ts
import { createAuthMiddleware } from "@finverse/middlewares";
import { authService } from "../services/auth.service";

export const {
  authMiddleware,
  optionalAuth,
  requirePermission,
  requireRole,
  requireAdmin,
  requireMaintainer,
} = createAuthMiddleware({
  authService,
  cookieName: "authToken",
  enableDebugLogs: process.env.NODE_ENV === "development",
});

// routes/users.ts
import { Router } from "express";
import { authMiddleware, requireMaintainer, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getAllUsers);
router.post("/", authMiddleware, requireMaintainer, createUser);
router.delete("/:id", authMiddleware, requireAdmin, deleteUser);

export default router;
```

## Best Practices

1. **Implement proper session validation**: Cache sessions for performance
2. **Use environment-based debug logging**: Only enable in development
3. **Define clear role hierarchies**: ADMIN > MAINTAINER > USER
4. **Use permissions for fine-grained control**: Combine roles with permissions
5. **Handle token extraction properly**: Prefer cookies for web apps
6. **Set appropriate cookie options**: httpOnly, secure, sameSite

## Testing

Run tests:

```bash
pnpm test
```

The middleware includes comprehensive tests covering:
- Authentication with cookies and Bearer tokens
- Optional authentication
- Permission checks
- Role-based access control
- Error handling
