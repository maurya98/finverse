import {
  IAuthService,
  SessionValidationResult,
} from "@finverse/middlewares";
import { logger } from "@finverse/logger";

/**
 * Auth Service for Site Platform
 * Validates sessions by making requests to the IAM service
 */
export class SitePlatformAuthService implements IAuthService {
  private iamBaseUrl: string;

  constructor() {
    this.iamBaseUrl = process.env.IAM_BASE_URL || "http://localhost:3000";
  }

  async validateSession(token: string): Promise<SessionValidationResult> {
    try {
      logger.debug({ tokenLength: token?.length }, "Validating session with IAM service");

      // Call IAM service to validate the session
      const response = await fetch(`${this.iamBaseUrl}/api/auth/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `authToken=${token}`,
        },
      });

      if (!response.ok) {
        logger.error({ status: response.status }, "Session validation failed");
        throw new Error("Invalid or expired session");
      }

      const data = await response.json();
      const { user, session } = data.data;

      logger.debug({ userId: user.id, role: user.role }, "Session validated successfully");

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
          expiresAt: new Date(session.expiresAt),
        },
      };
    } catch (error) {
      logger.error({ error }, "Session validation error");
      throw error;
    }
  }
}
