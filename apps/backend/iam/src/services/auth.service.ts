import { logger } from "@finverse/logger";
import { prisma } from "../databases/client";
import cache from "@finverse/cache";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { Role } from "../databases/generated/prisma";
import { sessionConfig } from "../auth/config";

export interface AuthSignUpInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signUp(input: AuthSignUpInput) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user with USER role by default
      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: Role.USER,
        },
      });

      // Create session
      const session = await this.createSession(user.id);

      logger.info({ userId: user.id, email: user.email }, "User signed up successfully");

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        session,
      };
    } catch (error) {
      logger.error({ error, email: input.email }, "Sign up failed");
      throw error;
    }
  }

  async login(input: AuthLoginInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      if (!user.isActive) {
        throw new Error("User account is inactive");
      }

      // Compare password
      const passwordMatch = await bcrypt.compare(input.password, user.password);
      if (!passwordMatch) {
        throw new Error("Invalid email or password");
      }

      // Create session
      const session = await this.createSession(user.id);

      logger.info({ userId: user.id, email: user.email }, "User logged in successfully");

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
        session,
      };
    } catch (error) {
      logger.error({ error, email: input.email }, "Login failed");
      throw error;
    }
  }

  async validateSession(token: string) {
    try {
      const cacheKey = `${sessionConfig.cacheKeyPrefix}${token}`;

      logger.debug({ 
        tokenLength: token?.length, 
        tokenPreview: token?.substring(0, 10) + '...', 
        cacheKey 
      }, "Validating session");

      // Check cache first
      const cachedSession = await cache.get(cacheKey);
      if (cachedSession) {
        const sessionData = JSON.parse(cachedSession);
        const user = await prisma.user.findUnique({
          where: { id: sessionData.userId },
        });

        if (!user) {
          logger.error({ userId: sessionData.userId }, "User not found for cached session");
          throw new Error("User not found");
        }

        if (!user.isActive) {
          logger.error({ userId: user.id }, "User account is inactive");
          throw new Error("User account is inactive");
        }

        logger.debug({ userId: user.id }, "Session validated from cache");

        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
          },
          session: sessionData,
        };
      }

      logger.debug({ token: token?.substring(0, 10) + '...' }, "Session not in cache, checking database");

      // Fall back to database
      const session = await prisma.session.findUnique({
        where: { token },
      });

      if (!session) {
        logger.error({ token: token?.substring(0, 10) + '...' }, "Invalid session token - not found in database");
        throw new Error("Invalid session token - not found in database");
      }

      if (session.expiresAt < new Date()) {
        // Delete expired session
        await prisma.session.delete({ where: { id: session.id } });
        logger.error({ sessionId: session.id, expiresAt: session.expiresAt }, "Session expired");
        throw new Error("Session expired");
      }

      const user = await prisma.user.findUnique({
        where: { id: session.userId },
      });

      if (!user) {
        logger.error({ userId: session.userId }, "User not found for database session");
        throw new Error("User not found");
      }

      if (!user.isActive) {
        logger.error({ userId: user.id }, "User account is inactive");
        throw new Error("User account is inactive");
      }

      // Refresh session in cache
      await cache.set(cacheKey, JSON.stringify(session), sessionConfig.expirationSeconds);

      logger.debug({ userId: user.id }, "Session validated from database and cached");

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
        session,
      };
    } catch (error) {
      logger.error({ 
        error, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name,
        token: token?.substring(0, 10) + '...' 
      }, "Session validation failed");
      throw error;
    }
  }

  async logout(sessionId: string) {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (session) {
        const cacheKey = `${sessionConfig.cacheKeyPrefix}${session.token}`;
        await cache.del(cacheKey);
      }

      await prisma.session.delete({ where: { id: sessionId } });
      logger.info({ sessionId }, "User logged out successfully");
      return true;
    } catch (error) {
      logger.error({ error, sessionId }, "Logout failed");
      throw error;
    }
  }

  private async createSession(userId: string): Promise<AuthSession> {
    const token = uuid();
    const expiresAt = new Date(Date.now() + sessionConfig.expirationMs);

    const session = await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    // Store in cache with TTL
    const cacheKey = `${sessionConfig.cacheKeyPrefix}${token}`;
    await cache.set(cacheKey, JSON.stringify(session), sessionConfig.expirationSeconds);

    logger.debug({ userId, sessionId: session.id }, "Session created and cached");

    return session;
  }
}

export default AuthService;
