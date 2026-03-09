# Admin Dashboard Authentication Setup

This document describes the authentication and authorization implementation for the admin dashboard.

## Overview

The admin dashboard uses a role-based authentication system with the following components:

1. **Frontend (admin_dashboard)**: React application with protected routes and role-based access control
2. **IAM Service**: Handles user authentication and session management
3. **Site Platform**: Backend API with auth middleware protecting admin routes

## Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│ Admin Dashboard │─────▶│  IAM Service │      │  Site Platform  │
│   (Frontend)    │      │  (Auth API)  │      │   (Admin API)   │
└─────────────────┘      └──────────────┘      └─────────────────┘
        │                        │                       │
        │    Login Request       │                       │
        │──────────────────────▶│                       │
        │                        │                       │
        │    Auth Cookie         │                       │
        │◀──────────────────────│                       │
        │                        │                       │
        │    API Request (with cookie)                  │
        │─────────────────────────────────────────────▶│
        │                        │                       │
        │                        │  Validate Session     │
        │                        │◀──────────────────────│
        │                        │                       │
        │                        │  User + Session Info  │
        │                        │──────────────────────▶│
        │                        │                       │
        │    API Response                                │
        │◀──────────────────────────────────────────────│
```

## Frontend Components

### 1. Login Page
- Located at: `src/pages/LoginPage.tsx`
- Provides email/password authentication
- Redirects to home page after successful login
- Displays error messages for failed login attempts

### 2. Auth Context
- Located at: `src/contexts/AuthContext.tsx`
- Manages global authentication state
- Provides `useAuth()` hook for accessing auth state
- Handles login, logout, and session validation

### 3. Protected Routes
- Located at: `src/components/auth/ProtectedRoute.tsx`
- Wraps routes that require authentication
- Supports optional role-based access control
- Redirects to login page if not authenticated

### 4. Auth API Service
- Located at: `src/services/authApi.ts`
- Communicates with IAM service
- Handles login, logout, and user info requests
- Uses HTTP-only cookies for session management

## Backend Components

### 1. Site Platform Auth Service
- Located at: `apps/backend/siteplatform/src/api/services/auth.service.ts`
- Implements `IAuthService` interface
- Validates sessions by calling IAM service
- Returns user and session information

### 2. Auth Middleware
- Located at: `apps/backend/siteplatform/src/api/middlewares/auth.middleware.ts`
- Uses `@finverse/middlewares` package
- Provides authentication and authorization middleware
- Supports role-based and permission-based access control

### 3. Protected Routes
- Located at: `apps/backend/siteplatform/src/api/routes/api.ts`
- All `/api/admin/*` routes require authentication
- Export endpoint requires `ADMIN` role

## Roles and Permissions

### Roles
- **ADMIN**: Full access to all resources
- **MAINTAINER**: Limited write access to services, applications, routes
- **USER**: Read-only access

### Permissions by Role

**ADMIN**:
- All MAINTAINER permissions
- USER_DELETE
- SERVICE_DELETE
- APPLICATION_DELETE
- ROUTE_DELETE
- PERMISSION_DELETE
- ADMIN_ACCESS

**MAINTAINER**:
- SERVICE_READ, SERVICE_WRITE
- APPLICATION_READ, APPLICATION_WRITE
- ROUTE_READ, ROUTE_WRITE
- PERMISSION_READ
- MAINTAINER_ACCESS

**USER**:
- SERVICE_READ
- APPLICATION_READ
- ROUTE_READ
- PERMISSION_READ

## Environment Variables

### Frontend (admin_dashboard)

Create a `.env` file in `apps/frontend/admin_dashboard/`:

```env
# IAM Service URL
VITE_IAM_BASE_URL=http://localhost:3000

# Site Platform API URL
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (siteplatform)

Create a `.env` file in `apps/backend/siteplatform/`:

```env
# IAM Service URL for session validation
IAM_BASE_URL=http://localhost:3000

# Server port
PORT=3001

# Enable debug logs for auth middleware
NODE_ENV=development
```

## Usage Examples

### Frontend: Using Protected Routes

```tsx
import ProtectedRoute from './components/auth/ProtectedRoute';

// Require authentication only
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// Require ADMIN role
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

### Frontend: Using Auth Context

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.name}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Backend: Protecting Routes

```typescript
import { authMiddleware, requireAdmin, requireRole } from '../middlewares/auth.middleware';

// Require authentication
router.get('/data', authMiddleware, controller.getData);

// Require ADMIN role
router.delete('/data/:id', requireAdmin, controller.deleteData);

// Require specific role
router.post('/data', requireRole('MAINTAINER'), controller.createData);
```

### Backend: Accessing User in Controller

```typescript
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@finverse/middlewares';

async function myController(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user; // { id, email, role, name }
  
  console.log(`User ${user.name} (${user.role}) is accessing this endpoint`);
  
  // Your logic here
}
```

## Development Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start IAM service:
   ```bash
   cd apps/backend/iam
   pnpm dev
   ```

3. Start Site Platform:
   ```bash
   cd apps/backend/siteplatform
   pnpm dev
   ```

4. Start Admin Dashboard:
   ```bash
   cd apps/frontend/admin_dashboard
   pnpm dev
   ```

5. Create a test user in IAM (if not exists):
   - Use the IAM API to create a user with ADMIN role
   - Or use the database directly

## Security Considerations

1. **HTTP-Only Cookies**: Session tokens are stored in HTTP-only cookies to prevent XSS attacks
2. **Secure Cookies**: In production, cookies are marked as `secure` (HTTPS only)
3. **SameSite**: Cookies use `SameSite=strict` to prevent CSRF attacks
4. **Token Validation**: All requests validate tokens with the IAM service
5. **Role-Based Access**: Endpoints are protected with role-based middleware

## Troubleshooting

### Login not working
- Check that IAM service is running on the correct port
- Verify `VITE_IAM_BASE_URL` in frontend `.env`
- Check browser console for CORS errors
- Ensure cookies are being set (check browser dev tools)

### API requests returning 401
- Verify cookies are being sent with requests (credentials: 'include')
- Check that Site Platform can reach IAM service
- Verify `IAM_BASE_URL` in siteplatform `.env`
- Check IAM service logs for session validation errors

### CORS issues
- Ensure IAM and Site Platform have CORS configured
- Verify frontend origin is allowed
- Check that `credentials: 'include'` is set in fetch requests

## Next Steps

- Add password reset functionality
- Implement refresh tokens
- Add user profile management
- Add audit logging for admin actions
- Implement multi-factor authentication (MFA)
