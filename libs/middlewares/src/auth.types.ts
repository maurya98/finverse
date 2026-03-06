import { Request } from "express";

/**
 * User information stored in request after authentication
 */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string | null;
}

/**
 * Session information
 */
export interface AuthSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  user: AuthUser;
  session: AuthSession;
}

/**
 * Auth service interface that apps must implement
 */
export interface IAuthService {
  /**
   * Validate a session token and return user and session information
   * @param token - The session token to validate
   * @returns Promise resolving to user and session information
   * @throws Error if token is invalid or expired
   */
  validateSession(token: string): Promise<SessionValidationResult>;
}

/**
 * Permission type for authorization
 */
export type PermissionType = 
  | "USER_READ"
  | "USER_WRITE"
  | "USER_DELETE"
  | "ADMIN_ACCESS"
  | "MAINTAINER_ACCESS"
  | string;

/**
 * Extended Express Request with user and session information
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  sessionToken?: string;
}

/**
 * Role-based permissions map
 */
export type RolePermissionsMap = Record<string, PermissionType[]>;

/**
 * Auth middleware configuration options
 */
export interface AuthMiddlewareConfig {
  /**
   * Auth service instance for validating sessions
   */
  authService: IAuthService;
  
  /**
   * Cookie name for session token (default: 'authToken')
   */
  cookieName?: string;
  
  /**
   * Role permissions mapping
   */
  rolePermissions?: RolePermissionsMap;
  
  /**
   * Whether to enable debug logging (default: false)
   */
  enableDebugLogs?: boolean;
}
