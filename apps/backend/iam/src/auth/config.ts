// Note: better-auth packages are not currently installed
// To enable this configuration, install: npm install better-auth @better-auth/prisma-adapter
// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "@better-auth/prisma-adapter";
import { logger } from "@finverse/logger";

/**
 * Session and Cookie Configuration
 * All values are in seconds, unless otherwise specified
 */
export const sessionConfig = {
  // Session expiration time (configurable in days from .env)
  expirationDays: parseInt(process.env.SESSION_EXPIRATION_DAYS || "7", 10),
  
  // Computed expiration in milliseconds
  get expirationMs() {
    return this.expirationDays * 24 * 60 * 60 * 1000;
  },
  
  // Computed expiration in seconds (for Redis TTL)
  get expirationSeconds() {
    return this.expirationDays * 24 * 60 * 60;
  },
  
  // Cache key prefix for sessions
  cacheKeyPrefix: "session:",
};

// Log session configuration on startup
logger.info(
  { expirationDays: sessionConfig.expirationDays },
  "Session configuration loaded"
);

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  [key: string]: unknown;
}

interface AuthSession {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  [key: string]: unknown;
}

interface AuthContext {
  user?: AuthUser;
  session?: AuthSession;
  [key: string]: unknown;
}

// export const auth = betterAuth({
  // database: prismaAdapter(prisma),

  // /**
  //  * Email and password authentication
  //  */
  // emailAndPassword: {
  //   enabled: true,
  //   autoSignUpCallback: async (user: AuthUser) => {
  //     logger.info(`Auto registered user: ${user.email}`);
  //     return user;
  //   },
  // },

  // /**
  //  * Session configuration
  //  */
  // session: {
  //   expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
  //   updateAge: 60 * 60 * 24, // Update session 1x per day
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 5 * 60, // 5 minutes
  //   },
  // },

  // /**
  //  * JWT token configuration
  //  */
  // jwt: {
  //   expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
  // },

  // /**
  //  * Custom User Fields
  //  * Extends the default user model with additional fields
  //  */
  // user: {
  //   additionalFields: {
  //     role: {
  //       type: "string",
  //       required: true,
  //       defaultValue: "user",
  //       input: true,
  //     },
  //     isActive: {
  //       type: "boolean",
  //       required: true,
  //       defaultValue: true,
  //       input: false,
  //     },
  //     emailVerified: {
  //       type: "boolean",
  //       required: false,
  //       defaultValue: false,
  //       input: false,
  //     },
  //   },
  // },

  // /**
  //  * Plugins for extended functionality
  //  */
  // plugins: [],

  // /**
  //  * Callbacks for lifecycle events
  //  */
  // callbacks: {
  //   /**
  //    * Called after successful sign-in
  //    */
  //   onSignInSuccess: async ({ user, session }: { user: AuthUser; session: AuthSession }) => {
  //     logger.info(`User signed in: ${user.email}`);
  //     return { user, session };
  //   },

  //   /**
  //    * Called after successful sign-up
  //    */
  //   onSignUpSuccess: async ({ user, session }: { user: AuthUser; session: AuthSession }) => {
  //     logger.info(`User registered: ${user.email}`);
  //     return { user, session };
  //   },

  //   /**
  //    * Called after sign-out
  //    */
  //   onSignOutSuccess: async (ctx: AuthContext) => {
  //     logger.info(`User signed out`);
  //     return ctx;
  //   },
  // },

  // /**
  //  * Base path for auth routes
  //  */
  // basePath: "/api/auth",

  // /**
  //  * Trust host configuration for production
  //  */
  // trustHost: true,

  // /**
  //  * Enable advanced security features
  //  */
  // advanced: {
  //   /**
  //    * Add CSRF protection
  //    */
  //   crossSubDomainCookies: {
  //     enabled: false,
  //   },
  // },
// });

/**
 * Better-Auth Types for TypeScript
 * Export session and user types for use in other parts of the application
 * Note: Uncomment when better-auth is installed
 */
// export type Session = typeof auth.$types.session;
// export type User = typeof auth.$types.user;